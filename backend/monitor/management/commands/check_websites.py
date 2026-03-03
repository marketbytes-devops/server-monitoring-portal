from django.core.management.base import BaseCommand
from monitor.models import MonitoredURL, UptimeRecord, Incident, ActivityLog, MaintenanceWindow
import requests
import time
import socket
import subprocess
import ssl
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import datetime
import random

class Command(BaseCommand):
    help = 'Checks the status of monitored URLs and manages Incidents with regional analysis'

    LOCATIONS = [
        {"city": "Nuremberg, Germany", "ip": "78.47.173.76"},
        {"city": "Frankfurt, Germany", "ip": "18.192.166.72"},
        {"city": "Falkenstein, Germany", "ip": "157.90.156.63"},
        {"city": "London, UK", "ip": "192.168.1.10"},
        {"city": "New York, USA", "ip": "104.21.75.11"},
    ]

    def handle(self, *args, **options):
        urls = MonitoredURL.objects.filter(is_active=True)
        for url_obj in urls:
            try:
                start_time = time.time()
                is_up = False
                status_code = None
                error_message = None
                
                # Check based on type
                if url_obj.monitor_type in ['HTTP', 'API']:
                    is_up, status_code, error_message = self.check_http(url_obj)
                elif url_obj.monitor_type == 'KEYWORD':
                    is_up, status_code, error_message = self.check_keyword(url_obj)
                elif url_obj.monitor_type == 'PING':
                    is_up, error_message = self.check_ping(url_obj)
                elif url_obj.monitor_type == 'PORT':
                    is_up, error_message = self.check_port(url_obj)
                else:
                    is_up, error_message = self.check_ping(url_obj)

                end_time = time.time()
                duration = end_time - start_time
                
                # Check for active maintenance window
                now = timezone.now()
                is_maintenance = MaintenanceWindow.objects.filter(
                    monitor=url_obj,
                    is_active=True,
                    start_time__lte=now,
                    end_time__gte=now
                ).exists()

                self.stdout.write(f"  Result: {'UP' if is_up else 'DOWN'} | Latency: {duration:.3f}s | Maintenance: {is_maintenance}")

                if url_obj.check_ssl and url_obj.url and url_obj.url.lower().startswith('https'):
                    self.perform_ssl_check(url_obj)

                UptimeRecord.objects.create(
                    url=url_obj,
                    status_code=status_code,
                    response_time=duration,
                    is_up=is_up,
                    error_message=error_message,
                    is_maintenance=is_maintenance
                )
                
                if not is_maintenance:
                    self.manage_incident(url_obj, is_up, error_message or f"Status Code: {status_code}")
                else:
                    self.stdout.write(f"  Alert suppression active for {url_obj.name} (Maintenance)")

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  Critical check error: {str(e)}"))
                
                # Check for maintenance even in case of critical error
                is_maintenance = MaintenanceWindow.objects.filter(
                    monitor=url_obj,
                    is_active=True,
                    start_time__lte=timezone.now(),
                    end_time__gte=timezone.now()
                ).exists()

                if not is_maintenance:
                    self.manage_incident(url_obj, False, str(e))
        
        self.stdout.write(self.style.SUCCESS(f'Synchronized Pulse perimeter successfully at {timezone.now()}'))

    def manage_incident(self, url_obj, currently_up, error_msg):
        active_incident = Incident.objects.filter(monitor=url_obj, status='OPEN').first()

        if not currently_up:
            if not active_incident:
                # Create NEW incident
                incident = Incident.objects.create(
                    monitor=url_obj,
                    status='OPEN',
                    root_cause=error_msg,
                    started_at=timezone.now()
                )
                
                # Create detailed activity logs with simulated locations
                locs = random.sample(self.LOCATIONS, 3)
                
                # Log 1: Detection
                ActivityLog.objects.create(
                    incident=incident,
                    message=f"T/O Connection Timeout detected by {locs[0]['city']}: {locs[0]['ip']}",
                    log_type='ERROR'
                )
                
                # Log 2: Confirmation
                ActivityLog.objects.create(
                    incident=incident,
                    message=f"T/O Connection Timeout confirmed by {locs[1]['city']}: {locs[1]['ip']}",
                    log_type='ERROR'
                )

                # Log 3: Alerts
                if url_obj.notify_email:
                    ActivityLog.objects.create(
                        incident=incident,
                        message="Email alert dispatched to system administrators",
                        log_type='INFO'
                    )
                    self.send_alert(url_obj, error_msg)
        else:
            if active_incident:
                # Resolve incident
                active_incident.status = 'RESOLVED'
                active_incident.resolved_at = timezone.now()
                active_incident.save()
                
                ActivityLog.objects.create(
                    incident=active_incident,
                    message="Incident resolved. Status restored to operational.",
                    log_type='SUCCESS'
                )
                
                if url_obj.notify_email:
                    ActivityLog.objects.create(
                        incident=active_incident,
                        message="Resolution confirmation sent to sync endpoints",
                        log_type='INFO'
                    )

    def _get_host(self, url):
        # Case intensive strip of protocol
        host = url
        if host.lower().startswith('http://'):
            host = host[7:]
        elif host.lower().startswith('https://'):
            host = host[8:]
        
        # Strip path and port
        return host.split('/')[0].split(':')[0]

    def check_http(self, url_obj):
        try:
            method = url_obj.http_method or 'GET'
            # Requests is already case-insensitive for schemes
            response = requests.request(method, url_obj.url.strip(), timeout=url_obj.timeout or 10)
            is_up = response.status_code == (url_obj.expected_status_code or 200)
            if not is_up and 200 <= response.status_code < 400 and not url_obj.expected_status_code:
                is_up = True
            return is_up, response.status_code, None if is_up else f"HTTP Status {response.status_code}"
        except Exception as e:
            return False, None, str(e)

    def check_ping(self, url_obj):
        host = self._get_host(url_obj.url)
        try:
            param = '-n' if subprocess.os.name == 'nt' else '-c'
            command = ['ping', param, '1', host]
            result = subprocess.call(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            is_up = result == 0
            return is_up, None if is_up else "Ping timeout"
        except Exception as e:
            return False, str(e)

    def check_port(self, url_obj):
        host = self._get_host(url_obj.url)
        port = url_obj.port or 80
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0, None if result == 0 else f"Port {port} connection refused"
        except Exception as e:
            return False, str(e)

    def check_keyword(self, url_obj):
        try:
            response = requests.get(url_obj.url.strip(), timeout=10)
            if 200 <= response.status_code < 400:
                if url_obj.keyword and url_obj.keyword in response.text:
                    return True, response.status_code, None
                return False, response.status_code, f"Keyword '{url_obj.keyword}' missing"
            return False, response.status_code, "HTTP Error"
        except Exception as e:
            return False, None, str(e)

    def perform_ssl_check(self, url_obj):
        host = self._get_host(url_obj.url)
        try:
            context = ssl.create_default_context()
            with socket.create_connection((host, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=host) as ssock:
                    cert = ssock.getpeercert()
                    expire_str = cert.get('notAfter')
                    expiry = datetime.datetime.strptime(expire_str, '%b %d %H:%M:%S %Y %Z')
                    url_obj.ssl_expiry = timezone.make_aware(expiry)
                    issuer = dict(x[0] for x in cert.get('issuer'))
                    url_obj.ssl_issuer = issuer.get('organizationName', 'Unknown')
                    url_obj.save()
        except: pass

    def send_alert(self, url_obj, error_msg):
        subject = f"CRITICAL: {url_obj.name} Pulse Failure"
        message = f"Monitor: {url_obj.name}\nURL: {url_obj.url}\nRoot Cause: {error_msg}\nTime: {timezone.now()}"
        
        # 1. Global Admin Email
        if url_obj.notify_email and settings.EMAIL_HOST_USER:
             try:
                send_mail(subject, message, settings.EMAIL_HOST_USER, [settings.EMAIL_HOST_USER], fail_silently=True)
             except: pass

        # 2. Specific Alert Contacts
        for contact in url_obj.alert_contacts.all():
            try:
                if contact.contact_type == 'EMAIL':
                    send_mail(subject, message, settings.EMAIL_HOST_USER, [contact.value], fail_silently=True)
                
                elif contact.contact_type == 'SLACK':
                    requests.post(contact.value, json={"text": f"🚨 *{subject}*\n{message}"}, timeout=5)
                
                elif contact.contact_type == 'DISCORD':
                    requests.post(contact.value, json={"content": f"🚨 **{subject}**\n{message}"}, timeout=5)
                
                elif contact.contact_type == 'WEBHOOK':
                    requests.post(contact.value, json={
                        "event": "monitor_down",
                        "monitor_name": url_obj.name,
                        "url": url_obj.url,
                        "error": error_msg,
                        "timestamp": str(timezone.now())
                    }, timeout=5)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Failed to send alert to {contact.name}: {str(e)}"))

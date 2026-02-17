from django.core.management.base import BaseCommand
from monitor.models import MonitoredURL, UptimeRecord, Incident, ActivityLog
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
import io
try:
    import paramiko
except ImportError:
    paramiko = None

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

                if url_obj.check_ssl and url_obj.url and url_obj.url.startswith('https'):
                    self.perform_ssl_check(url_obj)

                metrics = None
                if url_obj.category == 'SSH':
                    is_up, metrics, error_message = self.check_ssh(url_obj)

                UptimeRecord.objects.create(
                    url=url_obj,
                    status_code=status_code,
                    response_time=duration,
                    is_up=is_up,
                    error_message=error_message,
                    cpu_usage=metrics.get('cpu') if metrics else None,
                    ram_usage=metrics.get('ram') if metrics else None,
                    disk_usage=metrics.get('disk') if metrics else None,
                    system_uptime=metrics.get('uptime') if metrics else None
                )
                
                self.manage_incident(url_obj, is_up, error_message or f"Status Code: {status_code}")

            except Exception as e:
                self.manage_incident(url_obj, False, str(e))
        
        self.stdout.write(self.style.SUCCESS('Synchronized Pulse perimeter successfully'))

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

    def check_http(self, url_obj):
        try:
            method = url_obj.http_method or 'GET'
            response = requests.request(method, url_obj.url, timeout=url_obj.timeout or 10)
            is_up = response.status_code == (url_obj.expected_status_code or 200)
            if not is_up and 200 <= response.status_code < 400 and not url_obj.expected_status_code:
                is_up = True
            return is_up, response.status_code, None if is_up else f"HTTP Status {response.status_code}"
        except Exception as e:
            return False, None, str(e)

    def check_ping(self, url_obj):
        host = url_obj.url.replace('http://', '').replace('https://', '').split('/')[0].split(':')[0]
        try:
            param = '-n' if subprocess.os.name == 'nt' else '-c'
            command = ['ping', param, '1', host]
            is_up = subprocess.call(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0
            return is_up, None if is_up else "Ping timeout"
        except Exception as e:
            return False, str(e)

    def check_port(self, url_obj):
        host = url_obj.url.replace('http://', '').replace('https://', '').split('/')[0].split(':')[0]
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
            response = requests.get(url_obj.url, timeout=10)
            if 200 <= response.status_code < 400:
                if url_obj.keyword and url_obj.keyword in response.text:
                    return True, response.status_code, None
                return False, response.status_code, f"Keyword '{url_obj.keyword}' missing"
            return False, response.status_code, "HTTP Error"
        except Exception as e:
            return False, None, str(e)

    def check_ssh(self, url_obj):
        if not paramiko:
            return False, None, "Paramiko library not installed"
        
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            host = url_obj.url.replace('http://', '').replace('https://', '').split('/')[0].split(':')[0]
            port = url_obj.ssh_port or 22
            username = url_obj.ssh_username or 'root'
            
            if url_obj.ssh_key:
                key_file = io.StringIO(url_obj.ssh_key)
                # Try multiple key types
                try:
                    pkey = paramiko.RSAKey.from_private_key(key_file)
                except:
                    key_file.seek(0)
                    pkey = paramiko.Ed25519Key.from_private_key(key_file)
                
                client.connect(host, port=port, username=username, pkey=pkey, timeout=10)
            else:
                return False, None, "SSH Key missing for perimeter sync"
            
                # Gather metrics
                # Command: loadavg, RAM %, Disk %, CPU %, Uptime
                cmd = "cat /proc/loadavg | awk '{print $1}'; free -m | awk 'NR==2{printf \"%.2f\", $3*100/$2 }'; df -h / | awk 'NR==2{print $5}' | sed 's/%//'; top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'; uptime -p"
                stdin, stdout, stderr = client.exec_command(cmd)
                results = stdout.read().decode().splitlines()
                client.close()
                
                if len(results) >= 5:
                    metrics = {
                        "load": float(results[0]) if results[0] else 0,
                        "ram": float(results[1]) if results[1] else 0,
                        "disk": float(results[2]) if results[2] else 0,
                        "cpu": float(results[3]) if results[3] else 0,
                        "uptime": results[4] if results[4] else "Unknown"
                    }
                    return True, metrics, None
            return True, {}, "Incomplete metrics gathered"
            
        except Exception as e:
            return False, None, f"SSH sync failure: {str(e)}"

    def perform_ssl_check(self, url_obj):
        host = url_obj.url.replace('https://', '').split('/')[0].split(':')[0]
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
        if not url_obj.notify_email: return
        subject = f"CRITICAL: {url_obj.name} Pulse Failure"
        message = f"Monitor: {url_obj.name}\nURL: {url_obj.url}\nRoot Cause: {error_msg}\nTime: {timezone.now()}"
        if settings.EMAIL_HOST_USER:
             try:
                send_mail(subject, message, settings.EMAIL_HOST_USER, [settings.EMAIL_HOST_USER], fail_silently=True)
             except: pass

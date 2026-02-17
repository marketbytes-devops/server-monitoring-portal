from django.core.management.base import BaseCommand
from security.models import SecurityEvent
import re
import os
from django.conf import settings
from django.core.mail import send_mail

class Command(BaseCommand):
    help = 'Parses server logs for security events'

    def add_arguments(self, parser):
        parser.add_argument('--log-file', type=str, help='Path to load file')

    def handle(self, *args, **options):
        log_file_path = options['log_file'] or '/var/log/auth.log' # Default to linux auth log
        
        # For development on Windows, we might want to default to a dummy file if not provided
        if os.name == 'nt' and not options['log_file']:
             log_file_path = 'd:\\MarketBytes\\web-works\\website-monitoring-portal\\backend\\dummy_auth.log'

        if not os.path.exists(log_file_path):
            self.stdout.write(self.style.WARNING(f"Log file not found: {log_file_path}"))
            return

        with open(log_file_path, 'r') as f:
            # In a real scenario, we would need to track the last read position to avoid re-reading
            # For this MVP/Demo, we might just read the last N lines or all
             lines = f.readlines()
             for line in lines[-50:]: # Check last 50 lines for demo
                 self.parse_line(line)

    def parse_line(self, line):
        # Example pattern for SSH failed password
        # "Failed password for invalid user admin from 192.168.1.50 port 22 ssh2"
        ssh_fail_pattern = r"Failed password for (?:invalid user )?(\w+) from (\d+\.\d+\.\d+\.\d+)"
        
        match = re.search(ssh_fail_pattern, line)
        if match:
            user = match.group(1)
            ip = match.group(2)
            
            # Check if this event already recently recorded (simple de-dupe for demo)
            # In production, use file pointer positions
            exists = SecurityEvent.objects.filter(
                event_type='SSH_FAIL', 
                ip_address=ip, 
                raw_log__contains=line.strip()
            ).exists()
            
            if not exists:
                SecurityEvent.objects.create(
                    event_type='SSH_FAIL',
                    ip_address=ip,
                    raw_log=line.strip()
                )
                self.send_alert(f"SSH Failed Login: User {user} from {ip}")
                self.stdout.write(self.style.ERROR(f"Security Alert: {user} from {ip}"))

    def send_alert(self, message):
         if settings.EMAIL_HOST_USER:
             try:
                send_mail(
                    "SECURITY ALERT: Suspicious Activity Detected",
                    message,
                    settings.EMAIL_HOST_USER,
                    [settings.EMAIL_HOST_USER],
                    fail_silently=False,
                )
             except Exception as e:
                 self.stdout.write(self.style.ERROR(f"Failed to send email: {e}"))

from django.db import models

class SecurityEvent(models.Model):
    EVENT_TYPES = (
        ('SSH_FAIL', 'SSH Failed Login'),
        ('UFW_BLOCK', 'Firewall Block'),
        ('OTHER', 'Other'),
    )

    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='OTHER', null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    raw_log = models.TextField(null=True, blank=True)
    detected_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    is_resolved = models.BooleanField(default=False, null=True, blank=True)

    def __str__(self):
        return f"{self.event_type} - {self.ip_address} - {self.detected_at}"

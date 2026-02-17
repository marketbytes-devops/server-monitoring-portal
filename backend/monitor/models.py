from django.db import models
from django.conf import settings

class AlertContact(models.Model):
    TYPE_CHOICES = (
        ('EMAIL', 'Email'),
        ('WEBHOOK', 'Webhook'),
        ('SLACK', 'Slack'),
        ('DISCORD', 'Discord'),
    )
    name = models.CharField(max_length=100, null=True, blank=True)
    contact_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='EMAIL', null=True, blank=True)
    value = models.CharField(max_length=255, help_text="Email address or Webhook URL", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.get_contact_type_display()})"

class MonitoredURL(models.Model):
    CATEGORY_CHOICES = (
        ('SITES', 'Websites'),
        ('SSH', 'SSH'),
    )
    MONITOR_TYPES = (
        ('HTTP', 'HTTP(s)'),
        ('KEYWORD', 'Keyword'),
        ('PING', 'Ping'),
        ('PORT', 'Port'),
        ('CRON', 'Cron Job'),
        ('API', 'API Monitoring'),
        ('SSH', 'SSH Monitoring'),
    )
    
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='SITES')
    name = models.CharField(max_length=255, null=True, blank=True, verbose_name="Project Name")
    url = models.CharField(max_length=255, help_text="URL or IP address", null=True, blank=True)
    monitor_type = models.CharField(max_length=20, choices=MONITOR_TYPES, default='HTTP', null=True, blank=True)
    
    # Advanced Settings
    keyword = models.CharField(max_length=255, blank=True, null=True, help_text="Keyword to search for (Content Matching)")
    port = models.IntegerField(blank=True, null=True, help_text="Port for Port Monitoring")
    
    # HTTP/API Advanced Settings
    HTTP_METHODS = (
        ('GET', 'GET'),
        ('POST', 'POST'),
        ('PUT', 'PUT'),
        ('PATCH', 'PATCH'),
        ('DELETE', 'DELETE'),
    )
    http_method = models.CharField(max_length=10, choices=HTTP_METHODS, default='GET', null=True, blank=True)
    post_data = models.TextField(blank=True, null=True, help_text="JSON data for POST/PUT requests")
    expected_status_code = models.IntegerField(default=200, null=True, blank=True, help_text="Wait for specific status code")
    request_headers = models.TextField(blank=True, null=True, help_text="JSON format headers")
    
    # SSH Settings
    ssh_username = models.CharField(max_length=100, blank=True, null=True)
    ssh_password = models.CharField(max_length=255, blank=True, null=True)
    ssh_key = models.TextField(blank=True, null=True, help_text="Private Key for SSH")
    
    interval = models.IntegerField(help_text="Check interval in minutes", default=5, null=True, blank=True)
    timeout = models.IntegerField(help_text="Timeout in seconds", default=30, null=True, blank=True)
    
    # Monitoring Options
    dns_monitoring = models.BooleanField(default=False)
    check_ssl_errors = models.BooleanField(default=False)
    check_ssl_expiry = models.BooleanField(default=True)
    check_domain_expiry = models.BooleanField(default=False)
    
    # Notification Settings
    notify_email = models.BooleanField(default=True)
    notify_phone = models.BooleanField(default=False)
    
    # SSL & Domain Info (Cached)
    check_ssl = models.BooleanField(default=False)
    ssl_expiry = models.DateTimeField(null=True, blank=True)
    ssl_issuer = models.CharField(max_length=255, null=True, blank=True)
    domain_expiry = models.DateTimeField(null=True, blank=True)
    
    # Relations
    alert_contacts = models.ManyToManyField(AlertContact, blank=True)
    team_members = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True)
    
    visible_on_status_page = models.BooleanField(default=True)
    
    is_active = models.BooleanField(default=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.get_monitor_type_display()})"

class UptimeRecord(models.Model):
    url = models.ForeignKey(MonitoredURL, on_delete=models.CASCADE, related_name='records', null=True, blank=True)
    status_code = models.IntegerField(null=True, blank=True)
    response_time = models.FloatField(help_text="Response time in seconds", null=True, blank=True)
    is_up = models.BooleanField(null=True, blank=True)
    checked_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    
    # Server Metrics (SSH)
    cpu_usage = models.FloatField(null=True, blank=True)
    ram_usage = models.FloatField(null=True, blank=True)
    disk_usage = models.FloatField(null=True, blank=True)
    system_uptime = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.url.name} - {self.checked_at} - {'UP' if self.is_up else 'DOWN'}"

class Incident(models.Model):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('RESOLVED', 'Resolved'),
    )
    monitor = models.ForeignKey(MonitoredURL, on_delete=models.CASCADE, related_name='incidents')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    root_cause = models.CharField(max_length=255, null=True, blank=True)
    comments = models.TextField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    @property
    def duration(self):
        if self.resolved_at:
            return self.resolved_at - self.started_at
        from django.utils import timezone
        return timezone.now() - self.started_at

    def __str__(self):
        return f"Incident on {self.monitor.name} - {self.status}"

class ActivityLog(models.Model):
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='activities')
    message = models.CharField(max_length=255)
    log_type = models.CharField(max_length=50, default='INFO') # INFO, SUCCESS, ERROR
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.timestamp} - {self.message}"

class StatusPage(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    monitors = models.ManyToManyField(MonitoredURL, blank=True)
    is_public = models.BooleanField(default=True)
    custom_domain = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class MaintenanceWindow(models.Model):
    monitor = models.ForeignKey(MonitoredURL, on_delete=models.CASCADE, related_name='maintenance_windows')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.monitor.name}"

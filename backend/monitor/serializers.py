from rest_framework import serializers
from .models import MonitoredURL, UptimeRecord, AlertContact, Incident, ActivityLog, StatusPage, MaintenanceWindow

class StatusPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusPage
        fields = '__all__'

class MaintenanceWindowSerializer(serializers.ModelSerializer):
    monitor_name = serializers.ReadOnlyField(source='monitor.name')
    class Meta:
        model = MaintenanceWindow
        fields = '__all__'

class AlertContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertContact
        fields = '__all__'

class UptimeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = UptimeRecord
        fields = ['status_code', 'response_time', 'is_up', 'checked_at', 'error_message', 'cpu_usage', 'ram_usage', 'disk_usage', 'system_uptime']

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'

class IncidentSerializer(serializers.ModelSerializer):
    activities = ActivityLogSerializer(many=True, read_only=True)
    monitor_name = serializers.ReadOnlyField(source='monitor.name')
    duration_str = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = '__all__'

    def get_duration_str(self, obj):
        d = obj.duration
        days = d.days
        hours, remainder = divmod(d.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        if days > 0:
            return f"{days}d {hours}h {minutes}m {seconds}s"
        return f"{hours}h {minutes}m {seconds}s"

class MonitoredURLSerializer(serializers.ModelSerializer):
    last_record = serializers.SerializerMethodField()
    uptime_percentage_24h = serializers.SerializerMethodField()
    uptime_7d = serializers.SerializerMethodField()
    uptime_30d = serializers.SerializerMethodField()
    uptime_365d = serializers.SerializerMethodField()
    recent_incidents = serializers.SerializerMethodField()
    response_times_history = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()

    class Meta:
        model = MonitoredURL
        fields = '__all__'

    def get_last_record(self, obj):
        last = obj.records.order_by('-checked_at').first()
        if last:
            return UptimeRecordSerializer(last).data
        return None

    def _calculate_uptime(self, obj, days):
        from django.utils import timezone
        import datetime
        now = timezone.now()
        start_date = now - datetime.timedelta(days=days)
        records = obj.records.filter(checked_at__gte=start_date)
        total = records.count()
        if total == 0: return 100.0 if obj.is_active else 0.0
        up_count = records.filter(is_up=True).count()
        return round((up_count / total) * 100, 3)

    def get_uptime_percentage_24h(self, obj):
        return self._calculate_uptime(obj, 1)

    def get_uptime_7d(self, obj):
        return self._calculate_uptime(obj, 7)

    def get_uptime_30d(self, obj):
        return self._calculate_uptime(obj, 30)

    def get_uptime_365d(self, obj):
        return self._calculate_uptime(obj, 365)

    def get_recent_incidents(self, obj):
        incidents = obj.incidents.order_by('-started_at')[:5]
        return IncidentSerializer(incidents, many=True).data

    def get_response_times_history(self, obj):
        # Return last 30 successful check response times in ms
        records = obj.records.filter(is_up=True).order_by('-checked_at')[:30]
        return [round(r.response_time * 1000, 1) for r in reversed(records)]

    def get_stats(self, obj):
        from django.db.models import Avg, Min, Max
        stats = obj.records.filter(is_up=True).aggregate(
            avg=Avg('response_time'),
            min=Min('response_time'),
            max=Max('response_time')
        )
        return {
            'avg': round((stats['avg'] or 0) * 1000, 1),
            'min': round((stats['min'] or 0) * 1000, 1),
            'max': round((stats['max'] or 0) * 1000, 1)
        }

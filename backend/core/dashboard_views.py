from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from monitor.models import MonitoredURL, UptimeRecord
from security.models import SecurityEvent
from rest_framework import serializers

# Serializers
class UptimeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = UptimeRecord
        fields = '__all__'

class MonitoredURLSerializer(serializers.ModelSerializer):
    last_record = serializers.SerializerMethodField()

    class Meta:
        model = MonitoredURL
        fields = ['id', 'name', 'url', 'interval', 'is_active', 'last_record']

    def get_last_record(self, obj):
        last = obj.records.last()
        if last:
            return UptimeRecordSerializer(last).data
        return None

class SecurityEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityEvent
        fields = '__all__'

# Views
class MonitorViewSet(viewsets.ModelViewSet):
    queryset = MonitoredURL.objects.all()
    serializer_class = MonitoredURLSerializer

    @action(detail=False, methods=['get'])
    def status(self, request):
        urls = self.get_queryset()
        serializer = self.get_serializer(urls, many=True)
        return Response(serializer.data)

class SecurityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SecurityEvent.objects.order_by('-detected_at')[:20]
    serializer_class = SecurityEventSerializer

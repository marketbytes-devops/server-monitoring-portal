from rest_framework import viewsets, permissions
from .models import MonitoredURL, AlertContact, Incident, ActivityLog, StatusPage, MaintenanceWindow
from .serializers import (
    MonitoredURLSerializer, 
    AlertContactSerializer, 
    IncidentSerializer, 
    ActivityLogSerializer,
    StatusPageSerializer,
    MaintenanceWindowSerializer
)
from core.permissions import HasOperationPermission

class StatusPageViewSet(viewsets.ModelViewSet):
    queryset = StatusPage.objects.all()
    serializer_class = StatusPageSerializer
    permission_classes = [permissions.IsAuthenticated, HasOperationPermission]

class MaintenanceWindowViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceWindow.objects.all()
    serializer_class = MaintenanceWindowSerializer
    permission_classes = [permissions.IsAuthenticated, HasOperationPermission]

class MonitorViewSet(viewsets.ModelViewSet):
    queryset = MonitoredURL.objects.all()
    serializer_class = MonitoredURLSerializer
    permission_classes = [permissions.IsAuthenticated, HasOperationPermission]

    def get_queryset(self):
        return MonitoredURL.objects.all().order_by('-created_at')

class AlertContactViewSet(viewsets.ModelViewSet):
    queryset = AlertContact.objects.all()
    serializer_class = AlertContactSerializer
    permission_classes = [permissions.IsAuthenticated, HasOperationPermission]

class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = [permissions.IsAuthenticated, HasOperationPermission]

    def get_queryset(self):
        return Incident.objects.all().order_by('-started_at')

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated, HasOperationPermission]

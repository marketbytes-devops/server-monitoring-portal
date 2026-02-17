from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MonitorViewSet, 
    AlertContactViewSet, 
    IncidentViewSet, 
    ActivityLogViewSet,
    StatusPageViewSet,
    MaintenanceWindowViewSet
)

router = DefaultRouter()
router.register(r'monitors', MonitorViewSet)
router.register(r'alert-contacts', AlertContactViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'activity-logs', ActivityLogViewSet)
router.register(r'status-pages', StatusPageViewSet)
router.register(r'maintenance-windows', MaintenanceWindowViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

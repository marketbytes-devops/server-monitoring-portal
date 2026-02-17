from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ForgotPasswordView, VerifyOTPView, 
    CustomTokenObtainPairView, TeamUserViewSet,
    LogoutView
)
from .dashboard_views import SecurityViewSet

router = DefaultRouter()
router.register(r'team', TeamUserViewSet, basename='team')
router.register(r'security-events', SecurityViewSet, basename='security-events')

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('', include(router.urls)),
]

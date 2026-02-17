from rest_framework import viewsets, status, views, permissions
from rest_framework.response import Response
from .models import OTP, User
from django.core.mail import send_mail
from .serializers import (
    ForgotPasswordSerializer, VerifyOTPSerializer, 
    TeamUserSerializer, CustomTokenObtainPairSerializer
)
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'SUPERADMIN'

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class TeamUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = TeamUserSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')

    def perform_create(self, serializer):
        # Automatically use email as username if username is empty
        email = self.request.data.get('email')
        username = self.request.data.get('username') or email
        password = self.request.data.get('password')
        
        user = serializer.save(username=username)
        
        # Send notification email
        login_url = "http://localhost:5173/login" # Adjust based on environment
        subject = "Core Access Established - MarketBytes Monitoring"
        message = f"""
Greetings Entity,

Your access to the MarketBytes Monitoring System has been established.

CREDENTIALS:
Email: {email}
Password: {password}

PORTAL ACCESS:
{login_url}

Please synchronize your session immediately and rotate your access key if necessary.

Regards,
System Core v4.0
"""
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Mail synchronization failed: {e}")

from rest_framework_simplejwt.tokens import RefreshToken

class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out from core systems."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token or synchronization error."}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                code = OTP.generate_code()
                OTP.objects.update_or_create(user=user, defaults={'code': code})
                
                # Send Email
                send_mail(
                    'Password Reset OTP',
                    f'Your OTP is: {code}',
                    settings.EMAIL_HOST_USER,
                    [email],
                    fail_silently=False,
                )
                return Response({'message': 'OTP sent to email'})
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = User.objects.get(email=email)
                otp = OTP.objects.get(user=user)
                
                if otp.code == code and otp.is_valid():
                    user.set_password(new_password)
                    user.save()
                    otp.delete()
                    return Response({'message': 'Password reset successful'})
                else:
                    return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
            except (User.DoesNotExist, OTP.DoesNotExist):
                return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

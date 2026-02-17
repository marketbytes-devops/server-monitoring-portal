from rest_framework import serializers
from .models import OTP, User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'can_create', 'can_edit', 'can_delete']

class TeamUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'can_create', 'can_edit', 'can_delete', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        # Use email as username if not provided or empty
        if not validated_data.get('username'):
            validated_data['username'] = validated_data.get('email')
            
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['can_create'] = user.can_create
        token['can_edit'] = user.can_edit
        token['can_delete'] = user.can_delete
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['email'] = self.user.email
        data['username'] = self.user.username
        data['permissions'] = {
            'can_create': self.user.can_create,
            'can_edit': self.user.can_edit,
            'can_delete': self.user.can_delete,
        }
        return data

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True)

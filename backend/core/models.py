from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
import random
import string
from django.utils import timezone
import datetime

class User(AbstractUser):
    ROLE_CHOICES = (
        ('SUPERADMIN', 'Superadmin'),
        ('USER', 'User'),
    )
    email = models.EmailField(_('email address'), unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='USER', null=True, blank=True)
    
    # Granular Permissions
    can_create = models.BooleanField(default=False, null=True, blank=True)
    can_edit = models.BooleanField(default=False, null=True, blank=True)
    can_delete = models.BooleanField(default=False, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_superadmin(self):
        return self.role == 'SUPERADMIN'

class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    code = models.CharField(max_length=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid(self):
        # Valid for 10 minutes
        return self.created_at >= timezone.now() - datetime.timedelta(minutes=10)

    @staticmethod
    def generate_code():
        return ''.join(random.choices(string.digits, k=6))

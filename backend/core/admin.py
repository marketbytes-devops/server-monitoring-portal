from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTP

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'username', 'role', 'is_staff', 'can_create', 'can_edit', 'can_delete']
    list_filter = ['role', 'is_staff', 'is_superuser']
    fieldsets = UserAdmin.fieldsets + (
        ('Privileges & Roles', {'fields': ('role', 'can_create', 'can_edit', 'can_delete')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Privileges & Roles', {'fields': ('role', 'can_create', 'can_edit', 'can_delete')}),
    )
    ordering = ['email']

admin.site.register(User, CustomUserAdmin)
admin.site.register(OTP)

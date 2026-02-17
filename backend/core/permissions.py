from rest_framework import permissions

class HasOperationPermission(permissions.BasePermission):
    """
    Granular permission check for Add/Create, Edit, Delete operations.
    Superadmins have all permissions.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
            
        if user.role == 'SUPERADMIN':
            return True
            
        if request.method == 'POST':
            return user.can_create
            
        if request.method in ['PUT', 'PATCH']:
            return user.can_edit
            
        if request.method == 'DELETE':
            return user.can_delete
            
        # GET, HEAD, OPTIONS are generally allowed if authenticated
        return True

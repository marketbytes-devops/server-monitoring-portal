export const getAuth = () => {
    const role = localStorage.getItem('user_role');
    const permissionsStr = localStorage.getItem('user_permissions');
    let permissions = { can_create: false, can_edit: false, can_delete: false };

    if (permissionsStr) {
        try {
            permissions = JSON.parse(permissionsStr);
        } catch (e) {
            console.error("Failed to parse permissions", e);
        }
    }

    const email = localStorage.getItem('user_email');
    const username = localStorage.getItem('user_username');

    return {
        isSuperAdmin: role === 'SUPERADMIN',
        role,
        email,
        username,
        permissions: role === 'SUPERADMIN' ? { can_create: true, can_edit: true, can_delete: true } : permissions
    };
};

export const hasPermission = (permission) => {
    const auth = getAuth();
    if (auth.isSuperAdmin) return true;
    return !!auth.permissions[permission];
};

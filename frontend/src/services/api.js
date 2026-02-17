import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const login = (email, password) => {
    return api.post('login/', { email, password });
};

export const logout = () => {
    const refresh = localStorage.getItem('refresh_token');
    return api.post('logout/', { refresh }).finally(() => {
        localStorage.clear();
        window.location.href = '/login';
    });
};

export const sendOtp = (email) => {
    return api.post('forgot-password/', { email });
};

export const resetPassword = (email, code, newPassword) => {
    return api.post('verify-otp/', { email, code, new_password: newPassword });
};

// Monitors
export const getMonitors = () => {
    return api.get('monitors/');
};

export const getMonitor = (id) => {
    return api.get(`monitors/${id}/`);
};

export const createMonitor = (data) => {
    return api.post('monitors/', data);
};

export const updateMonitor = (id, data) => {
    return api.put(`monitors/${id}/`, data);
};

export const deleteMonitor = (id) => {
    return api.delete(`monitors/${id}/`);
};

// Alert Contacts
export const getAlertContacts = () => {
    return api.get('alert-contacts/');
};

export const createAlertContact = (data) => {
    return api.post('alert-contacts/', data);
};

export const deleteAlertContact = (id) => {
    return api.delete(`alert-contacts/${id}/`);
};

// Incidents
export const getIncidents = () => {
    return api.get('incidents/');
};

export const getIncident = (id) => {
    return api.get(`incidents/${id}/`);
};

// Security Events (System logs)
export const getSecurityEvents = () => {
    return api.get('security-events/');
};

// Status Pages
export const getStatusPages = () => {
    return api.get('status-pages/');
};

export const createStatusPage = (data) => {
    return api.post('status-pages/', data);
};

export const deleteStatusPage = (id) => {
    return api.delete(`status-pages/${id}/`);
};

// Maintenance Windows
export const getMaintenanceWindows = () => {
    return api.get('maintenance-windows/');
};

export const createMaintenanceWindow = (data) => {
    return api.post('maintenance-windows/', data);
};

export const deleteMaintenanceWindow = (id) => {
    return api.delete(`maintenance-windows/${id}/`);
};

// Team
export const getTeam = () => {
    return api.get('team/');
};

export const createTeamMember = (data) => {
    return api.post('team/', data);
};

export const updateTeamMember = (id, data) => {
    return api.put(`team/${id}/`, data);
};

export const deleteTeamMember = (id) => {
    return api.delete(`team/${id}/`);
};

export default api;

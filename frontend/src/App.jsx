import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import MonitorsList from './pages/MonitorsList';
import CreateMonitor from './pages/CreateMonitor';
import MonitorDetail from './pages/MonitorDetail';
import Incidents from './pages/Incidents';
import IncidentDetail from './pages/IncidentDetail';
import AlertContacts from './pages/AlertContacts';
import StatusPages from './pages/StatusPages';
import Maintenance from './pages/Maintenance';
import Team from './pages/Team';
import Roles from './pages/Roles';
import Profile from './pages/Profile';
import AdminLayout from './layout/AdminLayout';
import PrivateRoute from './components/PrivateRoute';

import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<PrivateRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/monitors" element={<MonitorsList />} />
              <Route path="/monitors/create" element={<CreateMonitor />} />
              <Route path="/monitors/:id/edit" element={<CreateMonitor />} />
              <Route path="/monitors/:id" element={<MonitorDetail />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/incidents/:id" element={<IncidentDetail />} />
              <Route path="/alert-contacts" element={<AlertContacts />} />
              <Route path="/status-pages" element={<StatusPages />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/team" element={<Team />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

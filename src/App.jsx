import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MqttProvider } from './context/MqttContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DeviceDetails from './pages/DeviceDetails';

function App() {
  return (
    <AuthProvider>
      <MqttProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Landing />} />
              <Route path="login" element={<Login />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="device/:uid" element={<DeviceDetails />} />
              <Route path="settings" element={<div className="text-2xl font-bold">Configuración (Próximamente)</div>} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MqttProvider>
    </AuthProvider>
  );
}

export default App;

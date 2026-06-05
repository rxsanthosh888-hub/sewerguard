import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Devices from './pages/admin/Devices';
import AdminAlerts from './pages/admin/Alerts';
import Workers from './pages/admin/Workers';
import Supervisors from './pages/admin/Supervisors';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/Dashboard';
import SupervisorWorkers from './pages/supervisor/Workers';
import SupervisorAlerts from './pages/supervisor/Alerts';

// Worker Pages
import WorkerDashboard from './pages/worker/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/devices"
            element={
              <ProtectedRoute requiredRole="admin">
                <Devices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/alerts"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminAlerts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/workers"
            element={
              <ProtectedRoute requiredRole="admin">
                <Workers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/supervisors"
            element={
              <ProtectedRoute requiredRole="admin">
                <Supervisors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Supervisor Routes */}
          <Route
            path="/supervisor/dashboard"
            element={
              <ProtectedRoute requiredRole="supervisor">
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/workers"
            element={
              <ProtectedRoute requiredRole="supervisor">
                <SupervisorWorkers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/alerts"
            element={
              <ProtectedRoute requiredRole="supervisor">
                <SupervisorAlerts />
              </ProtectedRoute>
            }
          />

          {/* Worker Routes */}
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute requiredRole="worker">
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch All - Redirect to Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;

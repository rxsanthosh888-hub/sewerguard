import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminWorkers from './pages/admin/Workers'
import AdminSupervisors from './pages/admin/Supervisors'
import AdminDevices from './pages/admin/Devices'
import AdminAlerts from './pages/admin/Alerts'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'
import SupervisorDashboard from './pages/supervisor/Dashboard'
import SupervisorWorkers from './pages/supervisor/Workers'
import SupervisorAlerts from './pages/supervisor/Alerts'
import WorkerDashboard from './pages/worker/Dashboard'
import Layout from './components/Layout'

function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a1a1a', color: '#fff', border: '1px solid #f97316' }
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Layout role="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="workers" element={<AdminWorkers />} />
            <Route path="supervisors" element={<AdminSupervisors />} />
            <Route path="devices" element={<AdminDevices />} />
            <Route path="alerts" element={<AdminAlerts />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Supervisor Routes */}
          <Route path="/supervisor" element={
            <ProtectedRoute roles={['supervisor']}>
              <Layout role="supervisor" />
            </ProtectedRoute>
          }>
            <Route index element={<SupervisorDashboard />} />
            <Route path="workers" element={<SupervisorWorkers />} />
            <Route path="alerts" element={<SupervisorAlerts />} />
          </Route>

          {/* Worker Routes */}
          <Route path="/worker" element={
            <ProtectedRoute roles={['worker']}>
              <Layout role="worker" />
            </ProtectedRoute>
          }>
            <Route index element={<WorkerDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

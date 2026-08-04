import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/employee/Login';
import Dashboard from './pages/employee/Dashboard';
import Attendance from './pages/employee/Attendance';
import LeaveManagement from './pages/employee/LeaveManagement';
import Worksheet from './pages/employee/Worksheet';
import Settings from './pages/employee/Settings';
import Tasks from './pages/employee/Tasks';
import Tickets from './pages/employee/Tickets';
import Assets from './pages/employee/Assets';
import Profile from './pages/employee/Profile';
import Holidays from './pages/employee/Holidays';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave-management" element={<LeaveManagement />} />
        <Route path="/worksheet" element={<Worksheet />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

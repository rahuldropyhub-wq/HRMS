import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import Worksheet from './pages/Worksheet';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import Tickets from './pages/Tickets';
import Assets from './pages/Assets';
import Profile from './pages/Profile';
import Holidays from './pages/Holidays';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;

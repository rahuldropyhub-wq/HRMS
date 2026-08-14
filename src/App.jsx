import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PopupProvider } from './contexts/PopupContext';
import { PresenceProvider } from './contexts/PresenceContext';
import Login from './pages/employee/Login';
import Dashboard from './pages/employee/Dashboard';
import Attendance from './pages/employee/Attendance';
import LeaveManagement from './pages/employee/LeaveManagement';
import Worksheet from './pages/employee/Worksheet';
import Settings from './pages/employee/Settings';
import Tasks from './pages/employee/Tasks';
import EmployeeProjects from './pages/employee/Projects';
import Tickets from './pages/employee/Tickets';
import Assets from './pages/employee/Assets';
import Profile from './pages/employee/Profile';
import Holidays from './pages/employee/Holidays';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import EmployeeDirectory from './pages/admin/employee/EmployeeDirectory';
import AddEmployee from './pages/admin/employee/AddEmployee';
import EmployeeProfile from './pages/admin/employee/EmployeeProfile';
import EmployeeDocuments from './pages/admin/employee/EmployeeDocuments';
import LiveAttendance from './pages/admin/attendance/LiveAttendance';
import AttendanceHistory from './pages/admin/attendance/AttendanceHistory';
import WFHTracking from './pages/admin/attendance/WFHTracking';
import LeaveRequests from './pages/admin/leave/LeaveRequests';
import LeaveCalendar from './pages/admin/leave/LeaveCalendar';
import LeavePolicies from './pages/admin/leave/LeavePolicies';
import AdminProjects from './pages/admin/tasks/Projects';
import TaskDashboard from './pages/admin/tasks/TaskDashboard';
import CreateTask from './pages/admin/tasks/CreateTask';
import TaskReview from './pages/admin/tasks/TaskReview';
import WorksheetReview from './pages/admin/worksheet/WorksheetReview';
import TicketQueue from './pages/admin/tickets/TicketQueue';
import CreateTicket from './pages/admin/tickets/CreateTicket';
import TicketDetail from './pages/admin/tickets/TicketDetail';
import AssetInventory from './pages/admin/assets/AssetInventory';
import AssetAssign from './pages/admin/assets/AssetAssign';
import Departments from './pages/admin/organization/Departments';
import Designations from './pages/admin/organization/Designations';
import OrgChart from './pages/admin/organization/OrgChart';
import CompanyHolidays from './pages/admin/organization/CompanyHolidays';
import ReportsDashboard from './pages/admin/reports/ReportsDashboard';
import AttendanceReport from './pages/admin/reports/AttendanceReport';
import LeaveReport from './pages/admin/reports/LeaveReport';
import Announcements from './pages/admin/communication/Announcements';
import AdminSettings from './pages/admin/settings/AdminSettings';
import RolesPermissions from './pages/admin/settings/RolesPermissions';
import AuditLogs from './pages/admin/audit/AuditLogs';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <PopupProvider>
      <PresenceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Employee Routes */}
            <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leave-management" element={<LeaveManagement />} />
              <Route path="/worksheet" element={<Worksheet />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/projects" element={<EmployeeProjects />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/holidays" element={<Holidays />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="employees" element={<EmployeeDirectory />} />
                <Route path="employees/add" element={<AddEmployee />} />
                <Route path="employees/edit/:id" element={<AddEmployee />} />
                <Route path="employees/profile/:id" element={<EmployeeProfile />} />
                <Route path="employees/documents" element={<EmployeeDocuments />} />
                
                <Route path="attendance/live" element={<LiveAttendance />} />
                <Route path="attendance/history" element={<AttendanceHistory />} />
                <Route path="attendance/wfh" element={<WFHTracking />} />

                <Route path="leave/requests" element={<LeaveRequests />} />
                <Route path="leave/calendar" element={<LeaveCalendar />} />
                <Route path="leave/policies" element={<LeavePolicies />} />

                <Route path="tasks/projects" element={<AdminProjects />} />
                <Route path="tasks/dashboard" element={<TaskDashboard />} />
                <Route path="tasks/create" element={<CreateTask />} />
                <Route path="tasks/review" element={<TaskReview />} />

                <Route path="worksheet/review" element={<WorksheetReview />} />

                <Route path="tickets/queue" element={<TicketQueue />} />
                <Route path="tickets/create" element={<CreateTicket />} />
                <Route path="tickets/detail/:id" element={<TicketDetail />} />

                <Route path="assets/inventory" element={<AssetInventory />} />
                <Route path="assets/assign" element={<AssetAssign />} />

                <Route path="organization/departments" element={<Departments />} />
                <Route path="organization/designations" element={<Designations />} />
                <Route path="organization/chart" element={<OrgChart />} />
                <Route path="organization/holidays" element={<CompanyHolidays />} />

                <Route path="reports" element={<ReportsDashboard />} />
                <Route path="reports/attendance" element={<AttendanceReport />} />
                <Route path="reports/leave" element={<LeaveReport />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="settings/roles" element={<RolesPermissions />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </PresenceProvider>
    </PopupProvider>
  );
}

export default App;

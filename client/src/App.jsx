import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import MyRequests from './pages/MyRequests';
import SubmitRequest from './pages/SubmitRequest';
import RequestDetails from './pages/RequestDetails';
import AdminAllRequests from './pages/AdminAllRequests';
import Reports from './pages/Reports';
import ManageUsers from './pages/ManageUsers';
import CategoryManagement from './pages/CategoryManagement';
import Profile from './pages/Profile';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TechnicianTickets from './pages/TechnicianTickets';
import ManagerDashboard from './pages/ManagerDashboard';
import CommandPalette from './components/CommandPalette';
import ToastContainer from './components/ToastContainer';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/AnimationWrapper';

const queryClient = new QueryClient();


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const TechnicianRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || (user.role !== 'technician' && user.role !== 'manager' && user.role !== 'admin')) return <Navigate to="/dashboard" replace />;
  return children;
};

const ManagerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || (user.role !== 'manager' && user.role !== 'admin')) return <Navigate to="/dashboard" replace />;
  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const dashboardMap = {
    'admin': '/admin/dashboard',
    'manager': '/manager/dashboard',
    'technician': '/technician/dashboard',
    'user': '/dashboard'
  };
  return <Navigate to={dashboardMap[user.role] || '/dashboard'} replace />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/my-requests" element={<PageTransition><MyRequests /></PageTransition>} />
          <Route path="/submit-request" element={<PageTransition><SubmitRequest /></PageTransition>} />
          <Route path="/request/:id" element={<PageTransition><RequestDetails /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />

          {/* Technician Routes */}
          <Route path="/technician/dashboard" element={<TechnicianRoute><PageTransition><TechnicianDashboard /></PageTransition></TechnicianRoute>} />
          <Route path="/technician/tickets" element={<TechnicianRoute><PageTransition><TechnicianTickets /></PageTransition></TechnicianRoute>} />

          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={<ManagerRoute><PageTransition><ManagerDashboard /></PageTransition></ManagerRoute>} />
          <Route path="/manager/requests" element={<ManagerRoute><PageTransition><AdminAllRequests /></PageTransition></ManagerRoute>} />
          <Route path="/manager/performance" element={<ManagerRoute><PageTransition><Reports /></PageTransition></ManagerRoute>} />

          {/* Shared Admin/Manager Routes */}
          <Route path="/admin/users" element={<ManagerRoute><PageTransition><ManageUsers /></PageTransition></ManagerRoute>} />
          <Route path="/admin/reports" element={<ManagerRoute><PageTransition><Reports /></PageTransition></ManagerRoute>} />

          {/* Admin Only Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><PageTransition><Dashboard /></PageTransition></AdminRoute>} />
          <Route path="/admin/requests" element={<AdminRoute><PageTransition><AdminAllRequests /></PageTransition></AdminRoute>} />
          <Route path="/admin/categories" element={<ManagerRoute><PageTransition><CategoryManagement /></PageTransition></ManagerRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <Router>
              <CommandPalette />
              <ToastContainer />
              <AnimatedRoutes />
            </Router>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

// Import page components
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MemberManagement from './pages/MemberManagement';
import MemberEdit from './pages/MemberEdit';
import Profile from './pages/Profile';
import MemberRegistrationForm from './features/members/MemberRegistrationForm';
import Homepage from './pages/Homepage';
import About from './pages/About';
import Contact from './pages/Contact';
import FirstTimers from './pages/FirstTimers';
import AttendanceSystem from './components/attendance/AttendanceSystem';
import PrayerRequests from './pages/PrayerRequests';
import WelfareSupport from './pages/WelfareSupport';
import EvangelismReports from './pages/EvangelismReports';
import AdminDashboard from './pages/AdminDashboard';
import TestimonyManagement from './pages/TestimonyManagement';
import Testimonies from './pages/Testimonies';
import OfflineSettings from './pages/OfflineSettings';
import type { JSX } from 'react';

// Placeholder components (will be replaced with actual components)
const Events = () => <div>Events Page</div>;
const PhotoGallery = () => <div>Photo Gallery Page</div>;
const ResourceLibrary = () => <div>Resource Library Page</div>;
const ServiceOpportunities = () => <div>Service Opportunities Page</div>;
const NotFound = () => <div>404 Not Found</div>;

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    // Show loading state while checking auth
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    // Show loading state while checking auth
    return <div>Loading...</div>;
  }
  
  if (!isAdmin) {
    // Redirect to dashboard if not an admin
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <PWAInstallPrompt />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/first-timers" element={<FirstTimers />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/attendance" element={
            <ProtectedRoute>
              <AttendanceSystem />
            </ProtectedRoute>
          } />
          
          <Route path="/events" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />
          
          <Route path="/prayers" element={<ProtectedRoute><PrayerRequests /></ProtectedRoute>} />
          
          <Route path="/gallery" element={
            <ProtectedRoute>
              <PhotoGallery />
            </ProtectedRoute>
          } />
          
          <Route path="/prayer-requests" element={
            <ProtectedRoute>
              <PrayerRequests />
            </ProtectedRoute>
          } />
          
          <Route path="/welfare" element={
            <ProtectedRoute>
              <WelfareSupport />
            </ProtectedRoute>
          } />
          
          <Route path="/evangelism" element={
            <ProtectedRoute>
              <EvangelismReports />
            </ProtectedRoute>
          } />
          
          <Route path="/testimonies" element={
            <ProtectedRoute>
              <Testimonies />
            </ProtectedRoute>
          } />
          
          <Route path="/resources" element={
            <ProtectedRoute>
              <ResourceLibrary />
            </ProtectedRoute>
          } />
          
          <Route path="/service" element={
            <ProtectedRoute>
              <ServiceOpportunities />
            </ProtectedRoute>
          } />
          
          {/* Profile Completion Route */}
          <Route path="/complete-profile" element={
            <ProtectedRoute>
              <MemberRegistrationForm />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          <Route path="/admin/members" element={
            <AdminRoute>
              <MemberManagement />
            </AdminRoute>
          } />
          
          <Route path="/admin/members/edit/:memberId" element={
            <AdminRoute>
              <MemberEdit />
            </AdminRoute>
          } />
          
          <Route path="/admin/testimonies" element={
            <AdminRoute>
              <TestimonyManagement />
            </AdminRoute>
          } />
          
          <Route path="/testimonies" element={<Testimonies />} />
          
          <Route path="/offline-settings" element={
            <ProtectedRoute>
              <OfflineSettings />
            </ProtectedRoute>
          } />
          
          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
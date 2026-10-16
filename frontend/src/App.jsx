import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy-loaded pages for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const GovernmentSchemesPage = lazy(() => import('./pages/GovernmentSchemesPage'));
const SchemeDetailPage = lazy(() => import('./pages/SchemeDetailPage'));
const InstitutesPage = lazy(() => import('./pages/InstitutesPage'));
const InstituteDetailPage = lazy(() => import('./pages/InstituteDetailPage'));
const ApprenticeshipsPage = lazy(() => import('./pages/ApprenticeshipsPage'));
const SkillsDirectoryPage = lazy(() => import('./pages/SkillsDirectoryPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Page loading spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 text-sm font-medium">Loading...</p>
    </div>
  </div>
);

// Route guards
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/schemes" element={<GovernmentSchemesPage />} />
            <Route path="/schemes/:id" element={<SchemeDetailPage />} />
            <Route path="/institutes" element={<InstitutesPage />} />
            <Route path="/institutes/:id" element={<InstituteDetailPage />} />
            <Route path="/apprenticeships" element={<ApprenticeshipsPage />} />
            <Route path="/skills" element={<SkillsDirectoryPage />} />

            {/* Auth routes */}
            <Route path="/login" element={
              <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
            } />
            <Route path="/register" element={
              <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>
            } />

            {/* Student routes */}
            <Route path="/dashboard" element={
              <PrivateRoute><StudentDashboard /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><StudentProfile /></PrivateRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
              <PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;

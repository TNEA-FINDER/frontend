import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import CollegeFinder from './pages/CollegeFinder';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

// If logged in, redirect away from landing/login/register pages
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/finder'} replace />;
  return children;
};

// If NOT logged in, redirect to login
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/finder" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public landing — redirects logged-in users straight to their dashboard */}
              <Route path="/" element={
                <PublicRoute>
                  <Landing />
                </PublicRoute>
              } />

              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />

              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* Student: College Finder */}
              <Route path="/finder" element={
                <ProtectedRoute>
                  <CollegeFinder />
                </ProtectedRoute>
              } />

              {/* Admin Dashboard */}
              <Route path="/admin" element={
                <ProtectedRoute role="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer style={{
            padding: '1.5rem 2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            borderTop: '1px solid var(--glass-border)',
          }}>
            © 2026 TNEA College Finder · Built for Engineering Aspirants
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

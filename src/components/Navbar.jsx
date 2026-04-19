import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Search, GraduationCap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.2rem 2rem',
      background: 'rgba(5, 11, 24, 0.6)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid var(--glass-border)'
    }}>
      {/* Logo */}
      <Link to={user ? (user.role === 'ADMIN' ? '/admin' : '/finder') : '/'} style={{
        fontSize: '1.35rem', fontWeight: '800', color: 'white',
        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem'
      }}>
        <div style={{
          background: 'var(--primary-gradient)', padding: '0.45rem 0.55rem',
          borderRadius: '10px', display: 'flex', alignItems: 'center'
        }}>
          <GraduationCap size={20} color="white" />
        </div>
        TNEA Finder
      </Link>

      {/* Right side */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            {user.role === 'STUDENT' && (
              <Link to="/finder" style={navLinkStyle}>
                <Search size={16} /> Predict Colleges
              </Link>
            )}
            {user.role === 'ADMIN' && (
              <Link to="/admin" style={navLinkStyle}>
                <LayoutDashboard size={16} /> Admin Panel
              </Link>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              paddingLeft: '1rem', borderLeft: '1px solid var(--glass-border)'
            }}>
              <div style={{
                background: 'var(--primary-gradient)', borderRadius: '8px',
                width: '32px', height: '32px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: '700', color: 'white'
              }}>
                {user.username[0].toUpperCase()}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.username}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user.role}
                </div>
              </div>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171', padding: '0.45rem 0.9rem', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s'
              }}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/login" style={navLinkStyle}>Sign In</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.9rem' }}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const navLinkStyle = {
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  transition: 'color 0.2s ease',
  padding: '0.4rem 0'
};

export default Navbar;

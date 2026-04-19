import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, LogIn, UserPlus, Search, Shield, Zap } from 'lucide-react';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glow orbs */}
        <div style={{
          position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%', width: '350px', height: '350px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none'
        }} />

        {/* Icon */}
        <div style={{
          display: 'inline-flex', padding: '1.5rem',
          background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
          borderRadius: '28px', marginBottom: '2rem',
          boxShadow: '0 0 60px rgba(99,102,241,0.4)',
          animation: 'pulse 2s infinite'
        }}>
          <GraduationCap size={56} color="white" />
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: '800',
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          TNEA College Finder
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          marginBottom: '3.5rem',
          lineHeight: 1.7
        }}>
          Discover the best engineering colleges in Tamil Nadu based on your cutoff marks.
          Smart predictions. Seamless college selection.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '5rem' }}>
          <Link to="/login" className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2rem', gap: '0.6rem' }}>
            <LogIn size={20} /> Sign In
          </Link>
          <Link to="/register" style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            fontSize: '1rem', padding: '0.9rem 2rem',
            borderRadius: '12px', fontWeight: '600',
            color: 'var(--text-primary)',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid var(--glass-border)',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >
            <UserPlus size={20} /> Create Account
          </Link>
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', maxWidth: '800px', width: '100%' }}>
          {[
            { icon: <Search size={28} />, title: 'Smart Predictions', desc: 'Filter by cutoff, district, and college type instantly.' },
            { icon: <Shield size={28} />, title: 'Secure Access', desc: 'Role-based login for students and administrators.' },
            { icon: <Zap size={28} />, title: 'Real-time Data', desc: 'Up-to-date TNEA college data with TNEA codes.' }
          ].map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.75rem', textAlign: 'left' }}>
              <div style={{
                color: 'var(--accent-color)',
                marginBottom: '1rem',
                background: 'rgba(56,189,248,0.1)',
                borderRadius: '12px',
                width: '52px', height: '52px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {f.icon}
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.05rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 60px rgba(99,102,241,0.4); }
          50% { box-shadow: 0 0 100px rgba(99,102,241,0.7); }
        }
      `}</style>
    </div>
  );
};

export default Landing;

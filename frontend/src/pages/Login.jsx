import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]    = useState('');
  const [loading, setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.role);
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* ── LEFT PANEL (Image/Branding) ── */}
      <div style={{ flex: 1, display: 'none', lg: { display: 'flex' }, background: 'linear-gradient(135deg, #1DBF73 0%, #158b53 100%)', position: 'relative', overflow: 'hidden' }} className="d-none d-lg-flex">
        {/* Subtle pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}/>
        
        <div style={{ padding: '4rem', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', color: 'white' }}>
          <h1 className="anim-fade-up" style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Success starts<br/>right here.
          </h1>
          <p className="anim-fade-up delay-1" style={{ fontSize: '1.2rem', color: '#e9f9f1', maxWidth: 400, lineHeight: 1.6 }}>
            Join thousands of professionals finding great work and unmatched talent.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
        <div className="card anim-scale-in" style={{ width: '100%', maxWidth: 440, padding: '2.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '.5rem' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-sub)' }}>Sign in to continue to GigSpace</p>
          </div>

          {error && <div className="alert-red anim-fade-in" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Email Address</label>
              <input type="email" required className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="label">Password</label>
                <a href="#" style={{ fontSize: '.75rem', color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</a>
              </div>
              <input type="password" required className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"/>
            </div>

            <button type="submit" disabled={loading} className="btn-green" style={{ width: '100%', justifyContent: 'center', padding: '.85rem', marginTop: '.5rem', fontSize: '1rem' }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '.9rem', color: 'var(--text-sub)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none' }}>Join now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

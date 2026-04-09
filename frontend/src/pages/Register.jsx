import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [role, setRole] = useState('freelancer');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', skills: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    let skillsArr = [];
    if (role === 'freelancer') {
      skillsArr = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArr.length < 3) {
        return setError('Please provide at least 3 skills separated by commas.');
      }
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role, skills: skillsArr })
      });

      console.log('Response status:', res);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
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

  const handleInput = (f) => (e) => setFormData({ ...formData, [f]: e.target.value });

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* ── LEFT PANEL (Image/Branding) ── */}
      <div style={{ flex: 1, display: 'none', lg: { display: 'flex' }, background: 'linear-gradient(135deg, #1DBF73 0%, #158b53 100%)', position: 'relative', overflow: 'hidden' }} className="d-none d-lg-flex">
        {/* Subtle pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}/>
        
        <div style={{ padding: '4rem', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', color: 'white' }}>
          <h1 className="anim-fade-up" style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Find the perfect<br/>freelance services<br/>for your business.
          </h1>
          <p className="anim-fade-up delay-1" style={{ fontSize: '1.2rem', color: '#e9f9f1', maxWidth: 400, lineHeight: 1.6 }}>
            Or join as a freelancer to grow your career and work with great clients.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
        <div className="card anim-scale-in" style={{ width: '100%', maxWidth: 500, padding: '2.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '.5rem' }}>Create Account</h2>
            <p style={{ color: 'var(--text-sub)' }}>Sign up to get started with GigSpace</p>
          </div>

          {error && <div className="alert-red anim-fade-in" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Role selection */}
            <div>
              <label className="label">I want to...</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '.25rem' }}>
                <div onClick={() => setRole('freelancer')}
                  style={{ flex: 1, cursor: 'pointer', padding: '1.25rem', borderRadius: '.5rem', border: `2px solid ${role === 'freelancer' ? 'var(--green)' : 'var(--border)'}`, background: role === 'freelancer' ? 'var(--green-light)' : 'white', textAlign: 'center', transition: 'all .2s' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>💻</div>
                  <div style={{ fontWeight: 700, color: role === 'freelancer' ? 'var(--green)' : 'var(--text-main)' }}>Work as Freelancer</div>
                </div>
                <div onClick={() => setRole('employer')}
                  style={{ flex: 1, cursor: 'pointer', padding: '1.25rem', borderRadius: '.5rem', border: `2px solid ${role === 'employer' ? 'var(--green)' : 'var(--border)'}`, background: role === 'employer' ? 'var(--green-light)' : 'white', textAlign: 'center', transition: 'all .2s' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🏢</div>
                  <div style={{ fontWeight: 700, color: role === 'employer' ? 'var(--green)' : 'var(--text-main)' }}>Hire Talent</div>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Full Name</label>
              <input type="text" required className="input" value={formData.name} onChange={handleInput('name')} placeholder="John Doe"/>
            </div>
            
            <div>
              <label className="label">Email Address</label>
              <input type="email" required className="input" value={formData.email} onChange={handleInput('email')} placeholder="you@example.com"/>
            </div>
            
            <div>
              <label className="label">Password</label>
              <input type="password" required minLength="6" className="input" value={formData.password} onChange={handleInput('password')} placeholder="••••••••"/>
            </div>

            {role === 'freelancer' && (
              <div>
                <label className="label">Your Skills (At least 3)</label>
                <input type="text" required className="input" value={formData.skills} onChange={handleInput('skills')} placeholder="e.g. React, Node.js, UI Design (comma separated)"/>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-green" style={{ width: '100%', justifyContent: 'center', padding: '.85rem', marginTop: '.5rem', fontSize: '1rem' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '.9rem', color: 'var(--text-sub)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

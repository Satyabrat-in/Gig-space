import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import ManageProject from './pages/ManageProject';
import History from './pages/History';

function Layout({ children }) {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('userRole');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const active = (path) => location.pathname === path ? 'active' : '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Topbar ── */}
      <header style={{ background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
              Gig<span style={{ color: 'var(--green)' }}>Space</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '.25rem', flex: 1, justifyContent: 'center' }}>
            <Link to="/search" className={`nav-link ${active('/search')}`}>Explore</Link>
            {token && (
              <>
                <Link to="/dashboard" className={`nav-link ${active('/dashboard')}`}>Dashboard</Link>
                {role === 'freelancer' && (
                  <Link to="/inbox" className={`nav-link ${active('/inbox')}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    Inbox
                  </Link>
                )}
                <Link to="/history" className={`nav-link ${active('/history')}`}>History</Link>
              </>
            )}
          </nav>

          {/* Auth area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 }}>
            {token ? (
              <>
                <Link to="/profile" className={`nav-link ${active('/profile')}`} style={{ fontWeight: 600 }}>Profile</Link>
                <button onClick={handleLogout} className="btn-white" style={{ padding: '.5rem 1rem', color: '#ef4444', borderColor: '#fecaca' }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Sign In</Link>
                <Link to="/register" className="btn-green" style={{ textDecoration: 'none' }}>Join Free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      {children}

      {/* Footer */}
      <footer style={{ background: '#1a1a2e', color: '#9ca3af', padding: '2.5rem 1.5rem', marginTop: '4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Gig<span style={{ color: 'var(--green)' }}>Space</span></span>
          </div>
          <p style={{ fontSize: '.8rem' }}>© 2025 GigSpace — Connecting India's Best Talent with Ambitious Projects</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"                    element={<Home />}          />
          <Route path="/login"               element={<Login />}         />
          <Route path="/register"            element={<Register />}      />
          <Route path="/dashboard"           element={<Dashboard />}     />
          <Route path="/search"              element={<Search />}        />
          <Route path="/inbox"               element={<Inbox />}         />
          <Route path="/history"             element={<History />}       />
          <Route path="/project/create"      element={<CreateProject />} />
          <Route path="/project/manage/:id"  element={<ManageProject />} />
          <Route path="/project/:id"         element={<ProjectDetails />}/>
          <Route path="/profile"             element={<Profile />}       />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

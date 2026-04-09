import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const statusConfig = {
  open: { label: 'Open', cls: 'badge-blue' },
  'in-progress': { label: 'In Progress', cls: 'badge-orange' },
  completed: { label: 'Completed', cls: 'badge-gray' },
  pending: { label: 'Pending', cls: 'badge-orange' },
  accepted: { label: 'Accepted', cls: 'badge-green' },
  rejected: { label: 'Rejected', cls: 'badge-red' },
};

const Spinner = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 1rem', gap:'1rem' }}>
    <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--green)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Loading dashboard...</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('userRole');

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const endpoint = role === 'employer'
        ? 'http://localhost:5000/api/projects/my-projects'
        : 'http://localhost:5000/api/applications/my-applications';
      const res = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setData(result.projects || result.applications || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={{ minHeight:'calc(100vh - 64px)' }}><Spinner/></div>;

  // Compute AI Insight
  let aiInsight = null;
  if (data.length > 0) {
    if (role === 'freelancer') {
      const successful = data.filter(d => d.status === 'accepted' || d.status === 'completed' || d.status === 'in-progress');
      if (successful.length > 0) {
        const avgBid = successful.reduce((s, a) => s + (a.bidAmount || 0), 0) / successful.length;
        aiInsight = `Based on your ${successful.length} successful proposal(s), your optimal bidding sweet spot seems to be around ₹${Math.round(avgBid).toLocaleString('en-IN')}. Bids near this amount historically have a higher selection rate for your skill profile.`;
      } else {
        aiInsight = "You haven't had a proposal accepted yet. Consider temporarily lowering your initial bids to build reviews, or updating your required skills to get better AI Matches.";
      }
    } else {
      const openCount = data.filter(d => d.status === 'open').length;
      const completed = data.filter(d => d.status === 'completed').length;
      if (completed > 0) {
        aiInsight = `You have successfully completed ${completed} project(s). To attract top freelancers faster for your next project, ensure your budgets align with top-rated talent expectations.`;
      } else if (openCount > 0) {
        aiInsight = `You currently have ${openCount} open project(s). Tip: Projects with 3+ specific skill tags receive up to 40% more relevant, high-quality proposals.`;
      }
    }
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="anim-fade-up" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.25rem' }}>
            {role === 'employer' ? 'Project Hub' : 'My Workspace'}
          </h1>
          <p style={{ color: 'var(--text-sub)' }}>
            {role === 'employer' ? `You have ${data.length} active project${data.length !== 1 ? 's' : ''}` : `You have submitted ${data.length} proposal${data.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {role === 'employer' && (
          <Link to="/project/create" className="btn-green">
            Post New Project
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="anim-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {(role === 'employer'
          ? [
              { label: 'Total Projects', val: data.length, icon: '📁', color: '#1a56db' },
              { label: 'Open', val: data.filter(d => d.status === 'open').length, icon: '🟢', color: '#0e8a52' },
              { label: 'In Progress', val: data.filter(d => d.status === 'in-progress').length, icon: '⚡', color: '#c2410c' },
              { label: 'Completed', val: data.filter(d => d.status === 'completed').length, icon: '✅', color: '#4b5563' },
            ]
          : [
              { label: 'Total Proposals', val: data.length, icon: '📝', color: '#1a56db' },
              { label: 'Pending', val: data.filter(d => d.status === 'pending').length, icon: '⏳', color: '#c2410c' },
              { label: 'Accepted', val: data.filter(d => d.status === 'accepted').length, icon: '🎉', color: '#0e8a52' },
              { label: 'Rejected', val: data.filter(d => d.status === 'rejected').length, icon: '❌', color: '#b91c1c' },
            ]
        ).map((stat, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{stat.val}</div>
            <div style={{ fontSize: '.875rem', color: 'var(--text-sub)', marginTop: '.5rem', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* AI Insights Widget */}
      {aiInsight && (
        <div className="card anim-fade-up delay-2" style={{ marginBottom: '3rem', padding: '1.5rem', borderLeft: '4px solid #8b5cf6', background: 'linear-gradient(to right, #f5f3ff, white)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ fontSize: '1.5rem', background: 'white', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)' }}>💡</div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#6d28d9', marginBottom: '.25rem' }}>AI Powered Insight</h3>
              <p style={{ color: '#5b21b6', fontSize: '.95rem', lineHeight: 1.5 }}>{aiInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table / List */}
      <div className="card anim-fade-up delay-3">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {role === 'employer' ? 'Your Projects' : 'Your Applications'}
          </h3>
          <Link to="/search" style={{ fontSize: '.875rem', color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
            Browse more ↗
          </Link>
        </div>

        <div>
          {data.length === 0 ? (
            <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '.5rem' }}>Nothing here yet!</h3>
              <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
                {role === 'employer' ? "Post your first project and let's find some talent." : "Explore projects and submit your first proposal."}
              </p>
              <Link to={role === 'employer' ? '/project/create' : '/search'} className="btn-outline-green">
                {role === 'employer' ? 'Post a Project' : 'Explore Projects'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.map((item, idx) => {
                const title = role === 'employer' ? item.title : item.project?.title || 'Untitled Project';
                const status = item.status || 'open';
                const cfg = statusConfig[status] || { label: status, cls: 'badge-orange' };
                const href = role === 'employer' ? `/project/manage/${item._id}` : `/project/${item.project?._id}`;
                const budget = role === 'employer' ? item.budget : item.bidAmount;
                const d = new Date(item.createdAt);
                const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                return (
                  <div key={idx} style={{ padding: '1.25rem 1.5rem', borderBottom: idx < data.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="avatar" style={{ width: 44, height: 44, background: 'var(--green-light)', color: 'var(--green)', fontSize: '1.25rem', borderRadius: 8 }}>
                        {title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link to={href} style={{ fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none', display: 'block', marginBottom: 4 }}>
                          {title}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                          <span className={cfg.cls}>{cfg.label}</span>
                          {budget && <span style={{ fontSize: '.8rem', color: 'var(--text-sub)', fontWeight: 600 }}>₹{budget.toLocaleString('en-IN')}</span>}
                          <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{dateStr}</span>
                        </div>
                      </div>
                    </div>
                    <Link to={href} className="btn-white" style={{ padding: '.5rem 1rem', fontSize: '.8rem' }}>
                      {role === 'employer' ? 'Manage' : 'View'}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

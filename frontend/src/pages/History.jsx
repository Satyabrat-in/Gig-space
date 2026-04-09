import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Spinner = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 1rem', gap:'1rem' }}>
    <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--green)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Loading history...</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const statusStyles = {
  funded:   { label: 'Funded',   cls: 'badge-blue' },
  released: { label: 'Released', cls: 'badge-green' },
  refunded: { label: 'Refunded', cls: 'badge-gray' },
  disputed: { label: 'Disputed', cls: 'badge-red' },
};

const StarRating = ({ rating, size = 16 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={size} height={size} fill={i <= rating ? '#f59e0b' : '#e5e7eb'} viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

export default function History() {
  const [escrows, setEscrows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');
  const role = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [escrowRes, reviewRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/escrow/my-escrows`, { headers }),
        fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/reviews/${role === 'employer' ? 'my-reviews' : 'received'}`, { headers }),
      ]);

      if (escrowRes.ok) {
        const d = await escrowRes.json();
        setEscrows(d.escrows || []);
      }
      if (reviewRes.ok) {
        const d = await reviewRes.json();
        setReviews(d.reviews || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalEarned = escrows.filter(e => e.status === 'released').reduce((s, e) => s + e.amount, 0);
  const totalFunded = escrows.filter(e => e.status === 'funded').reduce((s, e) => s + e.amount, 0);

  if (loading) return <div style={{ minHeight:'calc(100vh - 64px)' }}><Spinner/></div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem', minHeight: 'calc(100vh - 64px)' }}>

      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.25rem' }}>History & Feedback</h1>
        <p style={{ color: 'var(--text-sub)' }}>Track your complete financial and review history</p>
      </div>

      {/* Summary Cards */}
      <div className="anim-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {[
          { label: role === 'employer' ? 'Total Spent' : 'Total Earned', val: `₹${totalEarned.toLocaleString('en-IN')}`, icon: '💰', color: '#0e8a52' },
          { label: 'Active Escrow', val: `₹${totalFunded.toLocaleString('en-IN')}`, icon: '🔒', color: '#1a56db' },
          { label: 'Completed Jobs', val: escrows.filter(e => e.status === 'released').length, icon: '✅', color: '#4b5563' },
          { label: role === 'employer' ? 'Reviews Given' : 'Reviews Received', val: reviews.length, icon: '⭐', color: '#c2410c' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '.875rem', color: 'var(--text-sub)', marginTop: '.5rem', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar anim-fade-up delay-2" style={{ marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('payments')} className={`tab-item ${activeTab === 'payments' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          💳 Payment History
        </button>
        <button onClick={() => setActiveTab('reviews')} className={`tab-item ${activeTab === 'reviews' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          ⭐ {role === 'employer' ? 'Reviews Given' : 'Reviews Received'}
        </button>
      </div>

      {/* ── PAYMENT HISTORY ── */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {escrows.length === 0 ? (
            <div className="card anim-fade-in" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💳</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '.5rem' }}>No Payment History</h3>
              <p style={{ color: 'var(--text-sub)' }}>Completed projects and escrow transactions will appear here.</p>
            </div>
          ) : escrows.map((e, idx) => {
            const cfg = statusStyles[e.status] || { label: e.status, cls: 'badge-orange' };
            return (
              <div key={e._id} className="card anim-fade-up" style={{ animationDelay: `${idx * 0.05}s`, padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="avatar" style={{ width: 44, height: 44, background: '#f3f4f6', fontSize: '1.25rem' }}>
                      {e.status === 'released' ? '✅' : e.status === 'funded' ? '🔒' : e.status === 'refunded' ? '↩️' : '⚠️'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4 }}>
                        <Link to={`/project/manage/${e.project?._id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                          {e.project?.title || 'Project'}
                        </Link>
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                        <span className={cfg.cls}>{cfg.label}</span>
                        <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>
                          {role === 'employer' ? `To: ${e.freelancer?.name}` : `From: ${e.employer?.companyName || e.employer?.name}`}
                        </span>
                        <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: e.status === 'released' ? 'var(--green)' : 'var(--text-main)' }}>
                      ₹{e.amount?.toLocaleString('en-IN')}
                    </div>
                    {e.status === 'released' && e.releasedAt && (
                      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Released {new Date(e.releasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    )}
                  </div>
                </div>

                {/* Transaction log */}
                {e.transactions?.length > 0 && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.75rem' }}>Transaction Log</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                      {e.transactions.map((t, ti) => (
                        <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.action === 'released' ? 'var(--green)' : t.action === 'funded' ? '#3b82f6' : '#f59e0b', flexShrink: 0 }}/>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>{t.action}</span>
                          <span style={{ color: 'var(--border)' }}>—</span>
                          <span style={{ color: 'var(--text-sub)' }}>{t.note}</span>
                          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── REVIEWS ── */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {reviews.length === 0 ? (
             <div className="card anim-fade-in" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⭐</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '.5rem' }}>No Reviews Yet</h3>
              <p style={{ color: 'var(--text-sub)' }}>
                {role === 'employer' ? 'Complete a project and leave a review for your freelancer.' : 'Complete projects to start receiving reviews from employers.'}
              </p>
            </div>
          ) : reviews.map((r, idx) => (
            <div key={r._id} className="card anim-fade-up" style={{ animationDelay: `${idx * 0.05}s`, padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, justifyContent: 'space-between', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  {/* Who reviewed */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="avatar" style={{ width: 40, height: 40, background: 'var(--green-light)', color: 'var(--green)', fontSize: '1.1rem' }}>
                      {(role === 'employer' ? r.freelancer?.name : r.employer?.name)?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.95rem' }}>
                        {role === 'employer' ? r.freelancer?.name : r.employer?.companyName || r.employer?.name}
                      </p>
                      <p style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>
                        Project: <Link to={`/project/${r.project?._id}`} style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>{r.project?.title}</Link>
                      </p>
                    </div>
                  </div>

                  {/* Overall star rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem' }}>
                    <StarRating rating={r.rating} />
                    <span style={{ fontWeight: 800, color: '#d97706' }}>{r.rating}/5</span>
                    <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {/* Comment */}
                  <div style={{ background: '#f9fafb', borderRadius: '.5rem', padding: '1rem', fontSize: '.875rem', color: 'var(--text-sub)', fontStyle: 'italic', border: '1px solid var(--border)' }}>
                    "{r.comment}"
                  </div>
                </div>

                {/* Sub-ratings */}
                {(r.communicationRating || r.qualityRating || r.timelinessRating) && (
                  <div style={{ width: '100%', maxWidth: 220, display: 'flex', flexDirection: 'column', gap: '.75rem', flexShrink: 0 }}>
                    {[
                      { label: 'Communication', val: r.communicationRating },
                      { label: 'Quality', val: r.qualityRating },
                      { label: 'Timeliness', val: r.timelinessRating },
                    ].filter(s => s.val).map(s => (
                      <div key={s.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-sub)' }}>{s.label}</span>
                          <span style={{ fontWeight: 700, color: '#d97706' }}>{s.val}</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${(s.val / 5) * 100}%`, background: '#f59e0b' }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

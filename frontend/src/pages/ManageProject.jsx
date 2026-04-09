import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const Spinner = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 1rem', gap:'1rem', minHeight:'calc(100vh - 64px)' }}>
    <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--green)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Loading project...</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const StarPicker = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}
        style={{ cursor: 'pointer', background: 'none', border: 'none', transition: 'all 0.15s', transform: 'scale(1)' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        <svg width="28" height="28" fill={n <= value ? '#f59e0b' : '#e5e7eb'} viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    ))}
  </div>
);

const statusConfig = {
  open:        { label: 'Open',        cls: 'badge-blue' },
  'in-progress':{ label: 'In Progress', cls: 'badge-orange' },
  completed:   { label: 'Completed',   cls: 'badge-gray' },
};

const PaymentModal = ({ amount, onClose, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem', animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUpModal { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulseOp { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
        .dummy-input {
          width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: 0.5rem;
          font-size: 0.95rem; outline: none; transition: border-color 0.2s; background: #fafafa;
        }
        .dummy-input:focus { border-color: var(--green); background: #fff; }
      `}</style>
      <div style={{
        background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '450px',
        overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        animation: 'slideUpModal 0.3s ease-out'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '6px', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              ₹
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Secure Checkout</h3>
          </div>
          {!processing && !success && (
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-sub)', lineHeight: 1 }}>&times;</button>
          )}
        </div>

        <div style={{ padding: '2rem 1.5rem' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'slideUpModal 0.4s' }}>
              <div style={{ width: 80, height: 80, background: 'var(--green-light)', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto 1.5rem' }}>
                ✓
              </div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: 'var(--text-main)' }}>Payment Successful</h2>
              <p style={{ margin: 0, color: 'var(--text-sub)' }}>₹{amount?.toLocaleString('en-IN')} has been secured in Escrow.</p>
            </div>
          ) : processing ? (
             <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ width: 50, height: 50, border: '4px solid var(--border)', borderTop: '4px solid var(--green)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Processing Payment...</h3>
              <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '0.9rem', animation: 'pulseOp 1.5s infinite' }}>Confirming with your bank</p>
            </div>
          ) : (
            <form onSubmit={handlePay}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--text-sub)', fontSize: '0.95rem' }}>Amount to Pay</p>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1.5rem', color: 'var(--text-sub)' }}>₹</span>{amount?.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sub)' }}>Card Number</label>
                  <div style={{ position: 'relative' }}>
                    <input required type="text" className="dummy-input" placeholder="4111 1111 1111 1111" maxLength="19" defaultValue="4111 1111 1111 1111" style={{ paddingLeft: '2.5rem', letterSpacing: '2px' }} />
                    <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>💳</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sub)' }}>Expiry</label>
                    <input required type="text" className="dummy-input" placeholder="MM/YY" defaultValue="12/26" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sub)' }}>CVC</label>
                    <input required type="text" className="dummy-input" placeholder="123" maxLength="3" defaultValue="123" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sub)' }}>Cardholder Name</label>
                  <input required type="text" className="dummy-input" placeholder="John Doe" defaultValue="Test User" />
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: 'var(--text-sub)', fontSize: '0.8rem' }}>
                <span role="img" aria-label="lock">🔒</span> Guaranteed Safe & Secure Checkout
              </div>

              <button type="submit" className="btn-green" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}>
                Pay ₹{amount?.toLocaleString('en-IN')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ManageProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [escrow, setEscrow] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [rating, setRating] = useState(5);
  const [commRating, setCommRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [timeRating, setTimeRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [pRes, appRes, escRes, invRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/projects/${id}`),
        fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/applications/project/${id}`, { headers }),
        fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/escrow/${id}`, { headers }),
        fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/invitations/project/${id}`, { headers }),
      ]);

      if (!pRes.ok) throw new Error('Project not found');
      const pData = await pRes.json(); setProject(pData.project);

      if (appRes.ok) { const d = await appRes.json(); setApplications(d.applications || []); }
      if (escRes.ok) { const d = await escRes.json(); setEscrow(d.escrow); }
      if (invRes.ok) { const d = await invRes.json(); setInvitations(d.invitations || []); }

      const revRes = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/reviews/project/${id}`);
      if (revRes.ok) { const d = await revRes.json(); setExistingReview(d.review); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAccept = async (appId) => {
    if (!window.confirm('Accept this proposal? Remaining proposals will be rejected.')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/applications/accept/${appId}`, { method: 'PUT', headers });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      fetchAll();
    } catch (err) { alert(err.message); }
  };

  const handleFundEscrow = async () => {
    setShowPaymentModal(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/escrow/fund`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, amount: project.budget })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      fetchAll();
    } catch (err) { alert(err.message); }
  };

  const handleRelease = async () => {
    if (!window.confirm('Release payment to freelancer? This marks the project as completed.')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/escrow/release/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Work approved. Payment released.' })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      fetchAll();
    } catch (err) { alert(err.message); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!project.assignedFreelancer) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/reviews/add`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id,
          freelancerId: project.assignedFreelancer._id || project.assignedFreelancer,
          rating: Number(rating),
          comment,
          communicationRating: commRating || undefined,
          qualityRating: qualityRating || undefined,
          timelinessRating: timeRating || undefined,
        })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setReviewSuccess(true);
      setExistingReview(d.review);
      fetchAll();
    } catch (err) { alert(err.message); }
    finally { setReviewSubmitting(false); }
  };

  if (loading) return <Spinner/>;
  if (!project) return <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', color:'#ef4444', fontWeight:700, fontSize:'1.25rem' }}>Project not found.</div>;

  const statusCfg = statusConfig[project.status] || statusConfig.open;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem', minHeight: 'calc(100vh - 64px)' }}>
      {/* Page heading */}
      <div className="anim-fade-up" style={{ marginBottom: '2.5rem' }}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-sub)', fontSize: '.875rem', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', marginBottom: '1rem' }}>
          ← Back to Dashboard
        </button>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem', color: 'var(--text-main)' }}>{project.title}</h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '.95rem' }}>{project.category}</p>
          </div>
          <span className={statusCfg.cls}>{statusCfg.label}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: { gridTemplateColumns: '1fr 2fr' }, gap: '2rem' }}>
        {/* ──── LEFT SIDEBAR ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Budget / Escrow Card */}
          <div className="card anim-fade-up" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              Finances
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <p className="section-label" style={{ marginBottom: '.25rem' }}>Project Budget</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>₹{project.budget?.toLocaleString('en-IN')}</div>
            </div>

            {/* Escrow state machine */}
            {project.status === 'open' && (
              <div className="alert-warn" style={{ fontSize: '.8rem' }}>
                Accept a proposal below to activate escrow.
              </div>
            )}

            {project.status === 'in-progress' && !escrow && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="alert-warn" style={{ fontSize: '.8rem' }}>
                  ⚠️ Fund escrow so your freelancer can start work.
                </div>
                <button onClick={() => setShowPaymentModal(true)} className="btn-green" style={{ width: '100%', justifyContent: 'center' }}>
                  Fund Escrow (₹{project.budget?.toLocaleString('en-IN')})
                </button>
              </div>
            )}

            {escrow && escrow.status === 'funded' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="alert-green" style={{ fontSize: '.8rem' }}>
                  🔒 ₹{escrow.amount?.toLocaleString('en-IN')} secured in escrow
                </div>
                <button onClick={handleRelease} className="btn-green" style={{ width: '100%', justifyContent: 'center', background: '#0e8a52' }}>
                  Approve Work & Release Payment
                </button>
              </div>
            )}

            {escrow && escrow.status === 'released' && (
              <div className="alert-green" style={{ fontSize: '.8rem' }}>
                ✅ Payment of ₹{escrow.amount?.toLocaleString('en-IN')} released!
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="card anim-fade-up delay-1" style={{ padding: '2rem' }}>
            <h3 className="section-label" style={{ marginBottom: '1.25rem' }}>Project Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-sub)' }}>Budget</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{project.budget?.toLocaleString('en-IN')}</span>
              </div>
              {project.deadline && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Deadline</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
              {project.assignedFreelancer && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Freelancer</span>
                  <span style={{ fontWeight: 700, color: 'var(--green)' }}>{project.assignedFreelancer.name || 'Hired'}</span>
                </div>
              )}
            </div>
            
            {project.skillsRequired?.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <p className="section-label" style={{ marginBottom: '.75rem' }}>Skills Required</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                  {project.skillsRequired.map((s, i) => (
                    <span key={i} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


        {/* ──── RIGHT PANEL ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Applications / Proposals */}
          <div className="card anim-fade-up delay-2">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Proposals</h3>
              <span className="badge-gray">{applications.length} received</span>
            </div>

            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <p style={{ color: 'var(--text-sub)', fontSize: '.95rem' }}>No proposals yet. Share your project to attract talent.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {applications.map((app, idx) => (
                  <div key={app._id} style={{ padding: '1.5rem', borderBottom: idx < applications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', sm: { flexDirection: 'row' }, gap: '1.5rem', justifyContent: 'space-between' }}>
                      
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                        <div className="avatar" style={{ width: 48, height: 48, background: 'var(--green-light)', color: 'var(--green)', fontSize: '1.25rem' }}>
                          {app.freelancer?.name?.charAt(0) || 'F'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{app.freelancer?.name || 'Freelancer'}</h4>
                            {app.freelancer?.averageRating > 0 && (
                              <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: 2 }}>
                                ★ {app.freelancer.averageRating}
                              </span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: '.95rem' }}>₹{app.bidAmount?.toLocaleString('en-IN')}</span>
                            <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>in {app.estimatedDays} days</span>
                          </div>
                          
                          <p style={{ fontSize: '.875rem', color: 'var(--text-sub)', lineHeight: 1.6, fontStyle: 'italic', background: '#f9fafb', padding: '1rem', borderRadius: '.5rem', border: '1px solid var(--border)' }}>
                            "{app.coverLetter}"
                          </p>

                          {app.freelancer?.skills?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '1rem' }}>
                              {app.freelancer.skills.slice(0, 4).map((s, i) => (
                                <span key={i} className="skill-tag">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.5rem' }}>
                        {app.status === 'pending' && project.status === 'open' ? (
                          <button onClick={() => handleAccept(app._id)} className="btn-green" style={{ padding: '.5rem 1.5rem' }}>
                            Accept
                          </button>
                        ) : (
                          <span className={app.status === 'accepted' ? 'badge-green' : 'badge-red'}>{app.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          {project.status === 'completed' && !existingReview && !reviewSuccess && (
            <div className="card anim-fade-up delay-3">
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: '#fffbeb' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>⭐</span> Review your Freelancer
                </h3>
              </div>

              <form onSubmit={handleReviewSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="label">Overall Rating</label>
                  <StarPicker value={rating} onChange={setRating}/>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                  {[
                    { label: 'Communication', val: commRating, set: setCommRating },
                    { label: 'Quality', val: qualityRating, set: setQualityRating },
                    { label: 'Timeliness', val: timeRating, set: setTimeRating },
                  ].map(s => (
                    <div key={s.label}>
                      <label className="label" style={{ marginBottom: '.5rem' }}>{s.label}</label>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(n => (
                          <button key={n} type="button" onClick={() => s.set(n)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>
                            <svg width="20" height="20" fill={n <= s.val ? '#f59e0b' : '#e5e7eb'} viewBox="0 0 24 24">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="label">Your Feedback</label>
                  <textarea required rows="4" value={comment} onChange={e => setComment(e.target.value)}
                    className="input" placeholder="Describe the quality of work, communication, and overall experience..."/>
                </div>

                <button type="submit" disabled={reviewSubmitting} className="btn-green" style={{ alignSelf: 'flex-start' }}>
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Review Submitted State */}
          {(existingReview || reviewSuccess) && (
            <div className="card anim-fade-up delay-3" style={{ padding: '2rem', border: '1px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-light)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                  ✅
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Review Submitted</h3>
                  <p style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>You reviewed this freelancer</p>
                </div>
              </div>
              {existingReview && (
                <div style={{ background: '#f9fafb', borderRadius: '.5rem', padding: '1rem', fontSize: '.875rem', color: 'var(--text-sub)', fontStyle: 'italic', border: '1px solid var(--border)' }}>
                  "{existingReview.comment}"
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          amount={project.budget}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handleFundEscrow}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Spinner = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 1rem', gap:'1rem' }}>
    <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--green)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Loading inbox...</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const statusConfig = {
  pending:  { label: 'Pending',  cls: 'badge-orange' },
  accepted: { label: 'Accepted', cls: 'badge-green' },
  declined: { label: 'Declined', cls: 'badge-red' },
};

export default function Inbox() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchInvitations(); }, []);

  const fetchInvitations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/invitations/my-invitations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) setInvitations(data.invitations || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRespond = async (invite, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/invitations/${invite._id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Response failed');
      if (status === 'accepted') {
        navigate(`/project/${invite.project._id}`);
      } else {
        fetchInvitations();
      }
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div style={{ minHeight:'calc(100vh - 64px)' }}><Spinner/></div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.25rem' }}>Inbox</h1>
          <p style={{ color: 'var(--text-sub)' }}>{invitations.length} invitation{invitations.length !== 1 ? 's' : ''} from employers</p>
        </div>
        {invitations.filter(i => i.status === 'pending').length > 0 && (
          <div className="badge-orange" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.8rem', padding: '.4rem 1rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c2410c', animation: 'pulse-dot 1.5s infinite' }}/>
            {invitations.filter(i => i.status === 'pending').length} pending
          </div>
        )}
      </div>

      {/* Invitations */}
      {invitations.length === 0 ? (
        <div className="card anim-fade-up delay-1" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '.5rem' }}>Your Inbox is Empty</h3>
          <p style={{ color: 'var(--text-sub)', maxWidth: 400, margin: '0 auto 1.5rem' }}>When an employer invites you to one of their projects, it will appear here.</p>
          <Link to="/search" className="btn-outline-green">Browse Projects</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {invitations.map((invite, idx) => {
            const cfg = statusConfig[invite.status] || statusConfig.pending;
            return (
              <div key={invite._id} className={`card anim-fade-up delay-${Math.min(idx+1, 4)}`} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, gap: '1.25rem', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    {/* From */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem' }}>
                      <div className="avatar" style={{ width: 44, height: 44, background: '#f3f4f6', color: '#4b5563', fontSize: '1.1rem' }}>
                        {invite.employer?.name?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, marginBottom: 2 }}>Invitation from</p>
                        <p style={{ fontSize: '.95rem', fontWeight: 700 }}>{invite.employer?.companyName || invite.employer?.name}</p>
                      </div>
                    </div>

                    {/* Project title */}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '.5rem' }}>
                      <Link to={`/project/${invite.project?._id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                        {invite.project?.title}
                      </Link>
                    </h3>

                    {/* Project info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      {invite.project?.budget && (
                        <span style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--green)' }}>₹{invite.project.budget?.toLocaleString('en-IN')}</span>
                      )}
                      <span className={cfg.cls}>{cfg.label}</span>
                    </div>

                    {/* Message */}
                    <div style={{ background: '#f9fafb', border: '1px solid var(--border)', borderRadius: '.5rem', padding: '1rem', fontSize: '.875rem', color: 'var(--text-sub)', fontStyle: 'italic', position: 'relative' }}>
                      <svg style={{ position: 'absolute', top: 12, left: 12, color: '#e5e7eb', width: 24, height: 24 }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                      </svg>
                      <span style={{ paddingLeft: '2rem', display: 'block' }}>"{invite.message || 'I would like to invite you to collaborate on this project.'}"</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '.75rem', flexDirection: 'column', flexShrink: 0, minWidth: 140 }}>
                    {invite.status === 'pending' ? (
                      <>
                        <button onClick={() => handleRespond(invite, 'accepted')} className="btn-green" style={{ justifyContent: 'center' }}>
                          Accept
                        </button>
                        <button onClick={() => handleRespond(invite, 'declined')} className="btn-white" style={{ justifyContent: 'center', color: '#b91c1c' }}>
                          Decline
                        </button>
                      </>
                    ) : (
                      <div className={cfg.cls} style={{ textAlign: 'center', display: 'block', padding: '.6rem' }}>{cfg.label}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

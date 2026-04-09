import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const Spinner = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 1rem', gap:'1rem', minHeight:'calc(100vh - 64px)' }}>
    <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--green)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Loading project...</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application form state
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const role = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProj = async () => {
      try {
        const pRes = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/projects/${id}`);
        const pData = await pRes.json();
        if (!pRes.ok) throw new Error(pData.message);
        
        setProject(pData.project);
        setBidAmount(pData.project.budget || '');
        
        if (pData.project.status === 'completed') {
          const rRes = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/reviews/project/${id}`);
          if (rRes.ok) {
            const rData = await rRes.json();
            setReview(rData.review);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProj();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/applications/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ projectId: id, bidAmount, estimatedDays, coverLetter })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setApplicationSuccess(true);
    } catch (err) { alert(err.message); }
    finally { setIsApplying(false); }
  };

  if (loading) return <Spinner/>;
  if (error || !project) return <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', color:'#b91c1c', fontWeight:700, fontSize:'1.25rem' }}>{error || 'Project not found.'}</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem', minHeight: 'calc(100vh - 64px)' }}>
      
      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: '2.5rem' }}>
        <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-sub)', fontSize: '.875rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1.25rem' }}>
          ← Back to Search
        </Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
              {project.category && <span className="badge-blue">{project.category}</span>}
              <span className={project.status === 'open' ? 'badge-green' : 'badge-gray'} style={{ textTransform: 'capitalize' }}>{project.status}</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{project.title}</h1>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.25rem' }}>
            <span style={{ fontSize: '.875rem', color: 'var(--text-sub)', fontWeight: 600 }}>Project Budget</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>₹{project.budget?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: { gridTemplateColumns: '2fr 1fr' }, gap: '2rem' }}>
        {/* ──── LEFT DETAILS ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card anim-fade-up delay-1" style={{ padding: '2rem' }}>
            <h3 className="section-label" style={{ marginBottom: '1rem' }}>Project Description</h3>
            <p style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 700, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {project.description}
            </p>
          </div>

          <div className="card anim-fade-up delay-2" style={{ padding: '2rem' }}>
            <h3 className="section-label" style={{ marginBottom: '1.5rem' }}>Required Skills</h3>
            {project.skillsRequired?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
                {project.skillsRequired.map((s, i) => (
                  <span key={i} className="skill-tag" style={{ padding: '.5rem 1rem', fontSize: '.875rem' }}>{s}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-sub)', fontSize: '.9rem' }}>No specific skills listed.</p>
            )}
          </div>

          {review && (
            <div className="card anim-fade-up delay-3" style={{ padding: '2rem', borderTop: '4px solid #f59e0b' }}>
              <h3 className="section-label" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}><span style={{ fontSize: '1.25rem' }}>⭐</span> Employer's Review</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width={20} height={20} fill={i <= review.rating ? '#f59e0b' : '#e5e7eb'} viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <span style={{ fontWeight: 800, color: '#d97706' }}>{review.rating}/5</span>
                <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>

              <div style={{ background: '#fffbeb', borderRadius: '.5rem', padding: '1.25rem', fontSize: '.95rem', color: '#92400e', fontStyle: 'italic', border: '1px solid #fde68a' }}>
                "{review.comment}"
              </div>

              {(review.communicationRating || review.qualityRating || review.timelinessRating) && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Communication', val: review.communicationRating },
                    { label: 'Quality', val: review.qualityRating },
                    { label: 'Timeliness', val: review.timelinessRating },
                  ].filter(s => s.val).map(s => (
                    <div key={s.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-sub)' }}>{s.label}</span>
                        <span style={{ fontWeight: 700, color: '#d97706' }}>{s.val}</span>
                      </div>
                      <div className="progress-track" style={{ height: 4 }}>
                        <div className="progress-fill" style={{ width: `${(s.val / 5) * 100}%`, background: '#f59e0b' }}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ──── RIGHT SIDEBAR ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* About Employer */}
          <div className="card anim-fade-up delay-1" style={{ padding: '2rem' }}>
            <h3 className="section-label" style={{ marginBottom: '1.5rem' }}>About the Employer</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="avatar" style={{ width: 56, height: 56, background: '#f3f4f6', color: '#4b5563', fontSize: '1.5rem' }}>
                {project.employer?.name?.charAt(0) || 'E'}
              </div>
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{project.employer?.companyName || project.employer?.name}</p>
                <p style={{ fontSize: '.875rem', color: 'var(--text-sub)' }}>Client</p>
              </div>
            </div>
            {project.deadline && (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
                <span style={{ color: 'var(--text-sub)' }}>Deadline</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Application Form */}
          {role === 'freelancer' && project.status === 'open' && (
            <div className="card anim-fade-up delay-2" style={{ padding: '2rem', borderTop: '4px solid var(--green)' }}>
              {applicationSuccess ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '.5rem' }}>Proposal Submitted!</h3>
                  <p style={{ color: 'var(--text-sub)', fontSize: '.9rem', marginBottom: '1.5rem' }}>The employer will review your bid shortly. Good luck!</p>
                  <Link to="/dashboard" className="btn-outline-green" style={{ width: '100%', justifyContent: 'center' }}>Go to Dashboard</Link>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Submit a Proposal</h3>
                  <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label className="label">Your Bid (₹)</label>
                      <input type="number" required min="1" className="input" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder={`e.g. ${project.budget}`}/>
                    </div>
                    <div>
                      <label className="label">Estimated Delivery (Days)</label>
                      <input type="number" required min="1" className="input" value={estimatedDays} onChange={e => setEstimatedDays(e.target.value)} placeholder="e.g. 7"/>
                    </div>
                    <div>
                      <label className="label">Cover Letter</label>
                      <textarea required rows="5" className="input" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Why are you the best fit for this project?"/>
                    </div>
                    <div>
                      <label className="label">Resume / Experience (Optional)</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem', background: '#f9fafb', padding: '1rem', borderRadius: '.5rem', border: '1px dashed var(--border)', transition: 'all 0.2s' }} className="file-upload-hover">
                        <style>{`.file-upload-hover:hover { border-color: var(--green) !important; background: #f0fdf4 !important; }`}</style>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ position: 'absolute', opacity: 0, top: 0, left: 0, bottom: 0, right: 0, width: '100%', cursor: 'pointer' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', color: selectedFile ? 'var(--green)' : 'var(--text-sub)', fontWeight: 600 }}>
                          <span style={{ fontSize: '1.25rem', color: selectedFile ? 'var(--green)' : '#9ca3af' }}>📄</span> 
                          {selectedFile ? selectedFile.name : 'Upload PDF or Word Document'}
                        </div>
                        {selectedFile && (
                          <div style={{ marginLeft: 'auto', fontSize: '.875rem', color: 'var(--text-sub)' }}>
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        )}
                      </div>
                    </div>
                    <button type="submit" disabled={isApplying} className="btn-green" style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem', padding: '.85rem' }}>
                      {isApplying ? 'Submitting...' : 'Send Proposal'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {role === 'employer' && project.employer?._id === localStorage.getItem('userId') && (
            <Link to={`/project/manage/${project._id}`} className="btn-green anim-fade-up delay-2" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
              Manage This Project →
            </Link>
          )}

          {(!token || role === 'employer') && project.status === 'open' && project.employer?._id !== localStorage.getItem('userId') && (
            <div className="card anim-fade-up delay-2" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-sub)', fontSize: '.95rem', marginBottom: '1rem' }}>Interested in this project?</p>
              {!token ? (
                <Link to="/login" className="btn-green" style={{ width: '100%', justifyContent: 'center' }}>Sign in to Apply</Link>
              ) : (
                <p style={{ fontSize: '.875rem', color: '#b91c1c', fontWeight: 600, background: '#fef2f2', padding: '.75rem', borderRadius: '.5rem' }}>Only freelancers can apply to projects.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = () => {
    fetch('http://localhost:5000/api/user/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => {
      if (!res.ok) { if (res.status === 401) window.location.href = '/login'; throw new Error(); }
      return res.json();
    })
    .then(data => { const u = data.user || data; setProfile(u); setFormData(u); })
    .catch(console.error);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let submitData = { ...formData };
      if (typeof submitData.skills === 'string') {
         submitData.skills = submitData.skills.split(',').map(s => s.trim()).filter(Boolean);
      }

      const res = await fetch('http://localhost:5000/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(submitData)
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      setProfile(data.user);
      setIsEditing(false);
    } catch (err) { alert(err.message); }
    finally { setIsSaving(false); }
  };

  if (!profile) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 1rem', gap:'1rem', minHeight:'calc(100vh - 64px)' }}>
      <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--green)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Loading profile...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const initial = profile.name?.charAt(0)?.toUpperCase();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem', minHeight: 'calc(100vh - 64px)' }}>
      
      {/* Profile Header Card */}
      <div className="card anim-fade-up" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, alignItems: 'flex-start', gap: '2rem' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="avatar" style={{ width: 100, height: 100, background: 'var(--green-light)', color: 'var(--green)', fontSize: '2.5rem', borderRadius: '50%' }}>
              {initial}
            </div>
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 22, height: 22, background: profile.isActive !== false ? '#10b981' : '#9ca3af', border: '3px solid white', borderRadius: '50%' }} title={profile.isActive !== false ? 'Online' : 'Offline'}/>
          </div>

          {/* Info */}
          <div style={{ flex: 1, width: '100%' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '.25rem' }}>{profile.name}</h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '1rem', marginBottom: '1rem' }}>{profile.email}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge-blue" style={{ textTransform: 'capitalize' }}>{profile.role}</span>
                  {profile.averageRating > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.25rem', fontSize: '.875rem', fontWeight: 700, color: '#d97706' }}>
                      ★ {profile.averageRating} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({profile.totalReviews} reviews)</span>
                    </span>
                  )}
                </div>
              </div>
              
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn-outline-green">
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        /* ── EDIT FORM ── */
        <div className="card anim-scale-in" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Edit Profile</h2>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })}/>
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 ..."/>
              </div>
            </div>

            {profile.role === 'freelancer' && (
              <>
                <div>
                  <label className="label">Bio</label>
                  <textarea className="input" rows="4" value={formData.bio || ''} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell clients about yourself..."/>
                </div>
                <div>
                  <label className="label">Skills</label>
                  <input className="input" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || '')} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="e.g. React, Node.js, UI Design..."/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label className="label">Highest Qualification</label>
                    <input className="input" value={formData.qualification || ''} onChange={e => setFormData({ ...formData, qualification: e.target.value })} placeholder="e.g. B.Tech in CS"/>
                  </div>
                  <div>
                    <label className="label">Experience</label>
                    <input className="input" value={formData.experience || ''} onChange={e => setFormData({ ...formData, experience: e.target.value })} placeholder="e.g. 2 years"/>
                  </div>
                </div>
                <div>
                  <label className="label">Portfolio / Document Link</label>
                  <input type="url" className="input" value={formData.documentLink || ''} onChange={e => setFormData({ ...formData, documentLink: e.target.value })} placeholder="https://..."/>
                </div>
              </>
            )}

            {profile.role === 'employer' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label className="label">Company Name</label>
                  <input className="input" value={formData.companyName || ''} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="Your Company"/>
                </div>
                <div>
                  <label className="label">Company Website</label>
                  <input type="url" className="input" value={formData.companyWebsite || ''} onChange={e => setFormData({ ...formData, companyWebsite: e.target.value })} placeholder="https://company.com"/>
                </div>
              </div>
            )}

            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-white">Cancel</button>
              <button type="submit" disabled={isSaving} className="btn-green">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ── VIEW MODE ── */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: { gridTemplateColumns: '2fr 1fr' }, gap: '1.5rem' }}>
          {profile.role === 'freelancer' ? (
            <>
              {/* Bio & Skills */}
              <div className="card anim-fade-up delay-1" style={{ padding: '2rem' }}>
                <h3 className="section-label" style={{ marginBottom: '1rem' }}>About</h3>
                <p style={{ fontSize: '.95rem', color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: '2rem' }}>
                  {profile.bio || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No bio provided. Click "Edit Profile" to add your story.</span>}
                </p>

                {profile.skills?.length > 0 && (
                  <>
                    <h3 className="section-label" style={{ marginBottom: '1rem' }}>Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                      {profile.skills.map((s, i) => (
                        <span key={i} className="skill-tag" style={{ fontSize: '.875rem', padding: '.4rem .8rem' }}>{s}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Side Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card anim-fade-up delay-2" style={{ padding: '1.5rem' }}>
                  <h3 className="section-label" style={{ marginBottom: '.75rem' }}>Qualification</h3>
                  <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.95rem' }}>{profile.qualification || <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Not specified</span>}</p>
                </div>
                
                <div className="card anim-fade-up delay-3" style={{ padding: '1.5rem' }}>
                  <h3 className="section-label" style={{ marginBottom: '.75rem' }}>Experience</h3>
                  <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.95rem' }}>{profile.experience || <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Not specified</span>}</p>
                </div>

                <div className="card anim-fade-up delay-4" style={{ padding: '1.5rem' }}>
                  <h3 className="section-label" style={{ marginBottom: '.75rem' }}>Portfolio / Docs</h3>
                  {profile.documentLink
                    ? <a href={profile.documentLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', fontWeight: 600, fontSize: '.95rem', textDecoration: 'none' }}>
                        View Document ↗
                      </a>
                    : <span style={{ color: 'var(--text-muted)', fontSize: '.95rem' }}>No link added</span>
                  }
                </div>
              </div>
            </>
          ) : (
            /* Employer View */
            <div className="card anim-fade-up delay-1" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
              <h3 className="section-label" style={{ marginBottom: '1.5rem' }}>Company Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                <div>
                  <p style={{ fontSize: '.8rem', color: 'var(--text-sub)', marginBottom: '.25rem' }}>Company Name</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{profile.companyName || <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Not specified</span>}</p>
                </div>
                <div>
                  <p style={{ fontSize: '.8rem', color: 'var(--text-sub)', marginBottom: '.25rem' }}>Website</p>
                  {profile.companyWebsite
                    ? <a href={profile.companyWebsite} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none' }}>{profile.companyWebsite}</a>
                    : <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Not specified</span>
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

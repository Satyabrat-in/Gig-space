import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Stars = ({ n = 0, size = 14 }) => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(n) ? '#f59e0b' : '#e5e7eb', fontSize: size }}>{i <= Math.round(n) ? '★' : '☆'}</span>)}
  </div>
);

const Spinner = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 1rem', gap:'1rem' }}>
    <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--green)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Searching...</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function Search() {
  const [tab, setTab] = useState('projects');
  const [jobs, setJobs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [freelancerSkills, setFreelancerSkills] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [skill, setSkill] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sort, setSort] = useState('newest');
  const [minRating, setMinRating] = useState('');

  const role  = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');

  // Invite modal
  const [modal, setModal] = useState(false);
  const [selF, setSelF] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invite, setInvite] = useState({ projectId:'', message:'' });
  const [inviting, setInviting] = useState(false);

  useEffect(() => { doSearch(); }, [tab]);

  const doSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true); setHasSearched(true);
    try {
      if (tab === 'projects') {
        const p = new URLSearchParams();
        if (keyword)   p.set('keyword', keyword);
        if (skill)     p.set('skill', skill);
        if (minBudget) p.set('minBudget', minBudget);
        if (maxBudget) p.set('maxBudget', maxBudget);
        if (sort)      p.set('sort', sort);
        const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/search/jobs?${p}`);
        const d = await res.json();
        setJobs(d.projects || []);
      } else if (tab === 'freelancers') {
        const p = new URLSearchParams();
        if (keyword)   p.set('keyword', keyword);
        if (skill)     p.set('skill', skill);
        if (minRating) p.set('minRating', minRating);
        if (sort)      p.set('sort', sort);
        const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/search/freelancers?${p}`);
        const d = await res.json();
        setFreelancers(d.freelancers || []);
      } else if (tab === 'ai-matches') {
        const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/search/recommendations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = await res.json();
        setRecommendations(d.recommendations || []);
        setFreelancerSkills(d.freelancerSkills || []);
      }
    } catch(err){console.error(err);}
    finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/projects/my-projects`, { headers:{Authorization:`Bearer ${token}`} });
    const d = await res.json();
    if (res.ok) setProjects((d.projects||[]).filter(p=>p.status==='open'&&p.isActive));
  };

  const openModal = (f) => { setSelF(f); setModal(true); fetchProjects(); };
  const closeModal = () => { setModal(false); setSelF(null); setInvite({projectId:'',message:''}); };

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!invite.projectId) return alert('Select a project');
    setInviting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/invitations/invite`, {
        method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body: JSON.stringify({ projectId:invite.projectId, freelancerId:selF._id, message:invite.message })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      alert('Invitation sent!'); closeModal();
    } catch(err){alert(err.message);}
    finally { setInviting(false); }
  };

  const count = tab === 'projects' ? jobs.length : (tab === 'freelancers' ? freelancers.length : recommendations.length);

  return (
    <div style={{ background:'var(--bg)', minHeight:'calc(100vh - 64px)' }}>
      {/* ── Header strip ── */}
      <div style={{ background:'white', borderBottom:'1px solid var(--border)', padding:'1.5rem', display: tab === 'ai-matches' ? 'none' : 'block' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <form onSubmit={doSearch} style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', alignItems:'center' }}>
            {/* Keyword */}
            <div style={{ flex:'1 1 200px', display:'flex', alignItems:'center', gap:8, background:'#f7f8fa', border:'1.5px solid var(--border)', borderRadius:'.5rem', padding:'0 1rem' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
              </svg>
              <input placeholder={tab==='projects'?'Search projects...':'Search freelancers...'}
                style={{ flex:1, border:'none', background:'transparent', outline:'none', padding:'.7rem 0', fontSize:'.875rem' }}
                value={keyword} onChange={e=>setKeyword(e.target.value)}/>
            </div>
            {/* Skill */}
            <input className="input" style={{ flex:'0 1 160px' }} placeholder="Skill (e.g. React)" value={skill} onChange={e=>setSkill(e.target.value)}/>
            {/* Budget (projects only) */}
            {tab==='projects'&&<>
              <input type="number" className="input" style={{ flex:'0 1 120px' }} placeholder="Min ₹" value={minBudget} onChange={e=>setMinBudget(e.target.value)}/>
              <input type="number" className="input" style={{ flex:'0 1 120px' }} placeholder="Max ₹" value={maxBudget} onChange={e=>setMaxBudget(e.target.value)}/>
            </>}
            {/* Min rating (freelancers) */}
            {tab==='freelancers'&&(
              <select className="input" style={{ flex:'0 1 140px' }} value={minRating} onChange={e=>setMinRating(e.target.value)}>
                <option value="">Any Rating</option>
                <option value="1">1★ & above</option>
                <option value="2">2★ & above</option>
                <option value="3">3★ & above</option>
                <option value="4">4★ & above</option>
              </select>
            )}
            {/* Sort */}
            <select className="input" style={{ flex:'0 1 165px' }} value={sort} onChange={e=>setSort(e.target.value)}>
              {tab==='projects'
                ? <><option value="newest">Newest First</option><option value="budget-high">Highest Budget</option><option value="budget-low">Lowest Budget</option><option value="popular">Most Popular</option></>
                : <><option value="rating-high">Top Rated</option><option value="most-reviews">Most Reviews</option><option value="newest">Newest</option></>
              }
            </select>
            <button type="submit" className="btn-green">Search</button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 1.5rem' }}>
        {/* Tab switcher */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
          <div className="tab-bar" style={{ flexGrow:1 }}>
            <button className={`tab-item ${tab==='projects'?'active':''}`} onClick={()=>setTab('projects')}>📁 Projects</button>
            <button className={`tab-item ${tab==='freelancers'?'active':''}`} onClick={()=>setTab('freelancers')}>👤 Freelancers</button>
            {role === 'freelancer' && (
              <button className={`tab-item ${tab==='ai-matches'?'active':''}`} onClick={()=>setTab('ai-matches')} style={{ display:'flex', alignItems:'center', gap:'.25rem' }}>
                <span style={{ fontSize:'1.1rem' }}>✨</span> AI Matches
              </button>
            )}
          </div>
          {hasSearched && <span style={{ fontSize:'.8rem', color:'var(--text-muted)', fontWeight:600 }}>{count} result{count!==1?'s':''} found</span>}
        </div>

        {/* Results */}
        {loading ? <Spinner/> : (
          <>
            {/* PROJECTS GRID */}
            {tab==='projects'&&(
              jobs.length===0
              ? <EmptyState icon="📁" msg={hasSearched?'No projects match your search. Adjust filters above.':'Search for projects using the filters above.'} />
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.25rem' }}>
                  {jobs.map((job, idx) => <ProjectCard key={job._id} job={job} idx={idx}/>)}
                </div>
            )}

            {/* FREELANCERS GRID */}
            {tab==='freelancers'&&(
              freelancers.length===0
              ? <EmptyState icon="👤" msg={hasSearched?'No freelancers match your search.':'Search for talent using the filters above.'} />
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.25rem' }}>
                  {freelancers.map((f, idx) => <FreelancerCard key={f._id} f={f} idx={idx} role={role} onInvite={openModal}/>)}
                </div>
            )}

            {/* AI MATCHES GRID */}
            {tab==='ai-matches'&&(
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '1rem', padding: '1.5rem 2rem', marginBottom: '2rem', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div style={{ fontSize: '2.5rem', background: 'white', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(22,163,74,0.1)' }}>✨</div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', marginBottom: '.5rem' }}>AI Powered Recommendations</h3>
                    <p style={{ color: '#15803d', lineHeight: 1.5 }}>We've analyzed your skills ({freelancerSkills?.slice(0,3).join(', ')}{freelancerSkills?.length>3?'...':''}) and matched them with the best open projects on the platform.</p>
                  </div>
                </div>

                {recommendations.length===0
                  ? <EmptyState icon="🤔" msg={freelancerSkills?.length === 0 ? 'You need to add skills to your profile first.' : 'No matching projects found right now. Check back later!'} />
                  : <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1.25rem' }}>
                      {recommendations.map((job, idx) => (
                        <div key={job._id} style={{ position: 'relative' }}>
                          <ProjectCard job={job} idx={idx} width="100%" />
                          <div style={{ position: 'absolute', top: 12, right: 12, background: 'white', padding: '.4rem .75rem', borderRadius: '99px', fontSize: '.75rem', fontWeight: 800, color: '#16a34a', border: '1.5px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.5-6.3-4.8-6.3 4.8 2.3-7.5-6-4.6h7.6z"/></svg>
                            {job.matchScore} matching skill{job.matchScore!==1?'s':''}
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </div>
            )}
          </>
        )}
      </div>

      {/* Invite Modal */}
      {modal&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
          <div className="card anim-scale-in" style={{ width:'100%',maxWidth:460,borderRadius:'1rem',overflow:'hidden' }}>
            <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 style={{ fontSize:'1rem', fontWeight:700 }}>Invite {selF?.name}</h3>
                <p style={{ fontSize:'.8rem', color:'var(--text-muted)', marginTop:2 }}>Send them a project invitation</p>
              </div>
              <button onClick={closeModal} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'1.5rem',color:'var(--text-muted)',lineHeight:1 }}>&times;</button>
            </div>
            <form onSubmit={sendInvite} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label className="label">Select your project</label>
                {projects.length===0
                  ? <div className="alert-warn">You have no open projects. <Link to="/project/create">Create one</Link> first.</div>
                  : <select required className="input" value={invite.projectId} onChange={e=>setInvite({...invite,projectId:e.target.value})}>
                      <option value="">-- Choose a project --</option>
                      {projects.map(p=><option key={p._id} value={p._id}>{p.title}</option>)}
                    </select>
                }
              </div>
              <div>
                <label className="label">Message (optional)</label>
                <textarea className="input" rows="3" placeholder="Introduce yourself and explain why you think they're a good fit..." value={invite.message} onChange={e=>setInvite({...invite,message:e.target.value})}/>
              </div>
              <div style={{ display:'flex', gap:'.75rem', justifyContent:'flex-end' }}>
                <button type="button" onClick={closeModal} className="btn-white">Cancel</button>
                <button type="submit" disabled={inviting||projects.length===0} className="btn-green">{inviting?'Sending...':'Send Invite'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, msg }) {
  return (
    <div style={{ textAlign:'center', padding:'5rem 1rem' }}>
      <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>{icon}</div>
      <p style={{ color:'var(--text-sub)', fontSize:'1rem' }}>{msg}</p>
    </div>
  );
}

function ProjectCard({ job, idx }) {
  return (
    <Link to={`/project/${job._id}`} style={{ textDecoration:'none', display:'block' }}
      className={`card anim-fade-up`} style2={{ animationDelay:`${idx*.05}s` }}>
      <div style={{ padding:'1.25rem' }}>
        {/* Category pill */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.75rem' }}>
          {job.category && <span className="badge-blue">{job.category}</span>}
          <span className="badge-green">Open</span>
        </div>
        {/* Title */}
        <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--text-main)', marginBottom:'.5rem', lineHeight:1.4 }}>{job.title}</h3>
        {/* Description */}
        <p style={{ fontSize:'.825rem', color:'var(--text-sub)', lineHeight:1.6, marginBottom:'1rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {job.description}
        </p>
        {/* Skills */}
        {job.skillsRequired?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem', marginBottom:'1rem' }}>
            {job.skillsRequired.slice(0,4).map((s,i)=><span key={i} className="skill-tag">{s}</span>)}
            {job.skillsRequired.length>4&&<span style={{ fontSize:'.7rem', color:'var(--text-muted)' }}>+{job.skillsRequired.length-4}</span>}
          </div>
        )}
      </div>
      {/* Footer */}
      <div style={{ padding:'.9rem 1.25rem', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa' }}>
        <div>
          <span style={{ fontSize:'.7rem', color:'var(--text-muted)', display:'block' }}>Budget</span>
          <span style={{ fontSize:'1.05rem', fontWeight:800, color:'var(--green)' }}>₹{job.budget?.toLocaleString('en-IN')}</span>
        </div>
        {job.deadline && (
          <div style={{ textAlign:'right' }}>
            <span style={{ fontSize:'.7rem', color:'var(--text-muted)', display:'block' }}>Due</span>
            <span style={{ fontSize:'.8rem', fontWeight:600, color:'var(--text-sub)' }}>
              {new Date(job.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
            </span>
          </div>
        )}
        <span style={{ fontSize:'.8rem', fontWeight:600, color:'var(--green)', display:'flex', alignItems:'center', gap:4 }}>
          View <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </span>
      </div>
    </Link>
  );
}

function FreelancerCard({ f, idx, role, onInvite }) {
  const colors = ['#1DBF73','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#06b6d4'];
  const color  = colors[idx % colors.length];
  return (
    <div className={`card anim-fade-up`} style={{ display:'flex', flexDirection:'column' }}>
      {/* Card top */}
      <div style={{ padding:'1.25rem' }}>
        <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start', marginBottom:'1rem' }}>
          <div className="avatar" style={{ width:52, height:52, background:color, fontSize:'1.25rem', borderRadius:12 }}>
            {f.name?.charAt(0)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ fontSize:'.95rem', fontWeight:700, color:'var(--text-main)', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</h3>
            {f.averageRating > 0 ? (
              <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:3 }}>
                <span style={{ color:'#f59e0b', fontSize:'.9rem' }}>★</span>
                <span style={{ fontSize:'.8rem', fontWeight:700, color:'var(--text-main)' }}>{f.averageRating}</span>
                <span style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>({f.totalReviews} review{f.totalReviews!==1?'s':''})</span>
              </div>
            ) : <p style={{ fontSize:'.75rem', color:'var(--text-muted)', marginBottom:3 }}>No reviews yet</p>}
            {f.qualification && <p style={{ fontSize:'.75rem', color:'var(--text-sub)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.qualification}</p>}
          </div>
        </div>

        {/* Bio */}
        <p style={{ fontSize:'.825rem', color:'var(--text-sub)', lineHeight:1.6, marginBottom:'1rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', minHeight:'2.6rem' }}>
          {f.bio || 'No bio provided.'}
        </p>

        {/* Skills */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem', minHeight:'1.5rem' }}>
          {f.skills?.slice(0,4).map((s,i)=><span key={i} className="skill-tag">{s}</span>)}
          {f.skills?.length>4&&<span style={{ fontSize:'.7rem', color:'var(--text-muted)', alignSelf:'center' }}>+{f.skills.length-4}</span>}
        </div>
      </div>

      {/* Card footer */}
      <div style={{ marginTop:'auto', padding:'.9rem 1.25rem', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fafafa' }}>
        {f.documentLink
          ? <a href={f.documentLink} target="_blank" rel="noopener noreferrer"
              style={{ fontSize:'.8rem', color:'var(--green)', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
              Portfolio ↗
            </a>
          : <span/>
        }
        {role==='employer'&&(
          <button onClick={()=>onInvite(f)} className="btn-green" style={{ padding:'.45rem 1rem', fontSize:'.8rem' }}>
            Invite
          </button>
        )}
      </div>
    </div>
  );
}

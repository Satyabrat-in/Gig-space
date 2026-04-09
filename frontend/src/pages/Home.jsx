import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { icon: '💻', label: 'Web Development' },
  { icon: '🎨', label: 'Graphics & Design' },
  { icon: '✍️', label: 'Content Writing' },
  { icon: '📱', label: 'Mobile Apps' },
  { icon: '📊', label: 'Data & Analytics' },
  { icon: '🎬', label: 'Video & Animation' },
  { icon: '📢', label: 'Digital Marketing' },
  { icon: '🔒', label: 'Cybersecurity' },
];

const steps = [
  { num: '01', title: 'Post Your Project', desc: 'Describe what you need and set your budget. Takes under 3 minutes.' },
  { num: '02', title: 'Receive Proposals', desc: 'Talented freelancers send tailored bids with cover letters.' },
  { num: '03', title: 'Choose & Hire', desc: 'Review profiles, ratings, and portfolios. Accept the best fit.' },
  { num: '04', title: 'Pay Safely via Escrow', desc: 'Funds are locked in escrow and released only when you approve the work.' },
];

const testimonials = [
  { name: 'Rahul Sharma', role: 'Startup Founder', text: 'Found an amazing React developer in under 24 hours. The escrow system gave me complete peace of mind.', rating: 5 },
  { name: 'Priya Patel', role: 'Freelance Designer', text: 'GigSpace has completely replaced other platforms for me. Higher quality clients, fair payment guaranteed.', rating: 5 },
  { name: 'Aditya Kumar', role: 'E-commerce Owner', text: 'Hired 3 freelancers for my project. Every single one was professional and delivered on time.', rating: 5 },
];

const Stars = ({ n }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? '#f59e0b' : '#e5e7eb', fontSize: '1rem' }}>★</span>)}
  </div>
);

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ─── HERO ─────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)', color: 'var(--text-main)', padding: '6rem 1.5rem 5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-80, right:-80, width:400, height:400, borderRadius:'50%', background:'rgba(29,191,115,.05)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-100, left:-100, width:350, height:350, borderRadius:'50%', background:'rgba(29,191,115,.04)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1100, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
          <div className="anim-fade-up" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(29,191,115,.1)', border:'1px solid rgba(29,191,115,.2)', borderRadius:99, padding:'.4rem 1rem', marginBottom:'1.75rem' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', display:'inline-block', animation:'pulse-dot 1.5s ease infinite' }}/>
            <span style={{ fontSize:'.8rem', fontWeight:600, color:'#065f46', letterSpacing:'.05em' }}>INDIA'S TRUSTED FREELANCING PLATFORM</span>
          </div>

          <h1 className="anim-fade-up delay-1" style={{ fontSize:'clamp(2.2rem,5vw,3.75rem)', fontWeight:900, lineHeight:1.08, marginBottom:'1.5rem', letterSpacing:'-1px' }}>
            Find Exceptional Talent <br/>
            <span style={{ color:'var(--green)' }}>For Every Project</span>
          </h1>

          <p className="anim-fade-up delay-2" style={{ fontSize:'1.125rem', color:'var(--text-sub)', maxWidth:580, margin:'0 auto 2.5rem', lineHeight:1.7 }}>
            Connect with top-tier freelancers across India. Secure escrow payments, verified reviews, and smart matching — all in one place.
          </p>

          {/* Hero Search */}
          <div className="anim-fade-up delay-3" style={{ maxWidth:620, margin:'0 auto 3rem' }}>
            <div style={{ display:'flex', background:'white', borderRadius:'.5rem', overflow:'hidden', border: '1px solid var(--border)', boxShadow:'0 16px 40px rgba(0,0,0,.08)' }}>
              <svg style={{ margin:'auto .75rem auto 1.25rem', flexShrink:0, color:'#9ca3af' }} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
              </svg>
              <input className="input-search" style={{ flex:1, fontSize:'1rem' }} placeholder='Try "React developer", "logo design"...'
                onKeyDown={(e)=>{ if(e.key==='Enter') window.location.href=`/search?q=${e.target.value}`; }}/>
              <Link to="/search" className="btn-green" style={{ borderRadius:0, padding:'.85rem 1.75rem', fontSize:'.95rem' }}>Search</Link>
            </div>
          </div>

          {/* Stats */}
          <div className="anim-fade-up delay-4" style={{ display:'flex', justifyContent:'center', gap:'3rem', flexWrap:'wrap' }}>
            {[['12K+','Freelancers'],['₹8Cr+','Paid out'],['3K+','Projects done'],['4.9★','Avg rating']].map(([val,lbl]) => (
              <div key={lbl} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.75rem', fontWeight:900, color:'var(--text-main)' }}>{val}</div>
                <div style={{ fontSize:'.8rem', color:'var(--text-sub)', marginTop:2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────── */}
      <section style={{ padding:'4rem 1.5rem', background:'white', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <h2 className="anim-fade-up" style={{ textAlign:'center', fontSize:'1.75rem', fontWeight:800, marginBottom:'.75rem' }}>Browse by Category</h2>
          <p className="anim-fade-up delay-1" style={{ textAlign:'center', color:'var(--text-sub)', marginBottom:'2.5rem' }}>Find skilled professionals across every discipline</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem' }}>
            {categories.map((c, i) => (
              <Link key={c.label} to={`/search?skill=${encodeURIComponent(c.label.split(' ')[0])}`}
                className={`card anim-fade-up delay-${Math.min(i+1,4)}`}
                style={{ padding:'1.5rem 1rem', textAlign:'center', cursor:'pointer', textDecoration:'none', aspectRatio:'1/1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'.75rem' }}>
                <span style={{ fontSize:'2rem' }}>{c.icon}</span>
                <span style={{ fontSize:'.8rem', fontWeight:600, color:'var(--text-main)', lineHeight:1.3 }}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────── */}
      <section style={{ padding:'5rem 1.5rem', background:'var(--bg)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
            <span className="section-label">How It Works</span>
            <h2 style={{ fontSize:'1.75rem', fontWeight:800, marginTop:'.5rem' }}>Hire great talent in 4 simple steps</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'2rem' }}>
            {steps.map(s => (
              <div key={s.num} className="anim-fade-up" style={{ position:'relative', paddingTop:'1rem' }}>
                <div style={{ fontSize:'.7rem', fontWeight:800, color:'var(--green)', letterSpacing:'.1em', marginBottom:'.5rem' }}>{s.num}</div>
                <h3 style={{ fontSize:'1.05rem', fontWeight:700, marginBottom:'.6rem' }}>{s.title}</h3>
                <p style={{ fontSize:'.875rem', color:'var(--text-sub)', lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────── */}
      <section style={{ padding:'5rem 1.5rem', background:'white' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <span className="section-label">Testimonials</span>
            <h2 style={{ fontSize:'1.75rem', fontWeight:800, marginTop:'.5rem' }}>Trusted by thousands</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.5rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} className={`card anim-fade-up delay-${i+1}`} style={{ padding:'1.75rem' }}>
                <Stars n={t.rating}/>
                <p style={{ fontSize:'.9rem', color:'var(--text-sub)', lineHeight:1.7, margin:'1rem 0 1.25rem', fontStyle:'italic' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                  <div className="avatar" style={{ width:38, height:38, background:'var(--green)', fontSize:'.9rem' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'.875rem' }}>{t.name}</div>
                    <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────── */}
      <section style={{ padding:'5rem 1.5rem', background:'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)', textAlign:'center', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <h2 style={{ color:'var(--text-main)', fontSize:'2rem', fontWeight:800, marginBottom:'1rem' }}>Ready to get started?</h2>
          <p style={{ color:'var(--text-sub)', marginBottom:'2rem', fontSize:'1rem' }}>Join thousands of professionals building their careers and projects on GigSpace.</p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn-green" style={{ fontSize:'1rem', padding:'.85rem 2rem' }}>Create Free Account</Link>
            <Link to="/search" className="btn-white" style={{ fontSize:'1rem', padding:'.85rem 2rem', textDecoration:'none' }}>View Projects</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  'Web Development', 'Graphics & Design', 'Content Writing',
  'Mobile Apps', 'Data & Analytics', 'Video & Animation',
  'Digital Marketing', 'Cybersecurity', 'Other'
];

export default function CreateProject() {
  const [formData, setFormData] = useState({
    title: '', description: '', budget: '', deadline: '', category: categories[0], skillsRequired: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArr = formData.skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('http://localhost:5000/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, skillsRequired: skillsArr })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  const handleInput = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem', minHeight: 'calc(100vh - 64px)' }}>
      
      <div className="anim-fade-up" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '.5rem', letterSpacing: '-0.5px' }}>Post a Project</h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem' }}>Tell us what you need done, and we'll connect you with top talent.</p>
      </div>

      <div className="card anim-fade-up delay-1" style={{ padding: '2.5rem', borderTop: '4px solid var(--green)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label className="label">Project Title <span style={{ color: '#b91c1c' }}>*</span></label>
            <input required className="input" value={formData.title} onChange={handleInput('title')} placeholder="e.g. Build a responsive React website"/>
          </div>

          <div>
            <label className="label">Description <span style={{ color: '#b91c1c' }}>*</span></label>
            <textarea required className="input" rows="5" value={formData.description} onChange={handleInput('description')} placeholder="Describe the scope, deliverables, and any specific requirements..."/>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="label">Category <span style={{ color: '#b91c1c' }}>*</span></label>
              <select required className="input" value={formData.category} onChange={handleInput('category')}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Budget (₹) <span style={{ color: '#b91c1c' }}>*</span></label>
              <input required type="number" min="1" className="input" value={formData.budget} onChange={handleInput('budget')} placeholder="e.g. 50000"/>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="label">Required Skills</label>
              <input className="input" value={formData.skillsRequired} onChange={handleInput('skillsRequired')} placeholder="e.g. React, Node.js, MongoDB (comma separated)"/>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input type="date" className="input" value={formData.deadline} onChange={handleInput('deadline')} min={new Date().toISOString().split('T')[0]}/>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
            <button type="submit" disabled={loading} className="btn-green" style={{ padding: '.85rem 2.5rem', fontSize: '1rem' }}>
              {loading ? 'Posting...' : 'Post Project'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

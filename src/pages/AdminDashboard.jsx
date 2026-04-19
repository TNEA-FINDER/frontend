import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2, Save, X, Building2 } from 'lucide-react';

const AdminDashboard = () => {
  const [colleges, setColleges] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newCollege, setNewCollege] = useState({
    tneaCode: '',
    name: '',
    district: '',
    category: 'AUTONOMOUS',
    cutoffMax: ''
  });
  const [activeTab, setActiveTab] = useState('colleges');

  const tabStyleTop = {
    background: 'none',
    border: 'none',
    padding: '1.2rem 1rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.2s',
  };

  useEffect(() => {
    fetchColleges();
    fetchStudents();
  }, []);

  
  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data);
    } catch (err) {
      console.error(err);
    }
  };
    
  const fetchColleges = async () => {
    try {
      const response = await api.get('/admin/colleges');
      setColleges(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/colleges', newCollege);
      setNewCollege({ name: '', district: '', category: 'AUTONOMOUS', cutoffMax: '' });
      fetchColleges();
    fetchStudents();
    } catch (err) {
      alert('Error adding college');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this college?')) {
      try {
        await api.delete(`/admin/colleges/${id}`);
        fetchColleges();
    fetchStudents();
      } catch (err) {
        alert('Error deleting college');
      }
    }
  };

  const startEdit = (college) => {
    setEditingId(college.id);
    setEditFormData(college);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/admin/colleges/${editingId}`, editFormData);
      setEditingId(null);
      fetchColleges();
    fetchStudents();
    } catch (err) {
      alert('Error updating college');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
      {/* ══ Tabs Navigation ══ */}
      <div style={{ display: 'flex', padding: '0 2rem', gap: '2rem', background: 'rgba(8,13,28,0.4)', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
        <button onClick={() => setActiveTab('colleges')} style={{ ...tabStyleTop, borderBottom: activeTab === 'colleges' ? '2px solid var(--accent-color)' : 'none', color: activeTab === 'colleges' ? 'var(--accent-color)' : 'var(--text-secondary)' }}>Colleges Management</button>
        <button onClick={() => setActiveTab('students')} style={{ ...tabStyleTop, borderBottom: activeTab === 'students' ? '2px solid var(--accent-color)' : 'none', color: activeTab === 'students' ? 'var(--accent-color)' : 'var(--text-secondary)' }}>Registered Students</button>
      </div>

      <div className="container" style={{ flex: 1 }}>
        {activeTab === 'colleges' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Admin Dashboard - Manage Colleges</h2>
              <div className="badge badge-autonomous">Administrator Access</div>
            </div>

      <div className="glass-card" style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Add New College
        </h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>TNEA Code</label>
            <input
              type="text"
              value={newCollege.tneaCode}
              onChange={(e) => setNewCollege({...newCollege, tneaCode: e.target.value})}
              placeholder="e.g. 2648"
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>College Name</label>
            <input 
              type="text" 
              value={newCollege.name} 
              onChange={(e) => setNewCollege({...newCollege, name: e.target.value})}
              required
              placeholder="College full name"
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>District</label>
            <input 
              type="text" 
              value={newCollege.district} 
              onChange={(e) => setNewCollege({...newCollege, district: e.target.value})}
              required
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Type</label>
            <select value={newCollege.category} onChange={(e) => setNewCollege({...newCollege, category: e.target.value})}>
              <option value="AUTONOMOUS">Autonomous</option>
              <option value="NON_AUTONOMOUS">Non-Autonomous</option>
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Max Cutoff</label>
            <input 
              type="number" 
              step="0.01"
              value={newCollege.cutoffMax} 
              onChange={(e) => setNewCollege({...newCollege, cutoffMax: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ height: '45px' }}>
            Add College
          </button>
        </form>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem', overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>TNEA Code</th>
                <th>Name</th>
                <th>District</th>
                <th>Type</th>
                <th>Cutoff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map(college => (
                <tr key={college.id}>
                  {editingId === college.id ? (
                    <>
                      <td><input type="text" value={editFormData.tneaCode || ''} onChange={(e) => setEditFormData({...editFormData, tneaCode: e.target.value})} style={{ width: '80px', padding: '0.4rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '6px' }} /></td>
                      <td><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="input-group" style={{ padding: '0.4rem' }} /></td>
                      <td><input type="text" value={editFormData.district} onChange={(e) => setEditFormData({...editFormData, district: e.target.value})} className="input-group" style={{ padding: '0.4rem' }}/></td>
                      <td>
                        <select value={editFormData.category} onChange={(e) => setEditFormData({...editFormData, category: e.target.value})} style={{ padding: '0.4rem', border: '1px solid var(--glass-border)', background: 'var(--input-bg)', color: 'white' }}>
                          <option value="AUTONOMOUS">Autonomous</option>
                          <option value="NON_AUTONOMOUS">Non-Autonomous</option>
                        </select>
                      </td>
                      <td><input type="number" step="0.01" value={editFormData.cutoffMax} onChange={(e) => setEditFormData({...editFormData, cutoffMax: e.target.value})} style={{ width: '80px', padding: '0.4rem' }}/></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={handleUpdate} className="btn-primary" style={{ padding: '0.4rem', background: '#10b981' }}><Save size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="btn-primary" style={{ padding: '0.4rem', background: '#64748b' }}><X size={16} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: '#a78bfa', fontWeight: '700', fontSize: '0.85rem' }}>
                          {college.tneaCode || '—'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{college.name}</td>
                      <td>{college.district}</td>
                      <td>
                        <span className={`badge badge-${(college.category || 'unknown').toLowerCase().replace('_', '-')}`}>
                          {(college.category || 'Unknown').replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
                        {college.cutoffMax ? college.cutoffMax.toFixed(2) : 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => startEdit(college)} className="btn-primary" style={{ padding: '0.4rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)' }}><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(college.id)} className="btn-primary" style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
          </>
        )}

        {activeTab === 'students' && (
          <div className="glass-card" style={{ marginBottom: '3rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               Registered Students
            </h3>
            <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, index) => (
                    <tr key={s.id || index}>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{s.username}</td>
                      <td><span className="badge badge-non-autonomous">{s.role}</span></td>
                    </tr>
                  ))}
                  {students.length === 0 && <tr><td colSpan="2">No students found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

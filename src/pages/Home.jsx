import React, { useState } from 'react';
import api from '../services/api';
import { Search, Download, GraduationCap, MapPin, Building2 } from 'lucide-react';

const Home = () => {
  const [filters, setFilters] = useState({
    cutoff: '',
    district: 'All Districts',
    type: 'All Types'
  });
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const districts = [
    'All Districts', 'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 
    'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
    'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem',
    'Sivagangai', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli',
    'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
    'Vellore', 'Viluppuram', 'Virudhunagar'
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const response = await api.get('/colleges/predict', { params: filters });
      setColleges(response.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div style={{ display: 'inline-block', padding: '1.25rem', background: 'var(--primary-gradient)', borderRadius: '24px', marginBottom: '1.5rem', boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)' }}>
          <GraduationCap size={48} color="white" />
        </div>
        <h1>TNEA College Finder</h1>
        <p>Discover the best engineering colleges in Tamil Nadu based on your cutoff marks. Experience seamless college selection.</p>
      </header>

      <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto 4rem auto' }}>
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Your Cutoff Mark</label>
            <input 
              type="number" 
              step="0.01"
              value={filters.cutoff} 
              onChange={(e) => setFilters({...filters, cutoff: e.target.value})}
              placeholder="e.g., 185" 
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>District Preference</label>
            <select value={filters.district} onChange={(e) => setFilters({...filters, district: e.target.value})}>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>College Type</label>
            <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
              <option value="All Types">All Types</option>
              <option value="Autonomous">Autonomous</option>
              <option value="Non-Autonomous">Non-Autonomous</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ height: '45px' }}>
            {loading ? 'Searching...' : <><Search size={18} /> Predict Colleges</>}
          </button>
        </form>
      </div>

      {searched && (
        <div className="glass-card" style={{ overflow: 'hidden', padding: '0' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Found {colleges.length} Colleges</h3>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.5rem 1rem' }}>
              <Download size={16} /> Download PDF
            </button>
          </div>
          
          <div style={{ padding: '1rem', overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>College Name</th>
                  <th>District</th>
                  <th>Type</th>
                  <th>Max Cutoff</th>
                </tr>
              </thead>
              <tbody>
                {colleges.length > 0 ? (
                  colleges.map(college => (
                    <tr key={college.id}>
                      <td style={{ fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.4rem', borderRadius: '8px', color: 'var(--accent-color)' }}>
                            <Building2 size={16} />
                          </div>
                          {college.name}
                        </div>
                      </td>
                      <td>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                           <MapPin size={14} /> {college.district}
                         </div>
                      </td>
                      <td>
                        <span className={`badge badge-${college.type.toLowerCase().replace('_', '-')}`}>
                          {college.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: '800', color: 'var(--accent-color)' }}>{college.maxCutoff.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      No colleges found matching your criteria. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

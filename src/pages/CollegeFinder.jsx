import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import {
  Search, Building2, MapPin, Hash, TrendingDown, BookOpen,
  IndianRupee, X, GraduationCap, Download, ChevronDown, ChevronUp, Calculator
} from 'lucide-react';

/* ─── Static data ─────────────────────────────────────────────── */
// District names must exactly match what is stored in the DB
const DISTRICTS = [
  'Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore',
  'Dharmapuri','Dindigul','Erode','Kanchipuram','Kanniyakumari',
  'Karur','Krishnagiri','Madurai','Nagapattinam','Namakkal',
  'Perambalur','Pudukkottai','Ramanathapuram','Salem',
  'Sivaganga','Thanjavur','The Nilgiris','Theni','Thiruvallur',
  'Thirunelveli','Thiruvarur','Thoothukudi','Tiruchirappalli',
  'Tiruppur','Tiruvannamalai','Vellore','Villupuram','Virudhunagar',
];

const COURSES = [
  '','Aeronautical Engineering','B.Arch (Architecture)','Biomedical Engineering',
  'Computer Science and Engineering','Civil Engineering',
  'Electronics and Communication Engineering','Electrical and Electronics Engineering',
  'Electronics and Instrumentation Engineering','Information Technology',
  'Mechanical Engineering','Automobile Engineering',
];

const CATEGORIES = [
  { label: 'All Types', value: '' },
  { label: 'Autonomous', value: 'AUTONOMOUS' },
  { label: 'Non-Autonomous', value: 'NON_AUTONOMOUS' },
];

const catLabel = cat => ({ AUTONOMOUS:'Autonomous', NON_AUTONOMOUS:'Non-Autonomous',
  GOVERNMENT_AIDED:'Non-Autonomous', SELF_FINANCING:'Non-Autonomous',
  DEEMED_UNIVERSITY:'Non-Autonomous' }[cat] || (cat || 'Unknown'));

const catColor = cat => ({
  AUTONOMOUS:        { bg:'rgba(212,175,55,.15)',  col:'#d4af37', brd:'rgba(212,175,55,.4)' },
  NON_AUTONOMOUS:    { bg:'rgba(170,124,17,.15)',  col:'#cb9b51', brd:'rgba(170,124,17,.4)' },
  GOVERNMENT_AIDED:  { bg:'rgba(170,124,17,.15)',  col:'#cb9b51', brd:'rgba(170,124,17,.4)' },
  SELF_FINANCING:    { bg:'rgba(170,124,17,.15)',  col:'#cb9b51', brd:'rgba(170,124,17,.4)' },
  DEEMED_UNIVERSITY: { bg:'rgba(170,124,17,.15)',  col:'#cb9b51', brd:'rgba(170,124,17,.4)' },
}[cat] || { bg:'rgba(255,255,255,.05)', col:'#b1a7a6', brd:'rgba(255,255,255,.1)' });

/* ─── Bulk PDF generator (all filtered colleges in one PDF) ───── */
const downloadAllPDF = (colleges, filters) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const addHeader = (pageNum, total) => {
    // Dark header bar
    doc.setFillColor(18, 12, 3);
    doc.rect(0, 0, W, 22, 'F');
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 0, W, 2, 'F');

    doc.setTextColor(212, 175, 55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TNEA COLLEGE FINDER', 10, 10);

    doc.setTextColor(200, 180, 120);
    doc.setFontSize(8);
    doc.text(`College Search Results  |  ${new Date().toLocaleDateString('en-IN')}`, 10, 17);

    doc.setTextColor(160, 140, 80);
    doc.setFontSize(7);
    doc.text(`Page ${pageNum} of ${total}`, W - 20, 17);
  };

  const COLS = [
    { label: 'TNEA Code', key: 'tneaCode',   w: 22 },
    { label: 'College Name', key: 'name',     w: 90 },
    { label: 'District',  key: 'district',    w: 28 },
    { label: 'Type',      key: '_type',       w: 28 },
    { label: 'Course',    key: 'course',      w: 60 },
    { label: 'Cutoff',    key: '_cutoff',     w: 26 },
  ];

  const ROW_H = 9;
  const TABLE_TOP = 28;
  const PAGE_ROWS = Math.floor((H - TABLE_TOP - 10) / ROW_H);
  const totalPages = Math.ceil(colleges.length / PAGE_ROWS);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) doc.addPage();
    addHeader(page + 1, totalPages);

    let x = 10;
    let y = TABLE_TOP;

    // Table header row
    doc.setFillColor(30, 22, 5);
    doc.rect(10, y, W - 20, ROW_H, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.rect(10, y, W - 20, ROW_H);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(212, 175, 55);
    x = 10;
    COLS.forEach(col => {
      doc.text(col.label.toUpperCase(), x + 2, y + 6);
      x += col.w;
    });
    y += ROW_H;

    // Data rows
    const slice = colleges.slice(page * PAGE_ROWS, (page + 1) * PAGE_ROWS);
    slice.forEach((c, idx) => {
      const rowBg = idx % 2 === 0 ? [15, 10, 2] : [22, 16, 4];
      doc.setFillColor(...rowBg);
      doc.rect(10, y, W - 20, ROW_H, 'F');
      doc.setDrawColor(60, 45, 10);
      doc.setLineWidth(0.2);
      doc.line(10, y + ROW_H, W - 10, y + ROW_H);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(230, 210, 160);

      x = 10;
      COLS.forEach(col => {
        let val = '';
        if (col.key === '_type')   val = catLabel(c.category);
        else if (col.key === '_cutoff') val = `${c.cutoffMin ?? ''} - ${c.cutoffMax ?? ''}`;
        else val = String(c[col.key] || '—');
        const lines = doc.splitTextToSize(val, col.w - 3);
        doc.text(lines[0], x + 2, y + 6);
        x += col.w;
      });
      y += ROW_H;
    });

    // Border for whole table
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.4);
    doc.rect(10, TABLE_TOP, W - 20, (slice.length + 1) * ROW_H);
  }

  // Footer on each page
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(100, 80, 30);
    doc.text('Generated by TNEA College Finder. Data is indicative only.', 10, H - 4);
  }

  doc.save(`tnea_colleges_${colleges.length}_results.pdf`);
};

/* ─── Main Component ──────────────────────────────────────────── */
const CollegeFinder = () => {
  const [filters, setFilters] = useState({ districts: [], category: '', course: '', cutoff: '' });
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [districtOpen, setDistrictOpen] = useState(false);
  const dropRef = useRef(null);

  // Calculator State
  const [marks, setMarks] = useState({ physics: '', chemistry: '', maths: '' });
  const calculatedCutoff = React.useMemo(() => {
    const p = parseFloat(marks.physics) || 0;
    const c = parseFloat(marks.chemistry) || 0;
    const m = parseFloat(marks.maths) || 0;
    if (!marks.physics && !marks.chemistry && !marks.maths) return null;
    const cutoff = m + (p / 2) + (c / 2);
    return cutoff.toFixed(2);
  }, [marks]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setDistrictOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (filters.districts.length > 0) params.district = filters.districts.join(',');
      if (filters.category)             params.category = filters.category;
      if (filters.course)               params.course   = filters.course;
      if (filters.cutoff && Number(filters.cutoff) > 0) params.cutoff = Number(filters.cutoff);
      const response = await api.get('/colleges/predict', { params });
      setColleges(response.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ districts: [], category: '', course: '', cutoff: '' });
    setColleges([]);
    setSearched(false);
  };

  const toggleDistrict = (d) => {
    setFilters(prev => {
      const has = prev.districts.includes(d);
      return { ...prev, districts: has ? prev.districts.filter(x => x !== d) : [...prev.districts, d] };
    });
  };

  const activeCount = [filters.districts.length > 0, !!filters.category, !!filters.course, !!filters.cutoff].filter(Boolean).length;

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'calc(100vh - 120px)' }}>

      {/* ── Tab navigation ── */}
      <div style={{ display:'flex', padding:'0 2rem', gap:'2rem', background:'rgba(8,13,28,.4)', borderBottom:'1px solid var(--glass-border)' }}>
        {[['dashboard','Dashboard & Procedure'],['calculator','Cutoff Calculator'],['search','College Finder']].map(([key,label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            background:'none', border:'none', padding:'1.2rem 0.5rem', fontSize:'1rem', fontWeight:'600',
            cursor:'pointer', transition:'color .2s', whiteSpace:'nowrap',
            borderBottom: activeTab===key ? '2px solid var(--accent-color)' : '2px solid transparent',
            color: activeTab===key ? 'var(--accent-color)' : 'var(--text-secondary)',
          }}>{label}</button>
        ))}
      </div>

      {/* ══ DASHBOARD TAB ══ */}
      {activeTab === 'dashboard' && (
        <div style={{ padding:'3rem 2rem', maxWidth:'1000px', margin:'0 auto', width:'100%' }}>
          <div className="glass-card">
            <h2 style={{ fontSize:'1.8rem', color:'var(--accent-color)', marginBottom:'1rem', textAlign:'center' }}>
              TNEA Counselling Procedure Workflow
            </h2>
            <p style={{ textAlign:'center', color:'var(--text-secondary)', marginBottom:'2.5rem' }}>
              Follow this step-by-step flowchart to understand the Tamil Nadu Engineering Admissions process.
            </p>


            <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              {[
                ['1','Online Registration','Register online and pay the application fee before the deadline.'],
                ['2','Random Number Assignment','TNEA assigns a random number to break ties between students with identical scores.'],
                ['3','Certificates Verification','Upload required documents online or visit TFC centers for verification.'],
                ['4','Publication of Rank List','Check your overall and community rank published officially.'],
                ['5','Choice Filling & Modification','Select and prioritize your preferred colleges and courses based on your eligible cutoff.'],
                ['6','Tentative Allotment','System generates your tentative allotment. You must confirm or decline.'],
                ['7','Provisional Allotment','Download your provisional allotment order and report to the college!'],
              ].map(([step, title, desc], i, arr) => (
                <React.Fragment key={step}>
                  <div style={{ display:'flex', gap:'1.5rem', alignItems:'center', background:'rgba(255,255,255,.03)', padding:'1.1rem 1.3rem', borderRadius:'12px', border:'1px solid var(--glass-border)' }}>
                    <div style={{ background:'var(--primary-gradient)', color:'white', fontWeight:'bold', fontSize:'1.1rem', width:'42px', height:'42px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{step}</div>
                    <div>
                      <h4 style={{ fontSize:'1rem', marginBottom:'0.2rem', color:'var(--text-primary)' }}>{title}</h4>
                      <p style={{ fontSize:'0.87rem', color:'var(--text-secondary)' }}>{desc}</p>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div style={{ textAlign:'center', color:'var(--accent-color)', opacity:0.4, fontSize:'1.4rem' }}>↓</div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ CALCULATOR TAB ══ */}
      {activeTab === 'calculator' && (
        <div style={{ padding:'3rem 2rem', maxWidth:'800px', margin:'0 auto', width:'100%' }}>
          <div className="glass-card">
            <h2 style={{ fontSize:'1.8rem', color:'var(--accent-color)', marginBottom:'1rem', textAlign:'center' }}>
              Cutoff Calculator
            </h2>
            <p style={{ textAlign:'center', color:'var(--text-secondary)', marginBottom:'2.5rem' }}>
              Calculate your exact TNEA engineering admission cutoff based on your plus two subjects.
            </p>

            <div style={{ background:'rgba(255,255,255,.02)', borderRadius:'16px', border:'1px solid rgba(212,175,55,.2)', padding:'1.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem', borderBottom:'1px solid rgba(255,255,255,.05)', paddingBottom:'1rem' }}>
                <Calculator size={24} color="#d4af37" />
                <h3 style={{ margin:0, fontSize:'1.3rem', fontWeight:'700' }}>Enter Your Marks</h3>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'1.5rem', alignItems:'center' }}>
                <div style={{ flex:1, minWidth:'150px' }}>
                  <label style={{ display:'block', fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'0.4rem', fontWeight:'600' }}>Physics (out of 100)</label>
                  <input type="number" min="0" max="100" value={marks.physics} onChange={e => setMarks({...marks, physics: e.target.value})} placeholder="e.g. 90" style={{ width:'100%', padding:'0.7rem 1rem', background:'rgba(0,0,0,.3)', border:'1px solid var(--glass-border)', color:'white', borderRadius:'8px', outline:'none', fontSize:'1rem' }} />
                </div>
                <div style={{ flex:1, minWidth:'150px' }}>
                  <label style={{ display:'block', fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'0.4rem', fontWeight:'600' }}>Chemistry (out of 100)</label>
                  <input type="number" min="0" max="100" value={marks.chemistry} onChange={e => setMarks({...marks, chemistry: e.target.value})} placeholder="e.g. 85" style={{ width:'100%', padding:'0.7rem 1rem', background:'rgba(0,0,0,.3)', border:'1px solid var(--glass-border)', color:'white', borderRadius:'8px', outline:'none', fontSize:'1rem' }} />
                </div>
                <div style={{ flex:1, minWidth:'150px' }}>
                  <label style={{ display:'block', fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'0.4rem', fontWeight:'600' }}>Maths (out of 100)</label>
                  <input type="number" min="0" max="100" value={marks.maths} onChange={e => setMarks({...marks, maths: e.target.value})} placeholder="e.g. 95" style={{ width:'100%', padding:'0.7rem 1rem', background:'rgba(0,0,0,.3)', border:'1px solid var(--glass-border)', color:'white', borderRadius:'8px', outline:'none', fontSize:'1rem' }} />
                </div>
                <div style={{ background:'rgba(212,175,55,.1)', border:'1px solid rgba(212,175,55,.4)', borderRadius:'12px', padding:'1rem 1.5rem', minWidth:'200px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'0.85rem', color:'#d4af37', textTransform:'uppercase', letterSpacing:'1px', fontWeight:'700', marginBottom:'0.3rem' }}>Your Cutoff</span>
                  <span style={{ fontSize:'2.2rem', fontWeight:'800', color:'white', lineHeight:1 }}>{calculatedCutoff !== null ? calculatedCutoff : '--.--'}</span>
                  {calculatedCutoff !== null && (
                    <button onClick={() => { setActiveTab('search'); setFilters(f => ({...f, cutoff: calculatedCutoff})); }} style={{ marginTop:'0.8rem', background:'#d4af37', color:'black', border:'none', padding:'0.4rem 1rem', borderRadius:'6px', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer' }}>Use in Search</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SEARCH TAB ══ */}
      {activeTab === 'search' && (
        <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

          {/* ── Horizontal Filter Bar ── */}
          <div style={{ position:'relative', zIndex:100, background:'rgba(8,13,28,.8)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--glass-border)', padding:'1rem 2rem' }}>
            <div style={{ display:'flex', alignItems:'flex-end', gap:'1rem', flexWrap:'wrap' }}>

              {/* Cutoff */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                <label style={labelStyle}>Your Cutoff</label>
                <input
                  type="number" min="0" max="200" step="0.5"
                  value={filters.cutoff}
                  onChange={e => setFilters({...filters, cutoff: e.target.value})}
                  placeholder="e.g. 175"
                  style={{ ...hInputStyle, width:'130px' }}
                />
              </div>

              {/* District multi-select dropdown */}
              <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:'0.3rem' }} ref={dropRef}>
                <label style={labelStyle}>District</label>
                <button
                  onClick={() => setDistrictOpen(o => !o)}
                  style={{ ...hInputStyle, width:'200px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', background:'rgba(0,0,0,.4)' }}>
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'150px', color: filters.districts.length ? 'var(--accent-color)' : '#b1a7a6' }}>
                    {filters.districts.length > 0 ? filters.districts.join(', ') : 'All Districts'}
                  </span>
                  {districtOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>
                {districtOpen && (
                  <div style={{ position:'absolute', top:'100%', left:0, zIndex:999, background:'#0f1420', border:'1px solid var(--glass-border)', borderRadius:'10px', width:'220px', maxHeight:'260px', overflowY:'auto', boxShadow:'0 8px 30px rgba(0,0,0,.5)', marginTop:'4px' }}>
                    {DISTRICTS.map(d => (
                      <label key={d} style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.5rem 1rem', cursor:'pointer', fontSize:'0.85rem', color: filters.districts.includes(d) ? 'var(--accent-color)' : 'var(--text-secondary)', borderBottom:'1px solid rgba(255,255,255,.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(212,175,55,.08)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <input type="checkbox" checked={filters.districts.includes(d)} onChange={() => toggleDistrict(d)} style={{ accentColor:'var(--accent-color)', width:'14px', height:'14px', margin:0 }} />
                        {d}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* College Type */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                <label style={labelStyle}>College Type</label>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => setFilters({...filters, category: c.value})}
                      style={{ padding:'0.45rem 0.9rem', borderRadius:'8px', border:'1px solid', fontSize:'0.82rem', fontWeight:'600', cursor:'pointer', transition:'all .15s',
                        background: filters.category===c.value ? 'rgba(212,175,55,.2)' : 'rgba(0,0,0,.3)',
                        color: filters.category===c.value ? 'var(--accent-color)' : 'var(--text-secondary)',
                        borderColor: filters.category===c.value ? 'var(--accent-color)' : 'var(--glass-border)',
                      }}>{c.label}</button>
                  ))}
                </div>
              </div>

              {/* Course */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                <label style={labelStyle}>Course</label>
                <select value={filters.course} onChange={e => setFilters({...filters, course: e.target.value})}
                  style={{ ...hInputStyle, width:'220px' }}>
                  <option value="">All Courses</option>
                  {COURSES.filter(c => c).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Action buttons */}
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'flex-end' }}>
                <button onClick={handleSearch} disabled={loading} className="btn-primary"
                  style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.6rem 1.4rem', whiteSpace:'nowrap', opacity: loading ? 0.7 : 1 }}>
                  <Search size={15} /> {loading ? 'Searching...' : 'Apply Filters'}
                </button>
                {activeCount > 0 && (
                  <button onClick={resetFilters} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.6rem 1rem', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.4)', color:'#ef4444', borderRadius:'10px', cursor:'pointer', fontSize:'0.83rem', fontWeight:'600' }}>
                    <X size={13}/> Clear
                  </button>
                )}
              </div>

              {/* Active filter count */}
              {activeCount > 0 && (
                <span style={{ marginLeft:'auto', fontSize:'0.78rem', color:'var(--accent-color)', fontWeight:'700', background:'rgba(212,175,55,.12)', padding:'0.3rem 0.7rem', borderRadius:'999px', border:'1px solid rgba(212,175,55,.3)', whiteSpace:'nowrap' }}>
                  {activeCount} filter{activeCount > 1 ? 's' : ''} active
                </span>
              )}
            </div>
          </div>

          {/* ── Results ── */}
          <main style={{ flex:1, padding:'1.5rem 2rem', overflowX:'hidden' }}>
            {/* Count bar + Download All button */}
            {searched && (
              <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                <h2 style={{ fontSize:'1.1rem', fontWeight:'700', margin:0 }}>
                  <span style={{ color:'var(--accent-color)' }}>{colleges.length}</span> college{colleges.length !== 1 ? 's' : ''} found
                  {colleges.length === 50 && <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)', fontWeight:'400', marginLeft:'0.5rem' }}>(top 50 shown)</span>}
                </h2>
                {filters.cutoff && (
                  <span style={{ fontSize:'0.82rem', color:'var(--text-secondary)', background:'rgba(255,255,255,.05)', padding:'0.25rem 0.6rem', borderRadius:'6px' }}>
                    cutoff ≤ {filters.cutoff}
                  </span>
                )}
                {colleges.length > 0 && (
                  <button
                    onClick={() => downloadAllPDF(colleges, filters)}
                    style={{ marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:'0.45rem', padding:'0.5rem 1.2rem', background:'rgba(212,175,55,.15)', border:'1px solid rgba(212,175,55,.45)', color:'#d4af37', borderRadius:'10px', cursor:'pointer', fontSize:'0.85rem', fontWeight:'700', transition:'all .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(212,175,55,.28)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(212,175,55,.15)'}>
                    <Download size={15}/> Download PDF ({colleges.length} colleges)
                  </button>
                )}
              </div>
            )}

            {searched ? (
              colleges.length > 0 ? (
                <div className="glass-card" style={{ padding:0, overflow:'hidden' }}>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ minWidth:'750px', width:'100%' }}>
                      <thead>
                        <tr style={{ background:'rgba(212,175,55,.05)' }}>
                          <Th icon={<Hash size={11}/>}>TNEA Code</Th>
                          <Th icon={<Building2 size={11}/>}>College Name</Th>
                          <Th icon={<MapPin size={11}/>}>District</Th>
                          <Th>Type</Th>
                          <Th icon={<BookOpen size={11}/>}>Course</Th>
                          <Th icon={<TrendingDown size={11}/>}>Cutoff Range</Th>
                          <Th icon={<IndianRupee size={11}/>}>Annual Fee</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {colleges.map(c => {
                          const clr = catColor(c.category);
                          return (
                            <tr key={c.id}
                              style={{ borderBottom:'1px solid var(--glass-border)', transition:'background .15s' }}
                              onMouseEnter={e => e.currentTarget.style.background='rgba(212,175,55,.04)'}
                              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                              <td style={{ padding:'0.9rem 1rem', whiteSpace:'nowrap' }}>
                                <span style={{ fontFamily:'monospace', color:'#a78bfa', fontWeight:'800', fontSize:'0.87rem' }}>
                                  {c.tneaCode || '—'}
                                </span>
                              </td>
                              <td style={{ padding:'0.9rem 1rem', fontWeight:'600', maxWidth:'260px' }}>{c.name}</td>
                              <td style={{ padding:'0.9rem 1rem', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                                  <MapPin size={11}/>{c.district}
                                </div>
                              </td>
                              <td style={{ padding:'0.9rem 1rem', whiteSpace:'nowrap' }}>
                                <span style={{ padding:'0.2rem 0.55rem', borderRadius:'999px', fontSize:'0.7rem', fontWeight:'700', background:clr.bg, color:clr.col, border:`1px solid ${clr.brd}` }}>
                                  {catLabel(c.category)}
                                </span>
                              </td>
                              <td style={{ padding:'0.9rem 1rem', color:'var(--text-secondary)', fontSize:'0.84rem', maxWidth:'200px' }}>{c.course}</td>
                              <td style={{ padding:'0.9rem 1rem', whiteSpace:'nowrap', fontWeight:'700', color:'var(--accent-color)' }}>
                                {c.cutoffMin} – {c.cutoffMax}
                              </td>
                              <td style={{ padding:'0.9rem 1rem', whiteSpace:'nowrap', fontWeight:'700', color:'#10b981' }}>
                                ₹{c.annualFee?.toLocaleString('en-IN') || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <EmptyState icon={<Search size={52} style={{ opacity:.2 }}/>} title="No colleges found" desc="Try a different cutoff value or relax other filters. Your cutoff must fall within a college's allowed range." />
              )
            ) : (
              <EmptyState icon={<GraduationCap size={52} style={{ opacity:.2 }}/>} title="Ready to find your college?" desc="Enter your cutoff mark and click Apply Filters. Results are limited to the top 50 matching colleges." />
            )}
          </main>
        </div>
      )}
    </div>
  );
};

/* ─── Sub-components ────────────────────────────────────────── */
const Th = ({ children, icon }) => (
  <th style={{ padding:'0.85rem 1rem', textAlign:'left', color:'var(--text-secondary)', textTransform:'uppercase', fontSize:'0.67rem', fontWeight:'700', letterSpacing:'0.06em', borderBottom:'1px solid var(--glass-border)', whiteSpace:'nowrap' }}>
    <span style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>{icon}{children}</span>
  </th>
);

const EmptyState = ({ icon, title, desc }) => (
  <div style={{ textAlign:'center', padding:'6rem 2rem', color:'var(--text-secondary)' }}>
    <div style={{ marginBottom:'1rem' }}>{icon}</div>
    <p style={{ fontSize:'1.1rem', fontWeight:'600', color:'var(--text-primary)', marginBottom:'0.5rem' }}>{title}</p>
    <p style={{ fontSize:'0.9rem' }}>{desc}</p>
  </div>
);

/* ─── Shared styles ─────────────────────────────────────────── */
const labelStyle = {
  fontSize:'0.68rem', fontWeight:'700', color:'var(--text-secondary)',
  textTransform:'uppercase', letterSpacing:'0.06em',
};

const hInputStyle = {
  background:'rgba(0,0,0,.35)', border:'1px solid var(--glass-border)',
  padding:'0.5rem 0.75rem', borderRadius:'9px', color:'white', outline:'none',
  fontSize:'0.87rem', boxSizing:'border-box',
};

export default CollegeFinder;

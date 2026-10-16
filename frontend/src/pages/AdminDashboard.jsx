import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  jobsAPI, schemesAPI, companiesAPI, skillsAPI, usersAPI, analyticsAPI, institutesAPI
} from '../services/api';
import {
  LayoutDashboard, Briefcase, Building2, Award, FileText, Users,
  GraduationCap, TrendingUp, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  Search, ChevronRight, Loader2, X, Save, AlertTriangle, CheckCircle,
  BarChart2, Star, MapPin, DollarSign, Eye, RefreshCw, LogOut
} from 'lucide-react';

// ─── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = ({ onLogout }) => {
  const { pathname } = useLocation();
  const nav = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/skills', icon: Award, label: 'Skills' },
    { to: '/admin/schemes', icon: FileText, label: 'Schemes' },
    { to: '/admin/institutes', icon: GraduationCap, label: 'Institutes' },
    { to: '/admin/users', icon: Users, label: 'Students' },
    { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  ];
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm">S</div>
          SkillMatch
        </Link>
        <p className="text-slate-400 text-xs mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== '/admin' && pathname.startsWith(to));
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-medium transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <div className={`p-2 rounded-lg ${color}`}><Icon className="w-5 h-5 text-white" /></div>
    </div>
    <p className="text-3xl font-bold text-slate-800">{value}</p>
    {trend && <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>}
  </div>
);

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
      <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
      <p className="text-slate-700 font-medium text-center mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition">Delete</button>
      </div>
    </div>
  </div>
);

// ─── Generic Resource Manager ────────────────────────────────────────────────
const ResourceManager = ({ title, icon: Icon, fetchFn, createFn, updateFn, deleteFn, toggleFn, fields, renderRow }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchFn({ limit: 200 });
      setItems(res.data?.items || res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(Object.fromEntries(fields.map(f => [f.name, f.default ?? ''])));
    setShowForm(true);
    setError('');
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData(Object.fromEntries(fields.map(f => [f.name, item[f.name] ?? f.default ?? ''])));
    setShowForm(true);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editing) await updateFn(editing.id, formData);
      else await createFn(formData);
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Save failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await deleteFn(id);
    setConfirm(null);
    load();
  };

  const handleToggle = async (id) => {
    if (toggleFn) { await toggleFn(id); load(); }
  };

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    return Object.values(item).some(v => String(v).toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {confirm && <ConfirmDialog message={confirm.msg} onConfirm={() => handleDelete(confirm.id)} onCancel={() => setConfirm(null)} />}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Icon className="w-6 h-6 text-blue-600" />{title}
          <span className="text-slate-400 font-normal text-lg">({items.length})</span>
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <button onClick={load} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          {createFn && (
            <button onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all">
              <Plus className="w-4 h-4" /> Add New
            </button>
          )}
        </div>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-blue-300 p-6 shadow-lg">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-slate-800 text-lg">{editing ? 'Edit' : 'Add New'} {title.replace('Manage ', '')}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea value={formData[field.name] || ''} onChange={e => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                    rows={3} placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 resize-none" />
                ) : field.type === 'select' ? (
                  <select value={formData[field.name] || ''} onChange={e => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 appearance-none">
                    <option value="">Select...</option>
                    {field.options?.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
                  </select>
                ) : (
                  <input type={field.type || 'text'} value={formData[field.name] || ''} placeholder={field.placeholder}
                    onChange={e => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {renderRow.headers.map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={renderRow.headers.length + 1} className="text-center py-12 text-slate-400">No records found</td></tr>
                ) : filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {renderRow.cells(item).map((cell, i) => (
                      <td key={i} className="px-4 py-3 text-sm text-slate-700">{cell}</td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {toggleFn && (
                          <button onClick={() => handleToggle(item.id)}
                            className={`p-1.5 rounded-lg transition ${item.is_active !== false ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                            title={item.is_active !== false ? 'Deactivate' : 'Activate'}>
                            {item.is_active !== false ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                        )}
                        {updateFn && (
                          <button onClick={() => openEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {deleteFn && (
                          <button onClick={() => setConfirm({ id: item.id, msg: `Delete "${item.title || item.name || 'this item'}"?` })}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Admin Dashboard Home ────────────────────────────────────────────────────
const AdminHome = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getAnalytics().then(r => setAnalytics(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">SkillMatch platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Active Jobs" value={analytics?.active_jobs ?? '—'} color="bg-blue-500" trend="Visible to students" />
        <StatCard icon={Building2} label="Companies" value={analytics?.total_companies ?? '—'} color="bg-violet-500" />
        <StatCard icon={Users} label="Students" value={analytics?.total_students ?? '—'} color="bg-emerald-500" trend="Registered users" />
        <StatCard icon={FileText} label="Schemes" value={analytics?.active_schemes ?? '—'} color="bg-amber-500" trend="Govt. schemes" />
      </div>

      {analytics?.jobs_by_trade && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Jobs by Trade
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.jobs_by_trade).map(([trade, count]) => {
              const pct = Math.min(100, (count / Math.max(...Object.values(analytics.jobs_by_trade))) * 100);
              return (
                <div key={trade} className="flex items-center gap-4">
                  <span className="w-40 text-sm text-slate-600 font-medium truncate">{trade}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {analytics?.recent_signups && analytics.recent_signups.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Recent Student Signups
          </h2>
          <div className="space-y-3">
            {analytics.recent_signups.slice(0, 8).map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                    {s.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{s.full_name}</p>
                    <p className="text-slate-400 text-xs">{s.email}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Jobs Manager ────────────────────────────────────────────────────────────
const JobFields = [
  { name: 'title', label: 'Job Title', placeholder: 'e.g. CNC Operator' },
  { name: 'company_id', label: 'Company ID', type: 'number', placeholder: 'Company ID' },
  { name: 'location', label: 'Location', placeholder: 'e.g. Pune, Maharashtra' },
  { name: 'trade_required', label: 'Trade Required', type: 'select', options: ['ITI Welder', 'ITI Electrician', 'ITI Fitter', 'ITI Turner', 'ITI Machinist', 'Diploma Mechanical', 'Diploma Electrical', 'Any'] },
  { name: 'salary_min', label: 'Min Salary (₹/mo)', type: 'number', placeholder: '15000' },
  { name: 'salary_max', label: 'Max Salary (₹/mo)', type: 'number', placeholder: '25000' },
  { name: 'experience_required', label: 'Exp. Required (years)', type: 'number', placeholder: '0', default: 0 },
  { name: 'employment_type', label: 'Employment Type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Apprenticeship'] },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Job description...' },
  { name: 'required_skills', label: 'Required Skills (comma separated)', fullWidth: true, placeholder: 'Arc Welding, MIG, Safety' },
];

const ManageJobs = () => (
  <ResourceManager
    title="Jobs" icon={Briefcase}
    fetchFn={jobsAPI.getJobs} createFn={jobsAPI.createJob}
    updateFn={jobsAPI.updateJob} deleteFn={jobsAPI.deleteJob}
    toggleFn={jobsAPI.toggleStatus}
    fields={JobFields}
    renderRow={{
      headers: ['Title', 'Location', 'Trade', 'Salary', 'Type', 'Status'],
      cells: (j) => [
        <span className="font-semibold text-slate-800">{j.title}</span>,
        <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3" />{j.location}</span>,
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{j.trade_required}</span>,
        j.salary_min ? `₹${Math.round(j.salary_min / 1000)}k–₹${Math.round((j.salary_max || j.salary_min * 1.3) / 1000)}k` : '—',
        <span className="text-slate-500 text-xs">{j.employment_type}</span>,
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${j.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {j.is_active !== false ? 'Active' : 'Inactive'}
        </span>,
      ],
    }}
  />
);

// ─── Companies Manager ───────────────────────────────────────────────────────
const CompanyFields = [
  { name: 'name', label: 'Company Name', placeholder: 'e.g. Tata Motors' },
  { name: 'industry', label: 'Industry', placeholder: 'e.g. Automobile' },
  { name: 'location', label: 'Location', placeholder: 'e.g. Pune' },
  { name: 'size', label: 'Company Size', type: 'select', options: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'] },
  { name: 'website', label: 'Website', placeholder: 'https://company.com' },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
];

const ManageCompanies = () => (
  <ResourceManager
    title="Companies" icon={Building2}
    fetchFn={companiesAPI.getCompanies} createFn={companiesAPI.createCompany}
    updateFn={companiesAPI.updateCompany} deleteFn={companiesAPI.deleteCompany}
    fields={CompanyFields}
    renderRow={{
      headers: ['Name', 'Industry', 'Location', 'Size', 'Rating'],
      cells: (c) => [
        <span className="font-semibold text-slate-800">{c.name}</span>,
        c.industry,
        <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3" />{c.location}</span>,
        c.size,
        c.rating ? <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{c.rating}</span> : '—',
      ],
    }}
  />
);

// ─── Skills Manager ──────────────────────────────────────────────────────────
const SkillFields = [
  { name: 'name', label: 'Skill Name', placeholder: 'e.g. Arc Welding' },
  { name: 'category', label: 'Category', type: 'select', options: ['Technical', 'Safety', 'Quality', 'Software', 'Soft Skills', 'Equipment'] },
  { name: 'trade', label: 'Related Trade', type: 'select', options: ['ITI Welder', 'ITI Electrician', 'ITI Fitter', 'ITI Turner', 'Diploma Mechanical', 'Diploma Electrical', 'General'] },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
];

const ManageSkills = () => (
  <ResourceManager
    title="Skills" icon={Award}
    fetchFn={skillsAPI.getSkills} createFn={skillsAPI.createSkill}
    updateFn={skillsAPI.updateSkill} deleteFn={skillsAPI.deleteSkill}
    fields={SkillFields}
    renderRow={{
      headers: ['Skill Name', 'Category', 'Trade'],
      cells: (s) => [
        <span className="font-semibold text-slate-800">{s.name}</span>,
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{s.category}</span>,
        s.trade,
      ],
    }}
  />
);

// ─── Schemes Manager ─────────────────────────────────────────────────────────
const SchemeFields = [
  { name: 'name', label: 'Scheme Name', placeholder: 'e.g. PM Kaushal Vikas Yojana', fullWidth: true },
  { name: 'ministry', label: 'Ministry / Department', placeholder: 'e.g. Ministry of Skill Development' },
  { name: 'category', label: 'Category', type: 'select', options: ['Skill Development', 'Employment', 'Education', 'Finance', 'Housing', 'Health'] },
  { name: 'benefit_amount', label: 'Benefit Amount (₹)', type: 'number', placeholder: '10000' },
  { name: 'eligibility', label: 'Eligibility Criteria', type: 'textarea', fullWidth: true },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
  { name: 'apply_link', label: 'Apply Link (URL)', fullWidth: true, placeholder: 'https://...' },
];

const ManageSchemes = () => (
  <ResourceManager
    title="Government Schemes" icon={FileText}
    fetchFn={schemesAPI.getSchemes} createFn={schemesAPI.createScheme}
    updateFn={schemesAPI.updateScheme} deleteFn={schemesAPI.deleteScheme}
    toggleFn={schemesAPI.toggleStatus}
    fields={SchemeFields}
    renderRow={{
      headers: ['Scheme', 'Ministry', 'Category', 'Benefit', 'Status'],
      cells: (s) => [
        <span className="font-semibold text-slate-800 line-clamp-1">{s.name}</span>,
        <span className="text-slate-500 text-xs line-clamp-1">{s.ministry}</span>,
        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">{s.category}</span>,
        s.benefit_amount ? `₹${Number(s.benefit_amount).toLocaleString('en-IN')}` : '—',
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {s.is_active !== false ? 'Active' : 'Inactive'}
        </span>,
      ],
    }}
  />
);

// ─── Institutes Manager ──────────────────────────────────────────────────────
const InstituteFields = [
  { name: 'name', label: 'Institute Name', placeholder: 'e.g. ITI Pune', fullWidth: true },
  { name: 'type', label: 'Type', type: 'select', options: ['ITI', 'Polytechnic', 'Vocational', 'Training Center'] },
  { name: 'location', label: 'Location', placeholder: 'e.g. Pune, Maharashtra' },
  { name: 'affiliation', label: 'Affiliation', placeholder: 'e.g. NCVT, SCVT' },
  { name: 'total_seats', label: 'Total Seats', type: 'number', placeholder: '120' },
  { name: 'website', label: 'Website', placeholder: 'https://...' },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
];

const ManageInstitutes = () => (
  <ResourceManager
    title="Institutes" icon={GraduationCap}
    fetchFn={institutesAPI.getInstitutes} createFn={institutesAPI.createInstitute}
    updateFn={institutesAPI.updateInstitute} deleteFn={null}
    fields={InstituteFields}
    renderRow={{
      headers: ['Name', 'Type', 'Location', 'Affiliation', 'Seats'],
      cells: (i) => [
        <span className="font-semibold text-slate-800">{i.name}</span>,
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{i.type}</span>,
        <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3" />{i.location}</span>,
        i.affiliation,
        i.total_seats,
      ],
    }}
  />
);

// ─── Users Manager ───────────────────────────────────────────────────────────
const ManageUsers = () => (
  <ResourceManager
    title="Students" icon={Users}
    fetchFn={usersAPI.getUsers} createFn={null}
    updateFn={null} deleteFn={usersAPI.deleteUser}
    toggleFn={usersAPI.toggleStatus}
    fields={[]}
    renderRow={{
      headers: ['Name', 'Email', 'Trade', 'Location', 'Status', 'Joined'],
      cells: (u) => [
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">{u.full_name?.[0]?.toUpperCase() || '?'}</div>
          <span className="font-semibold text-slate-800">{u.full_name}</span>
        </div>,
        <span className="text-slate-500 text-xs">{u.email}</span>,
        u.trade ? <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{u.trade}</span> : '—',
        u.preferred_location || '—',
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {u.is_active !== false ? 'Active' : 'Inactive'}
        </span>,
        <span className="text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</span>,
      ],
    }}
  />
);

// ─── Analytics Manager ───────────────────────────────────────────────────────
const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getAnalytics().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BarChart2 className="w-6 h-6 text-blue-600" />Analytics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Total Jobs" value={data?.total_jobs ?? '—'} color="bg-blue-500" />
        <StatCard icon={Briefcase} label="Active Jobs" value={data?.active_jobs ?? '—'} color="bg-emerald-500" />
        <StatCard icon={Users} label="Total Students" value={data?.total_students ?? '—'} color="bg-violet-500" />
        <StatCard icon={FileText} label="Applications" value={data?.total_applications ?? '—'} color="bg-amber-500" />
      </div>

      {data?.jobs_by_trade && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Jobs Distribution by Trade</h3>
          <div className="space-y-4">
            {Object.entries(data.jobs_by_trade).map(([trade, count]) => {
              const total = Object.values(data.jobs_by_trade).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={trade} className="flex items-center gap-4">
                  <span className="w-44 text-sm text-slate-700 font-medium truncate">{trade}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-16 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data?.jobs_by_location && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Jobs by Location</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(data.jobs_by_location).slice(0, 9).map(([loc, count]) => (
              <div key={loc} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700"><MapPin className="w-4 h-4 text-slate-400" />{loc}</span>
                <span className="text-sm font-bold text-blue-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="companies" element={<ManageCompanies />} />
          <Route path="skills" element={<ManageSkills />} />
          <Route path="schemes" element={<ManageSchemes />} />
          <Route path="institutes" element={<ManageInstitutes />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI, skillsAPI } from '../services/api';
import { User, MapPin, Briefcase, Award, Plus, X, Save, Loader2, CheckCircle, Phone, Mail, Edit3 } from 'lucide-react';

const TRADES = [
  'ITI Welder', 'ITI Electrician', 'ITI Fitter', 'ITI Turner',
  'ITI Machinist', 'Diploma Mechanical', 'Diploma Electrical', 'Diploma Civil'
];

const LOCATIONS = [
  'Pune', 'Mumbai', 'Nashik', 'Aurangabad', 'Nagpur', 'Kolhapur',
  'Solapur', 'Thane', 'Navi Mumbai', 'Pimpri-Chinchwad', 'Jalgaon', 'Ahmednagar'
];

const EXPERIENCE_LEVELS = [
  { value: 0, label: 'Fresher (0 years)' },
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 4, label: '4 years' },
  { value: 5, label: '5+ years' },
];

const StudentProfile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    trade: '',
    preferred_location: '',
    experience_years: 0,
    skills: [],
    bio: '',
    address: '',
    linkedin_url: '',
    github_url: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, skillsRes] = await Promise.all([
        studentAPI.getProfile(),
        skillsAPI.getSkills(),
      ]);
      const p = profileRes.data;
      setProfile(p);
      setForm({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        trade: p?.trade || user?.trade || '',
        preferred_location: p?.preferred_location || '',
        experience_years: p?.experience_years ?? 0,
        skills: p?.skills || [],
        bio: p?.bio || '',
        address: p?.address || '',
        linkedin_url: p?.linkedin_url || '',
        github_url: p?.github_url || '',
      });
      setAllSkills(skillsRes.data?.map(s => s.name) || []);
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s)) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, s] }));
      setSaved(false);
    }
    setNewSkill('');
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const removeSkill = (skill) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    setSaved(false);
  };

  const handleSkillInput = (e) => {
    setSkillSearch(e.target.value);
    setNewSkill(e.target.value);
    setShowSkillDropdown(true);
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSkills.length > 0) addSkill(filteredSkills[0]);
      else if (newSkill.trim()) addSkill(newSkill);
    }
  };

  const filteredSkills = allSkills.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase()) && !form.skills.includes(s)
  ).slice(0, 8);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await studentAPI.updateProfile({
        ...form,
        experience_years: parseInt(form.experience_years) || 0,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const completionFields = ['full_name', 'trade', 'preferred_location', 'bio'];
  const completedFields = completionFields.filter(f => form[f]);
  const hasSkills = form.skills.length > 0;
  const completion = Math.round(((completedFields.length + (hasSkills ? 1 : 0)) / (completionFields.length + 1)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Edit3 className="w-7 h-7 text-blue-600" />
              My Profile
            </h1>
            <p className="text-slate-500 mt-1">Keep your profile updated for better job matches</p>
          </div>
          <div className="text-center">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                  strokeDasharray={`${completion} ${100 - completion}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-700">{completion}%</div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Complete</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}
        {saved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Personal Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input name="full_name" type="text" value={form.full_name} onChange={handleChange} required
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-800" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={user?.email || ''} disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio / About Me</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                  placeholder="Tell employers about yourself, your ITI training, achievements..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-800 resize-none" />
              </div>
            </div>
          </div>

          {/* Trade & Career */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" /> Trade & Career Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ITI Trade / Branch *</label>
                <select name="trade" value={form.trade} onChange={handleChange} required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-800 appearance-none">
                  <option value="">Select your trade...</option>
                  {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Experience</label>
                <select name="experience_years" value={form.experience_years} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-800 appearance-none">
                  {EXPERIENCE_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Preferred Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select name="preferred_location" value={form.preferred_location} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-800 appearance-none">
                    <option value="">Select preferred city...</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Address</label>
                <input name="address" type="text" value={form.address} onChange={handleChange}
                  placeholder="e.g. Kothrud, Pune"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-800" />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" /> Skills
              <span className="ml-auto text-sm font-normal text-slate-500">{form.skills.length} skills added</span>
            </h2>
            <p className="text-slate-500 text-sm mb-4">Add skills to improve your AI job matches</p>

            {/* Skill input */}
            <div className="relative mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={handleSkillInput}
                    onKeyDown={handleSkillKeyDown}
                    onFocus={() => setShowSkillDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                    placeholder="Search or type a skill (e.g. Arc Welding, MIG Welding...)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-800"
                  />
                  {showSkillDropdown && filteredSkills.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                      {filteredSkills.map(s => (
                        <button key={s} type="button" onClick={() => addSkill(s)}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                          + {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => newSkill.trim() && addSkill(newSkill)}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Skills list */}
            {form.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill, i) => (
                  <span key={i} className="group flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}
                      className="text-blue-400 hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No skills added yet. Start typing above to add skills.</p>
              </div>
            )}

            {/* Quick add common skills */}
            {form.trade && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-2">Quick add for {form.trade}:</p>
                <div className="flex flex-wrap gap-1.5">
                  {getTradeSkills(form.trade).filter(s => !form.skills.includes(s)).slice(0, 6).map(s => (
                    <button key={s} type="button" onClick={() => addSkill(s)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-full text-xs font-medium transition-all">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Online Presence (Optional)</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn URL</label>
                <input name="linkedin_url" type="url" value={form.linkedin_url} onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourname"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Portfolio / GitHub URL</label>
                <input name="github_url" type="url" value={form.github_url} onChange={handleChange}
                  placeholder="https://github.com/yourname"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-800" />
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end gap-3 pb-8">
            <button type="button" onClick={loadData}
              className="px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all">
              Reset Changes
            </button>
            <button type="submit" disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50">
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> Save Profile</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function getTradeSkills(trade) {
  const map = {
    'ITI Welder': ['Arc Welding', 'MIG Welding', 'TIG Welding', 'Gas Welding', 'Electrode Selection', 'Weld Inspection'],
    'ITI Electrician': ['AC/DC Wiring', 'Panel Installation', 'Motor Winding', 'PLC Basics', 'Switchgear', 'Earthing'],
    'ITI Fitter': ['Blueprint Reading', 'Lathe Operation', 'Precision Fitting', 'Measurement Tools', 'Thread Cutting', 'Assembly'],
    'ITI Turner': ['Lathe Operation', 'CNC Programming', 'Turning', 'Boring', 'Taper Turning', 'Knurling'],
    'ITI Machinist': ['CNC Operation', 'Milling', 'Grinding', 'Drilling', 'Quality Control', 'CAD Basics'],
    'Diploma Mechanical': ['AutoCAD', 'SolidWorks', 'CNC Programming', 'Thermodynamics', 'Fluid Mechanics', 'Manufacturing Processes'],
    'Diploma Electrical': ['Power Systems', 'Control Systems', 'PLC Programming', 'SCADA', 'HMI', 'Electrical Drawings'],
    'Diploma Civil': ['AutoCAD', 'Structural Analysis', 'Surveying', 'Concrete Technology', 'Project Management', 'Site Supervision'],
  };
  return map[trade] || [];
}

export default StudentProfile;

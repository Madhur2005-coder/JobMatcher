import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, BookOpen, Wrench, Loader2, ChevronRight } from 'lucide-react';

const TRADES = [
  { value: 'ITI Welder', label: '🔥 ITI Welder', desc: 'Arc, MIG, TIG Welding' },
  { value: 'ITI Electrician', label: '⚡ ITI Electrician', desc: 'Wiring, Panel, Installations' },
  { value: 'ITI Fitter', label: '🔧 ITI Fitter', desc: 'Assembly, Fitting, Machining' },
  { value: 'ITI Turner', label: '⚙️ ITI Turner', desc: 'Lathe, CNC Operations' },
  { value: 'ITI Machinist', label: '🏭 ITI Machinist', desc: 'Machine Operation & Maintenance' },
  { value: 'Diploma Mechanical', label: '📐 Diploma Mechanical', desc: 'Polytechnic Mechanical Eng.' },
  { value: 'Diploma Electrical', label: '🔌 Diploma Electrical', desc: 'Polytechnic Electrical Eng.' },
  { value: 'Diploma Civil', label: '🏗️ Diploma Civil', desc: 'Polytechnic Civil Eng.' },
];

const LOCATIONS = [
  'Pune', 'Mumbai', 'Nashik', 'Aurangabad', 'Nagpur', 'Kolhapur',
  'Solapur', 'Thane', 'Navi Mumbai', 'Pimpri-Chinchwad'
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    trade: '',
    preferred_location: '',
    experience_years: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleStep1Next = (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      setError('Please fill all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.trade) { setError('Please select your trade/branch.'); return; }
    setLoading(true);
    setError('');
    try {
      const userData = await register({
        ...form,
        experience_years: parseInt(form.experience_years) || 0,
      });
      navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white font-bold text-2xl mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            SkillMatch
          </Link>
          <p className="text-blue-200 text-sm">Create your free account • Find local jobs faster</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-blue-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-500' : 'bg-white/10'}`}>1</div>
            <span className="text-sm font-medium">Account</span>
          </div>
          <div className="flex-1 h-px bg-white/20"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-blue-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-500' : 'bg-white/10'}`}>2</div>
            <span className="text-sm font-medium">Trade & Location</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <h2 className="text-white text-xl font-bold mb-6">Create your account</h2>
              
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <input
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-1.5">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                Next: Select Trade <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <button type="button" onClick={() => setStep(1)}
                  className="text-blue-300 hover:text-white text-sm transition">← Back</button>
                <h2 className="text-white text-xl font-bold">Your Trade & Location</h2>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Select your ITI Trade / Polytechnic Branch *</label>
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                  {TRADES.map(t => (
                    <label key={t.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        form.trade === t.value
                          ? 'bg-blue-500/30 border-blue-400 text-white'
                          : 'bg-white/5 border-white/15 text-blue-100 hover:bg-white/10'
                      }`}>
                      <input type="radio" name="trade" value={t.value}
                        checked={form.trade === t.value}
                        onChange={handleChange}
                        className="hidden" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{t.label}</div>
                        <div className="text-xs text-blue-300">{t.desc}</div>
                      </div>
                      {form.trade === t.value && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-1.5">Preferred Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <select name="preferred_location" value={form.preferred_location} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition appearance-none">
                    <option value="" className="bg-blue-900">Select city...</option>
                    {LOCATIONS.map(l => (
                      <option key={l} value={l} className="bg-blue-900">{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-1.5">Experience (Years)</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <select name="experience_years" value={form.experience_years} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition appearance-none">
                    <option value={0} className="bg-blue-900">Fresher (0 years)</option>
                    <option value={1} className="bg-blue-900">1 year</option>
                    <option value={2} className="bg-blue-900">2 years</option>
                    <option value={3} className="bg-blue-900">3 years</option>
                    <option value={4} className="bg-blue-900">4+ years</option>
                    <option value={5} className="bg-blue-900">5+ years</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : '🎉 Create Account & Find Jobs'}
              </button>
            </form>
          )}

          <p className="text-center text-blue-300 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

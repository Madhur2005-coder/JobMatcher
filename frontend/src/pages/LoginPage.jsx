import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="container-custom py-12 sm:py-16 max-w-md mx-auto">
      <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-500/20 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">
            Sign In to SkillMatch
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Access AI job matches, salary predictions, and government schemes
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-ink-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-ink-200 py-2.5 pl-9 pr-3 text-xs sm:text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-ink-200 py-2.5 pl-9 pr-3 text-xs sm:text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 font-bold mt-2 shadow-md shadow-brand-500/20"
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="mt-6 pt-5 border-t border-ink-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">
            1-Click Demo Accounts:
          </p>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('rahul.electrician@gmail.com', 'student123')}
              className="w-full text-left rounded-lg bg-slate-50 hover:bg-slate-100 p-2 text-xs text-ink-700 border border-ink-200 transition flex justify-between items-center"
            >
              <span>⚡ <strong>Student (Electrician):</strong> rahul.electrician@gmail.com</span>
              <span className="text-[10px] text-brand-600 font-semibold">Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('amit.welder@gmail.com', 'student123')}
              className="w-full text-left rounded-lg bg-slate-50 hover:bg-slate-100 p-2 text-xs text-ink-700 border border-ink-200 transition flex justify-between items-center"
            >
              <span>🔥 <strong>Student (Welder):</strong> amit.welder@gmail.com</span>
              <span className="text-[10px] text-brand-600 font-semibold">Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@skillmatch.in', 'admin123')}
              className="w-full text-left rounded-lg bg-brand-50/70 hover:bg-brand-100 p-2 text-xs text-brand-900 border border-brand-200 transition flex justify-between items-center"
            >
              <span>🛡️ <strong>Administrator:</strong> admin@skillmatch.in</span>
              <span className="text-[10px] text-brand-700 font-semibold">Fill</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Register as a Student
          </Link>
        </p>
      </div>
    </div>
  );
}

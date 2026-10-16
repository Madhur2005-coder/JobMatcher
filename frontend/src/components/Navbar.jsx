import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Layers,
  Building2,
  FileCheck2,
  Award,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  Bookmark,
  Send,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/80 bg-white/90 backdrop-blur-md">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-ink-900">
                Skill<span className="text-brand-600">Match</span>
              </span>
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 border border-brand-200">
                ITI/Poly
              </span>
            </div>
            <p className="text-[10px] font-medium text-ink-500 -mt-1 hidden sm:block">
              Vocational Skill-to-Job Platform
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Public & Student Links */}
          {!isAdmin && (
            <>
              <Link
                to="/jobs"
                className={`btn-ghost ${isActive('/jobs') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Jobs
              </Link>
              <Link
                to="/institutes"
                className={`btn-ghost ${isActive('/institutes') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Institutes
              </Link>
              <Link
                to="/government-schemes"
                className={`btn-ghost flex items-center gap-1.5 ${isActive('/government-schemes') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Government Schemes
              </Link>
              <Link
                to="/apprenticeships"
                className={`btn-ghost ${isActive('/apprenticeships') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Apprenticeships
              </Link>
              <Link
                to="/skills"
                className={`btn-ghost ${isActive('/skills') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Skills
              </Link>
            </>
          )}

          {/* Admin Navigation */}
          {isAdmin && (
            <>
              <Link
                to="/admin"
                className={`btn-ghost font-semibold ${isActive('/admin') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/jobs"
                className={`btn-ghost ${isActive('/admin/jobs') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Jobs
              </Link>
              <Link
                to="/admin/schemes"
                className={`btn-ghost ${isActive('/admin/schemes') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Schemes
              </Link>
              <Link
                to="/admin/skills"
                className={`btn-ghost ${isActive('/admin/skills') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Skills
              </Link>
              <Link
                to="/admin/companies"
                className={`btn-ghost ${isActive('/admin/companies') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Companies
              </Link>
              <Link
                to="/admin/institutes"
                className={`btn-ghost ${isActive('/admin/institutes') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Institutes
              </Link>
              <Link
                to="/admin/users"
                className={`btn-ghost ${isActive('/admin/users') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Users
              </Link>
              <Link
                to="/admin/analytics"
                className={`btn-ghost ${isActive('/admin/analytics') ? 'text-brand-600 bg-brand-50' : ''}`}
              >
                Analytics
              </Link>
            </>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started →
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-800 hover:bg-ink-50 transition shadow-sm"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold leading-tight line-clamp-1">{user?.full_name}</p>
                  <p className="text-[10px] text-ink-500 capitalize">{isAdmin ? 'Admin' : (user?.trade_name || 'Student')}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-ink-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-ink-200 bg-white py-2 shadow-card"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-ink-100">
                    <p className="text-xs font-semibold text-ink-900">{user?.full_name}</p>
                    <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                  </div>

                  {isStudent && (
                    <>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Briefcase className="h-4 w-4" /> My Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-600"
                      >
                        <UserIcon className="h-4 w-4" /> Edit Profile & Skills
                      </Link>
                      <Link
                        to="/saved-jobs"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Bookmark className="h-4 w-4" /> Saved Jobs
                      </Link>
                      <Link
                        to="/applications"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Send className="h-4 w-4" /> My Applications
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <ShieldCheck className="h-4 w-4" /> Admin Console
                    </Link>
                  )}

                  <div className="border-t border-ink-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-ink-200 bg-white px-4 py-4 space-y-2">
          {!isAdmin ? (
            <>
              <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                Jobs Directory
              </Link>
              <Link to="/institutes" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                ITI Institutes
              </Link>
              <Link to="/government-schemes" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                Government Schemes
              </Link>
              <Link to="/apprenticeships" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                Apprenticeships
              </Link>
              <Link to="/skills" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                Skills Catalog
              </Link>
              {isStudent && (
                <>
                  <div className="border-t border-ink-100 my-2 pt-2"></div>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-brand-600">
                    My Student Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                    Profile & Skills
                  </Link>
                  <Link to="/saved-jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                    Saved Jobs
                  </Link>
                  <Link to="/applications" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                    Applications
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-brand-600">
                Admin Dashboard
              </Link>
              <Link to="/admin/jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                Manage Jobs
              </Link>
              <Link to="/admin/schemes" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                Manage Schemes
              </Link>
              <Link to="/admin/skills" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                Manage Skills
              </Link>
              <Link to="/admin/analytics" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-800">
                Analytics
              </Link>
            </>
          )}

          <div className="border-t border-ink-100 my-2 pt-2 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-center">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-center">
                  Get Started
                </Link>
              </>
            ) : (
              <button onClick={handleLogout} className="btn-secondary w-full text-rose-600 text-center">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

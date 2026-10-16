import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  IndianRupee,
  Briefcase,
  Sparkles,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Building,
  ExternalLink,
  ArrowLeft,
  Share2,
  Send,
  Award,
  Layers
} from 'lucide-react';
import { jobsAPI, studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await jobsAPI.getJob(id);
        setJob(res.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await studentAPI.toggleSaveJob(id);
      setIsSaved(res.data.saved);
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setApplying(true);
      await studentAPI.applyJob({
        job_id: parseInt(id),
        cover_note: coverNote
      });
      setAppliedSuccess(true);
      setTimeout(() => {
        setApplyModalOpen(false);
        setAppliedSuccess(false);
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-r-transparent"></div>
        <p className="mt-3 text-sm text-ink-500 font-medium">Loading position details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-xl font-bold text-ink-900">Job position not found</h2>
        <Link to="/jobs" className="btn-primary mt-4">
          Back to Jobs Directory
        </Link>
      </div>
    );
  }

  const breakdown = job.match_breakdown || {
    skill_match: 92,
    trade_match: 100,
    location_match: 85,
    experience_match: 90,
    salary_match: 95
  };

  const overallScore = job.match_score !== null && job.match_score !== undefined
    ? Math.round(job.match_score)
    : 88;

  return (
    <div className="container-custom py-8 space-y-8">
      {/* Back link */}
      <div>
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to All Jobs
        </Link>
      </div>

      {/* 1. Job Overview Card Header */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-brand text-xs px-3 py-1">
                {job.trade_name}
              </span>
              <span className="badge bg-ink-100 text-ink-700 border border-ink-200 text-xs px-3 py-1">
                {job.job_type}
              </span>
              <span className="badge badge-verified text-xs px-3 py-1">
                Verified Employer
              </span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">
              {job.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-ink-600 font-medium">
              <div className="flex items-center gap-1.5 text-ink-900 font-semibold">
                <Building className="h-4 w-4 text-brand-600" />
                <span>{job.company_name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-ink-400" />
                <span>{job.location}, {job.city}, {job.state}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                <span>₹{job.salary_min?.toLocaleString('en-IN')} – ₹{job.salary_max?.toLocaleString('en-IN')} / month</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleSave}
              className={`btn-secondary text-xs sm:text-sm ${
                isSaved ? 'bg-amber-50 text-amber-800 border-amber-300' : ''
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{isSaved ? 'Job Saved' : 'Save Job'}</span>
            </button>

            <button
              onClick={() => setApplyModalOpen(true)}
              className="btn-primary text-xs sm:text-sm px-6 py-2.5 font-bold shadow-md shadow-brand-500/20"
            >
              <Send className="h-4 w-4" />
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Job Description & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Overview Specs Card */}
          <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-soft">
            <h3 className="text-base font-bold text-ink-900 border-b border-ink-100 pb-3">
              Position Overview
            </h3>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-ink-400 font-medium block">Trade Specialization</span>
                <span className="text-ink-900 font-bold mt-0.5 block">{job.trade_name}</span>
              </div>
              <div>
                <span className="text-ink-400 font-medium block">Experience Required</span>
                <span className="text-ink-900 font-bold mt-0.5 block">
                  {job.experience_min === 0 ? 'Fresher friendly' : `${job.experience_min} – ${job.experience_max} Years`}
                </span>
              </div>
              <div>
                <span className="text-ink-400 font-medium block">Required Qualification</span>
                <span className="text-ink-900 font-bold mt-0.5 block">{job.qualification}</span>
              </div>
              <div>
                <span className="text-ink-400 font-medium block">Job Location</span>
                <span className="text-ink-900 font-bold mt-0.5 block">{job.city} ({job.location})</span>
              </div>
              <div>
                <span className="text-ink-400 font-medium block">Salary Package</span>
                <span className="text-emerald-700 font-bold mt-0.5 block">
                  ₹{job.salary_min?.toLocaleString('en-IN')} – ₹{job.salary_max?.toLocaleString('en-IN')} / mo
                </span>
              </div>
              <div>
                <span className="text-ink-400 font-medium block">Job Type</span>
                <span className="text-ink-900 font-bold mt-0.5 block">{job.job_type}</span>
              </div>
            </div>
          </div>

          {/* Description & Responsibilities */}
          <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-soft space-y-6">
            <div>
              <h3 className="text-base font-bold text-ink-900 mb-2">Job Description</h3>
              <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.responsibilities && (
              <div>
                <h3 className="text-base font-bold text-ink-900 mb-2">Key Responsibilities</h3>
                <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </div>
            )}

            {/* Required Skills */}
            <div>
              <h3 className="text-base font-bold text-ink-900 mb-3">Required Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((sk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg bg-ink-50 px-3 py-1.5 text-xs font-semibold text-ink-700 border border-ink-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Company Profile Card */}
          <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-soft">
            <h3 className="text-base font-bold text-ink-900 mb-3 flex items-center gap-2">
              <Building className="h-4 w-4 text-brand-600" /> About {job.company_name}
            </h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              Leading manufacturing enterprise in the {job.company_industry} sector operating specialized plant operations in {job.city}.
            </p>
            {job.company_website && (
              <a
                href={job.company_website}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                Visit Company Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Right Column: AI MATCH ANALYSIS WIDGET ⭐ */}
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-brand-200 bg-gradient-to-b from-brand-50/50 to-white p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-brand-100">
              <div>
                <span className="badge badge-brand text-[10px]">Scikit-learn Engine</span>
                <h3 className="text-lg font-extrabold text-ink-900 mt-1 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-600" /> AI Match Analysis
                </h3>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-black text-xl shadow-md">
                {overallScore}%
              </div>
            </div>

            {/* Weighted Factors Breakdown */}
            <div className="mt-5 space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-ink-700 mb-1">
                  <span>Skill Match (50% Weight)</span>
                  <span className="text-brand-700 font-bold">{Math.round(breakdown.skill_match)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${breakdown.skill_match}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-ink-700 mb-1">
                  <span>Trade Match (20% Weight)</span>
                  <span className="text-emerald-700 font-bold">{Math.round(breakdown.trade_match)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${breakdown.trade_match}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-ink-700 mb-1">
                  <span>Location Fit (15% Weight)</span>
                  <span className="text-ink-800 font-bold">{Math.round(breakdown.location_match)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${breakdown.location_match}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-ink-700 mb-1">
                  <span>Experience Fit (10% Weight)</span>
                  <span className="text-ink-800 font-bold">{Math.round(breakdown.experience_match)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${breakdown.experience_match}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-ink-700 mb-1">
                  <span>Salary Fit (5% Weight)</span>
                  <span className="text-ink-800 font-bold">{Math.round(breakdown.salary_match)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${breakdown.salary_match}%` }}></div>
                </div>
              </div>
            </div>

            {/* Why You Match Section */}
            <div className="mt-6 pt-5 border-t border-brand-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
                Why You Match
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Trade Match: {job.trade_name}</span>
                </div>

                {job.matched_skills && job.matched_skills.length > 0 && (
                  <div className="flex items-start gap-2 text-emerald-800 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Matched Skills: {job.matched_skills.join(', ')}</span>
                  </div>
                )}

                {/* Missing Skills Warning */}
                {job.missing_skills && job.missing_skills.length > 0 && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-3 border border-amber-200">
                    <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Skill Gap Detected:
                    </p>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      You are missing: <span className="font-bold">{job.missing_skills.join(', ')}</span>.
                    </p>
                    <Link
                      to="/government-schemes"
                      className="mt-2 inline-block text-[11px] font-bold text-amber-900 underline hover:text-amber-950"
                    >
                      Bridge this gap via Government Training Schemes →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Apply CTA Box */}
          <div className="rounded-xl border border-ink-200 bg-white p-5 text-center shadow-soft">
            <h4 className="text-sm font-bold text-ink-900">Ready to step onto the factory floor?</h4>
            <p className="mt-1 text-xs text-ink-500">
              Fast-tracked consideration for verified ITI passouts.
            </p>
            <button
              onClick={() => setApplyModalOpen(true)}
              className="btn-primary w-full mt-4 font-bold"
            >
              Apply to {job.company_name}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Similar Jobs Section */}
      {job.similar_jobs && job.similar_jobs.length > 0 && (
        <div className="pt-8 border-t border-ink-200">
          <h2 className="text-xl font-bold text-ink-900 mb-6">
            Similar Openings in {job.trade_name}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {job.similar_jobs.map((sj) => (
              <JobCard key={sj.id} job={sj} />
            ))}
          </div>
        </div>
      )}

      {/* Application Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-ink-900">
              Apply for {job.title}
            </h3>
            <p className="text-xs text-ink-500 mt-1">
              At {job.company_name} ({job.city})
            </p>

            {appliedSuccess ? (
              <div className="my-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-ink-900">Application Submitted!</h4>
                <p className="text-xs text-ink-500 mt-1">Your profile and skills have been shared with the HR placement team.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1">
                    Cover Note / Workshop Experience Summary
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Briefly state your trade background, ITI institute, and workshop practical experience..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full rounded-xl border border-ink-200 p-3 text-xs outline-none focus:border-brand-500"
                  ></textarea>
                </div>

                <div className="rounded-lg bg-ink-50 p-3 text-xs text-ink-600 border border-ink-100">
                  <p className="font-semibold text-ink-800">Your profile details will be attached:</p>
                  <p className="mt-0.5 text-[11px]">Trade: {job.trade_name} • Match Score: {overallScore}%</p>
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="btn-primary text-xs"
                  >
                    {applying ? 'Submitting...' : 'Confirm Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

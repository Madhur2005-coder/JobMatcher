import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Sparkles, Bookmark, CheckCircle2, Building, ArrowRight } from 'lucide-react';
import { studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function JobCard({ job, onSaveToggle }) {
  const { isAuthenticated, isStudent } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in as a student to save jobs');
      return;
    }
    try {
      setSaving(true);
      const res = await studentAPI.toggleSaveJob(job.id);
      setIsSaved(res.data.saved);
      if (onSaveToggle) onSaveToggle(job.id, res.data.saved);
    } catch (err) {
      console.error('Failed to save job:', err);
    } finally {
      setSaving(false);
    }
  };

  const getMatchColor = (score) => {
    if (!score) return 'bg-ink-100 text-ink-700';
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (score >= 75) return 'bg-blue-50 text-brand-700 border-blue-300';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  return (
    <div className="group relative rounded-xl border border-ink-200 bg-white p-5 shadow-soft transition-all hover:border-brand-300 hover:shadow-card flex flex-col justify-between">
      <div>
        {/* Card Header: Trade & Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-brand">
              {job.trade_name || 'Vocational'}
            </span>
            <span className="badge bg-ink-100 text-ink-700 border border-ink-200">
              {job.job_type || 'Full Time'}
            </span>
          </div>

          {job.match_score !== null && job.match_score !== undefined && (
            <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${getMatchColor(job.match_score)}`}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>{Math.round(job.match_score)}% Match</span>
            </div>
          )}
        </div>

        {/* Title & Company */}
        <div className="mt-3">
          <Link to={`/jobs/${job.id}`} className="block">
            <h3 className="text-base font-bold text-ink-900 group-hover:text-brand-600 transition line-clamp-1">
              {job.title}
            </h3>
          </Link>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-ink-600">
            <Building className="h-3.5 w-3.5 text-ink-400" />
            <span className="truncate">{job.company_name}</span>
          </div>
        </div>

        {/* Location, Salary, Experience Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-600 sm:grid-cols-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" />
            <span className="truncate">{job.city}, {job.state}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IndianRupee className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-ink-900">
              ₹{job.salary_min?.toLocaleString('en-IN')} – ₹{job.salary_max?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <Briefcase className="h-3.5 w-3.5 text-ink-400 shrink-0" />
            <span>
              {job.experience_min === 0 ? 'Fresher' : `${job.experience_min}–${job.experience_max} yrs`}
            </span>
          </div>
        </div>

        {/* Required Skills Badges */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="rounded-md bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-600 border border-ink-200"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="rounded-md bg-ink-50 px-1.5 py-0.5 text-[10px] text-ink-500">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Explainable match reason preview */}
        {job.why_reasons && job.why_reasons.length > 0 && (
          <div className="mt-3 rounded-lg bg-emerald-50/60 p-2 text-[11px] text-emerald-900 border border-emerald-100 flex items-start gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{job.why_reasons[0]}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
            isSaved
              ? 'bg-amber-50 text-amber-700 border border-amber-300'
              : 'text-ink-600 hover:bg-ink-100'
          }`}
          title="Save Job"
        >
          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <Link
          to={`/jobs/${job.id}`}
          className="btn-primary text-xs py-1.5 px-3"
        >
          View Details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

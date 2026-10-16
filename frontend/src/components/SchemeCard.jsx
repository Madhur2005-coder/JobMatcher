import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ExternalLink, ArrowRight, ShieldCheck, CheckCircle2, Calendar } from 'lucide-react';

export default function SchemeCard({ scheme }) {
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Skill Development':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Apprenticeship':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Financial Assistance':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Training':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Employment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-ink-50 text-ink-700 border-ink-200';
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-ink-200 bg-white p-5 shadow-soft transition-all hover:border-brand-300 hover:shadow-card">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`badge ${getCategoryColor(scheme.category)}`}>
            {scheme.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Official Verified
          </span>
        </div>

        {/* Scheme Name */}
        <Link to={`/government-schemes/${scheme.id}`} className="mt-3 block">
          <h3 className="text-base font-bold text-ink-900 hover:text-brand-600 transition line-clamp-1">
            {scheme.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-ink-500 line-clamp-1 font-medium">
          Source: {scheme.official_source_name || 'Ministry of Skill Development & Entrepreneurship'}
        </p>

        {/* Applicable Trades */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-600">
          <span className="font-medium text-ink-500">Applicable Trades:</span>
          <span className="font-semibold text-ink-800">
            {scheme.applicable_trades?.join(' • ') || 'Welder • Electrician • Fitter'}
          </span>
        </div>

        {/* Benefits Preview */}
        <div className="mt-3 rounded-lg bg-ink-50 p-2.5 text-xs text-ink-700 border border-ink-100">
          <p className="font-semibold text-ink-900 mb-0.5 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" /> Benefits:
          </p>
          <p className="line-clamp-2 text-ink-600 leading-relaxed">
            {scheme.benefits}
          </p>
        </div>

        {/* Deadline */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
          <Calendar className="h-3.5 w-3.5 text-ink-400" />
          <span>Deadline: {scheme.application_deadline || 'Open Throughout Year'}</span>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-3 gap-2">
        <a
          href={scheme.official_website}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
        >
          Official Portal <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <Link
          to={`/government-schemes/${scheme.id}`}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          View Details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

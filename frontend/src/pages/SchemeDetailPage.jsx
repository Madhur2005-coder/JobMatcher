import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Calendar,
  FileText,
  Building,
  HelpCircle,
  Award
} from 'lucide-react';
import { schemesAPI } from '../services/api';

export default function SchemeDetailPage() {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheme = async () => {
      setLoading(true);
      try {
        const res = await schemesAPI.getScheme(id);
        setScheme(res.data);
      } catch (err) {
        console.error('Error loading scheme:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScheme();
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-r-transparent"></div>
        <p className="mt-3 text-sm text-ink-500 font-medium">Loading scheme details...</p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-xl font-bold text-ink-900">Government scheme not found</h2>
        <Link to="/government-schemes" className="btn-primary mt-4">
          Back to Government Schemes
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 space-y-8 max-w-4xl">
      <div>
        <Link to="/government-schemes" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to Schemes Directory
        </Link>
      </div>

      {/* Main Header */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="badge badge-brand text-xs px-3 py-1">
              {scheme.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Verified Official Program
            </span>
          </div>
          <span className="text-xs text-ink-500 font-medium">
            Deadline: {scheme.application_deadline || 'Open Throughout Year'}
          </span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-ink-900">
          {scheme.name}
        </h1>
        <p className="mt-2 text-xs font-semibold text-ink-500">
          Nodal Authority: {scheme.official_source_name}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={scheme.official_website}
            target="_blank"
            rel="noreferrer"
            className="btn-primary font-bold"
          >
            Apply on Official Government Portal <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Detailed Content Cards */}
      <div className="space-y-6">
        {/* Scheme Description */}
        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-soft">
          <h3 className="text-base font-bold text-ink-900 mb-2">Program Overview</h3>
          <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">
            {scheme.description}
          </p>
        </div>

        {/* Benefits Breakdown */}
        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-soft">
          <h3 className="text-base font-bold text-ink-900 mb-3 flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Key Benefits & Financial Incentives
          </h3>
          <p className="text-sm text-ink-700 leading-relaxed bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 whitespace-pre-line">
            {scheme.benefits}
          </p>
        </div>

        {/* Official Eligibility */}
        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-soft">
          <h3 className="text-base font-bold text-ink-900 mb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-600" /> Official Eligibility Criteria
          </h3>
          <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">
            {scheme.eligibility_criteria}
          </p>
          <div className="mt-4 pt-3 border-t border-ink-100 flex items-center gap-2 text-xs text-ink-500">
            <span className="font-semibold text-ink-700">Applicable Trades:</span>
            <span>{scheme.applicable_trades?.join(', ') || 'Welder, Electrician, Fitter'}</span>
          </div>
        </div>

        {/* Required Documents */}
        {scheme.required_documents && (
          <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-soft">
            <h3 className="text-base font-bold text-ink-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" /> Documents Required for Application
            </h3>
            <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">
              {scheme.required_documents}
            </p>
          </div>
        )}

        {/* Application Process Steps */}
        {scheme.application_process && (
          <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-soft">
            <h3 className="text-base font-bold text-ink-900 mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" /> How to Apply
            </h3>
            <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">
              {scheme.application_process}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

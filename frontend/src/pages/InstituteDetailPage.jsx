import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ArrowLeft,
  Award,
  Star,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { institutesAPI } from '../services/api';

export default function InstituteDetailPage() {
  const { id } = useParams();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInst = async () => {
      setLoading(true);
      try {
        const res = await institutesAPI.getInstitute(id);
        setInstitute(res.data);
      } catch (err) {
        console.error('Error fetching institute:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInst();
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-r-transparent"></div>
        <p className="mt-3 text-sm text-ink-500 font-medium">Loading institute details...</p>
      </div>
    );
  }

  if (!institute) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-xl font-bold text-ink-900">Institute not found</h2>
        <Link to="/institutes" className="btn-primary mt-4">
          Back to Institute Directory
        </Link>
      </div>
    );
  }

  const cleanPhone = institute.placement_officer_phone?.replace(/[^0-9]/g, '') || '';
  const whatsappUrl = `https://wa.me/91${cleanPhone.slice(-10)}`;

  return (
    <div className="container-custom py-8 space-y-8 max-w-4xl">
      <div>
        <Link to="/institutes" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to Institutes Directory
        </Link>
      </div>

      {/* Main Header */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                  {institute.type}
                </span>
                <span className="badge badge-brand text-xs">
                  {institute.code || 'NCVT Accredited'}
                </span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink-900">
                {institute.name}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-xs sm:text-sm text-ink-500">
                <MapPin className="h-4 w-4 text-ink-400" />
                <span>{institute.address || institute.city}, {institute.city}, {institute.state}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span>{institute.placement_rating || 4.8} / 5.0 Rating</span>
          </div>
        </div>

        {/* Action Connect Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-ink-100">
          {cleanPhone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              Chat on WhatsApp with Placement Cell
            </a>
          )}
          {institute.website && (
            <a
              href={institute.website}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-xs"
            >
              Official Website <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Trades Offered */}
        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-soft">
          <h3 className="text-base font-bold text-ink-900 mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-brand-600" /> Trades & Curriculum
          </h3>
          <div className="space-y-2">
            {institute.trades_offered?.split(',').map((trade, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-ink-800 bg-ink-50 p-2.5 rounded-lg border border-ink-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>ITI {trade.trim()}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-500 font-medium">
            Affiliation: {institute.certifications || 'National Council for Vocational Training (NCVT)'}
          </p>
        </div>

        {/* Placement Office Contact */}
        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-soft">
          <h3 className="text-base font-bold text-ink-900 mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-600" /> Placement Officer Contact
          </h3>
          <div className="space-y-3 text-xs text-ink-700">
            <div>
              <span className="text-ink-400 font-medium block">Officer Name</span>
              <span className="font-bold text-ink-900 text-sm mt-0.5 block">
                {institute.placement_officer_name || 'Placement Cell Officer'}
              </span>
            </div>
            <div>
              <span className="text-ink-400 font-medium block">Phone / Mobile</span>
              <a href={`tel:${institute.placement_officer_phone}`} className="font-bold text-brand-600 mt-0.5 block hover:underline">
                {institute.placement_officer_phone || '+91 94220 18234'}
              </a>
            </div>
            {institute.placement_officer_email && (
              <div>
                <span className="text-ink-400 font-medium block">Email Address</span>
                <a href={`mailto:${institute.placement_officer_email}`} className="font-semibold text-brand-600 mt-0.5 block hover:underline">
                  {institute.placement_officer_email}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

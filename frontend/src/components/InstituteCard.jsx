import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, MessageSquare, Star, Award, ArrowRight } from 'lucide-react';

export default function InstituteCard({ institute }) {
  const cleanPhone = institute.placement_officer_phone?.replace(/[^0-9]/g, '') || '';
  const whatsappUrl = `https://wa.me/91${cleanPhone.slice(-10)}`;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-ink-200 bg-white p-5 shadow-soft transition-all hover:border-brand-300 hover:shadow-card">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-bold border border-brand-100 text-sm">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
              {institute.type || 'Government'}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>{institute.placement_rating || 4.8}</span>
            </div>
          </div>
        </div>

        {/* Name & Location */}
        <div className="mt-3">
          <Link to={`/institutes/${institute.id}`}>
            <h3 className="text-base font-bold text-ink-900 hover:text-brand-600 transition line-clamp-1">
              {institute.name}
            </h3>
          </Link>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-500 font-medium">
            <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" />
            <span className="truncate">{institute.city}, {institute.state}</span>
          </p>
        </div>

        {/* Trades Offered */}
        <div className="mt-3.5">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Trades Offered:</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {institute.trades_offered?.split(',').map((trade, idx) => (
              <span
                key={idx}
                className="badge badge-brand text-[11px]"
              >
                {trade.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-3 flex items-center gap-1 text-xs text-ink-600">
          <Award className="h-3.5 w-3.5 text-brand-600 shrink-0" />
          <span className="truncate">{institute.certifications || 'NCVT / DGT Affiliated'}</span>
        </div>
      </div>

      {/* Placement Officer & WhatsApp Contact Bar (CampusConnect inspired) */}
      <div className="mt-5 border-t border-ink-100 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-800 truncate">
              {institute.placement_officer_name || 'Placement Cell'}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-ink-500">
              <Phone className="h-3 w-3 text-ink-400" />
              <span>{institute.placement_officer_phone || '+91 94220 18234'}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {cleanPhone && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
            <Link
              to={`/institutes/${institute.id}`}
              className="btn-secondary text-xs p-1.5"
              title="View Details"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

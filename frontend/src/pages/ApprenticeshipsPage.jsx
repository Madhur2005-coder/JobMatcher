import React, { useState, useEffect } from 'react';
import { Search, MapPin, IndianRupee, Clock, Award, ExternalLink, Building, ArrowRight } from 'lucide-react';
import { apprenticeshipsAPI } from '../services/api';

export default function ApprenticeshipsPage() {
  const [apprenticeships, setApprenticeships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tradeFilter, setTradeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const fetchApprenticeships = async () => {
      setLoading(true);
      try {
        const params = {
          trade: tradeFilter || undefined,
          location: locationFilter || undefined,
        };
        const res = await apprenticeshipsAPI.getApprenticeships(params);
        setApprenticeships(res.data);
      } catch (err) {
        console.error('Error fetching apprenticeships:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApprenticeships();
  }, [tradeFilter, locationFilter]);

  return (
    <div className="container-custom py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="badge badge-brand mb-2">NAPS & DGT Opportunities</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
          Vocational Apprenticeship Opportunities
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Official 1-year industrial apprenticeships for ITI Welders, Electricians, and Fitters with direct DBT government stipend subsidies.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={tradeFilter}
          onChange={(e) => setTradeFilter(e.target.value)}
          className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-800 outline-none cursor-pointer"
        >
          <option value="">All Trades</option>
          <option value="welder">ITI Welder</option>
          <option value="electrician">ITI Electrician</option>
          <option value="fitter">ITI Fitter</option>
        </select>

        <input
          type="text"
          placeholder="Filter by city (e.g. Pune, Bangalore)..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-800 outline-none w-64"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-60 rounded-xl bg-white border border-ink-200 animate-pulse p-5">
              <div className="h-4 bg-ink-100 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-ink-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-ink-100 rounded w-1/2 mb-6"></div>
              <div className="h-10 bg-ink-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : apprenticeships.length === 0 ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-12 text-center shadow-soft">
          <Award className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-4 text-base font-bold text-ink-900">No apprenticeships found</h3>
          <p className="mt-1 text-xs text-ink-500">Try adjusting your trade or city filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {apprenticeships.map((appr) => (
            <div
              key={appr.id}
              className="flex flex-col justify-between rounded-xl border border-ink-200 bg-white p-5 shadow-soft hover:border-brand-300 hover:shadow-card transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="badge badge-brand text-[11px]">{appr.trade_name}</span>
                  <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                    NAPS Stipend Eligible
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-ink-900 line-clamp-1">
                  {appr.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-ink-700">
                  <Building className="h-3.5 w-3.5 text-ink-400" />
                  <span>{appr.company_name}</span>
                </p>

                <div className="mt-4 space-y-2 text-xs text-ink-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                    <span>{appr.city}, {appr.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{appr.stipend_range}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                    <span>Duration: {appr.duration_months} Months • {appr.positions} Open Positions</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-ink-500 line-clamp-2 leading-relaxed">
                  {appr.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-ink-100 flex items-center justify-between">
                <span className="text-[11px] text-ink-400">Eligibility: {appr.eligibility}</span>
                <a
                  href={appr.application_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Apply <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

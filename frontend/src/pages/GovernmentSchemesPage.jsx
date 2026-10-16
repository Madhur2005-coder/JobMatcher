import React, { useState, useEffect } from 'react';
import { Search, Award, ShieldCheck, Filter, ExternalLink } from 'lucide-react';
import { schemesAPI } from '../services/api';
import SchemeCard from '../components/SchemeCard';

export default function GovernmentSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tradeFilter, setTradeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Skill Development',
    'Apprenticeship',
    'Employment',
    'Training',
    'Financial Assistance'
  ];

  const trades = [
    { code: 'All', name: 'All Trades' },
    { code: 'welder', name: 'ITI Welder' },
    { code: 'electrician', name: 'ITI Electrician' },
    { code: 'fitter', name: 'ITI Fitter' }
  ];

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const params = {
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          trade: tradeFilter !== 'All' ? tradeFilter : undefined,
          q: searchQuery || undefined
        };
        const res = await schemesAPI.getSchemes(params);
        setSchemes(res.data);
      } catch (err) {
        console.error('Error loading schemes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [categoryFilter, tradeFilter, searchQuery]);

  return (
    <div className="container-custom py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 p-8 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200 border border-white/20 mb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Official Government Initiatives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Government Schemes & Opportunities
          </h1>
          <p className="mt-2 text-sm sm:text-base text-brand-100 leading-relaxed">
            Find verified Central & State government programs relevant to your vocational trade, apprenticeship stipends, toolkit incentives, and subsidized technical training.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search schemes by name, benefits or keyword (e.g. Vishwakarma, NAPS, PMKVY)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-brand-500 shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-ink-200 text-ink-700 hover:border-brand-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Trade Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-ink-600">
          <span className="font-semibold text-ink-400">Trade Filter:</span>
          {trades.map((t) => (
            <button
              key={t.code}
              onClick={() => setTradeFilter(t.code)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                tradeFilter === t.code
                  ? 'bg-ink-800 text-white'
                  : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-white border border-ink-200 animate-pulse p-5">
              <div className="h-4 bg-ink-100 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-ink-100 rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-ink-100 rounded mb-4"></div>
            </div>
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-12 text-center shadow-soft">
          <Award className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-4 text-base font-bold text-ink-900">No schemes found</h3>
          <p className="mt-1 text-xs text-ink-500">
            No active schemes matched your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
}

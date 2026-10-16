import React, { useState, useEffect } from 'react';
import { Search, Building2, MapPin, Filter } from 'lucide-react';
import { institutesAPI } from '../services/api';
import InstituteCard from '../components/InstituteCard';

export default function InstitutesPage() {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchInstitutes = async () => {
      setLoading(true);
      try {
        const params = {
          q: searchQuery || undefined,
          trade: tradeFilter || undefined,
          city: cityFilter || undefined,
          type: typeFilter || undefined
        };
        const res = await institutesAPI.getInstitutes(params);
        setInstitutes(res.data);
      } catch (err) {
        console.error('Error fetching institutes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutes();
  }, [searchQuery, tradeFilter, cityFilter, typeFilter]);

  return (
    <div className="container-custom py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
          ITI & Training Institute Directory
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Find verified Government and Private ITIs across Pune, Chennai, Bangalore, and Delhi. Connect directly with placement officers on WhatsApp.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-soft space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search institute name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-ink-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="w-full rounded-lg border border-ink-200 py-2 px-3 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="">All Trades</option>
              <option value="Welder">Welder</option>
              <option value="Electrician">Electrician</option>
              <option value="Fitter">Fitter</option>
            </select>
          </div>

          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-lg border border-ink-200 py-2 px-3 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="">All Cities</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Delhi">Delhi</option>
              <option value="Gurgaon">Gurgaon</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-ink-200 py-2 px-3 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="Government">Government ITI</option>
              <option value="Private">Private ITI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-white border border-ink-200 animate-pulse p-5">
              <div className="h-6 bg-ink-100 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-ink-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-ink-100 rounded w-1/3 mb-6"></div>
              <div className="h-8 bg-ink-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : institutes.length === 0 ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-12 text-center shadow-soft">
          <Building2 className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-4 text-base font-bold text-ink-900">No institutes found</h3>
          <p className="mt-1 text-xs text-ink-500">Try adjusting your trade or city filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {institutes.map((inst) => (
            <InstituteCard key={inst.id} institute={inst} />
          ))}
        </div>
      )}
    </div>
  );
}

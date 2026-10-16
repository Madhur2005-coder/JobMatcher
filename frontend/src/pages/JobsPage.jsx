import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RefreshCw, X, ChevronDown, Sparkles, MapPin, Briefcase } from 'lucide-react';
import { jobsAPI, skillsAPI } from '../services/api';
import JobCard from '../components/JobCard';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tradesWithSkills, setTradesWithSkills] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedTrades, setSelectedTrades] = useState(searchParams.get('trade') ? [searchParams.get('trade')] : []);
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [selectedExp, setSelectedExp] = useState(searchParams.get('experience') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('min_salary') || '');
  const [maxSalary, setMaxSalary] = useState(searchParams.get('max_salary') || '');
  const [jobType, setJobType] = useState(searchParams.get('job_type') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '');
  const [sortBy, setSortBy] = useState('best_match');

  useEffect(() => {
    skillsAPI.getTradesWithSkills().then((res) => setTradesWithSkills(res.data)).catch(console.error);
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        q: searchQuery || undefined,
        trade: selectedTrades.length > 0 ? selectedTrades[0] : undefined,
        location: locationInput || undefined,
        experience: selectedExp || undefined,
        min_salary: minSalary || undefined,
        max_salary: maxSalary || undefined,
        job_type: jobType || undefined,
        skill: selectedSkill || undefined,
        sort_by: sortBy,
        limit: 50
      };
      const res = await jobsAPI.getJobs(params);
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedTrades, locationInput, selectedExp, minSalary, maxSalary, jobType, selectedSkill, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleTradeToggle = (code) => {
    if (selectedTrades.includes(code)) {
      setSelectedTrades(selectedTrades.filter((t) => t !== code));
    } else {
      setSelectedTrades([code]); // Single active trade filter for sharp focus
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTrades([]);
    setLocationInput('');
    setSelectedExp('');
    setMinSalary('');
    setMaxSalary('');
    setJobType('');
    setSelectedSkill('');
    setSortBy('best_match');
  };

  // Get skills available for current trade filter
  const currentSkills = tradesWithSkills
    .filter((t) => selectedTrades.length === 0 || selectedTrades.includes(t.code))
    .flatMap((t) => t.skills || []);

  return (
    <div className="container-custom py-8">
      {/* Top Search Bar & Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">
            Find Vocational Jobs
          </h1>
          <p className="text-xs sm:text-sm text-ink-600 mt-1">
            Browse verified industrial manufacturing and plant maintenance positions for ITI graduates.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="btn-secondary sm:hidden flex items-center justify-center gap-2"
        >
          <Filter className="h-4 w-4 text-brand-600" />
          <span>Filters {selectedTrades.length > 0 ? '(Active)' : ''}</span>
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search job title, skills, or company name (e.g. MIG Welder, Industrial Wiring, CNC Fitter)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-ink-900 placeholder:text-ink-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 shadow-sm"
          />
        </div>
        <button type="submit" className="btn-primary px-6">
          Search
        </button>
      </form>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6">
          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <span className="font-bold text-sm text-ink-900 flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-brand-600" /> Filters
              </span>
              <button
                onClick={resetFilters}
                className="text-xs text-brand-600 hover:text-brand-800 font-semibold"
              >
                Reset All
              </button>
            </div>

            {/* 1. Trade Filter */}
            <div className="pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-500 block mb-2.5">
                Vocational Trade
              </label>
              <div className="space-y-2">
                {[
                  { code: 'welder', name: 'ITI Welder', icon: '🔥' },
                  { code: 'electrician', name: 'ITI Electrician', icon: '⚡' },
                  { code: 'fitter', name: 'ITI Fitter', icon: '🔧' }
                ].map((t) => (
                  <label
                    key={t.code}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition ${
                      selectedTrades.includes(t.code)
                        ? 'bg-brand-50 text-brand-800 border border-brand-200 font-bold'
                        : 'text-ink-700 hover:bg-ink-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTrades.includes(t.code)}
                      onChange={() => handleTradeToggle(t.code)}
                      className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>{t.icon} {t.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Location Filter */}
            <div className="pt-5 border-t border-ink-100 mt-5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-500 block mb-2">
                Location / City
              </label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="e.g. Pune, Chennai..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full rounded-lg border border-ink-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* 3. Experience */}
            <div className="pt-5 border-t border-ink-100 mt-5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-500 block mb-2">
                Experience Level
              </label>
              <div className="space-y-1.5 text-xs text-ink-700">
                {[
                  { val: '', label: 'All Experience Levels' },
                  { val: 'fresher', label: 'Fresher (0 years)' },
                  { val: '0-1', label: '0–1 years' },
                  { val: '1-3', label: '1–3 years' },
                  { val: '3+', label: '3+ years' }
                ].map((exp, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="expFilter"
                      checked={selectedExp === exp.val}
                      onChange={() => setSelectedExp(exp.val)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>{exp.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Salary Range */}
            <div className="pt-5 border-t border-ink-100 mt-5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-500 block mb-2">
                Monthly Salary (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min (15000)"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full rounded-lg border border-ink-200 p-1.5 text-xs outline-none"
                />
                <input
                  type="number"
                  placeholder="Max (35000)"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className="w-full rounded-lg border border-ink-200 p-1.5 text-xs outline-none"
                />
              </div>
            </div>

            {/* 5. Job Type */}
            <div className="pt-5 border-t border-ink-100 mt-5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-500 block mb-2">
                Employment Type
              </label>
              <div className="space-y-1.5 text-xs text-ink-700">
                {['', 'Full Time', 'Apprenticeship', 'Contract'].map((type, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="jobTypeFilter"
                      checked={jobType === type}
                      onChange={() => setJobType(type)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>{type || 'All Job Types'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 6. Skills Selector */}
            {currentSkills.length > 0 && (
              <div className="pt-5 border-t border-ink-100 mt-5">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-500 block mb-2">
                  Filter by Specific Skill
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full rounded-lg border border-ink-200 p-2 text-xs outline-none bg-white cursor-pointer"
                >
                  <option value="">All Skills</option>
                  {currentSkills.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: Results */}
        <main className="lg:col-span-3">
          {/* Results Bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-3 shadow-sm">
            <p className="text-sm font-bold text-ink-900">
              <span className="text-brand-600">{total}</span> Jobs Found
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-ink-600">
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-800 outline-none cursor-pointer"
              >
                <option value="best_match">AI Best Match (TF-IDF)</option>
                <option value="newest">Newest Postings</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
              </select>
            </div>
          </div>

          {/* Jobs Listing */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-60 rounded-xl bg-white border border-ink-200 animate-pulse p-5">
                  <div className="h-4 bg-ink-100 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-ink-100 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-ink-100 rounded w-1/2 mb-6"></div>
                  <div className="h-8 bg-ink-100 rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-ink-200 bg-white p-12 text-center shadow-soft">
              <Briefcase className="mx-auto h-12 w-12 text-ink-300" />
              <h3 className="mt-4 text-base font-bold text-ink-900">No matching jobs found</h3>
              <p className="mt-1 text-xs text-ink-500 max-w-sm mx-auto">
                Try loosening your filters or clear trade/location criteria to discover more openings.
              </p>
              <button
                onClick={resetFilters}
                className="btn-secondary mt-5"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 p-4 sm:hidden">
          <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="font-bold text-base text-ink-900">Filter Jobs</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="rounded-lg p-1 text-ink-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Filter Controls */}
            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-bold text-ink-500 uppercase">Trade</label>
                <div className="mt-2 space-y-1">
                  {['welder', 'electrician', 'fitter'].map((tc) => (
                    <label key={tc} className="flex items-center gap-2 text-xs font-medium py-1">
                      <input
                        type="checkbox"
                        checked={selectedTrades.includes(tc)}
                        onChange={() => handleTradeToggle(tc)}
                      />
                      <span className="capitalize">{tc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink-500 uppercase">Location</label>
                <input
                  type="text"
                  placeholder="City"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink-500 uppercase">Experience</label>
                <select
                  value={selectedExp}
                  onChange={(e) => setSelectedExp(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink-200 p-2 text-xs"
                >
                  <option value="">All</option>
                  <option value="fresher">Fresher</option>
                  <option value="0-1">0-1 yrs</option>
                  <option value="1-3">1-3 yrs</option>
                  <option value="3+">3+ yrs</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-ink-100">
              <button onClick={resetFilters} className="btn-secondary flex-1">Reset</button>
              <button onClick={() => setMobileFilterOpen(false)} className="btn-primary flex-1">Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

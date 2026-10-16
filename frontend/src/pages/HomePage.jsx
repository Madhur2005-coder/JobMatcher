import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  Zap,
  Wrench,
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Award,
  TrendingUp,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { jobsAPI, schemesAPI, institutesAPI, analyticsAPI } from '../services/api';
import JobCard from '../components/JobCard';
import SchemeCard from '../components/SchemeCard';
import InstituteCard from '../components/InstituteCard';

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedTrade, setSelectedTrade] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [stats, setStats] = useState({
    jobs: 54,
    companies: 20,
    institutes: 15,
    schemes: 8,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [jobsRes, schemesRes, instRes, analyticsRes] = await Promise.all([
          jobsAPI.getJobs({ limit: 4 }),
          schemesAPI.getSchemes({ limit: 3 }),
          institutesAPI.getInstitutes({ limit: 3 }),
          analyticsAPI.getAnalytics()
        ]);
        setFeaturedJobs(jobsRes.data.jobs || []);
        setSchemes(schemesRes.data.slice(0, 3));
        setInstitutes(instRes.data.slice(0, 3));
        if (analyticsRes.data?.kpis) {
          setStats(analyticsRes.data.kpis);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (selectedTrade) query.set('trade', selectedTrade);
    if (searchLocation) query.set('location', searchLocation);
    navigate(`/jobs?${query.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION (CampusConnect Inspired) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-ink-100">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(2,127,242,0.12),transparent)]"></div>

        <div className="container-custom text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>Vocational Skill-to-Job Matching Engine</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight sm:leading-none">
            Find Local Jobs That Match Your{' '}
            <span className="text-brand-600 bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-brand-500">
              ITI & Polytechnic Skills
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-ink-600 leading-relaxed">
            Connect your technical training in Welder, Electrician, and Fitter trades directly with verified manufacturing clusters, apprenticeship stipends, and official government schemes.
          </p>

          {/* Quick Trade Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-ink-500">Target Trades:</span>
            <button
              onClick={() => setSelectedTrade('welder')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedTrade === 'welder'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white border border-ink-200 text-ink-700 hover:border-amber-400'
              }`}
            >
              🔥 ITI Welder
            </button>
            <button
              onClick={() => setSelectedTrade('electrician')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedTrade === 'electrician'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-ink-200 text-ink-700 hover:border-blue-400'
              }`}
            >
              ⚡ ITI Electrician
            </button>
            <button
              onClick={() => setSelectedTrade('fitter')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedTrade === 'fitter'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-ink-200 text-ink-700 hover:border-emerald-400'
              }`}
            >
              🔧 ITI Fitter
            </button>
          </div>

          {/* Hero Search Box */}
          <form
            onSubmit={handleHeroSearch}
            className="mx-auto mt-8 flex max-w-3xl flex-col sm:flex-row items-stretch rounded-2xl border border-ink-200 bg-white p-2 shadow-card"
          >
            {/* Trade Selector */}
            <div className="flex-1 border-b border-ink-100 px-4 py-2 sm:border-b-0 sm:border-r text-left">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                Select Your Trade
              </label>
              <select
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink-900 outline-none cursor-pointer"
              >
                <option value="">All 3 Focused Trades</option>
                <option value="welder">ITI Welder (MIG, TIG, Arc, Fabrication)</option>
                <option value="electrician">ITI Electrician (Wiring, Control Panels, Motors)</option>
                <option value="fitter">ITI Fitter (Assembly, Lathe, Hydraulics)</option>
              </select>
            </div>

            {/* Location Input */}
            <div className="flex-1 px-4 py-2 text-left">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                Preferred Industrial Hub
              </label>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-4 w-4 text-ink-400 shrink-0" />
                <input
                  type="text"
                  placeholder="e.g. Pune, Chennai, Bangalore..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full border-0 bg-transparent p-0 text-sm font-medium text-ink-900 placeholder:text-ink-400 outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-1">
              <button
                type="submit"
                className="btn-primary h-full w-full whitespace-nowrap px-6 py-3 font-bold"
              >
                <Search className="h-4 w-4" />
                Search Jobs
              </button>
            </div>
          </form>

          {/* Trending Locations */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-500">
            <span className="font-semibold">Top Clusters:</span>
            {['Chakan (Pune)', 'Peenya (Bangalore)', 'Ambattur (Chennai)', 'Manesar (Gurgaon)', 'Sanand (Ahmedabad)'].map((loc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSearchLocation(loc.split(' ')[0])}
                className="rounded-md bg-white px-2.5 py-1 border border-ink-200 text-ink-700 hover:border-brand-300 transition"
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Dynamic Platform Statistics Bar */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 sm:grid-cols-4 gap-4 border-t border-ink-200/80 pt-8">
            <div className="p-3 bg-white rounded-xl border border-ink-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-ink-900">{stats.jobs || 50}+</p>
              <p className="text-xs font-semibold text-ink-500 mt-0.5">Active Local Jobs</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-ink-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-ink-900">{stats.companies || 20}+</p>
              <p className="text-xs font-semibold text-ink-500 mt-0.5">Industrial Employers</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-ink-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-ink-900">{stats.institutes || 15}+</p>
              <p className="text-xs font-semibold text-ink-500 mt-0.5">ITI Placement Cells</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-ink-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-ink-900">{stats.schemes || 8}+</p>
              <p className="text-xs font-semibold text-ink-500 mt-0.5">Government Schemes</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR TRADES SECTION */}
      <section className="container-custom">
        <div className="text-center max-w-2xl mx-auto">
          <span className="badge badge-brand">Focus Areas</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink-900">
            Dedicated to India's Three Essential Trades
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            We don't do generic listings. SkillMatch is hyper-optimized for core technical manufacturing and maintenance specializations.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Welder Card */}
          <div className="card-base flex flex-col justify-between border-t-4 border-t-amber-500 group">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold border border-amber-200 group-hover:scale-110 transition-transform">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-ink-900">ITI Welder</h3>
              <p className="mt-2 text-xs text-ink-600 leading-relaxed">
                Explore structural fabrication, MIG/MAG welding, TIG pipe welding, and radiographic inspection roles in automotive and heavy engineering.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {['MIG Welding', 'TIG Welding', 'Arc Welding', 'Fabrication', 'Blueprint'].map((s, i) => (
                  <span key={i} className="badge bg-amber-50 text-amber-800 border border-amber-200 text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/jobs?trade=welder"
              className="btn-secondary mt-6 w-full justify-between group-hover:bg-amber-50 group-hover:text-amber-800 transition"
            >
              <span>Explore Welder Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Electrician Card */}
          <div className="card-base flex flex-col justify-between border-t-4 border-t-blue-500 group">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand-600 font-bold border border-blue-200 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-ink-900">ITI Electrician</h3>
              <p className="mt-2 text-xs text-ink-600 leading-relaxed">
                Discover plant electrical maintenance, control panel wiring, industrial switchgear, motor overhaul, and PLC automation roles.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {['Industrial Wiring', 'Control Panels', 'Motor Repair', 'PLC Basics', 'Safety'].map((s, i) => (
                  <span key={i} className="badge bg-blue-50 text-brand-800 border border-blue-200 text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/jobs?trade=electrician"
              className="btn-secondary mt-6 w-full justify-between group-hover:bg-blue-50 group-hover:text-brand-800 transition"
            >
              <span>Explore Electrician Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Fitter Card */}
          <div className="card-base flex flex-col justify-between border-t-4 border-t-emerald-500 group">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold border border-emerald-200 group-hover:scale-110 transition-transform">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-ink-900">ITI Fitter</h3>
              <p className="mt-2 text-xs text-ink-600 leading-relaxed">
                Connect with machine assembly, lathe turning, preventive maintenance, press shop tooling, and pneumatic/hydraulic system roles.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {['Machine Assembly', 'Lathe', 'Hydraulics', 'Pneumatics', 'Precision Tools'].map((s, i) => (
                  <span key={i} className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/jobs?trade=fitter"
              className="btn-secondary mt-6 w-full justify-between group-hover:bg-emerald-50 group-hover:text-emerald-800 transition"
            >
              <span>Explore Fitter Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="bg-white py-16 border-y border-ink-200/80">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto">
            <span className="badge badge-brand">Workflow</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink-900">
              How SkillMatch Works
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              From trade selection to AI job ranking and official scheme enrollment in 4 simple steps.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                desc: 'Select whether you are an ITI Welder, Electrician, or Fitter, and enter your city.',
                icon: UserCheck
              },
              {
                step: '02',
                title: 'Add Your Skills',
                desc: 'Pick your verified trade proficiencies from our controlled industrial skill database.',
                icon: CheckCircle2
              },
              {
                step: '03',
                title: 'Get AI Job Matches',
                desc: 'Our TF-IDF matching engine calculates compatibility percentages and pinpoints skill gaps.',
                icon: Sparkles
              },
              {
                step: '04',
                title: 'Apply & Grow',
                desc: 'Apply directly to verified employers, access NAPS stipends, and enroll in government schemes.',
                icon: TrendingUp
              }
            ].map((item, idx) => (
              <div key={idx} className="relative rounded-xl border border-ink-200 bg-slate-50 p-6">
                <span className="text-3xl font-black text-brand-200 block mb-2">{item.step}</span>
                <div className="flex items-center gap-2">
                  <item.icon className="h-5 w-5 text-brand-600" />
                  <h4 className="font-bold text-ink-900 text-base">{item.title}</h4>
                </div>
                <p className="mt-2 text-xs text-ink-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED LOCAL JOBS */}
      <section className="container-custom">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="badge badge-brand">Fresh Openings</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              Featured Manufacturing & Maintenance Jobs
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-600">
              Real positions with transparent salary bands and verified contact points.
            </p>
          </div>
          <Link to="/jobs" className="btn-secondary whitespace-nowrap">
            View All Jobs ({stats.jobs || 54}) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* 5. MAIN DIFFERENTIATOR BANNER */}
      <section className="container-custom">
        <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200 border border-white/20">
              Unique Value Proposition
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
              "Don't just find jobs. Find jobs that match what you know — and discover what you need to learn next."
            </h2>
            <p className="mt-4 text-sm sm:text-base text-brand-100 leading-relaxed">
              YOUR SKILLS → AI MATCHING → LOCAL JOBS → SKILL GAP → TRAINING → GOVERNMENT SCHEMES → SUSTAINED EMPLOYMENT.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand-900 hover:bg-brand-50 shadow-md transition">
                Create Free Profile →
              </Link>
              <Link to="/government-schemes" className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20 border border-white/20 transition">
                Explore Government Schemes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GOVERNMENT SCHEMES PREVIEW */}
      <section className="container-custom">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="badge badge-brand">Official Portals</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              Government Schemes & Opportunities
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-600">
              Verified programs from MSDE, NAPS, PM Vishwakarma, and NSDC for skill-development and stipends.
            </p>
          </div>
          <Link to="/government-schemes" className="btn-secondary whitespace-nowrap">
            Explore All Schemes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      </section>

      {/* 7. FEATURED INSTITUTES PREVIEW */}
      <section className="container-custom pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="badge badge-brand">Verified ITI Placement Cells</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              Partner ITIs & Training Institutes
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-600">
              Connect directly with Placement Officers on WhatsApp. Zero middlemen.
            </p>
          </div>
          <Link to="/institutes" className="btn-secondary whitespace-nowrap">
            Browse All Institutes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {institutes.map((inst) => (
            <InstituteCard key={inst.id} institute={inst} />
          ))}
        </div>
      </section>
    </div>
  );
}

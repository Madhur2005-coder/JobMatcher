import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI, matchingAPI } from '../services/api';
import {
  Briefcase, Star, TrendingUp, BookOpen, MapPin, DollarSign,
  Target, ChevronRight, Zap, AlertCircle, CheckCircle, Clock,
  BarChart2, Award, Heart, Bell, RefreshCw, Loader2
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-700', '-100')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

const MatchBadge = ({ score }) => {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'emerald' : pct >= 60 ? 'blue' : pct >= 40 ? 'amber' : 'slate';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-${color}-100 text-${color}-700 border border-${color}-200`}>
      <Target className="w-3 h-3" /> {pct}% match
    </span>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [skillGap, setSkillGap] = useState(null);
  const [predictedSalary, setPredictedSalary] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, savedRes, appRes] = await Promise.all([
        studentAPI.getDashboard(),
        studentAPI.getSavedJobs(),
        studentAPI.getApplications(),
      ]);
      setDashboard(dashRes.data);
      setSavedJobs(savedRes.data || []);
      setApplications(appRes.data || []);

      // Load AI recommendations
      if (dashRes.data?.profile) {
        const profile = dashRes.data.profile;
        const [recRes, salRes] = await Promise.all([
          matchingAPI.getRecommendations({
            trade: profile.trade || user?.trade,
            skills: profile.skills || [],
            experience_years: profile.experience_years || 0,
            preferred_location: profile.preferred_location || '',
          }),
          matchingAPI.predictSalary({
            trade: profile.trade || user?.trade,
            experience_years: profile.experience_years || 0,
            location: profile.preferred_location || 'Pune',
          }),
        ]);
        setRecommendations(recRes.data?.recommendations || []);
        setPredictedSalary(salRes.data);

        // Skill gap
        if (recRes.data?.recommendations?.length > 0) {
          const topJob = recRes.data.recommendations[0];
          const gapRes = await matchingAPI.analyzeSkillGap({
            student_skills: profile.skills || [],
            job_id: topJob.job_id,
          });
          setSkillGap(gapRes.data);
        }
      }
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId) => {
    try {
      await studentAPI.toggleSaveJob(jobId);
      const res = await studentAPI.getSavedJobs();
      setSavedJobs(res.data || []);
    } catch (err) {
      console.error('Toggle save error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your personalized dashboard...</p>
          <p className="text-slate-400 text-sm mt-1">AI is analyzing your profile</p>
        </div>
      </div>
    );
  }

  const profile = dashboard?.profile;
  const stats = dashboard?.stats || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {user?.full_name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h1>
                  <p className="text-blue-200 text-sm">{profile?.trade || user?.trade || 'ITI Graduate'} • {profile?.preferred_location || 'Maharashtra'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/profile"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white text-sm font-medium rounded-xl transition-all">
                Edit Profile
              </Link>
              <button onClick={loadDashboard}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 rounded-xl transition-all">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Profile completion bar */}
          {profile && (
            <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Profile Completeness</span>
                <span className="text-sm font-bold">{stats.profile_completion || 60}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.profile_completion || 60}%` }}
                ></div>
              </div>
              {(stats.profile_completion || 60) < 100 && (
                <p className="text-blue-200 text-xs mt-2">
                  ✨ Complete your profile to get better job matches!{' '}
                  <Link to="/profile" className="text-white underline">Complete now →</Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto pb-0">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart2 },
              { id: 'recommendations', label: 'AI Jobs', icon: Zap },
              { id: 'saved', label: `Saved (${savedJobs.length})`, icon: Heart },
              { id: 'applications', label: `Applied (${applications.length})`, icon: Briefcase },
              { id: 'skillgap', label: 'Skill Gap', icon: Target },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-200 hover:text-white hover:border-blue-300'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Zap} label="AI Matches Found" value={recommendations.length || stats.jobs_matched || 0} color="text-blue-600" sub="Based on your skills" />
              <StatCard icon={Heart} label="Saved Jobs" value={savedJobs.length} color="text-rose-600" sub="Review anytime" />
              <StatCard icon={Briefcase} label="Applications" value={applications.length} color="text-violet-600" sub="Jobs applied to" />
              <StatCard icon={DollarSign} label="Predicted Salary"
                value={predictedSalary ? `₹${Math.round((predictedSalary.predicted_monthly || 0) / 1000)}k` : '—'}
                color="text-emerald-600"
                sub={predictedSalary ? `${predictedSalary.trade} • ${predictedSalary.experience_years}yr exp` : 'Complete profile'} />
            </div>

            {/* Top recommendations preview */}
            {recommendations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" /> Top AI Matches
                  </h2>
                  <button onClick={() => setActiveTab('recommendations')} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.slice(0, 3).map((rec, idx) => (
                    <Link key={rec.job_id || idx} to={`/jobs/${rec.job_id}`}
                      className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <MatchBadge score={rec.match_score} />
                        {idx === 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">🏆 Best Match</span>}
                      </div>
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{rec.title}</h3>
                      <p className="text-slate-500 text-sm mt-1">{rec.company}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{rec.location}</span>
                        {rec.salary_min && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />₹{Math.round(rec.salary_min / 1000)}k+</span>}
                      </div>
                      {rec.skill_gaps?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-amber-600 font-medium">Gap: {rec.skill_gaps.slice(0, 2).join(', ')}</p>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Skills overview */}
            {profile?.skills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" /> Your Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
                <Link to="/profile" className="inline-flex items-center gap-1 mt-4 text-blue-600 text-sm font-medium hover:underline">
                  Add more skills <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {!profile && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Complete Your Profile</h3>
                <p className="text-slate-600 mb-6">Add your skills, experience, and preferred location to get personalized AI job recommendations.</p>
                <Link to="/profile" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
                  Set Up Profile <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* AI RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">AI-Ranked Job Matches</h2>
                <p className="text-slate-500 text-sm mt-1">Ranked by TF-IDF cosine similarity + trade + location fit</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Zap className="w-4 h-4 text-blue-500" />
                {recommendations.length} jobs found
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No recommendations yet</h3>
                <p className="text-slate-500 mb-4">Complete your profile with skills and trade to get AI-matched jobs.</p>
                <Link to="/profile" className="btn-primary">Complete Profile</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, idx) => {
                  const pct = Math.round(rec.match_score * 100);
                  const isSaved = savedJobs.some(s => s.id === rec.job_id);
                  return (
                    <div key={rec.job_id || idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-lg font-bold text-blue-700 shrink-0">
                              #{idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Link to={`/jobs/${rec.job_id}`}
                                  className="font-bold text-slate-800 hover:text-blue-700 transition-colors text-lg leading-tight">
                                  {rec.title}
                                </Link>
                                {idx === 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">🏆 Best</span>}
                              </div>
                              <p className="text-slate-500 text-sm">{rec.company}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-4">
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" />{rec.location}</span>
                            {rec.salary_min && <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-emerald-500" />₹{Math.round(rec.salary_min / 1000)}k – ₹{Math.round((rec.salary_max || rec.salary_min * 1.4) / 1000)}k/mo</span>}
                          </div>

                          {/* Match breakdown */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-50 rounded-xl p-3">
                              <div className="text-xs text-slate-500 mb-1 font-medium">Overall Match</div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-200 rounded-full h-2">
                                  <div className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                    style={{ width: `${pct}%` }}></div>
                                </div>
                                <span className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>{pct}%</span>
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                              <div className="text-xs text-slate-500 mb-1 font-medium">Skill Overlap</div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-200 rounded-full h-2">
                                  <div className="bg-violet-500 h-2 rounded-full"
                                    style={{ width: `${Math.round((rec.skill_score || 0.5) * 100)}%` }}></div>
                                </div>
                                <span className="text-sm font-bold text-violet-600">{Math.round((rec.skill_score || 0.5) * 100)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Matched & Missing skills */}
                          <div className="flex flex-wrap gap-2">
                            {rec.matched_skills?.slice(0, 4).map((s, i) => (
                              <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />{s}
                              </span>
                            ))}
                            {rec.skill_gaps?.slice(0, 3).map((s, i) => (
                              <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                                <AlertCircle className="w-3 h-3" />{s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-3 shrink-0">
                          <Link to={`/jobs/${rec.job_id}`}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all text-center">
                            View Job
                          </Link>
                          <button
                            onClick={() => handleToggleSave(rec.job_id)}
                            className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold rounded-xl transition-all border ${
                              isSaved ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}>
                            <Heart className={`w-4 h-4 inline mr-1 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                            {isSaved ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SAVED JOBS TAB */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Saved Jobs</h2>
            {savedJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No saved jobs yet</h3>
                <p className="text-slate-500 mb-4">Save jobs you're interested in and review them later.</p>
                <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
                  Browse Jobs <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {savedJobs.map((job, idx) => (
                  <div key={job.id || idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Link to={`/jobs/${job.id}`} className="font-bold text-slate-800 hover:text-blue-700 transition-colors">{job.title}</Link>
                        <p className="text-slate-500 text-sm mt-0.5">{job.company?.name || job.company}</p>
                      </div>
                      <button onClick={() => handleToggleSave(job.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      {job.salary_min && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />₹{Math.round(job.salary_min / 1000)}k+</span>}
                    </div>
                    <Link to={`/jobs/${job.id}`}
                      className="mt-4 inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline">
                      View & Apply <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">My Applications</h2>
            {applications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No applications yet</h3>
                <p className="text-slate-500 mb-4">Apply to jobs from the job listing or your AI matches.</p>
                <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
                  Find Jobs <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app, idx) => {
                  const statusColor = { pending: 'amber', reviewed: 'blue', shortlisted: 'emerald', rejected: 'red' }[app.status] || 'slate';
                  return (
                    <div key={app.id || idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <Link to={`/jobs/${app.job_id}`} className="font-bold text-slate-800 hover:text-blue-700 transition-colors">
                            {app.job?.title || `Job #${app.job_id}`}
                          </Link>
                          <p className="text-slate-500 text-sm mt-0.5">{app.job?.company?.name}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Applied {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <span className={`self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-bold bg-${statusColor}-100 text-${statusColor}-700 border border-${statusColor}-200 capitalize`}>
                          {app.status}
                        </span>
                      </div>
                      {app.cover_note && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 italic">
                          "{app.cover_note}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SKILL GAP TAB */}
        {activeTab === 'skillgap' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Skill Gap Analysis</h2>
              <p className="text-slate-500 text-sm mt-1">Based on your top AI-matched job</p>
            </div>

            {!skillGap ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No skill gap data</h3>
                <p className="text-slate-500">Complete your profile with skills to see your skill gaps.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Skills you have */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> Skills You Have
                    <span className="ml-auto text-sm text-slate-500">{skillGap.matched_skills?.length || 0} matched</span>
                  </h3>
                  {skillGap.matched_skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skillGap.matched_skills.map((s, i) => (
                        <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />{s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No matching skills found. Add skills to your profile.</p>
                  )}
                </div>

                {/* Skills you need */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" /> Skills to Develop
                    <span className="ml-auto text-sm text-slate-500">{skillGap.missing_skills?.length || 0} gaps</span>
                  </h3>
                  {skillGap.missing_skills?.length > 0 ? (
                    <div className="space-y-2">
                      {skillGap.missing_skills.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <span className="text-amber-800 font-medium text-sm">{s}</span>
                          <span className="text-xs text-amber-600 font-medium">Learn →</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-emerald-600 font-medium text-sm">🎉 You have all required skills!</p>
                  )}
                </div>

                {/* Overall gap score */}
                <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" /> Overall Match Score
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                        <span>Skill match</span>
                        <span>{Math.round((skillGap.match_percentage || 0))}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-4 shadow-inner">
                        <div
                          className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                          style={{ width: `${skillGap.match_percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-blue-700">
                      {Math.round(skillGap.match_percentage || 0)}%
                    </div>
                  </div>
                  {skillGap.recommendations?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm font-semibold text-slate-700 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {skillGap.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <Star className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />{rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

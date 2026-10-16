import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Zap, Wrench, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { skillsAPI } from '../services/api';

export default function SkillsDirectoryPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    skillsAPI.getTradesWithSkills().then((res) => {
      setTrades(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const getTradeIcon = (code) => {
    switch (code) {
      case 'welder':
        return <Flame className="h-6 w-6 text-amber-500" />;
      case 'electrician':
        return <Zap className="h-6 w-6 text-blue-500" />;
      case 'fitter':
        return <Wrench className="h-6 w-6 text-emerald-500" />;
      default:
        return <BookOpen className="h-6 w-6 text-brand-500" />;
    }
  };

  return (
    <div className="container-custom py-8 space-y-8">
      <div>
        <span className="badge badge-brand mb-2">Controlled Skills Taxonomy</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
          Vocational Skills Directory
        </h1>
        <p className="mt-1 text-sm text-ink-600 max-w-3xl">
          Controlled skill standards for ITI Welder, ITI Electrician, and ITI Fitter trades. Select any skill to see currently available manufacturing jobs requiring that proficiency.
        </p>
      </div>

      {loading ? (
        <div className="h-60 rounded-xl bg-white border border-ink-200 animate-pulse"></div>
      ) : (
        <div className="space-y-10">
          {trades.map((trade) => (
            <div key={trade.id} className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-soft">
              <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-50 border border-ink-200">
                  {getTradeIcon(trade.code)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink-900">{trade.name}</h2>
                  <p className="text-xs text-ink-500">{trade.description}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {trade.skills?.map((skill) => (
                  <Link
                    key={skill.id}
                    to={`/jobs?skill=${encodeURIComponent(skill.name)}`}
                    className="group flex items-center justify-between p-3.5 rounded-xl border border-ink-200 bg-slate-50 hover:bg-white hover:border-brand-300 hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-ink-800 group-hover:text-brand-600">
                        {skill.name}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

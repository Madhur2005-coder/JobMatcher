import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, MapPin, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-200 bg-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-ink-900">
                Skill<span className="text-brand-600">Match</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-ink-600 leading-relaxed">
              India's specialized vocational skill-to-job matching engine for ITI Welder, ITI Electrician, and ITI Fitter trades. Connect directly with verified manufacturing employers and apprenticeships.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Aligned with MSDE & NCVT Industrial Guidelines</span>
            </div>
          </div>

          {/* Targeted Trades */}
          <div>
            <h4 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">Vocational Trades</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li>
                <Link to="/jobs?trade=welder" className="hover:text-brand-600 transition">ITI Welder Jobs</Link>
              </li>
              <li>
                <Link to="/jobs?trade=electrician" className="hover:text-brand-600 transition">ITI Electrician Jobs</Link>
              </li>
              <li>
                <Link to="/jobs?trade=fitter" className="hover:text-brand-600 transition">ITI Fitter Jobs</Link>
              </li>
              <li>
                <Link to="/skills" className="hover:text-brand-600 transition">Trade Skills Directory</Link>
              </li>
              <li>
                <Link to="/apprenticeships" className="hover:text-brand-600 transition">NAPS Apprenticeships</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li>
                <Link to="/government-schemes" className="hover:text-brand-600 transition">Government Schemes</Link>
              </li>
              <li>
                <Link to="/institutes" className="hover:text-brand-600 transition">Find ITI Institutes</Link>
              </li>
              <li>
                <a href="https://www.apprenticeshipindia.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-brand-600 transition">
                  NAPS Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://pmvishwakarma.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-brand-600 transition">
                  PM Vishwakarma <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-600 transition">Student Login</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">Placement Support</h4>
            <ul className="mt-3 space-y-2.5 text-sm text-ink-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-600 shrink-0" />
                <a href="mailto:support@skillmatch.in" className="hover:text-brand-600 truncate">
                  support@skillmatch.in
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                <span>Industrial MIDC Cluster, Pune & Bangalore Hubs</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 text-xs text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} SkillMatch Platform. Dedicated to India's Frontline Vocational Workforce.</p>
          <div className="flex items-center gap-4">
            <span className="text-ink-400">Pune • Chennai • Bangalore • Gurgaon • Ahmedabad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

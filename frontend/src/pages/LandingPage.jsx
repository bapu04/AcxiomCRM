import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../context/ThemeContext';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Target,
  CalendarCheck,
  History,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ChevronRight,
  Zap,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email, password) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Navigation Header */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/20">
              A
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Acxiom<span className="text-indigo-600 dark:text-indigo-400">CRM</span>
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 px-2 py-0.5 rounded">
                Enterprise
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition">Features</a>
            <a href="#roles" className="hover:text-indigo-600 dark:hover:text-white transition">Role Scopes</a>
            <a href="#security" className="hover:text-indigo-600 dark:hover:text-white transition">Security</a>
            <a href="#demo" className="hover:text-indigo-600 dark:hover:text-white transition">Live Demo</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition"
              >
                Go to Dashboard ({user?.role})
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition"
                >
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Full-Stack MERN Architecture • Role-Scoped Security</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Empower Every Sales Role.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-600 dark:from-indigo-400 dark:via-sky-300 dark:to-emerald-400">
              Close High-Value Deals.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AcxiomCRM unites customers, inbound leads, 5-stage opportunity forecasting, automated follow-ups, and an append-only audit trail inside a secure, role-governed platform.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 text-base"
            >
              Launch Live Application
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-base shadow-sm"
            >
              Test Pre-Seeded Roles
            </a>
          </div>

          {/* Floating Metric Badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pipeline Forecast</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">$225,000</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Weighted: $163,000</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Access Governance</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">3 Strict Roles</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin, Manager, Sales</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Lockout Defense</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">5 Attempts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">15-min auto lockout</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Audit Trail</p>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">Append-Only</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Zero tampering allowed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Demonstration Section */}
      <section id="demo" className="py-20 bg-slate-100 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800 relative transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Interactive Role Testing</h2>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">Experience AcxiomCRM From Any Perspective</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              Click any role card below to instantly authenticate with pre-seeded demo credentials and observe server-enforced role permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Admin Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-500/60 transition shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                    Administrator
                  </span>
                  <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">System Admin</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">admin@acxiomcrm.com</p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    User creation & role promotion
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    Account unlock & activation toggle
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    Tamper-proof audit logs & diffs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    Global pipeline oversight
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemoLogin('admin@acxiomcrm.com', 'Admin@12345')}
                className="mt-6 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                Log In as Admin
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Manager Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-500/60 transition shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                    Sales Manager
                  </span>
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sarah Jenkins</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">manager@acxiomcrm.com</p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    Full team pipeline monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    Conversion reports & analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    Lead assignment & opportunity oversight
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    Rep activity performance tracking
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemoLogin('manager@acxiomcrm.com', 'Manager@12345')}
                className="mt-6 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                Log In as Manager
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Sales Executive Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500/60 transition shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    Sales Executive
                  </span>
                  <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rahul Sharma</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">sales@acxiomcrm.com</p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    Assigned customer master data
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    Lead capture & 1-click deal conversion
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    Scheduled calls & meeting follow-ups
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    Scoped personal sales dashboard
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemoLogin('sales@acxiomcrm.com', 'Sales@12345')}
                className="mt-6 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                Log In as Sales Exec
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Complete CRM Modules</h2>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">End-to-End Sales Lifecycle Architecture</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              Engineered with layered clean architecture: Presentation, Application, Domain, Data Access, and Security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:shadow-md transition">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-500/20">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Customer Master Directory</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Centralized account records with unique email & phone enforcement. Prevents duplicate customer creation while retaining multi-contact activity history.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:shadow-md transition">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-500/20">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lead Qualification & Conversion</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Track prospect sources and stages. With 1 click, seamlessly convert qualified leads into Customer accounts and initial pipeline Opportunities.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:shadow-md transition">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-500/20">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">5-Stage Opportunity Pipeline</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Move deals from Qualification to Proposal, Negotiation, Won, or Lost. Automatically computes weighted values with business rules guarding active deal amounts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:shadow-md transition">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-500/20">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Follow-Up Coordination</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Schedule calls, meetings, emails, and tasks with date validation forbidding past schedules. Visual badges alert reps on overdue and upcoming touchpoints.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:shadow-md transition">
              <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 border border-purple-200 dark:border-purple-500/20">
                <History className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Append-Only Audit Trail</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Immutable, append-oriented log capturing logins, failed attempts, and CRUD actions with timestamp, user ID, IP address, and old vs new JSON snapshots.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:shadow-md transition">
              <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 border border-sky-200 dark:border-sky-500/20">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chart.js Analytics & Reports</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Interactive doughnut charts for lead distribution, pipeline stage bar graphs, conversion rates, and representative activity tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Architecture Section */}
      <section id="security" className="py-20 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Production-Grade Engineering
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                Multi-Layered Validation & Security Baseline
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                Client-side validation provides instant user feedback, while server-side business rules and authorization guards protect every REST API endpoint from tampering.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 mt-1">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Strict Business Validation</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Opportunity Amount must be &gt; 0, Probability bounded between 0–100, and Expected Close Dates cannot be in the past.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 mt-1">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Bcrypt Hashing & Account Lockout</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Salted password hashes are never exposed. 5 consecutive failed logins trigger a 15-minute lockout with admin unlock control.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 mt-1">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Secured REST API & DTOs</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Clean endpoints returning standard HTTP status codes (200, 201, 400, 401, 403, 404, 409) with sanitized payloads.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">AcxiomCRM Architecture</span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Online
                </span>
              </div>
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Presentation:</span> React 18, React Router v6, Tailwind CSS, Chart.js
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">Application:</span> Express.js, REST controllers, DTOs, validation
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Business / Domain:</span> CRM entities, pipeline formulas, RBAC
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">Security Layer:</span> JWT, Bcrypt, Lockout, Append-only AuditLog
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Database:</span> MongoDB with Mongoose referential models
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950 text-center border-y border-indigo-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white">Ready to Explore AcxiomCRM?</h2>
          <p className="mt-2 text-indigo-100 dark:text-indigo-200 text-sm">
            Sign in with one of the pre-configured accounts or create a new user profile right now.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-white text-indigo-900 font-bold text-sm rounded-xl hover:bg-slate-100 transition shadow-lg"
            >
              Sign In to App
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition border border-indigo-400/50 shadow-md"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-950 text-xs text-slate-500 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-white">AcxiomCRM</span>
            <span>• Full-Stack MERN Customer Relationship Management</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">Theme Toggle Enabled</span>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

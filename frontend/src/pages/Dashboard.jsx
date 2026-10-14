import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import {
  Users,
  Target,
  TrendingUp,
  DollarSign,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/dashboard');
      setDashboardData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        {error}
      </div>
    );
  }

  const { kpis, charts, upcomingFollowUps, recentActivities } = dashboardData || {};

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Amount: $${Number(context.raw).toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, font: { size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            Role: <span className="font-semibold text-white">{user?.role}</span> • Scope:{' '}
            <span className="text-white">
              {user?.role === 'Admin'
                ? 'Full CRM Administration'
                : user?.role === 'Manager'
                ? 'Team Pipeline & Oversight'
                : 'Assigned Sales Territory'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-indigo-800 hover:bg-indigo-700 text-xs font-semibold rounded-lg transition border border-indigo-600 text-white"
          >
            Refresh Analytics
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={kpis?.totalCustomers ?? 0}
          subtitle="Master account base"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Leads"
          value={kpis?.totalLeads ?? 0}
          subtitle={`${kpis?.openLeads ?? 0} active open leads`}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Total Pipeline Value"
          value={`$${(kpis?.totalPipelineValue ?? 0).toLocaleString()}`}
          subtitle={`Weighted: $${(kpis?.totalWeightedValue ?? 0).toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Pending Follow-Ups"
          value={kpis?.pendingFollowUps ?? 0}
          subtitle="Scheduled today or overdue"
          icon={CalendarCheck}
          color="amber"
        />
      </div>

      {/* Secondary Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Open Deals</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {kpis?.openOpportunities ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Won Deals</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {kpis?.wonOpportunities ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <p className="text-xs font-medium text-red-500 dark:text-red-400">Lost Deals</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
            {kpis?.lostOpportunities ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Opportunities</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {kpis?.totalOpportunities ?? 0}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opportunity Pipeline Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Opportunity Pipeline by Stage</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Stage-wise total deal volume</p>
            </div>
            <span className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="h-64">
            {charts?.opportunityPipeline ? (
              <Bar data={charts.opportunityPipeline} options={barChartOptions} />
            ) : (
              <p className="text-center text-sm text-slate-400 pt-20">No data available</p>
            )}
          </div>
        </div>

        {/* Lead Status Breakdown Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Lead Status Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Breakdown of inbound prospect stages</p>
            </div>
            <span className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div className="h-64">
            {charts?.leadStatus ? (
              <Doughnut data={charts.leadStatus} options={doughnutChartOptions} />
            ) : (
              <p className="text-center text-sm text-slate-400 pt-20">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Widgets: Upcoming Follow-ups & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Follow-ups */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Upcoming Follow-Ups
            </h3>
            <a href="/follow-ups" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View all
            </a>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingFollowUps?.length > 0 ? (
              upcomingFollowUps.map((item) => (
                <div key={item._id} className="py-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.subject}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.customerId?.name || item.leadId?.name || 'General Follow-up'} •{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.followUpType}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      {new Date(item.followUpDate).toLocaleDateString()}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Assigned: {item.assignedTo?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming follow-ups scheduled.</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Recent Sales Activities
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivities?.length > 0 ? (
              recentActivities.map((act) => (
                <div key={act._id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {act.activityType}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{act.subject}</p>
                    </div>
                    {act.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{act.description}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(act.activityDate || act.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent activities logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

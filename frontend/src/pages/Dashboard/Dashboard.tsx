import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { Search, ArrowUpRight, ArrowDownRight, Circle, Clock3 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Aside from '../../components/Aside.js';

const fallbackData = {
  summary: [
    {
      label: 'Total Revenue',
      value: '$2,45,000',
      change: '+12.5%',
      type: 'revenue',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Total Expenses',
      value: '$1,28,000',
      change: '-8.2%',
      type: 'expenses',
      color: 'bg-rose-100 text-rose-700',
    },
    {
      label: 'Total Employees',
      value: '1,245',
      change: '+5.4%',
      type: 'employees',
      color: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Pending Invoices',
      value: '28',
      change: '+12.0%',
      type: 'invoices',
      color: 'bg-amber-100 text-amber-700',
    },
  ],
  revenueSeries: [
    { day: '01', revenue: 42000, expense: 26000 },
    { day: '05', revenue: 53000, expense: 32000 },
    { day: '10', revenue: 48000, expense: 29000 },
    { day: '15', revenue: 62000, expense: 35000 },
    { day: '20', revenue: 58000, expense: 31000 },
    { day: '25', revenue: 69000, expense: 38000 },
    { day: '30', revenue: 72000, expense: 41000 },
  ],
  expenseCategories: [
    { category: 'Payroll', percentage: 40, color: '#0ea5e9' },
    { category: 'Operations', percentage: 25, color: '#22c55e' },
    { category: 'Marketing', percentage: 15, color: '#c026d3' },
    { category: 'Software', percentage: 10, color: '#4338ca' },
    { category: 'Others', percentage: 10, color: '#71717a' },
  ],
}

const iconMap = {
  revenue: ArrowUpRight,
  expenses: ArrowDownRight,
  employees: Clock3,
  invoices: Circle,
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name) {
          setUserName(parsed.name);
        }
      } catch (error) {
        console.warn('Unable to parse stored user data', error);
      }
    }
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard`);
        if (!response.ok) {
          throw new Error('Unable to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (fetchError: unknown) {
        if (fetchError instanceof Error) {
          setError(fetchError.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const summaryCards = dashboardData.summary;
  const revenueSeries = dashboardData.revenueSeries;
  const expenseCategories = dashboardData.expenseCategories;

  return (
    <section className="w-full min-h-screen flex flex-col bg-slate-100 text-slate-900 lg:flex-row">
      <Aside />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="mt-12 sm:mt-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 sm:text-sm">Dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Welcome back, {userName}!</h1>
              <p className="mt-2 text-sm text-slate-600">Here&rsquo;s what&rsquo;s happening in your organization today.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form className="relative w-full sm:min-w-60">
                <input
                  type="search"
                  placeholder="Search here"
                  className="h-12 w-full rounded-full border border-slate-300 bg-white px-4 pr-11 text-sm shadow-sm outline-none transition focus:border-blue-500"
                />
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </form>
              <Link to="/profile" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-lg font-semibold text-white">
                {userName ? userName.charAt(0).toUpperCase() : 'J'}
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
              Loading dashboard data...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800 shadow-sm">
              {error}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => {
                  const Icon = iconMap[card.type as keyof typeof iconMap] || Circle;
                  return (
                    <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-500">{card.label}</p>
                          <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
                        </div>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.color}`}>
                          <Icon size={20} />
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-slate-500">{card.change} vs last month</p>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Revenue Overview</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">Revenue vs Expenses</h2>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Revenue
                      <span className="ml-3 h-2.5 w-2.5 rounded-full bg-emerald-500" /> Expenses
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-sm text-slate-500">This month revenue</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">$72,000</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-sm text-slate-500">This month expenses</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">$41,000</p>
                    </div>
                  </div>

                  <div className="mt-6 h-72 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="monotone" dataKey="expense" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Expense by Category</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">This month</h2>
                    </div>
                    <div className="rounded-full bg-slate-50 px-3 py-2 text-xs text-slate-600">Total $1,28,000</div>
                  </div>

                  <div className="mb-6 h-64 rounded-3xl bg-slate-50 p-2 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart >
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Pie data={expenseCategories} dataKey="percentage" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                          {expenseCategories.map((entry) => (
                            <Cell key={entry.category} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    {expenseCategories.map((item) => (
                      <div key={item.category} className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-3.5 w-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <div>
                            <p className="text-sm font-medium text-slate-700">{item.category}</p>
                            <p className="text-xs text-slate-500">{item.percentage}%</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{item.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
    </section>
  )
}

export default Dashboard
// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { dashboardApi } from '../api/client';
import { Badge, PageLoader, EmptyState } from '../components/UI';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const COLORS = ['#7C3AED','#F43F5E','#10B981','#F59E0B','#0EA5E9','#EC4899','#8B5CF6','#14B8A6'];

// Custom tooltip
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--ink)', borderRadius: 10, padding: '10px 14px',
      color: '#fff', fontSize: '.8rem', boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ opacity: .7 }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [summary,    setSummary]    = useState(null);
  const [trends,     setTrends]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [recent,     setRecent]     = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.trends({ period: 'monthly', last: 6 }),
      dashboardApi.byCategory(),
      dashboardApi.recent({ limit: 6 }),
    ]).then(([s, t, c, r]) => {
      setSummary(s.data);
      setTrends(t.data.trends);
      setCategories(c.data.categories.slice(0, 8));
      setRecent(r.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const stats = [
    { label: 'Total Income',   value: fmt(summary?.totalIncome  ?? 0), icon: <TrendingUp size={20} />,  color: 'violet',  sub: 'All time' },
    { label: 'Total Expenses', value: fmt(summary?.totalExpense ?? 0), icon: <TrendingDown size={20} />, color: 'rose',    sub: 'All time' },
    { label: 'Net Balance',    value: fmt(summary?.netBalance   ?? 0), icon: <DollarSign size={20} />,  color: 'emerald', sub: 'Income − Expenses' },
    { label: 'Savings Rate',   value: `${summary?.savingsRate ?? 0}%`, icon: <Activity size={20} />,    color: 'amber',   sub: 'Of total income' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Overview of your financial health</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Area chart — trends */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="section-title">
            <TrendingUp size={16} color="var(--violet)" />
            Monthly Income vs Expenses
          </div>
          {trends.length === 0
            ? <EmptyState icon="📈" title="No trend data yet" />
            : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trends} margin={{ top: 4, right: 4, bottom: 0, left: 10 }}>
                  <defs>
                    <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="income"  name="Income"  stroke="#7C3AED" fill="url(#gIncome)"  strokeWidth={2.5} dot={{ r: 4, fill: '#7C3AED' }} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#F43F5E" fill="url(#gExpense)" strokeWidth={2.5} dot={{ r: 4, fill: '#F43F5E' }} />
                </AreaChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Pie chart — categories */}
        <div className="card">
          <div className="section-title">
            <Activity size={16} color="var(--violet)" />
            Spending by Category
          </div>
          {categories.length === 0
            ? <EmptyState icon="🥧" title="No category data" />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total"
                    nameKey="category"
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3}
                  >
                    {categories.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Bar chart — net by month */}
        <div className="card">
          <div className="section-title">
            <DollarSign size={16} color="var(--emerald)" />
            Monthly Net Balance
          </div>
          {trends.length === 0
            ? <EmptyState icon="📊" title="No data yet" />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trends} margin={{ top: 4, right: 4, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="net" name="Net" radius={[6,6,0,0]}>
                    {trends.map((t, i) => (
                      <Cell key={i} fill={t.net >= 0 ? '#10B981' : '#F43F5E'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* Recent activity */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="var(--violet)" />
            Recent Activity
          </span>
          <a href="/records" style={{ fontSize: '.8rem', color: 'var(--violet)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowUpRight size={13} />
          </a>
        </div>
        {recent.length === 0
          ? <EmptyState icon="📭" title="No recent records" />
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Category</th><th>Notes</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{r.date}</td>
                      <td style={{ fontWeight: 600 }}>{r.category}</td>
                      <td style={{ color: 'var(--muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                      <td><Badge type={r.type} /></td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, color: r.type === 'income' ? 'var(--emerald)' : 'var(--rose)' }}>
                        {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}

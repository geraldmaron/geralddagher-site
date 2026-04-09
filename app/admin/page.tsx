'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Users,
  Tag,
  FolderTree,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Eye,
  Globe,
  GitBranch,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Server,
  Zap,
  Plus,
  ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CHART_STYLE = {
  tooltip: {
    backgroundColor: '#1a1d24',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#e5e7eb',
    fontSize: '12px',
  },
  grid: { stroke: 'rgba(255,255,255,0.04)' },
  axis: { fill: '#4b5563', fontSize: 11 },
};

type Stat = {
  name: string;
  value: string | number;
  icon: React.ElementType;
  href: string | null;
  trend?: number;
  accentColor: string;
  bgGradient: string;
  borderAccent: string;
};

const QUICK_ACTIONS = [
  { label: 'New post', href: '/admin/posts/new', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 hover:bg-blue-500/[0.15]', border: 'border-blue-500/20' },
  { label: 'Browse assets', href: '/admin/assets', icon: ImageIcon, color: 'text-violet-400', bg: 'bg-violet-500/10 hover:bg-violet-500/[0.15]', border: 'border-violet-500/20' },
  { label: 'Manage users', href: '/admin/users', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10 hover:bg-emerald-500/[0.15]', border: 'border-emerald-500/20' },
];

function StatusDot({ status }: { status: 'healthy' | 'error' | 'unknown' }) {
  if (status === 'healthy') {
    return (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
    );
  }
  if (status === 'error') {
    return <span className="h-2 w-2 rounded-full bg-red-400 inline-flex" />;
  }
  return <span className="h-2 w-2 rounded-full bg-gray-600 inline-flex" />;
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  const timeSeriesData = (data?.cloudflare?.timeSeries || []).map((p: any) => {
    let date = p.date || '';
    try {
      if (date.includes('T')) {
        date = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = date.split('-');
        date = new Date(+y, +m - 1, +d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch { /* keep raw */ }
    return { date, visitors: p.visitors || 0, pageviews: p.pageviews || 0 };
  });

  const countryData = (data?.cloudflare?.requestsByCountry || [])
    .slice(0, 8)
    .map((x: any) => ({ name: x.country || 'Unknown', value: x.requests || 0 }));

  const topPagesData = (data?.cloudflare?.topPages || [])
    .slice(0, 8)
    .map((p: any) => ({
      name: (p.path?.length > 28 ? p.path.substring(0, 28) + '…' : p.path) || '/',
      views: p.views || 0,
    }));

  const stats: Stat[] = [
    {
      name: 'Posts', value: data?.stats?.posts ?? 0, icon: FileText, href: '/admin/posts',
      accentColor: 'text-blue-400', bgGradient: 'from-blue-500/[0.07]', borderAccent: 'border-t-blue-500/40',
    },
    {
      name: 'Users', value: data?.stats?.users ?? 0, icon: Users, href: '/admin/users',
      accentColor: 'text-violet-400', bgGradient: 'from-violet-500/[0.07]', borderAccent: 'border-t-violet-500/40',
    },
    {
      name: 'Categories', value: data?.stats?.categories ?? 0, icon: FolderTree, href: '/admin/taxonomy?tab=categories',
      accentColor: 'text-emerald-400', bgGradient: 'from-emerald-500/[0.07]', borderAccent: 'border-t-emerald-500/40',
    },
    {
      name: 'Tags', value: data?.stats?.tags ?? 0, icon: Tag, href: '/admin/taxonomy?tab=tags',
      accentColor: 'text-amber-400', bgGradient: 'from-amber-500/[0.07]', borderAccent: 'border-t-amber-500/40',
    },
    ...(data?.cloudflare?.visitors ? [{
      name: 'Visitors (30d)',
      value: fmt(data.cloudflare.visitors.total),
      trend: data.cloudflare.visitors.trend,
      icon: Globe,
      href: null,
      accentColor: 'text-cyan-400',
      bgGradient: 'from-cyan-500/[0.07]',
      borderAccent: 'border-t-cyan-500/40',
    }] : []),
    ...(data?.cloudflare?.pageviews ? [{
      name: 'Pageviews (30d)',
      value: fmt(data.cloudflare.pageviews.total),
      trend: data.cloudflare.pageviews.trend,
      icon: Eye,
      href: null,
      accentColor: 'text-pink-400',
      bgGradient: 'from-pink-500/[0.07]',
      borderAccent: 'border-t-pink-500/40',
    }] : []),
  ];

  const stateColors: Record<string, string> = {
    READY: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    BUILDING: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    ERROR: 'text-red-400 bg-red-400/10 border-red-400/20',
    CANCELED: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
    QUEUED: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  };

  const directusStatus = data?.directus?.status === 'healthy' ? 'healthy' : data ? 'error' : 'unknown';
  const cloudflareStatus = data?.cloudflare ? 'healthy' : data ? 'unknown' : 'unknown';

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg font-semibold text-gray-100 tracking-tight">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Site overview and analytics</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/[0.15] border border-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-300 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          New post
        </Link>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="grid grid-cols-3 gap-3"
      >
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                action.bg, action.border, action.color
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{action.label}</span>
            </Link>
          );
        })}
      </motion.div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const hasTrend = stat.trend !== undefined;
          const up = hasTrend && (stat.trend ?? 0) > 0;

          const inner = (
            <div className={cn(
              'flex flex-col gap-1.5 p-3 rounded-xl border border-white/[0.06] border-t-2 bg-gradient-to-b to-transparent hover:brightness-110 transition-all h-full',
              stat.bgGradient,
              stat.borderAccent,
            )}>
              <div className="flex items-center justify-between">
                <Icon className={cn('h-4 w-4', stat.accentColor)} />
                {hasTrend && (
                  <span className={cn('flex items-center gap-0.5 text-[10px] font-medium', up ? 'text-emerald-400' : 'text-red-400')}>
                    {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(stat.trend ?? 0).toFixed(1)}%
                  </span>
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-100 tabular-nums leading-none">
                  {loading ? <span className="text-gray-700">—</span> : stat.value}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">{stat.name}</p>
              </div>
            </div>
          );

          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.04 }}
            >
              {stat.href ? (
                <Link href={stat.href} className="block h-full">{inner}</Link>
              ) : inner}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main grid: chart + system status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-3 lg:grid-cols-3"
      >
        {/* Traffic chart */}
        {timeSeriesData.length > 0 && (
          <div className="lg:col-span-2 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-cyan-500/70" />
              <h2 className="text-sm font-medium text-gray-300">Traffic — 30 days</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPageviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid.stroke} />
                <XAxis dataKey="date" tick={CHART_STYLE.axis} interval="preserveStartEnd" minTickGap={20} />
                <YAxis yAxisId="l" tick={CHART_STYLE.axis} width={36} />
                <YAxis yAxisId="r" orientation="right" tick={CHART_STYLE.axis} width={36} />
                <Tooltip contentStyle={CHART_STYLE.tooltip} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
                <Area yAxisId="l" type="monotone" dataKey="visitors" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#gVisitors)" name="Visitors" dot={false} />
                <Area yAxisId="r" type="monotone" dataKey="pageviews" stroke="#818cf8" strokeWidth={1.5} fillOpacity={1} fill="url(#gPageviews)" name="Pageviews" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* System status */}
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-medium text-gray-300">System</h2>
            </div>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Server className="h-3.5 w-3.5 text-gray-600" />
                  Directus CMS
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={directusStatus} />
                  <span className={cn('text-[11px]', directusStatus === 'healthy' ? 'text-emerald-400' : 'text-red-400')}>
                    {directusStatus === 'healthy' ? 'Healthy' : 'Error'}
                  </span>
                </div>
              </div>
              {data?.vercel?.project && (
                <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Zap className="h-3.5 w-3.5 text-gray-600" />
                    Vercel
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot status="healthy" />
                    <span className="text-[11px] text-gray-400">{data.vercel.project.name}</span>
                  </div>
                </div>
              )}
              {data?.cloudflare && (
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Activity className="h-3.5 w-3.5 text-gray-600" />
                    Cloudflare
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={cloudflareStatus} />
                    <span className="text-[11px] text-emerald-400">Active</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Country + top pages */}
      {(countryData.length > 0 || topPagesData.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-3 lg:grid-cols-2"
        >
          {countryData.length > 0 && (
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-medium text-gray-300">Traffic by country</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={countryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid.stroke} horizontal={false} />
                  <XAxis type="number" tick={CHART_STYLE.axis} />
                  <YAxis type="category" dataKey="name" tick={CHART_STYLE.axis} width={70} />
                  <Tooltip
                    contentStyle={CHART_STYLE.tooltip}
                    formatter={(v: number | undefined) => [fmt(v ?? 0), 'Requests']}
                  />
                  <Bar dataKey="value" fill="#06b6d4" fillOpacity={0.8} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {topPagesData.length > 0 && (
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-medium text-gray-300">Top pages — 30 days</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topPagesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid.stroke} vertical={false} />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} tick={CHART_STYLE.axis} />
                  <YAxis tick={CHART_STYLE.axis} width={36} />
                  <Tooltip
                    contentStyle={CHART_STYLE.tooltip}
                    formatter={(v: number | undefined) => [fmt(v ?? 0), 'Views']}
                  />
                  <Bar dataKey="views" fill="#818cf8" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent deployments */}
      {data?.vercel?.deployments?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]"
        >
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-medium text-gray-300">Recent deployments</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {data.vercel.deployments.slice(0, 5).map((dep: any) => (
              <div key={dep.uid} className="flex items-center gap-4 py-1.5">
                <span className={cn('shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium', stateColors[dep.state] ?? stateColors.QUEUED)}>
                  {dep.state}
                </span>
                <a
                  href={`https://${dep.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {dep.url}
                </a>
                {dep.meta?.githubCommitMessage && (
                  <span className="hidden sm:block truncate max-w-[200px] text-[11px] text-gray-600">
                    {dep.meta.githubCommitMessage}
                  </span>
                )}
                <span className="shrink-0 text-[11px] text-gray-600">
                  {new Date(dep.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

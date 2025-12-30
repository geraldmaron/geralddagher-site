'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Tag, 
  FolderTree, 
  Activity, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Calendar,
  Clock,
  Globe,
  Download,
  GitBranch,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Server,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const timeSeriesData = data?.cloudflare?.timeSeries?.map((point: any) => {
    const dateStr = point.date || '';
    let formattedDate = dateStr;
    try {
      if (dateStr.includes('T')) {
        formattedDate = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      formattedDate = dateStr;
    }
    return {
      date: formattedDate,
      visitors: point.visitors || 0,
      pageviews: point.pageviews || 0,
      bandwidth: Math.round((point.bandwidth || 0) / 1024 / 1024),
    };
  }) || [];

  const countryData = data?.cloudflare?.requestsByCountry?.slice(0, 10).map((item: any) => ({
    name: item.country || 'Unknown',
    value: item.requests || 0,
  })) || [];

  const topPagesData = data?.cloudflare?.topPages?.slice(0, 8).map((page: any) => ({
    name: page.path?.length > 30 ? page.path.substring(0, 30) + '...' : page.path || '/',
    views: page.views || 0,
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  const stats = [
    { 
      name: 'Posts', 
      value: data?.stats?.posts || 0, 
      icon: FileText, 
      href: '/admin/posts', 
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    { 
      name: 'Users', 
      value: data?.stats?.users || 0, 
      icon: Users, 
      href: '/admin/users', 
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    { 
      name: 'Categories', 
      value: data?.stats?.categories || 0, 
      icon: FolderTree, 
      href: '/admin/categories', 
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    },
    { 
      name: 'Tags', 
      value: data?.stats?.tags || 0, 
      icon: Tag, 
      href: '/admin/tags', 
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-500/10'
    },
    ...(data?.cloudflare?.visitors ? [{
      name: 'Visitors (30d)',
      value: formatNumber(data.cloudflare.visitors.total),
      trend: data.cloudflare.visitors.trend,
      icon: Globe,
      href: null,
      color: 'from-cyan-500 to-cyan-600',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10'
    }] : []),
    ...(data?.cloudflare?.pageviews ? [{
      name: 'Pageviews (30d)',
      value: formatNumber(data.cloudflare.pageviews.total),
      trend: data.cloudflare.pageviews.trend,
      icon: Eye,
      href: null,
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-500/10'
    }] : []),
    ...(data?.cloudflare?.bandwidth ? [{
      name: 'Bandwidth (30d)',
      value: data.cloudflare.bandwidth.formatted,
      icon: Download,
      href: null,
      color: 'from-pink-500 to-pink-600',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-500/10'
    }] : []),
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Control center for your site analytics and content management
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const hasTrend = 'trend' in stat && stat.trend !== undefined;
          const trendValue = hasTrend ? stat.trend : null;
          const trendPositive = trendValue !== null && trendValue > 0;
          const TrendArrow = trendPositive ? ArrowUpRight : ArrowDownRight;
          
          const content = (
            <div className={cn(
              'relative p-6 rounded-2xl border transition-all duration-300',
              stat.href ? 'cursor-pointer' : '',
              'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
              'border-gray-200/50 dark:border-gray-700/50',
              stat.href && 'hover:bg-white/80 dark:hover:bg-gray-800/80',
              stat.href && 'hover:shadow-lg hover:shadow-gray-900/5 dark:hover:shadow-gray-900/20',
              stat.href && 'hover:border-gray-300/50 dark:hover:border-gray-600/50'
            )}>
              <div className="flex items-center justify-between">
                <div className={cn(
                  'p-3 rounded-xl',
                  stat.bgColor,
                  stat.href && 'group-hover:scale-110 transition-transform duration-200'
                )}>
                  <Icon className={cn('h-6 w-6', stat.textColor)} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {loading ? '...' : stat.value}
                  </p>
                  {hasTrend && trendValue !== null && (
                    <div className={cn(
                      'flex items-center gap-1 mt-1 text-xs font-medium',
                      trendPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}>
                      <TrendArrow className="h-3 w-3" />
                      <span>{Math.abs(trendValue).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className={cn(
                  'text-sm font-medium text-gray-600 dark:text-gray-400',
                  stat.href && 'group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors'
                )}>
                  {stat.name}
                </p>
              </div>
              
              {stat.href && (
                <div className={cn(
                  'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity',
                  'bg-gradient-to-br',
                  stat.color
                )} />
              )}
            </div>
          );

          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: stat.href ? 1.02 : 1 }}
              whileTap={{ scale: stat.href ? 0.98 : 1 }}
            >
              {stat.href ? (
                <Link href={stat.href} className="group block">
                  {content}
                </Link>
              ) : (
                content
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {data?.cloudflare?.timeSeries && timeSeriesData.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'p-6 rounded-2xl border',
            'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
            'border-gray-200/50 dark:border-gray-700/50'
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Traffic Trends (30 Days)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  color: '#1f2937'
                }}
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="visitors" 
                stroke="#06b6d4" 
                fillOpacity={1} 
                fill="url(#colorVisitors)"
                name="Visitors"
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="pageviews" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorPageviews)"
                name="Pageviews"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {data?.cloudflare?.bandwidth && timeSeriesData.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            'p-6 rounded-2xl border',
            'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
            'border-gray-200/50 dark:border-gray-700/50'
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-pink-500/10 rounded-xl">
              <Download className="h-5 w-5 text-pink-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bandwidth Usage (30 Days)</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
                label={{ value: 'MB', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  color: '#1f2937'
                }}
                formatter={(value: number) => [`${value} MB`, 'Bandwidth']}
              />
              <Line 
                type="monotone" 
                dataKey="bandwidth" 
                stroke="#ec4899" 
                strokeWidth={2}
                dot={{ fill: '#ec4899', r: 3 }}
                name="Bandwidth (MB)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {data?.cloudflare?.requestsByCountry && countryData.length > 0 && (
          <div className={cn(
            'p-6 rounded-2xl border',
            'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
            'border-gray-200/50 dark:border-gray-700/50'
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-500/10 rounded-xl">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Traffic by Country</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  type="number"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    color: '#1f2937'
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Requests']}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {topPagesData.length > 0 && (
          <div className={cn(
            'p-6 rounded-2xl border',
            'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
            'border-gray-200/50 dark:border-gray-700/50'
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                <Globe className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Pages (30d)</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPagesData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    color: '#1f2937'
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Views']}
                />
                <Bar dataKey="views" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className={cn(
          'p-6 rounded-2xl border',
          'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
          'border-gray-200/50 dark:border-gray-700/50'
        )}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Status</h2>
          </div>
          <div className="space-y-3">
            <div className={cn(
              'flex items-center justify-between p-4 rounded-xl transition-all',
              'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50'
            )}>
              <div className="flex items-center gap-3">
                <Server className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Directus CMS</span>
              </div>
              {data?.directus?.status === 'healthy' ? (
                <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Healthy
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
                  <XCircle className="h-4 w-4" />
                  Error
                </span>
              )}
            </div>
            {data?.vercel?.project && (
              <div className={cn(
                'flex items-center justify-between p-4 rounded-xl transition-all',
                'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50'
              )}>
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vercel Project</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {data.vercel.project.name}
                </span>
              </div>
            )}
            {data?.cloudflare && (
              <div className={cn(
                'flex items-center justify-between p-4 rounded-xl transition-all',
                'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50'
              )}>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cloudflare Analytics</span>
                </div>
                <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Active
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          'p-6 rounded-2xl border',
          'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
          'border-gray-200/50 dark:border-gray-700/50'
        )}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/admin/posts/new"
                className={cn(
                  'block p-4 rounded-xl transition-all duration-200 group',
                  'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
                  'hover:bg-white dark:hover:bg-gray-800/80 hover:shadow-md',
                  'hover:border-gray-300/50 dark:hover:border-gray-600/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                    Create New Post
                  </span>
                </div>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/admin/users"
                className={cn(
                  'block p-4 rounded-xl transition-all duration-200 group',
                  'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
                  'hover:bg-white dark:hover:bg-gray-800/80 hover:shadow-md',
                  'hover:border-gray-300/50 dark:hover:border-gray-600/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                    Manage Users
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {data?.vercel?.deployments && data.vercel.deployments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className={cn(
            'p-6 rounded-2xl border',
              'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
              'border-gray-200/50 dark:border-gray-700/50'
          )}
        >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-500/10 rounded-xl">
                  <GitBranch className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Deployments</h2>
              </div>
              <div className="space-y-3">
            {data.vercel.deployments.slice(0, 5).map((deployment: any) => {
                  const stateColors: Record<string, string> = {
                    READY: 'bg-green-500/10 text-green-600 dark:text-green-400',
                    BUILDING: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                    ERROR: 'bg-red-500/10 text-red-600 dark:text-red-400',
                    CANCELED: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
                    QUEUED: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
                  };
                  const stateColor = stateColors[deployment.state] || stateColors.QUEUED;
                  const deploymentDate = new Date(deployment.createdAt);
                  const timeAgo = deploymentDate.toLocaleDateString();

                  return (
                    <div
                      key={deployment.uid}
                      className={cn(
                        'p-4 rounded-xl transition-all',
                        'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
                        'hover:bg-white dark:hover:bg-gray-800/80'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <a
                          href={`https://${deployment.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline truncate flex-1"
                        >
                          {deployment.url}
                        </a>
                        <span className={cn('px-2 py-1 rounded-md text-xs font-medium', stateColor)}>
                          {deployment.state}
                        </span>
                      </div>
                      {deployment.meta?.githubCommitMessage && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                          {deployment.meta.githubCommitMessage}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {timeAgo}
                      </p>
                    </div>
                  );
                })}
              </div>
        </motion.div>
      )}
    </div>
  );
}

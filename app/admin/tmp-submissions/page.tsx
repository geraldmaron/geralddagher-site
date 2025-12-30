'use client';

import { Suspense, useMemo, useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  X,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/core/Button';
import { TMPSubmissionDrawer } from '@/components/admin/tmpmanager/TMPSubmissionDrawer';
import { useDebounce } from '@/hooks/useDebounce';

import type { TMPSubmission } from '@/lib/types/shared';

function StatusPill({ status }: { status?: string }) {
  const palette: Record<string, { bg: string; text: string; border: string }> = {
    Pending: { bg: 'bg-amber-500/15', text: 'text-amber-200', border: 'border-amber-500/40' },
    Scheduled: { bg: 'bg-sky-500/15', text: 'text-sky-200', border: 'border-sky-500/40' },
    Completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-200', border: 'border-emerald-500/40' },
    Rejected: { bg: 'bg-rose-500/15', text: 'text-rose-200', border: 'border-rose-500/40' }
  };
  const styles = palette[status || ''] || { bg: 'bg-slate-500/15', text: 'text-slate-200', border: 'border-slate-500/40' };
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
      styles.bg,
      styles.text,
      styles.border
    )}>
      {status || '—'}
    </span>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs',
              trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
                trend === 'down' ? 'text-rose-600 dark:text-rose-400' :
                  'text-gray-500 dark:text-gray-400'
            )}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              <span>{change > 0 ? '+' : ''}{change} from last period</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </motion.div>
  );
}

function ClientTable() {
  const [rows, setRows] = useState<TMPSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<TMPSubmission | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tmp-submissions');
      const json = await res.json();
      setRows(json.data || []);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    let filtered = rows;

    // Search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((sub) => {
        const name = [sub.first_name, sub.last_name].filter(Boolean).join(' ').toLowerCase();
        const email = sub.email?.toLowerCase() || '';
        const about = sub.about_you?.toLowerCase() || '';
        return name.includes(query) || email.includes(query) || about.includes(query);
      });
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((sub) => statusFilter.includes(sub.status || 'Pending'));
    }

    return filtered;
  }, [rows, debouncedSearch, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const pending = rows.filter((s) => (s.status || 'Pending') === 'Pending').length;
    const scheduled = rows.filter((s) => s.status === 'Scheduled').length;
    const completed = rows.filter((s) => s.status === 'Completed').length;
    const rejected = rows.filter((s) => s.status === 'Rejected').length;

    const now = new Date();
    const last7Days = rows.filter((s) => {
      if (!s.created_at) return false;
      const created = new Date(s.created_at);
      return created >= subDays(now, 7);
    }).length;
    const last30Days = rows.filter((s) => {
      if (!s.created_at) return false;
      const created = new Date(s.created_at);
      return created >= subDays(now, 30);
    }).length;

    return { pending, scheduled, completed, rejected, last7Days, last30Days };
  }, [rows]);

  const handleViewDetails = (submission: TMPSubmission) => {
    setSelectedSubmission(submission);
    setIsDrawerOpen(true);
  };

  const handleQuickStatusUpdate = async (id: number | string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/tmp-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Status updated');
      await load();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Submitted', 'Scheduled', 'Company', 'Job Title'];
    const rows = filteredRows.map((sub) => [
      sub.id,
      sub.first_name || '',
      sub.last_name || '',
      sub.email || '',
      sub.phone || '',
      sub.status || 'Pending',
      sub.created_at ? format(new Date(sub.created_at), 'yyyy-MM-dd') : '',
      sub.scheduled_at ? format(new Date(sub.scheduled_at), 'yyyy-MM-dd') : '',
      sub.company || '',
      sub.job_title || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tmp-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredRows.length} submissions`);
  };

  const statusOptions = ['Pending', 'Scheduled', 'Completed', 'Rejected'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          trend="neutral"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          icon={Calendar}
          trend="neutral"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={FileText}
          trend="neutral"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={X}
          trend="neutral"
        />
      </div>

      {/* Activity Summary */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {stats.last7Days} submissions in last 7 days
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats.last30Days} submissions in last 30 days
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or story..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            {statusOptions.map((status) => {
              const isSelected = statusFilter.includes(status);
              return (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter((prev) =>
                      isSelected ? prev.filter((s) => s !== status) : [...prev, status]
                    );
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {status}
                </button>
              );
            })}
            {statusFilter.length > 0 && (
              <button
                onClick={() => setStatusFilter([])}
                className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                setSelectedSubmission(null);
                setIsDrawerOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Create Submission
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              icon={<Download className="w-4 h-4" />}
              disabled={filteredRows.length === 0}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loading submissions...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">No submissions found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {searchQuery || statusFilter.length > 0
                          ? 'Try adjusting your filters'
                          : 'Submissions will appear here'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {[sub.first_name, sub.last_name].filter(Boolean).join(' ') || 'Unnamed'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {sub.email}
                      </div>
                      {sub.company && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {sub.company}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <select
                        value={sub.status || 'Pending'}
                        onChange={(e) => handleQuickStatusUpdate(sub.id, e.target.value)}
                        disabled={updatingId === sub.id}
                        className={cn(
                          'rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                          updatingId === sub.id && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex flex-col gap-1 text-xs">
                        {sub.phone && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            <span>{sub.phone}</span>
                          </div>
                        )}
                        {sub.contact_preferences?.selected_contact_methods && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span>{sub.contact_preferences.selected_contact_methods.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell text-sm text-gray-500 dark:text-gray-400">
                      {sub.created_at ? (() => {
                        try {
                          const date = new Date(sub.created_at);
                          if (isNaN(date.getTime())) return '—';
                          return (
                            <div>
                              <div>{formatDistanceToNow(date, { addSuffix: true })}</div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {format(date, 'MMM d, yyyy')}
                              </div>
                            </div>
                          );
                        } catch {
                          return '—';
                        }
                      })() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 max-w-md">
                        {sub.about_you || sub.rejected_reason || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(sub)}
                        icon={<Eye className="w-4 h-4" />}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <TMPSubmissionDrawer
        submission={selectedSubmission}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedSubmission(null);
        }}
        onUpdate={load}
      />
    </div>
  );
}

export default function TMPSubmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">The Maron Project Submissions</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Review and manage incoming story submissions from The Maron Project.
        </p>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading submissions...</p>
          </div>
        </div>
      }>
        <ClientTable />
      </Suspense>
    </div>
  );
}

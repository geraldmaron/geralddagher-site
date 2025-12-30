'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/directus/queries/users';
import { cn } from '@/lib/utils';

interface ArgusClientProps {
  user: UserProfile;
}

export default function ArgusClient({ user }: ArgusClientProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Argus</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monitoring & Analytics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-10 h-10 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome to Argus</h2>
          <p className="text-blue-100 max-w-2xl">
            Your centralized dashboard for monitoring, analytics, and system insights. Access real-time data and metrics across all platforms.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="-mb-px flex gap-8">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
                { id: 'monitoring', label: 'Monitoring', icon: '👁️' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Active Services', value: '12', change: '+2', color: 'blue' },
                { label: 'Total Users', value: '1,234', change: '+15%', color: 'green' },
                { label: 'Uptime', value: '99.9%', change: '+0.1%', color: 'purple' },
                { label: 'Alerts', value: '3', change: '-2', color: 'amber' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{metric.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                    <span className={cn(
                      'text-sm font-medium px-2 py-1 rounded',
                      metric.change.startsWith('+')
                        ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                        : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
                    )}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <span className="text-3xl">🚧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This section is currently under development.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

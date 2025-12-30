'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Plus, Trash2, Upload, Edit3, RefreshCw, Search, X, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { getAvatarUrl } from '@/lib/directus/utils/avatar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/core/Button';

type UserType = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  status?: string;
  is_author?: boolean;
  author_slug?: string | null;
  avatar?: string | null;
  role?: string | null;
};

type FormState = {
  id?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  status: string;
  role: string;
  is_author: boolean;
  author_slug: string;
  avatar: string | null;
  avatar_url: string | null;
};

const emptyForm: FormState = {
  id: null,
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  status: 'active',
  role: '',
  is_author: false,
  author_slug: '',
  avatar: null,
  avatar_url: null
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const json = await res.json();
    setUsers(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((user) => {
      const name = [user.first_name, user.last_name].filter(Boolean).join(' ').toLowerCase();
      return name.includes(q) || user.email.toLowerCase().includes(q);
    });
  }, [users, searchQuery]);

  const startCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (user: UserType) => {
    setForm({
      id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email,
      password: '',
      status: user.status || 'active',
      role: user.role || '',
      is_author: !!user.is_author,
      author_slug: user.author_slug || '',
      avatar: user.avatar || null,
      avatar_url: user.avatar ? getAvatarUrl(user.avatar) : null
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        status: form.status,
        role: form.role || undefined,
        is_author: form.is_author,
        author_slug: form.author_slug || undefined,
        avatar: form.avatar || undefined
      };
      if (!form.id) {
        payload.password = form.password;
      } else if (form.password) {
        payload.password = form.password;
      }

      const res = await fetch(form.id ? `/api/admin/users/${form.id}` : '/api/admin/users', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      toast.success(form.id ? 'User updated' : 'User created');
      closeForm();
      await load();
    } catch {
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('User deleted');
      await load();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleAuthor = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_author: !current })
      });
      if (!res.ok) throw new Error();
      toast.success('User updated');
      await load();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/users/avatar', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm(prev => ({ ...prev, avatar: data.id, avatar_url: data.url }));
      toast.success('Avatar uploaded');
    } catch {
      toast.error('Avatar upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  const isEditing = useMemo(() => !!form.id, [form.id]);

  const StatusBadge = ({ status }: { status?: string }) => {
    const colors: Record<string, string> = {
      active: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      draft: 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      suspended: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    };
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize',
        colors[status || 'active'] || colors.draft
      )}>
        {status || 'active'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Users
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage Directus accounts and authors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={load}
            disabled={loading}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
              'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
              'hover:bg-gray-200 dark:hover:bg-gray-700',
              'disabled:opacity-50'
            )}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={startCreate}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New User</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          'p-3 sm:p-4 rounded-2xl border',
          'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
          'border-gray-200/50 dark:border-gray-700/50'
        )}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm',
              'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'transition-all duration-200'
            )}
          />
        </div>
      </motion.div>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading users...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? 'No users match your search' : 'No users yet'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first user'}
            </p>
            {!searchQuery && (
              <Button
                onClick={startCreate}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium"
              >
                Create First User
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user, index) => {
              const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'No Name';
              const avatarUrl = user.avatar ? getAvatarUrl(user.avatar, { width: 80, height: 80, fit: 'cover' }) : null;
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={cn(
                    'group p-4 rounded-2xl border transition-all duration-200',
                    'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
                    'border-gray-200/50 dark:border-gray-700/50',
                    'hover:bg-white/80 dark:hover:bg-gray-800/80',
                    'hover:shadow-lg hover:shadow-gray-900/5 dark:hover:shadow-gray-900/20'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {avatarUrl ? (
                          <Image src={avatarUrl} alt={name} width={48} height={48} className="h-full w-full object-cover" />
                        ) : (
                          <span>{user.first_name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
                          {name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={user.status} />
                          {user.is_author && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              <Shield className="h-3 w-3" />
                              Author
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        {user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="hidden sm:flex items-center gap-2 cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                        <input
                          type="checkbox"
                          checked={!!user.is_author}
                          onChange={() => handleToggleAuthor(user.id, !!user.is_author)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        Author
                      </label>
                      <button
                        onClick={() => startEdit(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filteredUsers.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        )}
      </motion.div>

      {/* Slide-over Form */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'fixed right-0 top-0 h-full w-full sm:w-[420px] z-50',
                'bg-white dark:bg-gray-900 shadow-2xl',
                'overflow-y-auto'
              )}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {isEditing ? 'Edit User' : 'Create User'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {isEditing ? 'Update user details' : 'Add a new Directus user'}
                    </p>
                  </div>
                  <button
                    onClick={closeForm}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form className="p-4 sm:p-6 space-y-5" onSubmit={handleSubmit}>
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg font-semibold text-gray-600 dark:text-gray-300">
                      {form.avatar_url ? (
                        <Image src={form.avatar_url} alt="avatar" width={64} height={64} className="h-full w-full object-cover" />
                      ) : (
                        <span>{form.first_name?.[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    {avatarUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar</label>
                    <label className={cn(
                      'inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors',
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                      'hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}>
                      <Upload className="h-3.5 w-3.5" />
                      Upload
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                    </label>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First name</label>
                    <input
                      className={cn(
                        'w-full px-3 py-2 rounded-xl text-sm',
                        'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'transition-all'
                      )}
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last name</label>
                    <input
                      className={cn(
                        'w-full px-3 py-2 rounded-xl text-sm',
                        'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'transition-all'
                      )}
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    className={cn(
                      'w-full px-3 py-2 rounded-xl text-sm',
                      'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      'transition-all'
                    )}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Password
                    {isEditing && <span className="text-xs text-gray-400 ml-1">(leave blank to keep)</span>}
                  </label>
                  <input
                    type="password"
                    className={cn(
                      'w-full px-3 py-2 rounded-xl text-sm',
                      'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      'transition-all'
                    )}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={isEditing ? '••••••••' : ''}
                    autoComplete={isEditing ? 'new-password' : 'new-password'}
                    {...(isEditing ? {} : { required: true })}
                  />
                </div>

                {/* Status & Role */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                    <select
                      className={cn(
                        'w-full px-3 py-2 rounded-xl text-sm',
                        'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'transition-all'
                      )}
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role ID</label>
                    <input
                      className={cn(
                        'w-full px-3 py-2 rounded-xl text-sm',
                        'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'transition-all'
                      )}
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="UUID"
                    />
                  </div>
                </div>

                {/* Author Settings */}
                <div className={cn(
                  'p-4 rounded-xl',
                  'bg-purple-50/50 dark:bg-purple-900/10',
                  'border border-purple-100 dark:border-purple-900/30'
                )}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                      checked={form.is_author}
                      onChange={(e) => setForm({ ...form, is_author: e.target.checked })}
                    />
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as Author</span>
                    </div>
                  </label>
                  {form.is_author && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Author Slug</label>
                      <input
                        className={cn(
                          'w-full px-3 py-2 rounded-xl text-sm',
                          'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                          'transition-all'
                        )}
                        value={form.author_slug}
                        onChange={(e) => setForm({ ...form, author_slug: e.target.value })}
                        placeholder="john-doe"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
                      'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200',
                      'text-white dark:text-gray-900',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-all'
                    )}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      isEditing ? 'Update User' : 'Create User'
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-sm font-medium',
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                      'hover:bg-gray-200 dark:hover:bg-gray-700',
                      'transition-all'
                    )}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

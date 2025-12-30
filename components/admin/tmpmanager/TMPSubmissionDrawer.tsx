'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Calendar, Clock, Globe, User, Briefcase, MessageSquare, ExternalLink, Save, Edit2, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/core/Button';
import * as Dialog from '@radix-ui/react-dialog';

import type { TMPSubmission } from '@/lib/types/shared';

interface TMPSubmissionDrawerProps {
  submission: TMPSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusOptions = ['Pending', 'Scheduled', 'Completed', 'Rejected'];
const contactMethodOptions = ['email', 'phone', 'text'];
const timeSlotOptions = ['morning', 'afternoon', 'evening'];
const socialPlatforms = ['linkedin', 'twitter', 'instagram', 'facebook'];

export function TMPSubmissionDrawer({ submission, isOpen, onClose, onUpdate }: TMPSubmissionDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    company: '',
    status: 'Pending',
    about_you: '',
    phonetic_spelling: '',
    pronouns: '',
    website: '',
    youtube_link: '',
    session_date: '',
    notes: '',
    contact_preferences: {
      selected_contact_methods: [] as string[],
      selected_dates: [] as string[],
      selected_times: [] as string[]
    },
    social_links: {} as Record<string, string>
  });

  useEffect(() => {
    if (submission) {
      setFormData({
        first_name: submission.first_name || '',
        last_name: submission.last_name || '',
        email: submission.email || '',
        phone: submission.phone || '',
        job_title: submission.job_title || '',
        company: submission.company || '',
        status: submission.status || 'Pending',
        about_you: submission.about_you || '',
        phonetic_spelling: submission.phonetic_spelling || '',
        pronouns: submission.pronouns || '',
        website: submission.website || '',
        youtube_link: submission.youtube_link || '',
        session_date: submission.session_date || '',
        notes: submission.notes || submission.rejected_reason || '',
        contact_preferences: {
          selected_contact_methods: submission.contact_preferences?.selected_contact_methods || [],
          selected_dates: submission.contact_preferences?.selected_dates || [],
          selected_times: submission.contact_preferences?.selected_times || []
        },
        social_links: submission.social_links || {}
      });
      setIsEditing(false);
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        company: '',
        status: 'Pending',
        about_you: '',
        phonetic_spelling: '',
        pronouns: '',
        website: '',
        youtube_link: '',
        session_date: '',
        notes: '',
        contact_preferences: {
          selected_contact_methods: [] as string[],
          selected_dates: [] as string[],
          selected_times: [] as string[]
        },
        social_links: {} as Record<string, string>
      });
      setIsEditing(true);
    }
  }, [submission, isOpen]);

  const handleFieldChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleContactMethod = (method: string) => {
    const current = formData.contact_preferences.selected_contact_methods;
    const updated = current.includes(method)
      ? current.filter(m => m !== method)
      : [...current, method];
    handleFieldChange('contact_preferences.selected_contact_methods', updated);
  };

  const toggleTimeSlot = (slot: string) => {
    const current = formData.contact_preferences.selected_times;
    const updated = current.includes(slot)
      ? current.filter(s => s !== slot)
      : [...current, slot];
    handleFieldChange('contact_preferences.selected_times', updated);
  };

  const handleDateChange = (date: string) => {
    const current = formData.contact_preferences.selected_dates;
    const updated = current.includes(date)
      ? current.filter(d => d !== date)
      : [...current, date];
    handleFieldChange('contact_preferences.selected_dates', updated);
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: url
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        job_title: formData.job_title.trim() || null,
        company: formData.company.trim() || null,
        status: formData.status,
        about_you: formData.about_you.trim(),
        phonetic_spelling: formData.phonetic_spelling.trim() || null,
        pronouns: formData.pronouns.trim() || null,
        website: formData.website.trim() || null,
        youtube_link: formData.youtube_link.trim() || null,
        session_date: formData.session_date || null,
        notes: formData.notes.trim() || null,
        contact_preferences: formData.contact_preferences,
        social_links: Object.fromEntries(
          Object.entries(formData.social_links).filter(([_, url]) => url.trim())
        )
      };

      if (formData.status === 'Rejected' && formData.notes.trim()) {
        payload.rejected_reason = formData.notes.trim();
      }

      let res;
      if (submission?.id) {
        res = await fetch(`/api/admin/tmp-submissions/${submission.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/admin/tmp-submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      toast.success(submission ? 'Submission updated' : 'Submission created');
      setIsEditing(false);
      onUpdate();
      if (!submission) onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save submission');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!submission) return;

    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/tmp-submissions/${submission.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to delete');
      }

      toast.success('Submission deleted successfully');
      onClose();
      onUpdate();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete submission');
    } finally {
      setIsDeleting(false);
    }
  };

  const fullName = [formData.first_name, formData.last_name].filter(Boolean).join(' ') || 'Unnamed';
  const isCreation = !submission;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                />
              </Dialog.Overlay>

              <Dialog.Content asChild>
                <motion.div
                  className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[600px] lg:w-[700px] bg-white dark:bg-gray-900 shadow-xl flex flex-col"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <Dialog.Title asChild>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {isCreation ? 'New Submission' : fullName}
                        </h2>
                      </Dialog.Title>
                      {!isCreation && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formData.email}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            icon={<Edit2 className="w-4 h-4" />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            icon={<Trash2 className="w-4 h-4" />}
                            className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 border-rose-200 dark:border-rose-800"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          {!isCreation && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsEditing(false);
                                if (submission) {
                                  setFormData({
                                    first_name: submission.first_name || '',
                                    last_name: submission.last_name || '',
                                    email: submission.email || '',
                                    phone: submission.phone || '',
                                    job_title: submission.job_title || '',
                                    company: submission.company || '',
                                    status: submission.status || 'Pending',
                                    about_you: submission.about_you || '',
                                    phonetic_spelling: submission.phonetic_spelling || '',
                                    pronouns: submission.pronouns || '',
                                    website: submission.website || '',
                                    youtube_link: submission.youtube_link || '',
                                    session_date: submission.session_date || '',
                                    notes: submission.notes || submission.rejected_reason || '',
                                    contact_preferences: {
                                      selected_contact_methods: submission.contact_preferences?.selected_contact_methods || [],
                                      selected_dates: submission.contact_preferences?.selected_dates || [],
                                      selected_times: submission.contact_preferences?.selected_times || []
                                    },
                                    social_links: submission.social_links || {}
                                  });
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}
                      <Dialog.Close asChild>
                        <button
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          aria-label="Close"
                        >
                          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </Dialog.Close>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Status & Notes Section */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status *
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.status}
                            onChange={(e) => handleFieldChange('status', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            {formData.status}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes {formData.status === 'Rejected' && '(Rejection Reason)'}
                        </label>
                        {isEditing ? (
                          <textarea
                            value={formData.notes}
                            onChange={(e) => handleFieldChange('notes', e.target.value)}
                            rows={4}
                            placeholder={formData.status === 'Rejected' ? 'Enter rejection reason...' : 'Add notes...'}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[80px]">
                            {formData.notes || '—'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">First Name *</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.first_name}
                              onChange={(e) => handleFieldChange('first_name', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{formData.first_name || '—'}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last Name *</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.last_name}
                              onChange={(e) => handleFieldChange('last_name', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{formData.last_name || '—'}</p>
                          )}
                        </div>
                      </div>

                      {(isEditing || formData.phonetic_spelling) && (
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phonetic Spelling</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.phonetic_spelling}
                              onChange={(e) => handleFieldChange('phonetic_spelling', e.target.value)}
                              placeholder="Optional"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-sm text-gray-900 dark:text-gray-100">{formData.phonetic_spelling || '—'}</p>
                          )}
                        </div>
                      )}

                      {(isEditing || formData.pronouns) && (
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Pronouns</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.pronouns}
                              onChange={(e) => handleFieldChange('pronouns', e.target.value)}
                              placeholder="e.g., he/him, she/her, they/them"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-sm text-gray-900 dark:text-gray-100">{formData.pronouns || '—'}</p>
                          )}
                        </div>
                      )}

                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email *</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <a
                            href={`mailto:${formData.email}`}
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            <Mail className="w-3 h-3" />
                            {formData.email}
                          </a>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : formData.phone ? (
                          <a
                            href={`tel:${formData.phone}`}
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            <Phone className="w-3 h-3" />
                            {formData.phone}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">—</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Job Title</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.job_title}
                            onChange={(e) => handleFieldChange('job_title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900 dark:text-gray-100">{formData.job_title || '—'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Company</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => handleFieldChange('company', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900 dark:text-gray-100">{formData.company || '—'}</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Website</label>
                        {isEditing ? (
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => handleFieldChange('website', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : formData.website ? (
                          <a
                            href={formData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            <Globe className="w-3 h-3" />
                            {formData.website}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">—</p>
                        )}
                      </div>
                    </div>

                    {/* Story */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Their Story
                      </h3>
                      {isEditing ? (
                        <textarea
                          value={formData.about_you}
                          onChange={(e) => handleFieldChange('about_you', e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {formData.about_you || '—'}
                        </p>
                      )}
                    </div>

                    {/* Contact Preferences */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Contact Preferences
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Preferred Contact Methods</label>
                          {isEditing ? (
                            <div className="flex flex-wrap gap-2">
                              {contactMethodOptions.map((method) => (
                                <button
                                  key={method}
                                  type="button"
                                  onClick={() => toggleContactMethod(method)}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                    formData.contact_preferences.selected_contact_methods.includes(method)
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  )}
                                >
                                  {method.charAt(0).toUpperCase() + method.slice(1)}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {formData.contact_preferences.selected_contact_methods.length > 0 ? (
                                formData.contact_preferences.selected_contact_methods.map((method) => (
                                  <span
                                    key={method}
                                    className="px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs"
                                  >
                                    {method.charAt(0).toUpperCase() + method.slice(1)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Preferred Dates</label>
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="date"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleDateChange(e.target.value);
                                  }
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex flex-wrap gap-2">
                                {formData.contact_preferences.selected_dates.map((date) => {
                                  try {
                                    const dateObj = new Date(date);
                                    if (isNaN(dateObj.getTime())) return null;
                                    return (
                                      <span
                                        key={date}
                                        className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs flex items-center gap-1"
                                      >
                                        {format(dateObj, 'MMM d, yyyy')}
                                        <button
                                          type="button"
                                          onClick={() => handleDateChange(date)}
                                          className="hover:text-red-600 dark:hover:text-red-400"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </span>
                                    );
                                  } catch {
                                    return null;
                                  }
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {formData.contact_preferences.selected_dates.length > 0 ? (
                                formData.contact_preferences.selected_dates.map((date) => {
                                  try {
                                    const dateObj = new Date(date);
                                    if (isNaN(dateObj.getTime())) return null;
                                    return (
                                      <span
                                        key={date}
                                        className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs"
                                      >
                                        {format(dateObj, 'MMM d, yyyy')}
                                      </span>
                                    );
                                  } catch {
                                    return null;
                                  }
                                })
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Preferred Times</label>
                          {isEditing ? (
                            <div className="flex flex-wrap gap-2">
                              {timeSlotOptions.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => toggleTimeSlot(slot)}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                    formData.contact_preferences.selected_times.includes(slot)
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  )}
                                >
                                  {slot.charAt(0).toUpperCase() + slot.slice(1)}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {formData.contact_preferences.selected_times.length > 0 ? (
                                formData.contact_preferences.selected_times.map((time) => (
                                  <span
                                    key={time}
                                    className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs"
                                  >
                                    {time.charAt(0).toUpperCase() + time.slice(1)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Social Links</h3>
                      {isEditing ? (
                        <div className="space-y-2">
                          {socialPlatforms.map((platform) => (
                            <div key={platform}>
                              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
                                {platform}
                              </label>
                              <input
                                type="url"
                                value={formData.social_links[platform] || ''}
                                onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                                placeholder={`https://${platform}.com/username`}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(formData.social_links).filter(key => formData.social_links[key]).length > 0 ? (
                            Object.entries(formData.social_links)
                              .filter(([_, url]) => url)
                              .map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                                >
                                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* YouTube Link */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">YouTube Video</h3>
                      {isEditing ? (
                        <input
                          type="url"
                          value={formData.youtube_link}
                          onChange={(e) => handleFieldChange('youtube_link', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : formData.youtube_link ? (
                        <a
                          href={formData.youtube_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          <span>Watch Video</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                      )}
                    </div>

                    {/* Video Date */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Session Date</h3>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.session_date}
                          onChange={(e) => handleFieldChange('session_date', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : formData.session_date ? (
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          {format(new Date(formData.session_date), 'MMMM d, yyyy')}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                      )}
                    </div>

                    {/* Timestamps (Read-only) */}
                    {submission?.created_at && (
                      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Timestamps</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {(() => {
                            try {
                              const date = new Date(submission.created_at!);
                              if (isNaN(date.getTime())) return null;
                              return (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Submitted</span>
                                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                                    {format(date, 'MMM d, yyyy')}
                                  </p>
                                  <p className="text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(date, { addSuffix: true })}
                                  </p>
                                </div>
                              );
                            } catch {
                              return null;
                            }
                          })()}
                          {submission.scheduled_at && (() => {
                            try {
                              const date = new Date(submission.scheduled_at!);
                              if (isNaN(date.getTime())) return null;
                              return (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Scheduled</span>
                                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                                    {format(date, 'MMM d, yyyy')}
                                  </p>
                                  <p className="text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(date, { addSuffix: true })}
                                  </p>
                                </div>
                              );
                            } catch {
                              return null;
                            }
                          })()}
                          {submission.completed_at && (() => {
                            try {
                              const date = new Date(submission.completed_at!);
                              if (isNaN(date.getTime())) return null;
                              return (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Completed</span>
                                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                                    {format(date, 'MMM d, yyyy')}
                                  </p>
                                  <p className="text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(date, { addSuffix: true })}
                                  </p>
                                </div>
                              );
                            } catch {
                              return null;
                            }
                          })()}
                          {submission.rejected_at && (() => {
                            try {
                              const date = new Date(submission.rejected_at!);
                              if (isNaN(date.getTime())) return null;
                              return (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Rejected</span>
                                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                                    {format(date, 'MMM d, yyyy')}
                                  </p>
                                  <p className="text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(date, { addSuffix: true })}
                                  </p>
                                </div>
                              );
                            } catch {
                              return null;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                    {isEditing && (
                      <>
                        <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          loading={isSaving}
                          icon={<Save className="w-4 h-4" />}
                        >
                          Save Changes
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

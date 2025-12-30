'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/core/ThemeProvider';
import Button from '@/components/core/Button';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { User, MessageSquare, Contact, Globe, MapPin, Phone, Mail, Calendar, Clock, Send } from 'lucide-react';

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
  about_you: z.string().min(1, 'Please tell us about yourself'),
  phonetic_spelling: z.string().optional(),
  pronouns: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  contact_preferences: z.object({
    selected_contact_methods: z.array(z.string()).min(1, 'At least one contact method is required'),
    selected_dates: z.array(z.string()).min(1, 'At least one date is required'),
    selected_times: z.array(z.string()).min(1, 'At least one time slot is required'),
  }),
  social_links: z.record(z.string(), z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;
type FormFieldName = 
  | keyof FormData 
  | `social_links.${string}`
  | 'contact_preferences.selected_contact_methods'
  | 'contact_preferences.selected_dates'
  | 'contact_preferences.selected_times';

const contactMethods = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'text', label: 'Text Message', icon: MessageSquare },
];

const timeSlots = [
  { value: 'morning', label: 'Morning (9AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
  { value: 'evening', label: 'Evening (5PM - 8PM)' },
];

const socialPlatforms = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
];

interface TMPFormProps {
  onSuccess?: () => void;
}

const DatePickerAny = DatePicker as any;

export function TMPForm({ onSuccess }: TMPFormProps) {
  const { isDarkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);
  const [submitError, setSubmitError] = React.useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      job_title: '',
      company: '',
      about_you: '',
      phonetic_spelling: '',
      pronouns: '',
      website: '',
      contact_preferences: {
        selected_contact_methods: [],
        selected_dates: [],
        selected_times: [],
      },
      social_links: {},
    },
    mode: 'onTouched',
  });

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    const newSelectedDates = selectedDates.some(
      selectedDate => selectedDate.getTime() === date.getTime()
    )
      ? selectedDates.filter(selectedDate => selectedDate.getTime() !== date.getTime())
      : [...selectedDates, date];
    setSelectedDates(newSelectedDates);
    const formattedDates = newSelectedDates.map(date => format(date, 'yyyy-MM-dd'));
    form.setValue('contact_preferences.selected_dates', formattedDates);
  };

  const shouldShowError = (fieldName: FormFieldName) => {
    const field = form.getFieldState(fieldName);
    return (field.isTouched || hasAttemptedSubmit) && field.error;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      
      const response = await fetch('/api/tmp-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'Pending' }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      try {
        function isValidUrl(url: string) {
          try {
            if (!url || url.trim() === '') return false;
            new URL(url);
            return true;
          } catch {
            return false;
          }
        }

        const cleanedSocialLinks: Record<string, string> = {};
        if (data.social_links) {
          Object.entries(data.social_links).forEach(([platform, url]) => {
            if (isValidUrl(url as string)) {
              cleanedSocialLinks[platform] = url as string;
            }
          });
        }

        const website = isValidUrl(data.website || '') ? data.website : undefined;
        const youtube_link = 'youtube_link' in data && isValidUrl((data as any).youtube_link) ? (data as any).youtube_link as string : undefined;
        
        const brevoData = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || '',
          title: data.job_title || '',
          company: data.company || '',
          about_you: data.about_you,
          phonetic_spelling: data.phonetic_spelling || '',
          pronouns: data.pronouns || '',
          website,
          youtube_link,
          session_date: null,
          social_links: Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : undefined,
          contact_preferences: {
            selected_contact_methods: data.contact_preferences.selected_contact_methods || [],
            selected_days: [],
            selected_times: data.contact_preferences.selected_times || [],
            selected_dates: data.contact_preferences.selected_dates || [],
          },
          status: 'Pending',
        };

        const emailResponse = await fetch('/api/brevo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'tmp',
            data: brevoData
          }),
        });

        const contentType = emailResponse.headers.get('content-type') || '';
        if (!emailResponse.ok) {
          let errorDetail = '';
          if (contentType.includes('application/json')) {
            const error = await emailResponse.json();
            errorDetail = JSON.stringify(error);
          } else {
            const text = await emailResponse.text();
            errorDetail = text;
          }
          throw new Error(`Email failed: ${errorDetail}`);
        }
      } catch (emailError) {
        setSubmitError('Failed to send email. Please try again.');
        setIsSubmitting(false);
      }

      form.reset();
      setSelectedDates([]);
      setHasAttemptedSubmit(false);
      onSuccess?.();
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    setHasAttemptedSubmit(true);
    onSubmit(data);
  });

  return (
    <div className="w-full max-w-5xl mx-auto">

      <form onSubmit={handleSubmit} className="space-y-8">
        <PersonalInfoSection form={form} shouldShowError={shouldShowError} isDarkMode={isDarkMode} />
        <StorySection form={form} shouldShowError={shouldShowError} isDarkMode={isDarkMode} />
        <ContactPreferencesSection 
          form={form} 
          shouldShowError={shouldShowError} 
          isDarkMode={isDarkMode}
          selectedDates={selectedDates}
          handleDateChange={handleDateChange}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            size="lg"
            className="group relative px-8 py-4 text-lg font-semibold rounded-xl"
          >
            <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" />
            <span className="truncate">{isSubmitting ? 'Submitting...' : 'Submit Your Story'}</span>
          </Button>
        </motion.div>
      </form>
    </div>
  );
}

function PersonalInfoSection({ form, shouldShowError, isDarkMode }: any) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={cn(
        'p-6 rounded-xl border transition-all duration-300',
        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      )}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
          )}>
            <User className="w-5 h-5" />
          </div>
          <h2 className={cn(
            'text-2xl font-semibold',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            Personal Information
          </h2>
        </div>
        <p className={cn(
          'text-sm',
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        )}>
          Tell us about yourself so we can get to know you better.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={cn(
            'block text-sm font-medium',
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            First Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className={cn(
              'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )} />
            <input
              type="text"
              placeholder="John"
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              )}
              {...form.register('first_name')}
            />
          </div>
          {shouldShowError('first_name') && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.first_name?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className={cn(
            'block text-sm font-medium',
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            Last Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className={cn(
              'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )} />
            <input
              type="text"
              placeholder="Doe"
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              )}
              {...form.register('last_name')}
            />
          </div>
          {shouldShowError('last_name') && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.last_name?.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <label className={cn(
          'block text-sm font-medium',
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        )}>
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className={cn(
            'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          )} />
          <input
            type="email"
            placeholder="john.doe@example.com"
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              isDarkMode
                ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            )}
            {...form.register('email')}
          />
        </div>
        {shouldShowError('email') && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.email?.message}
          </p>
        )}
      </div>

      <div className="space-y-2 mt-6">
        <label className={cn(
          'block text-sm font-medium',
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        )}>
          Phone Number <span className="text-gray-400">(Optional)</span>
        </label>
        <div className="relative">
          <Phone className={cn(
            'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          )} />
          <input
            type="tel"
            placeholder="+1 (555) 123-4567"
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              isDarkMode
                ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            )}
            {...form.register('phone')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <label className={cn(
            'block text-sm font-medium',
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            Job Title <span className="text-gray-400">(Optional)</span>
          </label>
          <div className="relative">
            <MapPin className={cn(
              'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )} />
            <input
              type="text"
              placeholder="Software Engineer"
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              )}
              {...form.register('job_title')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={cn(
            'block text-sm font-medium',
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            Company <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Acme Corp"
            className={cn(
              'w-full px-4 py-3 rounded-lg border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              isDarkMode
                ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            )}
            {...form.register('company')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <label className={cn(
            'block text-sm font-medium',
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            Name Pronunciation <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="JOHN DOH"
            className={cn(
              'w-full px-4 py-3 rounded-lg border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              isDarkMode
                ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            )}
            {...form.register('phonetic_spelling')}
          />
        </div>

        <div className="space-y-2">
          <label className={cn(
            'block text-sm font-medium',
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            Pronouns <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="he/him, she/her, they/them"
            className={cn(
              'w-full px-4 py-3 rounded-lg border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              isDarkMode
                ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            )}
            {...form.register('pronouns')}
          />
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <label className={cn(
          'block text-sm font-medium',
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        )}>
          Website <span className="text-gray-400">(Optional)</span>
        </label>
        <div className="relative">
          <Globe className={cn(
            'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          )} />
          <input
            type="url"
            placeholder="https://www.johndoe.com"
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              isDarkMode
                ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            )}
            {...form.register('website')}
          />
        </div>
        {shouldShowError('website') && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.website?.message}
          </p>
        )}
      </div>
    </motion.section>
  );
}

function StorySection({ form, shouldShowError, isDarkMode }: any) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={cn(
        'p-6 rounded-xl border transition-all duration-300',
        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      )}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isDarkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'
          )}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className={cn(
            'text-2xl font-semibold',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            Your Story
          </h2>
        </div>
        <p className={cn(
          'text-sm',
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        )}>
          Share your experience and what brings you here today.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className={cn(
            'block text-sm font-medium',
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            Tell us about yourself <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Share your story, experience, or what you'd like to discuss..."
            className={cn(
              'w-full px-4 py-3 rounded-lg border transition-all duration-200 min-h-[200px] resize-y',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              isDarkMode
                ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            )}
            {...form.register('about_you')}
          />
          {shouldShowError('about_you') && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.about_you?.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className={cn(
            'text-lg font-medium',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            Social Media Links <span className="text-gray-400">(Optional)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {socialPlatforms.map((platform) => (
              <div key={platform.value} className="space-y-2">
                <label className={cn(
                  'block text-sm font-medium',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                )}>
                  {platform.label}
                </label>
                <input
                  type="text"
                  placeholder={`@username or URL`}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                    isDarkMode
                      ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  )}
                  onChange={(e) => {
                    const value = e.target.value;
                    const currentLinks = form.getValues('social_links') || {};
                    form.setValue('social_links', {
                      ...currentLinks,
                      [platform.value]: value || '',
                    });
                  }}
                />
                {shouldShowError(`social_links.${platform.value}`) && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.social_links?.[platform.value]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ContactPreferencesSection({ form, shouldShowError, isDarkMode, selectedDates, handleDateChange }: any) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={cn(
        'p-6 rounded-xl border transition-all duration-300',
        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      )}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'
          )}>
            <Contact className="w-5 h-5" />
          </div>
          <h2 className={cn(
            'text-2xl font-semibold',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            Contact Preferences
          </h2>
        </div>
        <p className={cn(
          'text-sm',
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        )}>
          How and when would you like us to reach out to you?
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className={cn(
            'block text-sm font-medium',
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            Preferred Contact Methods <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = form.watch('contact_preferences.selected_contact_methods').includes(method.value);
              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => {
                                         const current = form.getValues('contact_preferences.selected_contact_methods');
                     const newValue = current.includes(method.value)
                       ? current.filter((v: string) => v !== method.value)
                       : [...current, method.value];
                    form.setValue('contact_preferences.selected_contact_methods', newValue);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {method.label}
                </button>
              );
            })}
          </div>
          {shouldShowError('contact_preferences.selected_contact_methods') && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.contact_preferences?.selected_contact_methods?.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <label className={cn(
            'block text-sm font-medium',
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            Preferred Dates <span className="text-red-500">*</span>
          </label>
          <div className="mt-2">
            <DatePickerAny
              selected={selectedDates[0]}
              onChange={handleDateChange}
              inline
              minDate={new Date()}
              monthsShown={1}
              className={cn(
                'w-full rounded-lg border transition-colors duration-200',
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              )}
              calendarClassName={cn(
                'rounded-lg border shadow-lg',
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              )}
              dayClassName={(date: Date) => cn(
                'hover:bg-blue-100 rounded-md transition-colors duration-200',
                isDarkMode ? 'hover:bg-blue-900' : 'hover:bg-blue-100',
                                 selectedDates.some(
                   (selectedDate: Date) => selectedDate.getTime() === date.getTime()
                 ) && 'bg-blue-600 text-white'
              )}
            />
            {selectedDates.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                            {selectedDates.map((date: Date) => (
              <div
                key={date.getTime()}
                className={cn(
                  'group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  'bg-blue-600 text-white'
                )}
              >
                    <Calendar className="w-4 h-4" />
                    <span>{format(date, 'MMM d, yyyy')}</span>
                    <button
                      type="button"
                      onClick={() => {
                                                 const newSelectedDates = selectedDates.filter(
                           (d: Date) => d.getTime() !== date.getTime()
                         );
                         handleDateChange(null);
                         selectedDates.forEach((d: Date) => {
                           if (d.getTime() !== date.getTime()) {
                             handleDateChange(d);
                           }
                         });
                      }}
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                      aria-label={`Remove ${format(date, 'MMMM d, yyyy')}`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {shouldShowError('contact_preferences.selected_dates') && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.contact_preferences?.selected_dates?.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <label className={cn(
            'block text-sm font-medium',
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            Preferred Times <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {timeSlots.map((slot) => {
              const isSelected = form.watch('contact_preferences.selected_times').includes(slot.value);
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => {
                                         const current = form.getValues('contact_preferences.selected_times');
                     const newValue = current.includes(slot.value)
                       ? current.filter((v: string) => v !== slot.value)
                       : [...current, slot.value];
                    form.setValue('contact_preferences.selected_times', newValue);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <Clock className="w-4 h-4" />
                  {slot.label}
                </button>
              );
            })}
          </div>
          {shouldShowError('contact_preferences.selected_times') && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.contact_preferences?.selected_times?.message}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
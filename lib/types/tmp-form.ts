import { z } from 'zod';
import type { TMPSubmissionStatus } from './database';
export const tmpFormSchema = z.object({
  status: z.enum(['Pending', 'Scheduled', 'Completed', 'Rejected'] as const),
  about_you: z.string().optional(),
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  company: z.string().optional(),
  contact_preferences: z.object({
    selected_contact_methods: z.array(z.string()).min(1, 'At least one contact method is required'),
    selected_days: z.array(z.string()).min(1, 'At least one day is required'),
    selected_times: z.array(z.string()).min(1, 'At least one time slot is required'),
    selected_dates: z.array(z.string()).min(1, 'At least one date is required'),
  }),
  phone: z.string().optional(),
  phonetic_spelling: z.string().optional(),
  pronouns: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  social_links: z.record(z.string(), z.string()).optional(),
});
export type TMPFormData = z.infer<typeof tmpFormSchema>;
export interface FormStep {
  title: string;
  description?: string;
  isValid: (data: Partial<TMPFormData>) => boolean;
}
export interface ContactMethod {
  id: string;
  label: string;
  description?: string;
}
export const CONTACT_METHODS: ContactMethod[] = [
  { id: 'email', label: 'Email', description: 'We will contact you via email' },
  { id: 'phone', label: 'Phone Call', description: 'We will call you at your provided number' },
  { id: 'text', label: 'Text Message', description: 'We will send you a text message' },
];
export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}
export const TIME_SLOTS: TimeSlot[] = [
  { id: 'morning', label: 'Morning', startTime: '09:00', endTime: '12:00' },
  { id: 'afternoon', label: 'Afternoon', startTime: '12:00', endTime: '17:00' },
  { id: 'evening', label: 'Evening', startTime: '17:00', endTime: '20:00' },
];
export interface SocialMediaPlatform {
  id: string;
  label: string;
  icon: string;
  placeholder: string;
}
export const SOCIAL_MEDIA_PLATFORMS: SocialMediaPlatform[] = [
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', placeholder: 'https://linkedin.com/in/yourusername' },
  { id: 'twitter', label: 'Twitter', icon: 'twitter', placeholder: 'https://twitter.com/yourusername' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram', placeholder: 'https://instagram.com/yourusername' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube', placeholder: 'https://youtube.com/@yourusername' },
];
export interface TMPFormProps {
  isOpen: boolean;
  initialStep?: number;
  onClose: () => void;
  onStepChange?: (step: number) => void;
  onSubmit?: (data: TMPFormData) => Promise<void>;
}
export interface FormState {
  activeStep: number;
  isSubmitting: boolean;
  isSubmitted: boolean;
  formData: Partial<TMPFormData>;
  selectedSocials: string[];
  selectedContactMethods: string[];
  selectedDays: string[];
  selectedTimes: string[];
  selectedDates: string[];
  socialLinks: Record<string, string>;
}
export const formSteps: FormStep[] = [
  {
    title: 'Personal Information',
    description: 'Tell us about yourself',
    isValid: (data: Partial<TMPFormData>) => {
      return !!(
        data.first_name?.trim() &&
        data.last_name?.trim() &&
        data.email?.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')
      );
    }
  },
  {
    title: 'Contact Preferences',
    description: 'How would you like to be contacted?',
    isValid: (data: Partial<TMPFormData>) => {
      const contactMethods = data.contact_preferences?.selected_contact_methods || [];
      const days = data.contact_preferences?.selected_days || [];
      const times = data.contact_preferences?.selected_times || [];
      return contactMethods.length >= 1 && days.length >= 1 && times.length >= 1;
    }
  },
  {
    title: 'Schedule',
    description: 'Choose your preferred dates',
    isValid: (data: Partial<TMPFormData>) => {
      const dates = data.contact_preferences?.selected_dates || [];
      return dates.length >= 1;
    }
  },
  {
    title: 'Social Media',
    description: 'Connect your social profiles',
    isValid: () => true 
  }
];
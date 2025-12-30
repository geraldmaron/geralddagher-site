import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Logger } from '@/lib/utils/logger';
import React from 'react';
import { useDebounceValue } from '@/lib/hooks/use-debounce-value';
import type { TMPSubmission } from '@/lib/types/database';
import type { TMPFormData, FormState, FormStep } from '@/lib/types/tmp-form';
import { tmpFormSchema } from '@/lib/types/tmp-form';
import type { TMPSubmissionStatus } from '@/lib/types/database';
const initialFormState: FormState = {
  activeStep: 0,
  isSubmitting: false,
  isSubmitted: false,
  formData: {
    status: 'Pending',
    about_you: '',
    email: '',
    first_name: '',
    last_name: '',
    contact_preferences: {
      selected_contact_methods: [],
      selected_days: [],
      selected_times: [],
      selected_dates: [],
    },
  },
  selectedSocials: [],
  selectedContactMethods: [],
  selectedDays: [],
  selectedTimes: [],
  selectedDates: [],
  socialLinks: {},
};
export const useTMPForm = (initialStep: number = 0) => {
  const [formState, setFormState] = useState<FormState>({
    ...initialFormState,
    activeStep: initialStep
  });
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid: isFormValid },
    getValues,
    reset
  } = useForm<TMPFormData>({
    resolver: zodResolver(tmpFormSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      title: '',
      company: '',
      website: '',
      phonetic_spelling: '',
      pronouns: '',
      contact_preferences: {
        selected_contact_methods: [],
        selected_days: [],
        selected_times: [],
        selected_dates: []
      },
      social_links: {
        instagram: '',
        twitter: '',
        facebook: '',
        linkedin: '',
        youtube: ''
      }
    }
  });
  const formSteps = React.useMemo(() => [
    {
      title: 'Personal Information',
      isValid: (data: Partial<TMPFormData>) => {
        const validation = {
          firstName: {
            value: data.first_name,
            isValid: !!data.first_name?.trim(),
            message: 'First name is required'
          },
          lastName: {
            value: data.last_name,
            isValid: !!data.last_name?.trim(),
            message: 'Last name is required'
          },
          email: {
            value: data.email,
            isValid: !!data.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email),
            message: 'Valid email is required'
          }
        };
        const isValid = validation.firstName.isValid && 
                       validation.lastName.isValid && 
                       validation.email.isValid;
        const result = {
          isValid,
          data,
          validation,
          failingFields: Object.entries(validation)
            .filter(([_, field]) => !field.isValid)
            .map(([field]) => field)
        };
        return isValid;
      }
    },
    {
      title: 'Contact Preferences',
      isValid: (data: Partial<TMPFormData>) => {
        const validation = {
          contactMethods: {
            value: formState.selectedContactMethods,
            isValid: formState.selectedContactMethods.length > 0,
            message: 'At least one contact method is required'
          },
          days: {
            value: formState.selectedDays,
            isValid: formState.selectedDays.length > 0,
            message: 'At least one day is required'
          },
          times: {
            value: formState.selectedTimes,
            isValid: formState.selectedTimes.length > 0,
            message: 'At least one time is required'
          }
        };
        const isValid = validation.contactMethods.isValid && 
                       validation.days.isValid && 
                       validation.times.isValid;
        const result = {
          isValid,
          data,
          validation,
          failingFields: Object.entries(validation)
            .filter(([_, field]) => !field.isValid)
            .map(([field]) => field)
        };
        return isValid;
      }
    },
    {
      title: 'Calendar',
      isValid: (data: Partial<TMPFormData>) => {
        const validation = {
          dates: {
            value: formState.selectedDates,
            isValid: Array.isArray(formState.selectedDates) && formState.selectedDates.length > 0,
            message: 'At least one date is required'
          }
        };
        const isValid = validation.dates.isValid;
        const result = {
          isValid,
          data,
          validation,
          failingFields: Object.entries(validation)
            .filter(([_, field]) => !field.isValid)
            .map(([field]) => field)
        };
        return isValid;
      }
    },
    {
      title: 'Social Media',
      isValid: () => true
    }
  ], [formState.selectedContactMethods, formState.selectedDays, formState.selectedTimes, formState.selectedDates]);
  const validateStep = useCallback((stepIndex: number) => {
    const step = formSteps[stepIndex];
    const currentValues = getValues();
    const isValid = step.isValid(currentValues);
    return isValid;
  }, [formSteps, getValues]);
  const formValues = watch();
  const memoizedFormValues = React.useMemo(() => formValues, [formValues]);
  const updateFormState = React.useCallback((prev: FormState, newValues: TMPFormData) => {
    const hasChanges = Object.keys(newValues).some(key => {
      const typedKey = key as keyof TMPFormData;
      if (typedKey === 'contact_preferences' || typedKey === 'social_links') {
        return JSON.stringify(prev.formData[typedKey]) !== JSON.stringify(newValues[typedKey]);
      }
      return prev.formData[typedKey] !== newValues[typedKey];
    });
    if (!hasChanges) {
      return prev;
    }
    return {
      ...prev,
      formData: {
        ...prev.formData,
        ...newValues
      }
    };
  }, []);
  const debouncedFormValues = useDebounceValue(memoizedFormValues, 300);
  useEffect(() => {
    if (!debouncedFormValues) return;
    setFormState(prev => {
      const newState = updateFormState(prev, debouncedFormValues);
      setTimeout(() => {
        trigger();
      }, 0);
      return newState;
    });
  }, [debouncedFormValues, updateFormState, trigger]);
  const handleStepChange = useCallback(async (newStep: number) => {
    if (newStep === formState.activeStep) return;
    setFormState(prev => ({ ...prev, isStepChanging: true }));
    const isValid = validateStep(formState.activeStep);
    if (newStep > formState.activeStep && !isValid) {
      setFormState(prev => ({ ...prev, isStepChanging: false }));
      return;
    }
    setFormState(prev => ({
      ...prev,
      activeStep: newStep,
      isStepChanging: false
    }));
  }, [formState.activeStep, validateStep]);
  const resetFormState = useCallback(() => {
    reset();
    setFormState(initialFormState);
  }, [reset]);
  const handleDateChange = useCallback((dates: Date[]) => {
    setFormState(prev => ({
      ...prev,
      selectedDates: dates.map(date => date.toISOString().split('T')[0])
    }));
  }, []);
  const handleSocialToggle = useCallback((socialId: string) => {
    setFormState(prev => ({
      ...prev,
      selectedSocials: prev.selectedSocials.includes(socialId)
        ? prev.selectedSocials.filter(id => id !== socialId)
        : [...prev.selectedSocials, socialId],
    }));
  }, []);
  const handleSocialLinkChange = useCallback((socialId: string, value: string) => {
    setFormState(prev => {
      const newSocialLinks = {
        ...prev.socialLinks,
        [socialId]: value,
      };
      return {
        ...prev,
        socialLinks: newSocialLinks,
        formData: {
          ...prev.formData,
          social_links: newSocialLinks
        }
      };
    });
  }, []);
  const handleContactMethodToggle = useCallback((method: string) => {
    setFormState(prev => {
      const newSelectedMethods = prev.selectedContactMethods.includes(method)
        ? prev.selectedContactMethods.filter(m => m !== method)
        : [...prev.selectedContactMethods, method];
      return {
        ...prev,
        selectedContactMethods: newSelectedMethods,
        formData: {
          ...prev.formData,
          contact_preferences: {
            selected_contact_methods: newSelectedMethods,
            selected_days: prev.formData.contact_preferences?.selected_days || [],
            selected_times: prev.formData.contact_preferences?.selected_times || [],
            selected_dates: prev.formData.contact_preferences?.selected_dates || []
          }
        }
      };
    });
  }, []);
  const handleDayToggle = useCallback((day: string) => {
    setFormState(prev => {
      const newSelectedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day];
      return {
        ...prev,
        selectedDays: newSelectedDays,
        formData: {
          ...prev.formData,
          contact_preferences: {
            selected_contact_methods: prev.formData.contact_preferences?.selected_contact_methods || [],
            selected_days: newSelectedDays,
            selected_times: prev.formData.contact_preferences?.selected_times || [],
            selected_dates: prev.formData.contact_preferences?.selected_dates || []
          }
        }
      };
    });
  }, []);
  const handleTimeToggle = useCallback((time: string) => {
    setFormState(prev => {
      const newSelectedTimes = prev.selectedTimes.includes(time)
        ? prev.selectedTimes.filter(t => t !== time)
        : [...prev.selectedTimes, time];
      return {
        ...prev,
        selectedTimes: newSelectedTimes,
        formData: {
          ...prev.formData,
          contact_preferences: {
            selected_contact_methods: prev.formData.contact_preferences?.selected_contact_methods || [],
            selected_days: prev.formData.contact_preferences?.selected_days || [],
            selected_times: newSelectedTimes,
            selected_dates: prev.formData.contact_preferences?.selected_dates || []
          }
        }
      };
    });
  }, []);
  const isFormValidForSubmission = useCallback(() => {
    const requiredSteps = formSteps.slice(0, -1);
    return requiredSteps.every((step) => step.isValid(getValues()));
  }, [formSteps, getValues]);
  const submitForm = async (formData: Omit<TMPSubmission, 'id' | 'created_at' | 'updated_at'>) => {
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    setError(null);
    try {
      const submissionData = {
        ...formData,
        status: 'Pending' as const,
        contact_preferences: {
          selected_contact_methods: formState.selectedContactMethods,
          selected_days: formState.selectedDays,
          selected_times: formState.selectedTimes,
          selected_dates: formState.selectedDates,
        },
        social_links: formState.socialLinks,
      };
      await Promise.resolve();
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isSubmitted: true
      }));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while submitting the form';
      setError(errorMessage);
      setFormState(prev => ({
        ...prev,
        isSubmitting: false
      }));
      Logger.error('Form submission failed', { error: err });
      return false;
    }
  };
  return {
    formState,
    formSteps,
    errors,
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    resetFormState,
    handleStepChange,
    handleDateChange,
    handleSocialToggle,
    handleSocialLinkChange,
    handleContactMethodToggle,
    handleDayToggle,
    handleTimeToggle,
    isFormValid: isFormValidForSubmission,
    validateStep,
    submitForm,
    error
  };
};
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, User, Shield } from 'lucide-react';
import { getMyProfile } from '@/lib/directus/queries/users';
import ChangePasswordForm from '@/components/settings/ChangePasswordForm';

export const metadata = {
  title: 'Settings - Argus - Gerald Dagher',
  description: 'Account settings and security',
};

export default async function ArgusSettingsPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('directus_session_token');

  if (!sessionToken) {
    redirect('/login?redirect=/argus/settings');
  }

  try {
    const user = await getMyProfile();

    if (!user) {
      redirect('/login?redirect=/argus/settings');
    }

    if (!user.has_argus_access) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Access Denied
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have permission to access Argus. Please contact the administrator if you believe this is an error.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/30">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/argus"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Argus
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  Settings
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Manage your account settings and security
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                  <User className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Profile Information
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Your account details
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-600 dark:text-neutral-400">Name</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-600 dark:text-neutral-400">Email</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-neutral-600 dark:text-neutral-400">Role</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {typeof user.role === 'object' ? user.role?.name : user.role}
                  </span>
                </div>
              </div>
            </div>

            <ChangePasswordForm />

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Security Tip
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    For better security, change your password regularly and use a unique password that you don't use anywhere else.
                    Consider using a password manager to generate and store strong passwords.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading settings:', error);
    redirect('/login?redirect=/argus/settings');
  }
}

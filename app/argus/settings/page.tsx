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
        <div data-area="argus" className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Access Denied
              </h1>
              <p className="text-muted-foreground">
                You don't have permission to access Argus. Please contact the administrator if you believe this is an error.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div data-area="argus" className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-violet-50/20 dark:from-indigo-950/20 dark:via-gray-950 dark:to-violet-950/10">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/argus"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Argus
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your account settings and security
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card dark:bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Profile Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your account details
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-foreground">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">Role</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {typeof user.role === 'object' ? user.role?.name : user.role}
                  </span>
                </div>
              </div>
            </div>

            <ChangePasswordForm />

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                  <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                    Security Tip
                  </h3>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
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

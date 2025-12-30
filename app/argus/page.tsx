import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getMyProfile } from '@/lib/directus/queries/users';
import ArgusClient from './ArgusClient';

export const metadata = {
  title: 'Argus - Gerald Dagher',
  description: 'Argus Dashboard - Authorized Access Only',
};

export default async function ArgusPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('directus_session_token');

  // Redirect to login if not authenticated
  if (!sessionToken) {
    redirect('/login?redirect=/argus');
  }

  // Check user permissions
  try {
    const user = await getMyProfile();

    if (!user) {
      redirect('/login?redirect=/argus');
    }

    // Check if user has Argus access
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
            <a
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return Home
            </a>
          </div>
        </div>
      );
    }

    // User has access, render the Argus dashboard
    return <ArgusClient user={user} />;
  } catch (error) {
    console.error('Error checking Argus access:', error);
    redirect('/login?redirect=/argus');
  }
}

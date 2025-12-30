import React from 'react';

export const metadata = {
  title: 'Privacy Policy - Gerald Dagher',
  description: 'Privacy Policy for Gerald Dagher\'s personal website and services.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Introduction</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              This Privacy Policy describes how Gerald Dagher ("we," "us," or "our") collects, uses, and shares your personal information when you visit our website and use our services.
            </p>
            <p>
              By using our website, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Information We Collect</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
              <p>We may collect personal information that you voluntarily provide to us, including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                <li>Name and email address (when you contact us or subscribe to our newsletter)</li>
                <li>Comments and feedback you provide</li>
                <li>Information you submit through forms on our website</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Automatically Collected Information</h3>
              <p>We automatically collect certain information when you visit our website:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                <li>IP address and browser type</li>
                <li>Pages visited and time spent on each page</li>
                <li>Referring website and search terms</li>
                <li>Device information and operating system</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>To provide and maintain our website and services</li>
              <li>To improve user experience and website functionality</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To send newsletters and updates (with your consent)</li>
              <li>To analyze website usage and trends</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Cookies and Tracking Technologies</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              We use cookies and similar tracking technologies to enhance your browsing experience and analyze website traffic.
            </p>
            <div>
              <h3 className="text-lg font-semibold mb-2">Types of Cookies We Use</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </div>
            <p>
              You can control cookie settings through your browser preferences. However, disabling certain cookies may affect website functionality.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Third-Party Services</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>We may use third-party services that collect, monitor, and analyze data:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Google Analytics for website analytics</li>
              <li>Vercel for hosting and performance monitoring</li>
              <li>Social media platforms for sharing and engagement</li>
            </ul>
            <p>
              These third-party services have their own privacy policies, and we encourage you to review them.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Data Security</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Your Rights</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal information</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided below.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Children's Privacy</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
            <p>
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Changes to This Privacy Policy</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            <p>
              We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Contact Us</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>Email: privacy@geralddagher.com</p>
              <p>Website: https://geralddagher.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
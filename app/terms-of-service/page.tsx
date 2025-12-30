import React from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms of Service - Gerald Dagher',
  description: 'Terms of Service for Gerald Dagher\'s personal website and services.',
};
export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
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
            <h2 className="text-xl font-semibold">Agreement to Terms</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              These Terms of Service ("Terms") govern your use of the website operated by Gerald Dagher ("we," "us," or "our") and any related services.
            </p>
            <p>
              By accessing or using our website, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access our website.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Description of Service            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              Our website provides personal content, blog posts, professional information, and various interactive features. The content includes but is not limited to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Personal blog posts and articles</li>
              <li>Professional information and portfolio</li>
              <li>Contact forms and communication tools</li>
              <li>Interactive features and applications</li>
            </ul>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">User Accounts            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <p>
              You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account, whether or not you have authorized such activities or actions.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Acceptable Use            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>You agree not to use our website to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of our website</li>
              <li>Use automated systems to access our website without permission</li>
              <li>Engage in any form of harassment or abuse</li>
            </ul>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Intellectual Property            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              The content on our website, including but not limited to text, graphics, images, logos, and software, is owned by us or our licensors and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, or create derivative works of our content without our express written permission.
            </p>
            <p>
              You retain ownership of any content you submit to our website, but you grant us a non-exclusive, royalty-free license to use, reproduce, and distribute such content.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Privacy Policy            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our website, to understand our practices regarding the collection and use of your personal information.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Disclaimers            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              Our website is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the operation of our website or the information, content, or materials included on our website.
            </p>
            <p>
              We do not warrant that our website will be uninterrupted or error-free, that defects will be corrected, or that our website or the server that makes it available are free of viruses or other harmful components.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Limitation of Liability            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our website.
            </p>
            <p>
              Our total liability to you for any claims arising from your use of our website shall not exceed the amount you paid, if any, for accessing our website.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Indemnification            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              You agree to indemnify, defend, and hold harmless us and our officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of our website or violation of these Terms.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Third-Party Links            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              Our website may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
            </p>
            <p>
              You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by the use of such third-party websites or services.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Termination            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              We may terminate or suspend your account and access to our website immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p>
              Upon termination, your right to use our website will cease immediately. If you wish to terminate your account, you may simply discontinue using our website.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Governing Law            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Gerald Dagher operates, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from these Terms or your use of our website shall be resolved in the courts of competent jurisdiction in that jurisdiction.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Changes to Terms            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p>
              What constitutes a material change will be determined at our sole discretion. By continuing to access or use our website after any revisions become effective, you agree to be bound by the revised terms.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Severability            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>
              If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Contact Information            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>Email: legal@geralddagher.com</p>
              <p>Website: https://geralddagher.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
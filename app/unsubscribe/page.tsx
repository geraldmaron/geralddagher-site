'use client';

import { useState } from 'react';
import { z } from 'zod';

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  target: z.enum(['blog', 'substack'])
});

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [target, setTarget] = useState<'blog' | 'substack'>('blog');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; substackUnsubscribeUrl?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = unsubscribeSchema.safeParse({ email, target });
    if (!validation.success) {
      setResult({ success: false, message: validation.error.issues[0].message });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, target })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, message: 'Failed to process unsubscribe request' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unsubscribe
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            I'm sorry to see you go. You can unsubscribe from my updates below.
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unsubscribe From
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="target"
                    value="blog"
                    checked={target === 'blog'}
                    onChange={(e) => setTarget(e.target.value as 'blog')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Blog Updates</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="target"
                    value="substack"
                    checked={target === 'substack'}
                    onChange={(e) => setTarget(e.target.value as 'substack')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Substack Newsletter</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isLoading ? 'Processing...' : 'Unsubscribe'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className={`p-4 rounded-md mb-4 ${result.success ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
              <p>{result.message}</p>
            </div>
            
            {result.substackUnsubscribeUrl && (
              <div className="mb-4">
                <a
                  href={result.substackUnsubscribeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Complete Substack Unsubscribe
                </a>
              </div>
            )}
            
            <button
              onClick={() => setResult(null)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Make Another Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

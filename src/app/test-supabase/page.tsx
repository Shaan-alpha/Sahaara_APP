'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Testing Supabase connection...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Check environment variables
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!hasUrl || !hasKey) {
        setStatus('error');
        setMessage('Missing environment variables!');
        setDetails({
          hasUrl,
          hasKey,
          url: hasUrl ? 'Set' : 'Missing',
          key: hasKey ? 'Set' : 'Missing',
        });
        return;
      }

      // Test simple query
      const { data, error } = await supabase
        .from('user_locations')
        .select('count')
        .limit(1);

      if (error) {
        setStatus('error');
        setMessage('Supabase query failed!');
        setDetails({
          error: error.message,
          hint: error.hint,
          code: error.code,
        });
      } else {
        setStatus('success');
        setMessage('Supabase connection successful!');
        setDetails({
          connection: 'OK',
          envVars: 'Loaded',
          database: 'Accessible',
        });
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('Connection test failed!');
      setDetails({
        error: err.message || 'Unknown error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Supabase Connection Test
        </h1>

        {/* Status Indicator */}
        <div className="mb-6 flex items-center justify-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              status === 'loading'
                ? 'bg-blue-100 text-blue-600'
                : status === 'success'
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {status === 'error' && (
              <svg
                className="w-8 h-8"
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
            )}
          </div>
        </div>

        {/* Message */}
        <p
          className={`text-center text-xl font-semibold mb-6 ${
            status === 'success'
              ? 'text-green-600'
              : status === 'error'
              ? 'text-red-600'
              : 'text-blue-600'
          }`}
        >
          {message}
        </p>

        {/* Details */}
        {details && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Details:</h2>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        {/* Environment Variables Check */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-3">Environment Variables:</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                  ? '✓ Set'
                  : '✗ Missing'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={testConnection}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Retest Connection
          </button>
          <a
            href="/"
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition text-center"
          >
            Back to Home
          </a>
        </div>

        {/* Troubleshooting */}
        {status === 'error' && (
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
            <h3 className="font-semibold mb-2">Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Verify .env.local file exists in project root</li>
              <li>Check NEXT_PUBLIC_SUPABASE_URL is set correctly</li>
              <li>Check NEXT_PUBLIC_SUPABASE_ANON_KEY is set correctly</li>
              <li>Restart the dev server (npm run dev)</li>
              <li>
                Make sure you ran the SQL schema in Supabase dashboard
              </li>
              <li>Check Supabase project is active</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { testFirebaseConnection } from '@/lib/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function TestFirebase() {
    const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
    const [message, setMessage] = useState('Testing Firebase connection...');

    useEffect(() => {
        const runTest = async () => {
            console.log('🔍 Starting Firebase connection test...');
            const result = await testFirebaseConnection();

            if (result) {
                setStatus('success');
                setMessage('Firebase connected successfully!');
            } else {
                setStatus('error');
                setMessage('Firebase connection failed. Check console for details.');
            }
        };

        runTest();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card p-12 max-w-2xl w-full">
                <h1 className="text-4xl font-bold mb-8 text-center gradient-text">
                    Firebase Connection Test
                </h1>

                <div className="flex flex-col items-center gap-6">
                    {/* Status Icon */}
                    <div className="text-6xl">
                        {status === 'testing' && (
                            <FontAwesomeIcon icon={faSpinner} className="text-primary animate-spin" />
                        )}
                        {status === 'success' && (
                            <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
                        )}
                        {status === 'error' && (
                            <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />
                        )}
                    </div>

                    {/* Status Message */}
                    <p className="text-2xl font-semibold text-center">
                        {message}
                    </p>

                    {/* Instructions */}
                    <div className="mt-8 p-6 bg-white/5 rounded-lg w-full">
                        <h2 className="text-xl font-bold mb-4">📋 Instructions:</h2>
                        <ol className="space-y-3 text-gray-300">
                            <li>1. Open your browser's Developer Console (F12)</li>
                            <li>2. Look for Firebase connection messages</li>
                            <li>3. If successful, you'll see: ✅ Firebase connected successfully!</li>
                            <li>4. If failed, follow the tips in the console to fix the issue</li>
                        </ol>
                    </div>

                    {/* Configuration Help */}
                    {status === 'error' && (
                        <div className="mt-6 p-6 bg-danger/10 border border-danger/30 rounded-lg w-full">
                            <h3 className="text-lg font-bold mb-3 text-danger">Common Issues:</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Make sure you've created a Firebase project</li>
                                <li>• Copy .env.example to .env.local</li>
                                <li>• Add your Firebase credentials to .env.local</li>
                                <li>• Enable Firestore Database in Firebase Console</li>
                                <li>• Set Firestore rules to test mode (allow read/write)</li>
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => window.location.reload()}
                            className="glass-card px-6 py-3 font-semibold hover:bg-primary/20 transition-all duration-300"
                        >
                            Test Again
                        </button>
                        <Link
                            href="/"
                            className="glass-card px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-300"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faMoneyBillWave,
  faChartLine,
  faHandHoldingDollar,
  faArrowRight,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { testFirebaseConnection } from '@/lib/firebase';

export default function Home() {
  // Test Firebase connection on component mount
  useEffect(() => {
    testFirebaseConnection();
  }, []);
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <div className="glass-card px-6 py-3">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-primary text-3xl" />
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Split Expenses
              <br />
              <span className="gradient-text">Made Simple</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Track shared expenses, settle debts, and manage group finances effortlessly.
              Perfect for roommates, trips, and friends.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="group glass-card px-8 py-4 text-lg font-semibold hover:bg-primary/20 transition-all duration-300 inline-flex items-center justify-center gap-3 animate-pulse-glow"
              >
                Get Started
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/signup"
                className="glass-card px-8 py-4 text-lg font-semibold hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faUsers} className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Create Groups</h3>
              <p className="text-gray-400">
                Organize expenses by creating groups for trips, households, or events.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Track Expenses</h3>
              <p className="text-gray-400">
                Add expenses and split them equally or customize the split.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faChartLine} className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">View Balances</h3>
              <p className="text-gray-400">
                See who owes what at a glance with clear balance summaries.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faHandHoldingDollar} className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Settle Up</h3>
              <p className="text-gray-400">
                Mark payments as settled and keep track of all transactions.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto glass-card p-12">
            <h2 className="text-4xl font-bold mb-8 text-center gradient-text">
              Why Choose Our Expense Tracker?
            </h2>

            <div className="space-y-6">
              {[
                'Real-time synchronization across all devices',
                'Secure Firebase backend for data protection',
                'Beautiful, intuitive interface',
                'No ads, completely free to use',
                'Perfect for roommates, trips, and group activities'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-success text-xl mt-1 flex-shrink-0" />
                  <p className="text-lg text-gray-300">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users managing their shared expenses effortlessly.
            </p>
            <Link
              href="/signup"
              className="glass-card px-10 py-5 text-xl font-semibold hover:bg-primary/20 transition-all duration-300 inline-flex items-center gap-3 animate-pulse-glow"
            >
              Start Tracking Now
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail('');
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1000);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative bg-gradient-to-r from-secondary-dark via-secondary to-secondary-light rounded-3xl p-8 lg:p-12 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Newsletter.
            </h2>
            <p className="text-lg lg:text-xl text-white/90 mb-8">
              Subscrible Our Newsletter For Discounts, Promo And Many More.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition disabled:opacity-50 flex-shrink-0"
              >
                {isSubmitting ? (
                  <Icon icon="mdi:loading" className="w-6 h-6 animate-spin" />
                ) : (
                  <Icon icon="mdi:send" className="w-6 h-6" />
                )}
              </button>
            </form>

            {isSuccess && (
              <p className="mt-4 text-white font-medium">
                ✓ Successfully subscribed!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


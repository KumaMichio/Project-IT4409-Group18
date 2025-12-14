'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

export function Hero() {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  return (
    <section className="relative bg-white py-12 lg:py-20 overflow-hidden">
      {/* Green Promotional Banner */}
      <div className="absolute top-0 left-0 right-0 bg-green-promo text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium z-10">
        <Icon icon="mdi:check-circle" className="w-5 h-5" />
        <span>GET 30% OFF ON FIRST ENROLL</span>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-midnight-text leading-tight">
                Learn Engineering From Top Experts
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 max-w-xl">
                Build Skills With Our Courses And Mentor From World-Class Companies.
              </p>
            </div>

            {/* Large Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search engineering courses..."
                className="w-full pl-6 pr-32 py-4 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-gray-300 transition-all text-base"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition"
              >
                <Icon icon="mdi:magnify" className="w-6 h-6" />
              </button>
            </form>

            {/* Features List */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:check-circle" className="w-6 h-6 text-secondary" />
                <span className="text-gray-700 font-medium">Flexible Schedules</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:check-circle" className="w-6 h-6 text-secondary" />
                <span className="text-gray-700 font-medium">Peer Support Community</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:check-circle" className="w-6 h-6 text-secondary" />
                <span className="text-gray-700 font-medium">Guided Learning Paths</span>
              </div>
            </div>
          </div>

          {/* Right Column - Illustration with Overlays */}
          <div className="relative hidden lg:block">
            {/* Main Illustration Placeholder */}
            <div className="relative w-full h-[500px] bg-gradient-to-br from-primary-light to-secondary-light rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <Icon icon="mdi:school" className="w-32 h-32 text-primary mx-auto" />
                <p className="text-gray-600">Illustration Placeholder</p>
              </div>
            </div>

            {/* Overlay: 50+ Available courses */}
            <div className="absolute top-8 left-8 bg-secondary text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
              <span className="font-semibold">50+ Available courses</span>
            </div>

            {/* Overlay: No of students chart */}
            <div className="absolute bottom-8 right-8 bg-white px-4 py-3 rounded-lg shadow-lg">
              <p className="text-sm text-gray-600 mb-2">No of students</p>
              <div className="flex items-end gap-1 h-16">
                <div className="w-4 bg-secondary rounded-t" style={{ height: '40%' }}></div>
                <div className="w-4 bg-primary rounded-t" style={{ height: '70%' }}></div>
                <div className="w-4 bg-green-promo rounded-t" style={{ height: '50%' }}></div>
                <div className="w-4 bg-yellow-400 rounded-t" style={{ height: '90%' }}></div>
                <div className="w-4 bg-secondary rounded-t" style={{ height: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


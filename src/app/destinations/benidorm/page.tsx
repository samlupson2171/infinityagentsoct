'use client';

import Link from 'next/link';
import { useState } from 'react';

// Section Components
function OverviewSection() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome to Benidorm</h2>
      <p className="text-lg text-gray-700 mb-4">
        Benidorm is Spain&apos;s most popular beach resort destination, offering stunning beaches, vibrant nightlife, and endless entertainment options.
      </p>
    </div>
  );
}

function AccommodationSection() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Hotels & Resorts</h2>
      <p className="text-lg text-gray-700 mb-4">
        Choose from a wide range of accommodation options in Benidorm.
      </p>
    </div>
  );
}

function AttractionsSection() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Attractions</h2>
      <p className="text-lg text-gray-700 mb-4">
        Discover the best attractions and activities in Benidorm.
      </p>
    </div>
  );
}

function BeachesSection() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Beaches</h2>
      <p className="text-lg text-gray-700 mb-4">
        Enjoy the beautiful beaches of Benidorm.
      </p>
    </div>
  );
}

function NightlifeSection() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Nightlife</h2>
      <p className="text-lg text-gray-700 mb-4">
        Experience the vibrant nightlife scene in Benidorm.
      </p>
    </div>
  );
}

function DiningSection() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Dining</h2>
      <p className="text-lg text-gray-700 mb-4">
        Discover the best restaurants and dining options.
      </p>
    </div>
  );
}

function PracticalSection() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Practical Information</h2>
      <p className="text-lg text-gray-700 mb-4">
        Essential information for your trip to Benidorm.
      </p>
    </div>
  );
}

export default function BenidormPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: 'Overview', icon: '🏖️' },
    { id: 'accommodation', name: 'Hotels & Resorts', icon: '🏨' },
    { id: 'attractions', name: 'Attractions', icon: '🎢' },
    { id: 'beaches', name: 'Beaches', icon: '🏄‍♂️' },
    { id: 'nightlife', name: 'Nightlife', icon: '🌙' },
    { id: 'dining', name: 'Dining', icon: '🍽️' },
    { id: 'practical', name: 'Practical Info', icon: 'ℹ️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-orange-500">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <nav className="mb-4">
              <Link
                href="/destinations"
                className="text-blue-200 hover:text-white"
              >
                Destinations
              </Link>
              <span className="mx-2">/</span>
              <span>Benidorm</span>
            </nav>
            <h1 className="text-5xl font-bold mb-4">Benidorm</h1>
            <p className="text-xl text-blue-100 max-w-2xl">
              Spain's premier beach resort destination on the Costa Blanca
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                📍 Costa Blanca, Spain
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                ✈️ 2.5 hours from UK
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                ☀️ 300+ days of sunshine
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Explore Benidorm
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                      activeSection === section.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {activeSection === 'overview' && <OverviewSection />}
              {activeSection === 'accommodation' && <AccommodationSection />}
              {activeSection === 'attractions' && <AttractionsSection />}
              {activeSection === 'beaches' && <BeachesSection />}
              {activeSection === 'nightlife' && <NightlifeSection />}
              {activeSection === 'dining' && <DiningSection />}
              {activeSection === 'practical' && <PracticalSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

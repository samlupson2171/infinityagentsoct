'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

interface Booking {
  _id: string;
  quoteReference: string;
  title: string;
  destination: string;
  leadName: string;
  hotelName: string;
  numberOfPeople: number;
  numberOfRooms: number;
  numberOfNights: number;
  arrivalDate: string;
  totalPrice: number;
  currency: string;
  whatsIncluded: string;
  transferIncluded: boolean;
  selectedEvents: any[];
  linkedPackage: any;
  status: string;
  emailSentAt: string;
  tripType: string;
  accommodationType: string;
  boardType: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agent/bookings')
      .then(r => r.json())
      .then(data => setBookings(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sym = (c: string) => c === 'GBP' ? '£' : c === 'EUR' ? '€' : '$';
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">← Back to Dashboard</Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">My Bookings</h1>
              <p className="text-gray-500 text-sm mt-1">View your confirmed holiday quotes and download itineraries</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                  <div className="h-5 bg-gray-100 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-6"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-12 bg-gray-50 rounded-lg"></div>
                    <div className="h-12 bg-gray-50 rounded-lg"></div>
                    <div className="h-12 bg-gray-50 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No bookings yet</h3>
              <p className="text-gray-500 text-sm mt-2">Once you submit an enquiry and receive a quote, your bookings will appear here.</p>
              <Link href="/enquiries" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium mt-6 transition-all">
                Send an Enquiry
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map(b => (
                <Link key={b._id} href={`/dashboard/bookings/${b._id}`} className="block group">
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-400 text-xs font-medium">{b.quoteReference}</p>
                          <h3 className="text-white font-semibold mt-0.5">{b.title || b.leadName}</h3>
                        </div>
                        <p className="text-white font-bold text-lg">{sym(b.currency)}{b.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {b.destination} · {b.hotelName}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-gray-900">{b.numberOfPeople}</p>
                          <p className="text-xs text-gray-500">Guests</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-gray-900">{b.numberOfNights}</p>
                          <p className="text-xs text-gray-500">Nights</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-gray-900">{fmtDate(b.arrivalDate)}</p>
                          <p className="text-xs text-gray-500">Arrival</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Sent {fmtDate(b.emailSentAt)}</span>
                        <span className="text-sm text-orange-600 font-medium group-hover:translate-x-1 transition-transform">View details →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

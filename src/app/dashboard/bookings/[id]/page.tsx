'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

interface BookingDetail {
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
  selectedEvents: Array<{ eventName: string; eventPrice: number; eventCurrency: string; pricePerPerson: boolean }>;
  linkedPackage: any;
  status: string;
  emailSentAt: string;
  tripType: string;
  accommodationType: string;
  boardType: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/agent/bookings')
      .then(r => r.json())
      .then(data => {
        const found = (data.data || []).find((b: any) => b._id === params.id);
        setBooking(found || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const downloadItinerary = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/agent/bookings/${params.id}/itinerary`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `itinerary-${booking?.leadName?.replace(/\s+/g, '-').toLowerCase() || 'booking'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const sym = (c: string) => c === 'GBP' ? '£' : c === 'EUR' ? '€' : '$';
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const shortDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!booking) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Booking not found</h2>
            <Link href="/dashboard/bookings" className="text-orange-600 mt-2 inline-block">← Back to bookings</Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const arrivalDate = new Date(booking.arrivalDate);
  const departureDate = new Date(arrivalDate);
  departureDate.setDate(departureDate.getDate() + booking.numberOfNights);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/dashboard/bookings" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">← Back to Bookings</Link>
            <button
              onClick={downloadItinerary}
              disabled={downloading}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {downloading ? 'Downloading...' : 'Download Itinerary'}
            </button>
          </div>

          {/* Header Card */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">{booking.quoteReference}</p>
                <h1 className="text-2xl font-bold mt-1">{booking.title || booking.leadName}&apos;s Trip</h1>
                <p className="text-gray-400 mt-1">{booking.destination} · {booking.hotelName}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Total Price</p>
                <p className="text-3xl font-bold text-orange-400">{sym(booking.currency)}{booking.totalPrice.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{sym(booking.currency)}{Math.round(booking.totalPrice / booking.numberOfPeople)} per person</p>
              </div>
            </div>
          </div>

          {/* Trip Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{booking.numberOfPeople}</p>
              <p className="text-xs text-gray-500 mt-1">Guests</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{booking.numberOfNights}</p>
              <p className="text-xs text-gray-500 mt-1">Nights</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{booking.numberOfRooms}</p>
              <p className="text-xs text-gray-500 mt-1">Rooms</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-sm font-semibold text-gray-900 capitalize">{booking.tripType || 'Holiday'}</p>
              <p className="text-xs text-gray-500 mt-1">Trip Type</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Arrival</p>
                  <p className="font-semibold text-gray-900">{fmtDate(booking.arrivalDate)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Departure</p>
                  <p className="font-semibold text-gray-900">{fmtDate(departureDate.toISOString())}</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Included */}
          {booking.whatsIncluded && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Included</h2>
              <div className="prose prose-sm text-gray-600 whitespace-pre-line">{booking.whatsIncluded}</div>
              {booking.transferIncluded && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-emerald-700 text-sm font-medium">Airport transfers included</span>
                </div>
              )}
            </div>
          )}

          {/* Events */}
          {booking.selectedEvents?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Events & Activities</h2>
              <div className="space-y-3">
                {booking.selectedEvents.map((event, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                        <span className="text-sm">🎉</span>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{event.eventName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{sym(event.eventCurrency || booking.currency)}{event.eventPrice}</p>
                      <p className="text-xs text-gray-500">{event.pricePerPerson ? 'per person' : 'flat rate'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package Details */}
          {booking.linkedPackage && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Package Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Package</p>
                  <p className="font-medium text-gray-900">{booking.linkedPackage.packageName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Group Size</p>
                  <p className="font-medium text-gray-900">{booking.linkedPackage.selectedTier?.tierLabel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Period</p>
                  <p className="font-medium text-gray-900">{booking.linkedPackage.selectedPeriod || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Accommodation Info */}
          {(booking.accommodationType || booking.boardType) && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Accommodation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {booking.accommodationType && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                    <p className="font-medium text-gray-900 capitalize">{booking.accommodationType}</p>
                  </div>
                )}
                {booking.boardType && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Board</p>
                    <p className="font-medium text-gray-900 capitalize">{booking.boardType}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quote sent info */}
          <div className="text-center text-sm text-gray-400 mt-8 pb-8">
            Quote sent on {shortDate(booking.emailSentAt)}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

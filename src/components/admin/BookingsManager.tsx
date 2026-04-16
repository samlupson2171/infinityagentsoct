'use client';

import { useState, useEffect, useCallback } from 'react';

interface Booking {
  _id: string;
  quoteReference: string;
  leadName: string;
  destination: string;
  hotelName: string;
  numberOfPeople: number;
  numberOfRooms: number;
  numberOfNights: number;
  arrivalDate: string;
  totalPrice: number;
  currency: string;
  status: string;
  tripType: string;
  agentEmail: string;
  createdAt: string;
  updatedAt: string;
  whatsIncluded: string;
  transferIncluded: boolean;
  selectedEvents: Array<{ eventName: string; eventPrice: number; eventCurrency: string; pricePerPerson: boolean }>;
}

export default function BookingsManager() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [counts, setCounts] = useState({ pending: 0, confirmed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [tab, setTab] = useState<'pending' | 'confirmed'>('pending');

  const sym = (c: string) => (c === 'GBP' ? '£' : c === 'EUR' ? '€' : '$');
  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setPendingBookings(data.data.pendingConfirmation || []);
        setConfirmedBookings(data.data.confirmed || []);
        setCounts(data.data.counts || { pending: 0, confirmed: 0, total: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleConfirmBooking = async (quoteId: string) => {
    setConfirming(quoteId);
    try {
      const response = await fetch(`/api/admin/bookings/${quoteId}/confirm`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchBookings();
        setSelectedBooking(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to confirm booking');
      }
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      alert('Failed to confirm booking');
    } finally {
      setConfirming(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayBookings = tab === 'pending' ? pendingBookings : confirmedBookings;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{counts.pending}</p>
          <p className="text-sm text-gray-600">Awaiting Confirmation</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{counts.confirmed}</p>
          <p className="text-sm text-gray-600">Confirmed Bookings</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{counts.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTab('pending')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'pending'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Awaiting Confirmation
            {counts.pending > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-600 text-xs font-bold rounded-full px-2 py-0.5">
                {counts.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('confirmed')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'confirmed'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Confirmed Bookings
            {counts.confirmed > 0 && (
              <span className="ml-2 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full px-2 py-0.5">
                {counts.confirmed}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Booking List */}
      {displayBookings.length === 0 ? (
        <div className="bg-white rounded-lg border p-10 text-center">
          <p className="text-gray-400">
            {tab === 'pending'
              ? 'No bookings awaiting confirmation'
              : 'No confirmed bookings yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayBookings.map((booking) => (
            <div
              key={booking._id}
              onClick={() => setSelectedBooking(booking)}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      booking.status === 'accepted'
                        ? 'bg-orange-50'
                        : 'bg-emerald-50'
                    }`}
                  >
                    <span className="text-lg">
                      {booking.status === 'accepted' ? '⏳' : '✅'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {booking.leadName}
                      </p>
                      <span className="text-xs text-gray-400">
                        {booking.quoteReference}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {booking.destination} · {booking.hotelName} ·{' '}
                      {booking.numberOfPeople} guests · {booking.numberOfNights}N
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Agent: {booking.agentEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {sym(booking.currency)}
                      {booking.totalPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fmtDate(booking.arrivalDate)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      booking.status === 'accepted'
                        ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20'
                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                    }`}
                  >
                    {booking.status === 'accepted'
                      ? 'Awaiting Confirmation'
                      : 'Confirmed'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedBooking.leadName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedBooking.quoteReference} · {selectedBooking.destination}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Hotel</p>
                  <p className="font-medium text-gray-900">{selectedBooking.hotelName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Trip Type</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedBooking.tripType || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Guests</p>
                  <p className="font-medium text-gray-900">{selectedBooking.numberOfPeople}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Rooms</p>
                  <p className="font-medium text-gray-900">{selectedBooking.numberOfRooms}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Nights</p>
                  <p className="font-medium text-gray-900">{selectedBooking.numberOfNights}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Arrival</p>
                  <p className="font-medium text-gray-900">{fmtDate(selectedBooking.arrivalDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Price</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {sym(selectedBooking.currency)}{selectedBooking.totalPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Agent</p>
                  <p className="font-medium text-gray-900">{selectedBooking.agentEmail}</p>
                </div>
              </div>

              {selectedBooking.whatsIncluded && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">What&apos;s Included</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-3">
                    {selectedBooking.whatsIncluded}
                  </p>
                </div>
              )}

              {selectedBooking.transferIncluded && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span className="text-sm text-emerald-700 font-medium">Airport transfers included</span>
                </div>
              )}

              {selectedBooking.selectedEvents?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Events & Activities</p>
                  <div className="space-y-2">
                    {selectedBooking.selectedEvents.map((event, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-900">{event.eventName}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {sym(event.eventCurrency || selectedBooking.currency)}{event.eventPrice}
                          {event.pricePerPerson ? ' pp' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              {selectedBooking.status === 'accepted' && (
                <button
                  onClick={() => handleConfirmBooking(selectedBooking._id)}
                  disabled={confirming === selectedBooking._id}
                  className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors"
                >
                  {confirming === selectedBooking._id ? 'Confirming...' : '✓ Confirm Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

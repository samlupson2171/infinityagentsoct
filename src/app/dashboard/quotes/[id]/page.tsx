'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

interface QuoteDetail {
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
  createdAt: string;
  tripType: string;
  accommodationType: string;
  boardType: string;
}

export default function QuoteDetailPage() {
  const params = useParams();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    fetch('/api/agent/quotes')
      .then(r => r.json())
      .then(data => {
        const found = (data.data || []).find((q: any) => q._id === params.id);
        setQuote(found || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const sym = (c: string) => c === 'GBP' ? '£' : c === 'EUR' ? '€' : '$';

  const handleAcceptQuote = async () => {
    if (!quote) return;
    if (!confirm('Are you sure you want to accept this quote and proceed with booking?')) return;
    setAccepting(true);
    try {
      const response = await fetch(`/api/agent/quotes/${quote._id}/accept`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setAccepted(true);
      } else {
        alert(data.error || 'Failed to accept quote');
      }
    } catch {
      alert('Failed to accept quote. Please try again.');
    } finally {
      setAccepting(false);
    }
  };
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return '—'; }
  };
  const shortDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return '—'; }
  };

  if (loading) {
    return (<ProtectedRoute><div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div></div></ProtectedRoute>);
  }

  if (!quote) {
    return (<ProtectedRoute><div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center"><div className="text-center"><h2 className="text-xl font-semibold text-gray-900">Quote not found</h2><Link href="/dashboard" className="text-orange-600 mt-2 inline-block">← Back to dashboard</Link></div></div></ProtectedRoute>);
  }

  const arrivalDate = new Date(quote.arrivalDate);
  const departureDate = new Date(arrivalDate);
  departureDate.setDate(departureDate.getDate() + quote.numberOfNights);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">← Back to Dashboard</Link>

          <div className="mt-4 mb-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 px-2.5 py-0.5 text-xs font-medium">Quote</span>
            <span className="text-sm text-gray-400">{quote.quoteReference}</span>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{quote.title || quote.leadName}&apos;s Trip</h1>
                <p className="text-gray-400 mt-1">{quote.destination} · {quote.hotelName}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Quoted Price</p>
                <p className="text-3xl font-bold text-orange-400">{sym(quote.currency)}{quote.totalPrice.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{sym(quote.currency)}{Math.round(quote.totalPrice / quote.numberOfPeople)} per person</p>
              </div>
            </div>
          </div>

          {/* Trip stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Guests', value: quote.numberOfPeople },
              { label: 'Nights', value: quote.numberOfNights },
              { label: 'Rooms', value: quote.numberOfRooms },
              { label: 'Trip Type', value: (quote.tripType || 'Holiday').charAt(0).toUpperCase() + (quote.tripType || 'holiday').slice(1) },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
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
                  <p className="font-semibold text-gray-900">{fmtDate(quote.arrivalDate)}</p>
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
          {quote.whatsIncluded && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Included</h2>
              <div className="prose prose-sm text-gray-600 whitespace-pre-line">{quote.whatsIncluded}</div>
              {quote.transferIncluded && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-emerald-700 text-sm font-medium">Airport transfers included</span>
                </div>
              )}
            </div>
          )}

          {/* Events */}
          {quote.selectedEvents?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Events & Activities</h2>
              <div className="space-y-3">
                {quote.selectedEvents.map((event, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><span className="text-sm">🎉</span></div>
                      <span className="font-medium text-gray-900 text-sm">{event.eventName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{sym(event.eventCurrency || quote.currency)}{event.eventPrice}</p>
                      <p className="text-xs text-gray-500">{event.pricePerPerson ? 'per person' : 'flat rate'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package */}
          {quote.linkedPackage && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Package Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Package</p><p className="font-medium text-gray-900">{quote.linkedPackage.packageName}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Group Size</p><p className="font-medium text-gray-900">{quote.linkedPackage.selectedTier?.tierLabel || 'N/A'}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Period</p><p className="font-medium text-gray-900">{quote.linkedPackage.selectedPeriod || 'N/A'}</p></div>
              </div>
            </div>
          )}

          {/* Accept / Status */}
          {accepted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-emerald-900">Quote Accepted</h3>
              <p className="text-sm text-emerald-700 mt-1">The Infinity Weekends team will confirm your booking shortly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Ready to book?</h3>
                <p className="text-orange-100 text-sm mb-4">Accept this quote to proceed with the booking. The admin team will then confirm it.</p>
                <button
                  onClick={handleAcceptQuote}
                  disabled={accepting}
                  className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  {accepting ? 'Accepting...' : '✓ Accept Quote & Book'}
                </button>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Have questions? Contact us: 📞 0800 994 9934 · ✉️ emma@infinityweekends.co.uk</p>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-400 mt-6 pb-8">
            Quote received {shortDate(quote.emailSentAt || quote.createdAt)}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

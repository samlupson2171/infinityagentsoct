'use client';

import { useState, useEffect, useCallback } from 'react';

interface OverviewData {
  counts: {
    enquiries: { total: number; new: number; inProgress: number; withoutQuotes: number; thisWeek: number };
    quotes: { total: number; draft: number; sent: number; accepted: number; booked: number; thisWeek: number };
    users: { total: number; pendingApproval: number };
  };
  revenue: { confirmed: number; pipeline: number };
  recent: {
    newEnquiries: Array<{
      _id: string; leadName: string; destination: string; tripType: string;
      guests: number; nights: number; travelDate: string; agentEmail: string; createdAt: string;
    }>;
    quotesToFollowUp: Array<{
      _id: string; quoteReference: string; leadName: string; destination: string;
      hotelName: string; totalPrice: number; currency: string; agentEmail: string; sentAt: string;
    }>;
    pendingBookings: Array<{
      _id: string; quoteReference: string; leadName: string; destination: string;
      hotelName: string; totalPrice: number; currency: string; numberOfPeople: number;
      numberOfNights: number; arrivalDate: string; agentEmail: string; acceptedAt: string;
    }>;
    confirmedBookings: Array<{
      _id: string; quoteReference: string; leadName: string; destination: string;
      hotelName: string; totalPrice: number; currency: string; arrivalDate: string;
      agentEmail: string; confirmedAt: string;
    }>;
  };
}

interface AdminOverviewProps {
  onNavigate: (tab: string) => void;
}

export default function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const sym = (c: string) => (c === 'GBP' ? '£' : c === 'EUR' ? '€' : '$');
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return '—'; }
  };
  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };
  const tripIcon = (t: string) => t === 'stag' ? '🎩' : t === 'hen' ? '👑' : '✈️';

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/overview');
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch overview:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirmBooking = async (quoteId: string) => {
    setConfirmingId(quoteId);
    try {
      const response = await fetch(`/api/admin/bookings/${quoteId}/confirm`, { method: 'POST' });
      if (response.ok) {
        fetchData();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to confirm booking');
      }
    } catch { alert('Failed to confirm booking'); }
    finally { setConfirmingId(null); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
              <div className="space-y-3">{[1, 2, 3].map(j => <div key={j} className="h-12 bg-gray-100 rounded" />)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center text-gray-500 py-12">Failed to load overview data</div>;

  const { counts, revenue, recent } = data;

  return (
    <div className="space-y-6">
      {/* Action-required banner */}
      {(counts.enquiries.new > 0 || counts.quotes.accepted > 0 || counts.users.pendingApproval > 0) && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-sm">Action needed:</span>
            {counts.enquiries.new > 0 && (
              <button onClick={() => onNavigate('enquiries')} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                {counts.enquiries.new} new {counts.enquiries.new === 1 ? 'enquiry' : 'enquiries'}
              </button>
            )}
            {counts.quotes.accepted > 0 && (
              <button onClick={() => onNavigate('bookings')} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                {counts.quotes.accepted} {counts.quotes.accepted === 1 ? 'booking' : 'bookings'} to confirm
              </button>
            )}
            {counts.users.pendingApproval > 0 && (
              <button onClick={() => onNavigate('approvals')} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                {counts.users.pendingApproval} user {counts.users.pendingApproval === 1 ? 'approval' : 'approvals'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => onNavigate('enquiries')} className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-orange-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold text-gray-900">{counts.enquiries.new}</span>
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-sm text-gray-500">New Enquiries</p>
          <p className="text-xs text-orange-600 mt-1">{counts.enquiries.withoutQuotes} awaiting quote</p>
        </button>

        <button onClick={() => onNavigate('quotes')} className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-orange-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold text-gray-900">{counts.quotes.sent}</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-sm text-gray-500">Quotes Sent</p>
          <p className="text-xs text-blue-600 mt-1">{counts.quotes.draft} in draft</p>
        </button>

        <button onClick={() => onNavigate('bookings')} className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-orange-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold text-gray-900">{counts.quotes.accepted}</span>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-sm text-gray-500">Awaiting Confirmation</p>
          <p className="text-xs text-emerald-600 mt-1">{counts.quotes.booked} confirmed</p>
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold text-gray-900">£{revenue.confirmed.toLocaleString()}</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-sm text-gray-500">Confirmed Revenue</p>
          <p className="text-xs text-purple-600 mt-1">£{revenue.pipeline.toLocaleString()} in pipeline</p>
        </div>
      </div>

      {/* This week summary */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 text-white">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">This Week</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold">{counts.enquiries.thisWeek}</p>
            <p className="text-sm text-gray-400">New Enquiries</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{counts.quotes.thisWeek}</p>
            <p className="text-sm text-gray-400">Quotes Sent</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{counts.quotes.booked}</p>
            <p className="text-sm text-gray-400">Total Bookings</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{counts.users.total}</p>
            <p className="text-sm text-gray-400">Active Agents</p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bookings Awaiting Confirmation */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Bookings to Confirm</h3>
              {recent.pendingBookings.length > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs font-bold rounded-full px-2 py-0.5">
                  {recent.pendingBookings.length}
                </span>
              )}
            </div>
            <button onClick={() => onNavigate('bookings')} className="text-sm text-gray-500 hover:text-orange-600 font-medium">View all →</button>
          </div>
          {recent.pendingBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No bookings awaiting confirmation</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.pendingBookings.map(b => (
                <div key={b._id} className="px-5 py-3.5 hover:bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{b.leadName}</p>
                        <span className="text-xs text-gray-400">{b.quoteReference}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{b.destination} · {b.hotelName} · {b.numberOfPeople} guests</p>
                      <p className="text-xs text-gray-400">{b.agentEmail} · {timeAgo(b.acceptedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span className="text-sm font-semibold text-gray-900">{sym(b.currency)}{b.totalPrice.toLocaleString()}</span>
                      <button
                        onClick={() => handleConfirmBooking(b._id)}
                        disabled={confirmingId === b._id}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {confirmingId === b._id ? '...' : '✓ Confirm'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Enquiries */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">New Enquiries</h3>
              {recent.newEnquiries.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold rounded-full px-2 py-0.5">
                  {recent.newEnquiries.length}
                </span>
              )}
            </div>
            <button onClick={() => onNavigate('enquiries')} className="text-sm text-gray-500 hover:text-orange-600 font-medium">View all →</button>
          </div>
          {recent.newEnquiries.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No new enquiries</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.newEnquiries.map(e => (
                <button key={e._id} onClick={() => onNavigate('enquiries')} className="w-full text-left px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">{tripIcon(e.tripType)}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{e.leadName}</p>
                        <p className="text-xs text-gray-500 truncate">{e.destination} · {e.guests} guests · {e.nights}N · {fmtDate(e.travelDate)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-xs text-gray-400">{timeAgo(e.createdAt)}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">{e.agentEmail}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quotes to Follow Up */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Quotes Sent — Follow Up</h3>
              {recent.quotesToFollowUp.length > 0 && (
                <span className="bg-purple-100 text-purple-700 text-xs font-bold rounded-full px-2 py-0.5">
                  {recent.quotesToFollowUp.length}
                </span>
              )}
            </div>
            <button onClick={() => onNavigate('quotes')} className="text-sm text-gray-500 hover:text-orange-600 font-medium">View all →</button>
          </div>
          {recent.quotesToFollowUp.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No quotes awaiting response</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.quotesToFollowUp.map(q => (
                <button key={q._id} onClick={() => onNavigate('quotes')} className="w-full text-left px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{q.leadName}</p>
                        <span className="text-xs text-gray-400">{q.quoteReference}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{q.destination} · {q.hotelName}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-semibold text-gray-900">{sym(q.currency)}{q.totalPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Sent {timeAgo(q.sentAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Confirmed Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
              {counts.quotes.booked > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full px-2 py-0.5">
                  {counts.quotes.booked}
                </span>
              )}
            </div>
            <button onClick={() => onNavigate('bookings')} className="text-sm text-gray-500 hover:text-orange-600 font-medium">View all →</button>
          </div>
          {recent.confirmedBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No confirmed bookings yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.confirmedBookings.map(b => (
                <button key={b._id} onClick={() => onNavigate('bookings')} className="w-full text-left px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">✅</span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{b.leadName}</p>
                        <p className="text-xs text-gray-500 truncate">{b.destination} · {b.hotelName} · {fmtDate(b.arrivalDate)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-semibold text-gray-900">{sym(b.currency)}{b.totalPrice.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600">Confirmed {timeAgo(b.confirmedAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

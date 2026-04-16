'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

interface Enquiry {
  _id: string;
  leadName: string;
  tripType: string;
  firstChoiceDestination: string;
  secondChoiceDestination?: string;
  travelDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  accommodationType: string;
  boardType: string;
  budgetPerPerson: number;
  status: string;
  hasQuotes: boolean;
  quotesCount: number;
  createdAt: string;
  additionalNotes?: string;
  quotes?: Array<{ _id: string; status: string }>;
}

export default function AgentEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/agent/enquiries')
      .then(r => r.json())
      .then(data => setEnquiries(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const filtered = filter === 'all' ? enquiries : enquiries.filter(e => {
    if (filter === 'quoted') return !!sentQuote(e);
    if (filter === 'pending') return !sentQuote(e);
    return e.status === filter;
  });

  const sentQuote = (enq: Enquiry) => enq.quotes?.find(q => q.status === 'sent' || q.status === 'updated');

  const statusBadge = (enq: Enquiry) => {
    if (sentQuote(enq)) return { label: 'Quote Ready', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' };
    if (enq.hasQuotes) return { label: 'In Review', cls: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20' };
    const map: Record<string, { label: string; cls: string }> = {
      'new': { label: 'Submitted', cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20' },
      'in-progress': { label: 'In Progress', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' },
      'completed': { label: 'Completed', cls: 'bg-green-50 text-green-700 ring-1 ring-green-600/20' },
    };
    return map[enq.status] || { label: enq.status, cls: 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20' };
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">← Back to Dashboard</Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">My Enquiries</h1>
              <p className="text-gray-500 text-sm mt-1">Track all your submitted enquiries</p>
            </div>
            <Link href="/enquiries" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Enquiry
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {[
              { key: 'all', label: 'All', count: enquiries.length },
              { key: 'pending', label: 'Awaiting Quote', count: enquiries.filter(e => !sentQuote(e)).length },
              { key: 'quoted', label: 'Quote Ready', count: enquiries.filter(e => !!sentQuote(e)).length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab.label} <span className="ml-1 text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-100 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No enquiries found</h3>
              <p className="text-gray-500 text-sm mt-2">Submit your first enquiry to get started.</p>
              <Link href="/enquiries" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium mt-6 text-sm transition-all">
                Send an Enquiry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(enq => {
                const badge = statusBadge(enq);
                const sq = sentQuote(enq);
                const Wrapper = sq ? Link : 'div' as any;
                const wrapperProps = sq ? { href: `/dashboard/quotes/${sq._id}` } : {};
                return (
                  <Wrapper key={enq._id} {...wrapperProps} className={`block bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 hover:shadow-sm transition-all ${sq ? 'cursor-pointer' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">{enq.tripType === 'stag' ? '🎩' : enq.tripType === 'hen' ? '👑' : '✈️'}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{enq.leadName}</h3>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {enq.firstChoiceDestination}{enq.secondChoiceDestination ? ` / ${enq.secondChoiceDestination}` : ''} · {enq.numberOfGuests} guests · {enq.numberOfNights} nights
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>Travel: {fmtDate(enq.travelDate)}</span>
                            <span>Budget: £{enq.budgetPerPerson}pp</span>
                            <span>Submitted: {fmtDate(enq.createdAt)}</span>
                            {enq.quotesCount > 0 && <span className="text-emerald-600 font-medium">{enq.quotesCount} quote{enq.quotesCount > 1 ? 's' : ''}</span>}
                          </div>
                        </div>
                      </div>
                      {sq && (
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <span className="text-sm text-orange-600 font-medium">View quote</span>
                          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      )}
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

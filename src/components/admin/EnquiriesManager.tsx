'use client';

import { useState, useEffect } from 'react';
import { IEnquiry } from '@/models/Enquiry';
import QuoteForm from './QuoteForm';

interface EnquiryWithId
  extends Omit<
    IEnquiry,
    | '_id'
    | 'submittedBy'
    | 'quotes'
    | 'hasQuotes'
    | 'quotesCount'
    | 'latestQuoteDate'
  > {
  _id: string;
  submittedBy?: {
    _id: string;
    name: string;
    companyName: string;
    contactEmail: string;
  };
  quotes?: Array<{
    _id: string;
    title?: string;
    destination?: string;
    leadName?: string;
    hotelName?: string;
    numberOfPeople?: number;
    numberOfNights?: number;
    arrivalDate?: string;
    status: 'draft' | 'sent' | 'updated' | 'booked';
    totalPrice: number;
    currency: string;
    createdAt: string;
    version: number;
  }>;
  hasQuotes?: boolean;
  quotesCount?: number;
  latestQuoteDate?: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalEnquiries: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface EnquiriesManagerProps {
  className?: string;
}

export default function EnquiriesManager({
  className = '',
}: EnquiriesManagerProps) {
  const [enquiries, setEnquiries] = useState<EnquiryWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryWithId | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'new' | 'in-progress' | 'completed'
  >('all');
  const [quotesFilter, setQuotesFilter] = useState<
    'all' | 'with-quotes' | 'without-quotes'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateQuoteModal, setShowCreateQuoteModal] = useState(false);
  const [selectedEnquiryForQuote, setSelectedEnquiryForQuote] =
    useState<EnquiryWithId | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, quotesFilter, searchTerm, currentPage]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(quotesFilter === 'with-quotes' && { hasQuotes: 'true' }),
        ...(quotesFilter === 'without-quotes' && { hasQuotes: 'false' }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/enquiries?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch enquiries');
      }

      setEnquiries(data.data.enquiries);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    enquiryId: string,
    newStatus: 'new' | 'in-progress' | 'completed'
  ) => {
    try {
      setActionLoading(enquiryId);
      const response = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || 'Failed to update enquiry status'
        );
      }

      fetchEnquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmBooking = async (quoteId: string) => {
    try {
      setActionLoading(quoteId);
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'booked' }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to confirm booking');
      }
      fetchEnquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendQuote = async (quoteId: string) => {
    try {
      setActionLoading(`send-${quoteId}`);
      const response = await fetch(`/api/admin/quotes/${quoteId}/send`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || data.error || 'Failed to send quote');
      }
      fetchEnquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      setActionLoading(`del-${quoteId}`);
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to delete quote');
      }
      fetchEnquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateQuoteStatus = async (quoteId: string, newStatus: string) => {
    try {
      setActionLoading(`status-${quoteId}`);
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to update quote status');
      }
      fetchEnquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateQuote = (enquiry: EnquiryWithId) => {
    setSelectedEnquiryForQuote(enquiry);
    setShowCreateQuoteModal(true);
  };

  const handleQuoteCreated = async (quoteData: any) => {
    try {
      const response = await fetch(
        `/api/admin/enquiries/${selectedEnquiryForQuote?._id}/quotes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quoteData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create quote');
      }

      setShowCreateQuoteModal(false);
      setSelectedEnquiryForQuote(null);
      fetchEnquiries();
    } catch (err) {
      throw err; // Let the form handle the error
    }
  };

  const openDetailsModal = (enquiry: EnquiryWithId) => {
    setSelectedEnquiry(enquiry);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedEnquiry(null);
    setShowDetailsModal(false);
  };

  const closeCreateQuoteModal = () => {
    setSelectedEnquiryForQuote(null);
    setShowCreateQuoteModal(false);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTripType = (type: string) => {
    switch (type) {
      case 'stag':
        return 'Stag Do';
      case 'hen':
        return 'Hen Do';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-orange-100 text-orange-800';
      case 'booked':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'N/A';
    }
    const symbols = { GBP: '£', EUR: '€', USD: '$' };
    return `${symbols[currency as keyof typeof symbols] || currency}${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading enquiries...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Enquiries Management
            </h3>
            <button
              onClick={fetchEnquiries}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value as
                      | 'all'
                      | 'new'
                      | 'in-progress'
                      | 'completed'
                  );
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Enquiries</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={quotesFilter}
                onChange={(e) => {
                  setQuotesFilter(
                    e.target.value as 'all' | 'with-quotes' | 'without-quotes'
                  );
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Enquiries</option>
                <option value="with-quotes">With Quotes</option>
                <option value="without-quotes">Without Quotes</option>
              </select>
            </div>

            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enquiries Table */}
          {enquiries.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No enquiries found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? `No enquiries found matching "${searchTerm}".`
                  : statusFilter === 'all'
                    ? 'No enquiries have been submitted yet.'
                    : `No ${statusFilter.replace('-', ' ')} enquiries found.`}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enquiry Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quotes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enquiries.map((enquiry) => (
                      <tr key={enquiry._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enquiry.leadName} -{' '}
                              {formatTripType(enquiry.tripType)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enquiry.firstChoiceDestination}{enquiry.resort ? ` • ${enquiry.resort}` : ''} •{' '}
                              {formatDate(enquiry.travelDate)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {enquiry.numberOfGuests} guests •{' '}
                              {enquiry.numberOfNights} nights • £
                              {enquiry.budgetPerPerson}/person
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {enquiry.submittedBy?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {enquiry.submittedBy?.companyName ||
                              'Unknown Company'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {enquiry.agentEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enquiry.status)}`}
                          >
                            {getStatusLabel(enquiry.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {enquiry.hasQuotes &&
                          enquiry.quotes &&
                          enquiry.quotes.length > 0 ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {enquiry.quotes.length} quote
                                {enquiry.quotes.length !== 1 ? 's' : ''}
                              </div>
                              <div className="text-xs text-gray-500">
                                {enquiry.quotes[0].title || enquiry.quotes[0].destination || 'Untitled'} ·{' '}
                                {formatCurrency(
                                  enquiry.quotes[0].totalPrice,
                                  enquiry.quotes[0].currency
                                )}
                              </div>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQuoteStatusColor(enquiry.quotes[0].status)}`}
                              >
                                {enquiry.quotes[0].status}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              No quotes
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(enquiry.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openDetailsModal(enquiry)}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1 text-sm"
                            >
                              View Details
                            </button>

                            <button
                              onClick={() => handleCreateQuote(enquiry)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm mr-2"
                            >
                              Create Quote
                            </button>

                            {enquiry.status === 'new' && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(enquiry._id, 'in-progress')
                                }
                                disabled={actionLoading === enquiry._id}
                                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-3 py-1 rounded text-sm"
                              >
                                {actionLoading === enquiry._id
                                  ? 'Updating...'
                                  : 'Start'}
                              </button>
                            )}

                            {enquiry.status === 'in-progress' && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(enquiry._id, 'completed')
                                }
                                disabled={actionLoading === enquiry._id}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded text-sm"
                              >
                                {actionLoading === enquiry._id
                                  ? 'Updating...'
                                  : 'Complete'}
                              </button>
                            )}

                            {enquiry.status === 'completed' && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(enquiry._id, 'in-progress')
                                }
                                disabled={actionLoading === enquiry._id}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded text-sm"
                              >
                                {actionLoading === enquiry._id
                                  ? 'Updating...'
                                  : 'Reopen'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(pagination.totalPages, prev + 1)
                        )
                      }
                      disabled={!pagination.hasNextPage}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing page{' '}
                        <span className="font-medium">
                          {pagination.currentPage}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">
                          {pagination.totalPages}
                        </span>{' '}
                        ({pagination.totalEnquiries} total enquiries)
                      </p>
                    </div>
                    <div>
                      <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={!pagination.hasPrevPage}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100"
                        >
                          <span className="sr-only">Previous</span>
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                  pageNum === pagination.currentPage
                                    ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(pagination.totalPages, prev + 1)
                            )
                          }
                          disabled={!pagination.hasNextPage}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100"
                        >
                          <span className="sr-only">Next</span>
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Enquiry Details
                </h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Lead Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{' '}
                      {selectedEnquiry.leadName}
                    </div>
                    <div>
                      <span className="font-medium">Trip Type:</span>{' '}
                      {formatTripType(selectedEnquiry.tripType)}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEnquiry.status)}`}
                      >
                        {getStatusLabel(selectedEnquiry.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Agent Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Agent:</span>{' '}
                      {selectedEnquiry.submittedBy?.name || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Company:</span>{' '}
                      {selectedEnquiry.submittedBy?.companyName || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <a
                        href={`mailto:${selectedEnquiry.agentEmail}`}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        {selectedEnquiry.agentEmail}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Trip Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">1st Choice Destination:</span>{' '}
                      {selectedEnquiry.firstChoiceDestination}
                    </div>
                    {selectedEnquiry.secondChoiceDestination && (
                      <div>
                        <span className="font-medium">2nd Choice Destination:</span>{' '}
                        {selectedEnquiry.secondChoiceDestination}
                      </div>
                    )}
                    {selectedEnquiry.resort && (
                      <div>
                        <span className="font-medium">Specific Resort:</span>{' '}
                        {selectedEnquiry.resort}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Travel Date:</span>{' '}
                      {formatDateTime(selectedEnquiry.travelDate)}
                    </div>
                    {selectedEnquiry.arrivalAirport && (
                      <div>
                        <span className="font-medium">Arrival Airport:</span>{' '}
                        {selectedEnquiry.arrivalAirport}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Duration:</span>{' '}
                      {selectedEnquiry.numberOfNights} night
                      {selectedEnquiry.numberOfNights !== 1 ? 's' : ''}
                    </div>
                    <div>
                      <span className="font-medium">Guests:</span>{' '}
                      {selectedEnquiry.numberOfGuests}
                    </div>
                  </div>
                </div>

                {/* Accommodation & Budget */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Accommodation & Budget
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>{' '}
                      {selectedEnquiry.accommodationType === 'hotel'
                        ? 'Hotel'
                        : 'Apartments'}
                    </div>
                    <div>
                      <span className="font-medium">Star Rating:</span>{' '}
                      {selectedEnquiry.starRating ? `${selectedEnquiry.starRating} Star` : 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Board:</span>{' '}
                      {selectedEnquiry.boardType}
                    </div>
                    <div>
                      <span className="font-medium">Budget per Person:</span> £
                      {selectedEnquiry.budgetPerPerson.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">
                        Total Budget:
                      </span>{' '}
                      £
                      {(
                        selectedEnquiry.budgetPerPerson *
                        selectedEnquiry.numberOfGuests
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Events Requested */}
              {selectedEnquiry.eventsRequested.length > 0 && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Events Requested
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEnquiry.eventsRequested.map((event, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {typeof event === 'string' ? event : event.name || 'Unknown Event'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotes Section */}
              <div className="mt-6 bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-gray-900">
                    Quotes ({selectedEnquiry.quotes?.length || 0})
                  </h4>
                  <button
                    onClick={() => handleCreateQuote(selectedEnquiry)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Quote
                  </button>
                </div>

                {selectedEnquiry.quotes && selectedEnquiry.quotes.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEnquiry.quotes.map((quote) => (
                      <div key={quote._id} className="bg-white rounded-lg border border-purple-200 overflow-hidden">
                        {/* Quote header */}
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {quote.title || quote.leadName || 'Untitled Quote'}
                                </span>
                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getQuoteStatusColor(quote.status)}`}>
                                  {quote.status}
                                </span>
                              </div>
                              {quote.destination && (
                                <p className="text-sm text-gray-500 mt-0.5">{quote.destination}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(quote.totalPrice, quote.currency)}
                              </p>
                            </div>
                          </div>

                          {/* Quote details grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                            {quote.hotelName && (
                              <div><span className="text-gray-400">Hotel</span><p className="text-gray-700 font-medium">{quote.hotelName}</p></div>
                            )}
                            {quote.numberOfPeople && (
                              <div><span className="text-gray-400">Guests</span><p className="text-gray-700 font-medium">{quote.numberOfPeople}</p></div>
                            )}
                            {quote.numberOfNights && (
                              <div><span className="text-gray-400">Nights</span><p className="text-gray-700 font-medium">{quote.numberOfNights}</p></div>
                            )}
                            {quote.arrivalDate && (
                              <div><span className="text-gray-400">Arrival</span><p className="text-gray-700 font-medium">{formatDate(quote.arrivalDate)}</p></div>
                            )}
                          </div>

                          <p className="text-xs text-gray-400 mt-2">
                            Version {quote.version} · Created {quote.createdAt ? formatDate(quote.createdAt) : 'Unknown'}
                          </p>
                        </div>

                        {/* Quote actions bar */}
                        <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 flex flex-wrap items-center gap-2">
                          {/* Send Quote - only for draft or updated */}
                          {(quote.status === 'draft' || quote.status === 'updated') && (
                            <button
                              onClick={() => handleSendQuote(quote._id)}
                              disabled={actionLoading === `send-${quote._id}`}
                              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              {actionLoading === `send-${quote._id}` ? 'Sending...' : 'Send to Agent'}
                            </button>
                          )}

                          {/* Confirm Booking - only for sent */}
                          {quote.status === 'sent' && (
                            <button
                              onClick={() => handleConfirmBooking(quote._id)}
                              disabled={actionLoading === quote._id}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              {actionLoading === quote._id ? 'Confirming...' : 'Confirm Booking'}
                            </button>
                          )}

                          {/* Status changes */}
                          {quote.status === 'sent' && (
                            <button
                              onClick={() => handleUpdateQuoteStatus(quote._id, 'updated')}
                              disabled={!!actionLoading}
                              className="inline-flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
                            >
                              Mark as Updated
                            </button>
                          )}

                          {quote.status === 'booked' && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium px-3 py-1.5 bg-emerald-50 rounded">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              Booking Confirmed
                            </span>
                          )}

                          {/* Edit - go to quote manager */}
                          <button
                            onClick={() => {
                              closeDetailsModal();
                              window.location.href = `/admin/quotes?enquiry=${selectedEnquiry._id}`;
                            }}
                            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit Quote
                          </button>

                          {/* Delete */}
                          {quote.status !== 'booked' && (
                            <button
                              onClick={() => handleDeleteQuote(quote._id)}
                              disabled={actionLoading === `del-${quote._id}`}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium px-3 py-1.5 rounded hover:bg-red-50 transition-colors ml-auto"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              {actionLoading === `del-${quote._id}` ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      No quotes created yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Click "Create Quote" to get started
                    </p>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Timestamps
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Submitted:</span>{' '}
                    {formatDateTime(selectedEnquiry.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {formatDateTime(selectedEnquiry.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>

                <a
                  href={`mailto:${selectedEnquiry.agentEmail}?subject=Re: Enquiry ${selectedEnquiry._id} - ${selectedEnquiry.leadName}&body=Dear ${selectedEnquiry.submittedBy?.name || 'Agent'},%0D%0A%0D%0AThank you for your enquiry regarding ${selectedEnquiry.leadName}'s ${formatTripType(selectedEnquiry.tripType).toLowerCase()} to ${selectedEnquiry.resort}.%0D%0A%0D%0A`}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Reply to Agent
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Quote Modal */}
      {showCreateQuoteModal && selectedEnquiryForQuote && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Create Quote for {selectedEnquiryForQuote?.leadName}
              </h3>
              <button
                onClick={closeCreateQuoteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <QuoteForm
              enquiryId={selectedEnquiryForQuote._id}
              initialData={{
                enquiryId: selectedEnquiryForQuote._id,
                leadName: selectedEnquiryForQuote.leadName,
                numberOfPeople: selectedEnquiryForQuote.numberOfGuests,
                numberOfNights: selectedEnquiryForQuote.numberOfNights,
                arrivalDate: selectedEnquiryForQuote.travelDate
                  ? new Date(selectedEnquiryForQuote.travelDate).getTime()
                    ? new Date(selectedEnquiryForQuote.travelDate)
                        .toISOString()
                        .split('T')[0]
                    : new Date().toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0],
                hotelName: selectedEnquiryForQuote.resort || '',
                numberOfRooms: Math.ceil(
                  selectedEnquiryForQuote.numberOfGuests / 2
                ),
                isSuperPackage: false,
                whatsIncluded: `${selectedEnquiryForQuote.accommodationType === 'hotel' ? 'Hotel' : 'Apartment'} accommodation, ${selectedEnquiryForQuote.boardType}`,
                transferIncluded: false,
                activitiesIncluded:
                  selectedEnquiryForQuote.eventsRequested
                    .map((event: any) => typeof event === 'string' ? event : event.name || 'Unknown Event')
                    .join(', '),
                totalPrice:
                  selectedEnquiryForQuote.budgetPerPerson *
                  selectedEnquiryForQuote.numberOfGuests,
                currency: 'GBP' as const,
                internalNotes: `Created from enquiry. Original budget: £${selectedEnquiryForQuote.budgetPerPerson}/person`,
              }}
              onSubmit={handleQuoteCreated}
              onCancel={closeCreateQuoteModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

interface SuperPackage {
  _id: string;
  name: string;
  destination: string;
  resort: string;
  currency: string;
  groupSizeTiers: Array<{ label: string; minPeople: number; maxPeople: number }>;
  durationOptions: number[];
  pricingMatrix: Array<{
    period: string;
    periodType: string;
    prices: Array<{ groupSizeTierIndex: number; nights: number; price: number | 'ON_REQUEST' }>;
  }>;
  inclusions: Array<{ text: string; category: string }>;
  accommodationExamples: string[];
  salesNotes: string;
}

export default function AgentPackagesPage() {
  const [packages, setPackages] = useState<SuperPackage[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDest, setSelectedDest] = useState('');
  const [search, setSearch] = useState('');
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<Record<string, number>>({});
  const [selectedNights, setSelectedNights] = useState<Record<string, number>>({});
  const [selectedPeriod, setSelectedPeriod] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchPackages();
  }, [selectedDest, search]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDest) params.set('destination', selectedDest);
      if (search) params.set('search', search);
      const res = await fetch(`/api/agent/super-packages?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data.data.packages || []);
        setDestinations(data.data.destinations || []);
      }
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sym = (c: string) => c === 'GBP' ? '£' : c === 'EUR' ? '€' : '$';

  const getPrice = (pkg: SuperPackage, tierIdx: number, nights: number) => {
    if (!pkg.pricingMatrix?.length) return null;
    const now = new Date();
    const currentMonth = now.toLocaleString('en-US', { month: 'long' });
    const entry = pkg.pricingMatrix.find(p => p.period.toLowerCase() === currentMonth.toLowerCase()) || pkg.pricingMatrix[0];
    if (!entry) return null;
    const pricePoint = entry.prices.find(p => p.groupSizeTierIndex === tierIdx && p.nights === nights);
    return pricePoint?.price ?? null;
  };

  const getLowestPrice = (pkg: SuperPackage) => {
    let lowest: number | null = null;
    for (const entry of pkg.pricingMatrix || []) {
      for (const p of entry.prices) {
        if (typeof p.price === 'number' && (lowest === null || p.price < lowest)) {
          lowest = p.price;
        }
      }
    }
    return lowest;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">← Back to Dashboard</Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Super Packages</h1>
              <p className="text-gray-500 text-sm mt-1">Pre-built holiday packages with transparent pricing</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search packages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
              />
            </div>
            <select
              value={selectedDest}
              onChange={e => setSelectedDest(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white"
            >
              <option value="">All Destinations</option>
              {destinations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                  <div className="h-5 bg-gray-100 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-50 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No packages found</h3>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map(pkg => {
                const isExpanded = expandedPkg === pkg._id;
                const lowestPrice = getLowestPrice(pkg);
                const tierIdx = selectedTier[pkg._id] ?? 0;
                const nights = selectedNights[pkg._id] ?? pkg.durationOptions[0];
                const currentPrice = getPrice(pkg, tierIdx, nights);

                return (
                  <div key={pkg._id} className={`bg-white rounded-xl border transition-all ${isExpanded ? 'border-orange-300 shadow-lg col-span-1 md:col-span-2 lg:col-span-3' : 'border-gray-100 hover:border-orange-200 hover:shadow-md'}`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            {pkg.destination} · {pkg.resort}
                          </p>
                        </div>
                        {lowestPrice && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">From</p>
                            <p className="text-lg font-bold text-orange-600">{sym(pkg.currency)}{lowestPrice}<span className="text-xs font-normal text-gray-500">pp</span></p>
                          </div>
                        )}
                      </div>

                      {/* Inclusions preview */}
                      {pkg.inclusions?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {pkg.inclusions.slice(0, isExpanded ? undefined : 3).map((inc, i) => (
                            <span key={i} className="inline-flex items-center text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md">
                              {inc.category === 'transfer' ? '🚐' : inc.category === 'accommodation' ? '🏨' : inc.category === 'activity' ? '🎉' : '✓'} {inc.text}
                            </span>
                          ))}
                          {!isExpanded && pkg.inclusions.length > 3 && (
                            <span className="text-xs text-gray-400">+{pkg.inclusions.length - 3} more</span>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedPkg(isExpanded ? null : pkg._id)}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        {isExpanded ? 'Show less ↑' : 'View pricing & details →'}
                      </button>
                    </div>

                    {/* Expanded pricing section */}
                    {isExpanded && (() => {
                      const periodIdx = selectedPeriod[pkg._id] ?? 0;
                      const chosenEntry = pkg.pricingMatrix[periodIdx];
                      const chosenPrice = chosenEntry?.prices.find(p => p.groupSizeTierIndex === tierIdx && p.nights === nights);

                      // Build pricing for all night options in the selected period/tier for the enquiry link
                      const buildEnquiryUrl = () => {
                        const params = new URLSearchParams();
                        params.set('destination', pkg.destination);
                        params.set('month', chosenEntry?.period || '');
                        params.set('accommodation', 'hotel');
                        params.set('packageTitle', pkg.name);

                        // Get prices for each duration option in the selected period + tier
                        const getPriceForNights = (n: number) => {
                          const p = chosenEntry?.prices.find(pp => pp.groupSizeTierIndex === tierIdx && pp.nights === n);
                          return p && typeof p.price === 'number' ? p.price : 0;
                        };

                        // Map to the enquiry form's expected params (twoNights, threeNights, fourNights)
                        const nightsMap: Record<number, string> = { 2: 'twoNights', 3: 'threeNights', 4: 'fourNights' };
                        pkg.durationOptions.forEach(n => {
                          const key = nightsMap[n];
                          if (key) params.set(key, String(getPriceForNights(n)));
                        });
                        // Ensure all three params exist even if package doesn't have that duration
                        ['twoNights', 'threeNights', 'fourNights'].forEach(k => {
                          if (!params.has(k)) params.set(k, '0');
                        });

                        return `/enquiries?${params.toString()}`;
                      };

                      return (
                      <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Price Calculator */}
                          <div className="lg:col-span-2">
                            <h4 className="font-semibold text-gray-900 mb-4">Price Calculator</h4>
                            <div className="flex flex-wrap gap-3 mb-4">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">Group Size</label>
                                <select
                                  value={tierIdx}
                                  onChange={e => setSelectedTier(prev => ({ ...prev, [pkg._id]: parseInt(e.target.value) }))}
                                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                                >
                                  {pkg.groupSizeTiers.map((t, i) => (
                                    <option key={i} value={i}>{t.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">Nights</label>
                                <select
                                  value={nights}
                                  onChange={e => setSelectedNights(prev => ({ ...prev, [pkg._id]: parseInt(e.target.value) }))}
                                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                                >
                                  {pkg.durationOptions.map(n => (
                                    <option key={n} value={n}>{n} nights</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">Month / Period</label>
                                <select
                                  value={periodIdx}
                                  onChange={e => setSelectedPeriod(prev => ({ ...prev, [pkg._id]: parseInt(e.target.value) }))}
                                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                                >
                                  {pkg.pricingMatrix.map((entry, i) => (
                                    <option key={i} value={i}>{entry.period}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Selected price highlight */}
                            {chosenPrice && (
                              <div className="mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-orange-100 text-xs font-medium uppercase tracking-wide">Selected Price</p>
                                    <p className="text-sm mt-0.5">{pkg.groupSizeTiers[tierIdx]?.label} · {nights} nights · {chosenEntry.period}</p>
                                  </div>
                                  <div className="text-right">
                                    {typeof chosenPrice.price === 'number' ? (
                                      <p className="text-2xl font-bold">{sym(pkg.currency)}{chosenPrice.price}<span className="text-sm font-normal opacity-80">pp</span></p>
                                    ) : (
                                      <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-lg">On Request</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Pricing table */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Period</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price pp</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {pkg.pricingMatrix.map((entry, i) => {
                                    const price = entry.prices.find(p => p.groupSizeTierIndex === tierIdx && p.nights === nights);
                                    const isSelected = i === periodIdx;
                                    return (
                                      <tr
                                        key={i}
                                        onClick={() => setSelectedPeriod(prev => ({ ...prev, [pkg._id]: i }))}
                                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-orange-50 ring-1 ring-inset ring-orange-200' : 'hover:bg-gray-50/50'}`}
                                      >
                                        <td className="px-4 py-3 text-gray-900 flex items-center gap-2">
                                          {isSelected && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>}
                                          {entry.period}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                          {price ? (
                                            typeof price.price === 'number' ? (
                                              <span className="text-gray-900">{sym(pkg.currency)}{price.price}</span>
                                            ) : (
                                              <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded">On Request</span>
                                            )
                                          ) : (
                                            <span className="text-gray-400">—</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Package Info */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Package Info</h4>
                            {pkg.accommodationExamples?.length > 0 && (
                              <div className="mb-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Accommodation Examples</p>
                                <ul className="space-y-1">
                                  {pkg.accommodationExamples.map((a, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                      <span className="text-orange-500 mt-0.5">•</span> {a}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {pkg.salesNotes && (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                                <p className="text-xs text-orange-600 font-medium uppercase tracking-wide mb-1">Sales Notes</p>
                                <p className="text-sm text-gray-700">{pkg.salesNotes}</p>
                              </div>
                            )}

                            {/* Selection summary before enquiry */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Selection</p>
                              <div className="space-y-1 text-sm text-gray-700">
                                <p><span className="text-gray-500">Package:</span> {pkg.name}</p>
                                <p><span className="text-gray-500">Period:</span> {chosenEntry?.period || '—'}</p>
                                <p><span className="text-gray-500">Group:</span> {pkg.groupSizeTiers[tierIdx]?.label || '—'}</p>
                                <p><span className="text-gray-500">Nights:</span> {nights}</p>
                                {chosenPrice && typeof chosenPrice.price === 'number' && (
                                  <p className="font-semibold text-orange-600 pt-1 border-t border-gray-100 mt-2">{sym(pkg.currency)}{chosenPrice.price} per person</p>
                                )}
                              </div>
                            </div>

                            <Link
                              href={buildEnquiryUrl()}
                              className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-orange-500/20"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                              Enquire About This Package
                            </Link>
                          </div>
                        </div>
                      </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

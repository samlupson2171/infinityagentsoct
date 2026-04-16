'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import LogoutButton from './auth/LogoutButton';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hideNavigation = pathname?.startsWith('/auth/') || pathname === '/unauthorized';
  if (hideNavigation) return null;

  const isAdmin = session?.user?.role === 'admin';
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const agentLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/packages', label: 'Packages' },
    { href: '/enquiries', label: 'New Enquiry' },
    { href: '/dashboard/bookings', label: 'Bookings' },
    { href: '/training', label: 'Training' },
    { href: '/destinations', label: 'Destinations' },
  ];

  const navLinkClass = (href: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive(href)
        ? 'bg-orange-50 text-orange-600'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/infinity-weekends-logo.png"
                alt="Infinity Weekends"
                className="h-9 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <span className="hidden items-center gap-1.5 text-lg font-bold text-gray-900">
                <span className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center text-white text-xs font-bold">∞</span>
                Infinity Weekends
              </span>
            </Link>

            {/* Desktop nav links */}
            {session && !isAdmin && (
              <div className="hidden md:flex items-center gap-1">
                {agentLinks.map(link => (
                  <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            {session && isAdmin && (
              <div className="hidden md:flex items-center gap-1">
                <Link href="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>Admin Dashboard</Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : session ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                      {session.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <span className="text-sm text-gray-700 font-medium max-w-[120px] truncate">{session.user?.name}</span>
                  </div>
                  <LogoutButton />
                </div>
                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
                  aria-label="Toggle menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <Link href="/auth/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md hover:shadow-orange-500/20">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && session && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {(isAdmin ? [{ href: '/admin/dashboard', label: 'Admin Dashboard' }] : agentLinks).map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive(link.href) ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-gray-500">{session.user?.name}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

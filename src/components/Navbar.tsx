'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();

  const isActive = (path: string) => {
    return pathname === path ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 hover:text-gray-700 border-transparent';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-lg font-bold text-indigo-600">
                Buyer Leads
              </Link>
            </div>
            {user && !isLoading && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/buyers"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 font-medium ${isActive('/buyers')}`}
                >
                  Buyers
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user && !isLoading ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>
            ) : !isLoading && (
              <Link
                href="/login"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
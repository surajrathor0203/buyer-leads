'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BuyersTable from '@/components/table/BuyersTable';
import { useAuth } from '@/hooks/useAuth';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // If authentication is still loading, wait
    if (authLoading) return;
    
    // If user is not authenticated, redirect will happen via AuthContext
    if (!user) return;
    
    async function fetchBuyers() {
      try {
        const response = await fetch('/api/buyers');
        
        if (!response.ok) {
          if (response.status === 401) {
            // Handle unauthorized access
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch buyers');
        }
        
        const data = await response.json();
        setBuyers(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBuyers();
  }, [user, authLoading, router]);

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyer Leads</h1>
        <Link
          href="/buyers/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add New Buyer
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading buyers...</p>
        </div>
      ) : buyers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500 mb-4">No buyers found</p>
          <Link
            href="/buyers/new"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Add your first buyer
          </Link>
        </div>
      ) : (
        <BuyersTable buyers={buyers} />
      )}
    </div>
  );
}

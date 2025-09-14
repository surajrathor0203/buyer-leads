'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BuyerForm from '@/components/forms/BuyerForm';
import { useAuth } from '@/hooks/useAuth';

export default function BuyerDetailPage({ params }: { params: { id: string } }) {
  const [buyer, setBuyer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication is still loading, wait
    if (authLoading) return;
    
    // If user is not authenticated, redirect will happen via AuthContext
    if (!user) return;
    
    async function fetchBuyer() {
      try {
        const response = await fetch(`/api/buyers/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Handle unauthorized access
            router.push('/login');
            return;
          }
          
          if (response.status === 403) {
            // Handle forbidden access (not owner)
            setError('You do not have permission to view this buyer');
            setIsLoading(false);
            return;
          }
          
          if (response.status === 404) {
            setError('Buyer not found');
            setIsLoading(false);
            return;
          }
          
          throw new Error('Failed to fetch buyer');
        }
        
        const data = await response.json();
        setBuyer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBuyer();
  }, [params.id, user, authLoading, router]);

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isLoading ? 'Loading...' : error ? 'Error' : `Edit Buyer: ${buyer?.name}`}
        </h1>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/buyers')}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            Return to Buyers List
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading buyer details...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <BuyerForm buyer={buyer} isEditing={true} />
        </div>
      )}
    </div>
  );
}
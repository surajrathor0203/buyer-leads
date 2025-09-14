'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BuyerForm from '@/components/forms/BuyerForm';
import { useAuth } from '@/hooks/useAuth';

export default function NewBuyerPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Buyer</h1>
        <p className="text-gray-600">Create a new buyer lead</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <BuyerForm />
      </div>
    </div>
  );
}
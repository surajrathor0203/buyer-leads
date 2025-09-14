'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Buyer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
};

type BuyersTableProps = {
  buyers: Buyer[];
};

export default function BuyersTable({ buyers }: BuyersTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this buyer?')) {
      setIsDeleting(id);
      
      try {
        const response = await fetch(`/api/buyers/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete buyer');
        }
        
        // Refresh the page to update the list
        router.refresh();
      } catch (error) {
        console.error('Error deleting buyer:', error);
        alert('Failed to delete buyer. Please try again.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Viewing Scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'Offer Made':
        return 'bg-orange-100 text-orange-800';
      case 'Closed':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Added
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {buyers.map((buyer) => (
            <tr key={buyer.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{buyer.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{buyer.email}</div>
                {buyer.phone && <div className="text-sm text-gray-500">{buyer.phone}</div>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    buyer.status
                  )}`}
                >
                  {buyer.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(buyer.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/buyers/${buyer.id}`}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(buyer.id)}
                  disabled={isDeleting === buyer.id}
                  className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                >
                  {isDeleting === buyer.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
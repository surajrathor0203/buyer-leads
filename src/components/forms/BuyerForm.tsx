'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useDebounce } from '@/hooks/useDebounce';
import { createBuyerSchema, updateBuyerSchema, PropertyTypeEnum, BuyerStatusEnum } from '@/lib/validation';

type BuyerFormProps = {
  buyer?: any;
  isEditing?: boolean;
};

export default function BuyerForm({ buyer, isEditing = false }: BuyerFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // Use the appropriate schema based on whether we're editing or creating
  const validationSchema = isEditing ? updateBuyerSchema : createBuyerSchema;
  const { validateForm, validateField, getFieldError } = useFormValidation(validationSchema);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    location: '',
    property_type: 'Residential' as const,
    bedrooms: '',
    bathrooms: '',
    notes: '',
    status: 'New' as const
  });
  
  // Use debounce for form validation to avoid excessive validation during typing
  const debouncedFormData = useDebounce(formData, 300);

  useEffect(() => {
    if (buyer) {
      setFormData({
        name: buyer.name || '',
        email: buyer.email || '',
        phone: buyer.phone || '',
        budget: buyer.budget || '',
        location: buyer.location || '',
        property_type: buyer.property_type || 'Residential',
        bedrooms: buyer.bedrooms || '',
        bathrooms: buyer.bathrooms || '',
        notes: buyer.notes || '',
        status: buyer.status || 'New'
      });
    }
  }, [buyer]);
  
  // Perform field validation on debounced data change
  useEffect(() => {
    // Don't validate empty form on initial load
    if (!debouncedFormData.name && !debouncedFormData.email) return;
    
    Object.keys(debouncedFormData).forEach(field => {
      validateField(field, debouncedFormData[field as keyof typeof debouncedFormData]);
    });
  }, [debouncedFormData, validateField]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change - immediate feedback for select fields
    if (e.target.tagName === 'SELECT') {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entire form before submission
    if (!validateForm(formData)) {
      return; // Don't submit if validation fails
    }
    
    setIsSubmitting(true);
    setServerError('');

    try {
      // Make sure user is authenticated
      if (!user) {
        throw new Error('You must be logged in to submit this form');
      }

      const url = isEditing ? `/api/buyers/${buyer.id}` : '/api/buyers';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from the server
        if (response.status === 400 && data.details) {
          throw new Error(data.error || 'Validation failed');
        }
        
        throw new Error(data.error || 'Failed to save buyer data');
      }

      // Redirect to buyers list on success
      router.push('/buyers');
      router.refresh();
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{serverError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              getFieldError('name') ? 'border-red-300' : ''
            }`}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              getFieldError('email') ? 'border-red-300' : ''
            }`}
          />
          {getFieldError('email') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              getFieldError('phone') ? 'border-red-300' : ''
            }`}
          />
          {getFieldError('phone') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
          )}
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
            Budget
          </label>
          <input
            type="text"
            name="budget"
            id="budget"
            value={formData.budget}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              getFieldError('budget') ? 'border-red-300' : ''
            }`}
          />
          {getFieldError('budget') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('budget')}</p>
          )}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            name="location"
            id="location"
            value={formData.location}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              getFieldError('location') ? 'border-red-300' : ''
            }`}
          />
          {getFieldError('location') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('location')}</p>
          )}
        </div>

        <div>
          <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">
            Property Type
          </label>
          <select
            name="property_type"
            id="property_type"
            value={formData.property_type}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              getFieldError('property_type') ? 'border-red-300' : ''
            }`}
          >
            {Object.values(PropertyTypeEnum.enum).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {getFieldError('property_type') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('property_type')}</p>
          )}
        </div>

        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
            Bedrooms
          </label>
          <input
            type="number"
            name="bedrooms"
            id="bedrooms"
            min="0"
            value={formData.bedrooms}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              getFieldError('bedrooms') ? 'border-red-300' : ''
            }`}
          />
          {getFieldError('bedrooms') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('bedrooms')}</p>
          )}
        </div>

        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
            Bathrooms
          </label>
          <input
            type="number"
            name="bathrooms"
            id="bathrooms"
            min="0"
            step="0.5"
            value={formData.bathrooms}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              getFieldError('bathrooms') ? 'border-red-300' : ''
            }`}
          />
          {getFieldError('bathrooms') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('bathrooms')}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              getFieldError('status') ? 'border-red-300' : ''
            }`}
          >
            {Object.values(BuyerStatusEnum.enum).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {getFieldError('status') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('status')}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              getFieldError('notes') ? 'border-red-300' : ''
            }`}
          />
          {getFieldError('notes') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('notes')}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Buyer' : 'Create Buyer'}
        </button>
      </div>
    </form>
  );
}
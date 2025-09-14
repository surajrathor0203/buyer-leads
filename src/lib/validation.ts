import { z } from 'zod';

// Define the buyer status enum
export const BuyerStatusEnum = z.enum([
  'New',
  'Contacted',
  'Viewing Scheduled',
  'Offer Made',
  'Closed',
  'Lost'
]);

// Define the property type enum
export const PropertyTypeEnum = z.enum([
  'Residential',
  'Commercial',
  'Land',
  'Industrial'
]);

// Base schema for common buyer fields
export const buyerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  budget: z.string().optional(),
  location: z.string().optional(),
  property_type: PropertyTypeEnum,
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
  status: BuyerStatusEnum
});

// Schema for creating a new buyer
export const createBuyerSchema = buyerSchema;

// Schema for updating an existing buyer
export const updateBuyerSchema = buyerSchema.partial();

// Schema for importing buyers from CSV
export const importBuyerSchema = buyerSchema.extend({
  // Additional fields that might be in a CSV import
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Type definitions based on schemas
export type Buyer = z.infer<typeof buyerSchema>;
export type CreateBuyer = z.infer<typeof createBuyerSchema>;
export type UpdateBuyer = z.infer<typeof updateBuyerSchema>;
export type BuyerStatus = z.infer<typeof BuyerStatusEnum>;
export type PropertyType = z.infer<typeof PropertyTypeEnum>;

// Schema for filtering buyers
export const buyerFilterSchema = z.object({
  search: z.string().optional(),
  status: BuyerStatusEnum.optional(),
  property_type: PropertyTypeEnum.optional(),
  min_budget: z.coerce.number().optional(),
  max_budget: z.coerce.number().optional(),
  location: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10)
});

export type BuyerFilter = z.infer<typeof buyerFilterSchema>;
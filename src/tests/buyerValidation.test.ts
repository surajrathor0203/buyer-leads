import { describe, it, expect } from 'vitest';
import { createBuyerSchema, updateBuyerSchema } from '@/lib/validation';

describe('Buyer Validation', () => {
  describe('Create Buyer Schema', () => {
    it('should validate a valid buyer', () => {
      const validBuyer = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        budget: '500000',
        location: 'New York',
        property_type: 'Residential',
        bedrooms: 3,
        bathrooms: 2,
        notes: 'Looking for a family home',
        status: 'New'
      };
      
      const result = createBuyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });
    
    it('should reject a buyer with invalid email', () => {
      const invalidBuyer = {
        name: 'John Doe',
        email: 'not-an-email',
        property_type: 'Residential',
        status: 'New'
      };
      
      const result = createBuyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });
    
    it('should reject a buyer with too short name', () => {
      const invalidBuyer = {
        name: 'J',
        email: 'john@example.com',
        property_type: 'Residential',
        status: 'New'
      };
      
      const result = createBuyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });
    
    it('should reject a buyer with invalid property type', () => {
      const invalidBuyer = {
        name: 'John Doe',
        email: 'john@example.com',
        property_type: 'Invalid',
        status: 'New'
      };
      
      const result = createBuyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('property_type');
      }
    });
    
    it('should reject a buyer with invalid status', () => {
      const invalidBuyer = {
        name: 'John Doe',
        email: 'john@example.com',
        property_type: 'Residential',
        status: 'Invalid'
      };
      
      const result = createBuyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('status');
      }
    });
    
    it('should reject negative bedrooms or bathrooms', () => {
      const invalidBuyer = {
        name: 'John Doe',
        email: 'john@example.com',
        property_type: 'Residential',
        status: 'New',
        bedrooms: -1,
        bathrooms: -0.5
      };
      
      const result = createBuyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Update Buyer Schema', () => {
    it('should validate a partial update', () => {
      const partialUpdate = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };
      
      const result = updateBuyerSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });
    
    it('should validate an empty update', () => {
      const emptyUpdate = {};
      
      const result = updateBuyerSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid fields in a partial update', () => {
      const invalidUpdate = {
        email: 'not-an-email'
      };
      
      const result = updateBuyerSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });
  });
});
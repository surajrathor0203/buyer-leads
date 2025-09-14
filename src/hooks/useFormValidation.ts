'use client';

import { useState } from 'react';
import { z } from 'zod';

type ValidationErrors = Record<string, string> | null;

export function useFormValidation<T extends z.ZodObject<any>>(schema: T) {
  const [errors, setErrors] = useState<ValidationErrors>(null);

  // Validate the entire form
  const validateForm = (data: unknown): data is z.infer<T> => {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      // Format errors for easy use in forms
      const formattedErrors: ValidationErrors = {};
      
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        formattedErrors[path] = issue.message;
      });
      
      setErrors(formattedErrors);
      return false;
    }
    
    // Clear any previous errors if validation succeeds
    setErrors(null);
    return true;
  };

  // Validate a single field
  const validateField = (name: string, value: unknown) => {
    // Extract the specific field schema
    const fieldSchema = schema.shape[name as keyof typeof schema.shape];
    
    if (!fieldSchema) {
      console.warn(`No schema found for field: ${name}`);
      return;
    }
    
    const result = fieldSchema.safeParse(value);
    
    if (!result.success) {
      setErrors((prev) => ({
        ...prev,
        [name]: result.error.issues[0].message,
      }));
    } else {
      setErrors((prev) => {
        if (!prev) return null;
        
        const newErrors = { ...prev };
        delete newErrors[name];
        return Object.keys(newErrors).length ? newErrors : null;
      });
    }
  };

  // Get error for a specific field
  const getFieldError = (name: string): string | undefined => {
    return errors ? errors[name] : undefined;
  };

  // Check if the form has any errors
  const hasErrors = (): boolean => {
    return errors !== null;
  };

  return {
    errors,
    validateForm,
    validateField,
    getFieldError,
    hasErrors,
  };
}
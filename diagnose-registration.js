#!/usr/bin/env node

/**
 * Registration Diagnostic Tool
 * This script helps diagnose registration issues by testing the validation schema
 */

const { z } = require('zod');

// Recreate the validation schema
const baseUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  contactEmail: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase(),
});

const enhancedRegistrationSchema = baseUserSchema
  .extend({
    companyName: z
      .string()
      .min(2, 'Company name must be at least 2 characters long')
      .max(200, 'Company name cannot exceed 200 characters')
      .trim()
      .optional(),
    abtaPtsNumber: z
      .string()
      .regex(
        /^(ABTA|PTS)[A-Z0-9]{4,10}$/i,
        'ABTA/PTS number must start with ABTA or PTS followed by 4-10 alphanumeric characters'
      )
      .transform((val) => val.toUpperCase()),
    phoneNumber: z
      .string()
      .min(10, 'Phone number must be at least 10 digits')
      .max(20, 'Phone number cannot exceed 20 characters')
      .regex(
        /^[\d\s\-\+\(\)]+$/,
        'Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses'
      )
      .trim(),
    websiteAddress: z
      .string()
      .url('Please provide a valid HTTP or HTTPS website URL')
      .refine((url) => {
        try {
          const parsedUrl = new URL(url);
          return (
            parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
          );
        } catch {
          return false;
        }
      }, 'Please provide a valid HTTP or HTTPS website URL')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password confirmation is required')
      .max(128, 'Password confirmation cannot exceed 128 characters')
      .optional(),
    company: z
      .string()
      .min(2, 'Company name must be at least 2 characters long')
      .max(200, 'Company name cannot exceed 200 characters')
      .trim(),
    consortia: z
      .string()
      .max(200, 'Consortia name cannot exceed 200 characters')
      .trim()
      .optional(),
  })
  .refine(
    (data) => {
      return data.company || data.companyName;
    },
    {
      message: 'Company name is required',
      path: ['company'],
    }
  )
  .refine(
    (data) => {
      if (data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

// Test data - typical registration payload
const testData = {
  name: "John Smith",
  contactEmail: "john.smith@example.com",
  company: "Test Travel Agency Ltd",
  abtaPtsNumber: "ABTA12345",
  phoneNumber: "+44 20 1234 5678",
  websiteAddress: "https://www.testtravelagency.com",
  password: "SecurePassword123!",
  confirmPassword: "SecurePassword123!",
  consortia: "Test Consortia"
};

console.log('=== Registration Validation Diagnostic ===\n');
console.log('Test Data:');
console.log(JSON.stringify(testData, null, 2));
console.log('\n--- Validation Test ---');

try {
  const result = enhancedRegistrationSchema.parse(testData);
  console.log('✅ Validation PASSED');
  console.log('\nValidated Data:');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.log('❌ Validation FAILED');
  if (error.errors) {
    console.log('\nValidation Errors:');
    error.errors.forEach((err, index) => {
      console.log(`\n${index + 1}. Field: ${err.path.join('.')}`);
      console.log(`   Message: ${err.message}`);
      console.log(`   Code: ${err.code}`);
    });
  } else {
    console.log('\nError:', error.message);
  }
}

console.log('\n=== Test Complete ===');

import { z } from 'zod';

const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const createCandidateSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: 'Full name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    phone: z.string({ required_error: 'Phone number is required' }).min(10, 'Phone must be at least 10 digits'),
    aadhaarNumber: z.string({ required_error: 'Aadhaar number is required' })
      .regex(aadhaarRegex, 'Aadhaar must be exactly 12 numeric digits'),
    panNumber: z.string({ required_error: 'PAN number is required' })
      .regex(panRegex, 'PAN must be in standard format (e.g. ABCDE1234F)'),
    dob: z.string({ required_error: 'Date of birth is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    address: z.string({ required_error: 'Address is required' }).min(5, 'Address must be at least 5 characters'),
  }),
});

export const updateCandidateSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().min(10, 'Phone must be at least 10 digits').optional(),
    aadhaarNumber: z.string().regex(aadhaarRegex, 'Aadhaar must be exactly 12 numeric digits').optional(),
    panNumber: z.string().regex(panRegex, 'PAN must be in standard format (e.g. ABCDE1234F)').optional(),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }).optional(),
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
    status: z.enum(['PENDING', 'VERIFIED', 'FAILED', 'PARTIAL']).optional(),
  }),
});

import { z } from 'zod';

// Member registration schema
export const memberSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  age: z.number().min(16, 'Age must be at least 16').max(100, 'Age must be less than 100'),
  birthday: z.string().min(1, 'Birthday is required'),
  department: z.string().min(1, 'Department/Major is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  academicYear: z.string().min(1, 'Academic year is required'),
  major: z.string().min(1, 'Major/Field of study is required'),
  yearOfStudy: z.enum(['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', 'Masters', 'PhD'], {
    errorMap: () => ({ message: 'Please select your year of study' })
  }),
  expectedGraduation: z.string().min(1, 'Expected graduation year is required'),
  profilePhoto: z.any().optional(),
});

// Type inference
export type MemberFormData = z.infer<typeof memberSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Type inference
export type LoginFormData = z.infer<typeof loginSchema>;

// Registration schema (extends login schema)
export const registrationSchema = loginSchema.extend({
  displayName: z.string().min(3, 'Display name must be at least 3 characters'),
  birthday: z.string().min(1, 'Birthday is required'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type inference
export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Prayer request schema
export const prayerRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  isAnonymous: z.boolean(),
  isPublic: z.boolean(),
  category: z.string().min(1, 'Category is required'),
});

// Type inference
export type PrayerRequestFormData = z.infer<typeof prayerRequestSchema>;

// Testimony schema
export const testimonySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  isAnonymous: z.boolean(),
  category: z.string().min(1, 'Category is required'),
});

// Type inference
export type TestimonyFormData = z.infer<typeof testimonySchema>;

// Event schema
export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.string().min(1, 'Event type is required'),
  coverImage: z.any().optional(),
});

// Type inference
export type EventFormData = z.infer<typeof eventSchema>;

// Resource schema
export const resourceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  file: z.any().optional(),
  fileUrl: z.string().optional(),
});

// Type inference
export type ResourceFormData = z.infer<typeof resourceSchema>;
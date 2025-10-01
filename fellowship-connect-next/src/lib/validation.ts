import { z } from 'zod';

/**
 * Comprehensive Zod validation schemas for all API endpoints
 */

// Auth Schemas
export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Display name is required')
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const UpdatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

// User Schemas
export const UpdateProfileSchema = z.object({
  displayName: z.string().optional(),
  photoURL: z.string().url('Invalid URL').optional()
});

export const UpdateRoleSchema = z.object({
  newRole: z.enum(['member', 'admin', 'super-admin'])
});

// Attendance Schemas
export const CreateSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  location: z.string().min(1, 'Location is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(1440, 'Duration cannot exceed 24 hours')
});

export const CheckInSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  method: z.enum(['qr', 'manual', 'admin', 'offline'])
});

export const OfflineSyncSchema = z.array(z.object({
  userId: z.string(),
  sessionId: z.string(),
  timestamp: z.string()
}));

// Prayer Schemas
export const SubmitPrayerRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description cannot exceed 1000 characters'),
  isAnonymous: z.boolean(),
  isPublic: z.boolean()
});

export const UpdatePrayerStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'answered', 'archived'])
});

// Welfare Schemas
export const SubmitWelfareSupportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description cannot exceed 1000 characters'),
  category: z.string().min(1, 'Category is required'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  isAnonymous: z.boolean()
});

export const UpdateWelfareStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'approved', 'completed', 'declined']),
  notes: z.string().optional()
});

// Evangelism Schemas
export const SubmitEvangelismReportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description cannot exceed 1000 characters'),
  location: z.string().optional(),
  peopleReached: z.number().min(0, 'People reached cannot be negative'),
  conversions: z.number().min(0, 'Conversions cannot be negative'),
  followUpRequired: z.boolean(),
  followUpNotes: z.string().optional()
});

// Media Schemas
export const UploadMediaSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0')
});

export const UpdateMediaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional()
});

// Notification Schemas
export const SendNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  type: z.enum(['info', 'warning', 'success', 'error', 'event', 'reminder']),
  userIds: z.array(z.string()).optional()
});

export const UpdateNotificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean()
});

// Export types
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type CheckInInput = z.infer<typeof CheckInSchema>;
export type OfflineSyncInput = z.infer<typeof OfflineSyncSchema>;
export type SubmitPrayerRequestInput = z.infer<typeof SubmitPrayerRequestSchema>;
export type UpdatePrayerStatusInput = z.infer<typeof UpdatePrayerStatusSchema>;
export type SubmitWelfareSupportInput = z.infer<typeof SubmitWelfareSupportSchema>;
export type UpdateWelfareStatusInput = z.infer<typeof UpdateWelfareStatusSchema>;
export type SubmitEvangelismReportInput = z.infer<typeof SubmitEvangelismReportSchema>;
export type UploadMediaInput = z.infer<typeof UploadMediaSchema>;
export type UpdateMediaInput = z.infer<typeof UpdateMediaSchema>;
export type SendNotificationInput = z.infer<typeof SendNotificationSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof UpdateNotificationPreferencesSchema>;
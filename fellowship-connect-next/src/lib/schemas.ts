import { z } from 'zod';

// Authentication schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  department: z.string().optional(),
  college: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// User profile schemas
export const updateUserProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').optional(),
  department: z.string().optional(),
  college: z.string().optional(),
  phoneNumber: z.string().optional(),
  academicYear: z.enum(['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', 'Masters', 'PhD']).optional(),
  expectedGraduation: z.string().optional(),
  photoURL: z.string().url().optional(),
  birthday: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['member', 'admin', 'super-admin', 'chaplain']),
});

// Attendance schemas
export const createQRSessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const checkInSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  qrCodeData: z.string().optional(),
});

// Prayer request schemas
export const createPrayerRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  isPublic: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
});

export const updatePrayerRequestStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'answered']),
  notes: z.string().optional(),
});

// Welfare support schemas
export const createWelfareSupportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['financial', 'health', 'academic', 'spiritual', 'other']),
  urgency: z.enum(['low', 'medium', 'high']),
  isAnonymous: z.boolean().default(false),
});

export const updateWelfareSupportStatusSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'resolved', 'closed']),
  notes: z.string().optional(),
});

// Evangelism report schemas
export const createEvangelismReportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  soulsSaved: z.number().min(0).default(0),
  followUpsNeeded: z.number().min(0).default(0),
  date: z.string().datetime(),
});

// Media schemas
export const uploadMediaSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
});

// Notification schemas
export const sendNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  recipients: z.array(z.string()).min(1, 'At least one recipient is required'),
  type: z.enum(['email', 'push', 'sms']).optional(),
});

export const broadcastNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  targetGroup: z.enum(['all', 'members', 'admins', 'chaplains']),
  type: z.enum(['email', 'push', 'sms']).optional(),
});

// Export types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreateQRSessionInput = z.infer<typeof createQRSessionSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CreatePrayerRequestInput = z.infer<typeof createPrayerRequestSchema>;
export type UpdatePrayerRequestStatusInput = z.infer<typeof updatePrayerRequestStatusSchema>;
export type CreateWelfareSupportInput = z.infer<typeof createWelfareSupportSchema>;
export type UpdateWelfareSupportStatusInput = z.infer<typeof updateWelfareSupportStatusSchema>;
export type CreateEvangelismReportInput = z.infer<typeof createEvangelismReportSchema>;
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>;
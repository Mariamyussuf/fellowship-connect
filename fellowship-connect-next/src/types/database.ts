import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

/**
 * TypeScript interfaces and Zod validation schemas for all Firestore collections
 */

// User roles
export const UserRoleSchema = z.enum(['member', 'admin', 'super-admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// User interface
export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  role: UserRoleSchema,
  photoURL: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  lastLoginAt: z.string().nullable()
});

export type User = z.infer<typeof UserSchema>;

// Attendance interface
export const AttendanceSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  sessionId: z.string(),
  timestamp: z.string(),
  location: z.string().nullable(),
  method: z.enum(['qr', 'manual', 'admin', 'offline'])
});

export type Attendance = z.infer<typeof AttendanceSchema>;

// QR Code Session interface
export const QRCodeSessionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  createdBy: z.string(),
  isActive: z.boolean()
});

export type QRCodeSession = z.infer<typeof QRCodeSessionSchema>;

// Prayer Request interface
export const PrayerRequestSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  isAnonymous: z.boolean(),
  status: z.enum(['pending', 'approved', 'rejected', 'answered', 'archived']),
  createdAt: z.string(),
  updatedAt: z.string().nullable()
});

export type PrayerRequest = z.infer<typeof PrayerRequestSchema>;

// Welfare Support interface
export const WelfareSupportSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  category: z.string(),
  description: z.string().min(1).max(1000),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['pending', 'reviewed', 'approved', 'completed', 'declined']),
  createdAt: z.string(),
  updatedAt: z.string().nullable()
});

export type WelfareSupport = z.infer<typeof WelfareSupportSchema>;

// Evangelism Report interface
export const EvangelismReportSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  location: z.string(),
  contacts: z.string(),
  followUps: z.number(),
  notes: z.string().nullable(),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable()
});

export type EvangelismReport = z.infer<typeof EvangelismReportSchema>;

// Media interface
export const MediaSchema = z.object({
  id: z.string().optional(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  storageUrl: z.string(),
  uploadedBy: z.string(),
  createdAt: z.string()
});

export type Media = z.infer<typeof MediaSchema>;

// Notification interface
export const NotificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  body: z.string(),
  type: z.enum(['info', 'warning', 'success', 'error', 'event', 'reminder']),
  read: z.boolean(),
  sentAt: z.string()
});

export type Notification = z.infer<typeof NotificationSchema>;

// Audit Log interface
export const AuditLogSchema = z.object({
  id: z.string().optional(),
  action: z.string(),
  userId: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  changes: z.string(),
  timestamp: z.string(),
  ipAddress: z.string()
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// Offline Attendance interface
export const OfflineAttendanceSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  sessionId: z.string(),
  timestamp: z.string(),
  synced: z.boolean()
});

export type OfflineAttendance = z.infer<typeof OfflineAttendanceSchema>;

// Firestore converter functions
export const userConverter = {
  toFirestore(user: User) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      photoURL: user.photoURL,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt
    };
  },
  fromFirestore(snapshot: any): User {
    const data = snapshot.data();
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      photoURL: data.photoURL,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLoginAt: data.lastLoginAt
    };
  }
};

export const attendanceConverter = {
  toFirestore(attendance: Attendance) {
    return {
      userId: attendance.userId,
      sessionId: attendance.sessionId,
      timestamp: attendance.timestamp,
      location: attendance.location,
      method: attendance.method
    };
  },
  fromFirestore(snapshot: any): Attendance {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: data.timestamp,
      location: data.location,
      method: data.method
    };
  }
};

export const qrCodeSessionConverter = {
  toFirestore(session: QRCodeSession) {
    return {
      name: session.name,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      createdBy: session.createdBy,
      isActive: session.isActive
    };
  },
  fromFirestore(snapshot: any): QRCodeSession {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      createdBy: data.createdBy,
      isActive: data.isActive
    };
  }
};

export const prayerRequestConverter = {
  toFirestore(request: PrayerRequest) {
    return {
      userId: request.userId,
      title: request.title,
      description: request.description,
      isAnonymous: request.isAnonymous,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
  },
  fromFirestore(snapshot: any): PrayerRequest {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      isAnonymous: data.isAnonymous,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
};

export const welfareSupportConverter = {
  toFirestore(support: WelfareSupport) {
    return {
      userId: support.userId,
      category: support.category,
      description: support.description,
      urgency: support.urgency,
      status: support.status,
      createdAt: support.createdAt,
      updatedAt: support.updatedAt
    };
  },
  fromFirestore(snapshot: any): WelfareSupport {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      category: data.category,
      description: data.description,
      urgency: data.urgency,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
};

export const evangelismReportConverter = {
  toFirestore(report: EvangelismReport) {
    return {
      userId: report.userId,
      location: report.location,
      contacts: report.contacts,
      followUps: report.followUps,
      notes: report.notes,
      date: report.date,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    };
  },
  fromFirestore(snapshot: any): EvangelismReport {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      location: data.location,
      contacts: data.contacts,
      followUps: data.followUps,
      notes: data.notes,
      date: data.date,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
};

export const mediaConverter = {
  toFirestore(media: Media) {
    return {
      fileName: media.fileName,
      fileType: media.fileType,
      fileSize: media.fileSize,
      storageUrl: media.storageUrl,
      uploadedBy: media.uploadedBy,
      createdAt: media.createdAt
    };
  },
  fromFirestore(snapshot: any): Media {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      storageUrl: data.storageUrl,
      uploadedBy: data.uploadedBy,
      createdAt: data.createdAt
    };
  }
};

export const notificationConverter = {
  toFirestore(notification: Notification) {
    return {
      userId: notification.userId,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      read: notification.read,
      sentAt: notification.sentAt
    };
  },
  fromFirestore(snapshot: any): Notification {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      title: data.title,
      body: data.body,
      type: data.type,
      read: data.read,
      sentAt: data.sentAt
    };
  }
};

export const auditLogConverter = {
  toFirestore(log: AuditLog) {
    return {
      action: log.action,
      userId: log.userId,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      changes: log.changes,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress
    };
  },
  fromFirestore(snapshot: any): AuditLog {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      action: data.action,
      userId: data.userId,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      changes: data.changes,
      timestamp: data.timestamp,
      ipAddress: data.ipAddress
    };
  }
};

export const offlineAttendanceConverter = {
  toFirestore(record: OfflineAttendance) {
    return {
      userId: record.userId,
      sessionId: record.sessionId,
      timestamp: record.timestamp,
      synced: record.synced
    };
  },
  fromFirestore(snapshot: any): OfflineAttendance {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: data.timestamp,
      synced: data.synced
    };
  }
};
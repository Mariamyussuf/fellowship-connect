/**
 * Core types used throughout the application
 */

// User related types
import { Timestamp } from 'firebase/firestore';

export type UserRole = 'member' | 'admin' | 'super-admin';

export interface FellowshipUser {
  id?: string;
  uid: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  role: UserRole;
  status?: 'active' | 'inactive' | 'suspended';
  campus?: string;
  profileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  academicYear?: string;
  major?: string;
  yearOfStudy?: '100 Level' | '200 Level' | '300 Level' | '400 Level' | '500 Level' | 'Masters' | 'PhD';
  expectedGraduation?: string;
  photoURL?: string | null;
  active?: boolean;
  age?: number;
  birthday?: string;
  department?: string;
}

// Attendance related types
export interface AttendanceRecord {
  id?: string;
  userId: string;
  userName: string;
  eventId?: string;
  eventType: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other';
  eventName?: string;
  checkInTime: string;
  timestamp: string;
  checkInMethod: 'qr' | 'qrcode' | 'manual' | 'admin' | 'self' | 'offline';
  qrCodeSessionId?: string;
  isVisitor?: boolean;
  visitorInfo?: {
    name: string;
    email?: string;
    phoneNumber?: string;
    referredBy?: string;
    isFirstTime?: boolean;
  };
  campus?: string;
  createdAt?: string;
}

export interface OfflineAttendanceRecord extends AttendanceRecord {
  synced?: boolean;
  syncedAt?: string;
}

export interface VisitorInfo {
  name: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  invitedBy?: string;
  referredBy?: string;
  isFirstTime: boolean;
}

// QR Code related types
export interface QRCodeData {
  eventId: string;
  eventName: string;
  timestamp: number;
  expiresAt: number;
}

// Event related types
export interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other';
  coverImageURL?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  attendees?: string[];
  rsvpCount?: number;
}

// Prayer request related types
export interface PrayerRequest {
  id?: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  description: string; // Alias for content to match form field
  isAnonymous: boolean;
  isPublic: boolean;
  category: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'approved' | 'rejected' | 'answered' | 'archived';
  createdAt: string;
  updatedAt?: string;
  answeredAt?: string;
  isAnswered?: boolean;
  answerNote?: string;
  adminNotes?: string;
  moderatedAt?: string;
}

// Welfare/Help Request types
export interface WelfareRequest {
  id?: string;
  userId: string;
  userName: string;
  email?: string;
  phoneNumber?: string;
  requestType: 'financial' | 'food' | 'accommodation' | 'medical' | 'transportation' | 'other';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'approved' | 'completed' | 'declined';
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  adminNotes?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Welfare Support type (alias for WelfareRequest)
export type WelfareSupport = WelfareRequest;

// Evangelism Report types
export interface EvangelismReport {
  id?: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  location?: string;
  date: string;
  peopleReached?: number;
  conversions?: number;
  followUpRequired?: boolean;
  followUpNotes?: string;
  status: 'pending' | 'approved' | 'published' | 'rejected';
  moderatedBy?: string;
  moderatedAt?: string;
  moderationNotes?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Media/Sermon types
export interface Sermon {
  id?: string;
  title: string;
  description?: string;
  preacher: string;
  series?: string;
  date: string;
  duration?: number;
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  downloadableResources?: SermonResource[];
  tags?: string[];
  scripture?: string;
  notes?: string;
  viewCount?: number;
  downloadCount?: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SermonResource {
  id?: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'image' | 'other';
  url: string;
  size?: number;
}

// QR Code and Attendance System types
export interface QRCodeSession {
  id?: string;
  eventId?: string;
  eventName: string;
  eventType: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other';
  wordOfTheDay: string;
  qrCodeData: string;
  generatedAt: string;
  expiresAt: string;
  isActive: boolean;
  generatedBy: string;
  attendanceCount?: number;
}

// Device Management types
export interface Device {
  id?: string;
  deviceName: string;
  deviceType: 'tablet' | 'kiosk' | 'mobile' | 'desktop';
  location: string;
  isActive: boolean;
  lastSyncAt?: string;
  registeredBy: string;
  registeredAt: string;
  syncLogs?: DeviceSyncLog[];
}

export interface DeviceSyncLog {
  id?: string;
  deviceId: string;
  syncType: 'attendance' | 'members' | 'events' | 'full';
  status: 'success' | 'failed' | 'partial';
  recordsCount?: number;
  errorMessage?: string;
  syncedAt: string;
}

// Ministry and Small Group types
export interface Ministry {
  id?: string;
  name: string;
  description: string;
  leader: string;
  leaderContact?: string;
  members?: string[];
  meetingSchedule?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SmallGroup {
  id?: string;
  name: string;
  description?: string;
  leader: string;
  coLeader?: string;
  members: string[];
  maxMembers?: number;
  meetingDay: string;
  meetingTime: string;
  location: string;
  isActive: boolean;
  attendanceRecords?: GroupAttendanceRecord[];
  createdAt: string;
  updatedAt?: string;
}

export interface GroupAttendanceRecord {
  id?: string;
  groupId: string;
  date: string;
  presentMembers: string[];
  absentMembers: string[];
  visitors?: string[];
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

// Mailing List types
export interface MailingListSubscriber {
  id?: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  subscriptionType: 'email' | 'sms' | 'both';
  categories: string[];
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
}

// Notification types
export interface Notification {
  id?: string;
  userId?: string; // null for broadcast notifications
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'event' | 'reminder';
  category: 'general' | 'event' | 'prayer' | 'welfare' | 'testimony' | 'admin';
  isRead: boolean;
  isPush: boolean;
  isSMS: boolean;
  isEmail: boolean;
  scheduledFor?: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
}

// Campus types
export interface Campus {
  id?: string;
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  serviceTimes: ServiceTime[];
  contactInfo: {
    phone?: string;
    email?: string;
  };
  pastor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceTime {
  day: string;
  time: string;
  serviceType: string;
}

// Testimony types
export interface Testimony {
  id?: string;
  userId?: string;
  userName?: string;
  title: string;
  content: string;
  category: string;
  isPublic?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  submittedBy?: string;
  submittedAt?: Timestamp | string;
  moderatedBy?: string | null;
  moderatedAt?: Timestamp | string | null;
  moderationNotes?: string;
  featured?: boolean;
  viewCount?: number;
  likes?: number;
  mediaUrls?: string[];
  tags?: string[];
  isAnonymous?: boolean;
  contactPermission?: boolean;
  location?: string;
  witnessedBy?: string;
  dateOfTestimony?: string;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

// Media/Resource types
export interface MediaItem {
  id?: string;
  title: string;
  description?: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  category: string;
  fileName: string;
  fileSize?: number;
  createdAt: Timestamp | string;
  uploadedBy: string;
  tags?: string[];
}

export interface Resource {
  id?: string;
  title: string;
  description: string;
  url: string;
  type: 'pdf' | 'doc' | 'ppt' | 'image' | 'other';
  category: string;
  fileName: string;
  fileSize?: number;
  createdAt: Timestamp | string;
  uploadedBy: string;
  downloadCount?: number;
  tags?: string[];
}

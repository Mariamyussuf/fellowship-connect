import type { QRCodeSession } from '../types';

/**
 * QR Code utilities for the attendance system
 * Handles QR code generation, validation, and word-of-the-day verification
 */

// Generate a cryptographically secure random string
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
};

// Generate word of the day based on date and secret
export const generateWordOfTheDay = (date: Date, secretKey?: string): string => {
  const words = [
    'FAITH', 'HOPE', 'LOVE', 'GRACE', 'PEACE', 'JOY', 'TRUST', 'MERCY',
    'BLESSED', 'PRAISE', 'GLORY', 'LIGHT', 'TRUTH', 'WISDOM', 'SPIRIT',
    'PRAYER', 'WORSHIP', 'SERVE', 'HONOR', 'UNITY', 'STRENGTH', 'COURAGE',
    'KINDNESS', 'PATIENCE', 'HUMBLE', 'FORGIVE', 'ETERNAL', 'DIVINE',
    'SACRED', 'HOLY', 'MIRACLE', 'VICTORY', 'PROMISE', 'COVENANT',
    'SALVATION', 'REDEMPTION', 'FELLOWSHIP', 'COMMUNION', 'SANCTUARY'
  ];
  
  // Create a seed based on the date and optional secret
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  const seed = secretKey ? `${dateStr}-${secretKey}` : dateStr;
  
  // Simple hash function to generate consistent index
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % words.length;
  return words[index];
};

// Create QR code data with embedded information
export const createQRCodeData = (session: Partial<QRCodeSession>): string => {
  const qrData = {
    sessionId: session.id,
    eventName: session.eventName,
    eventType: session.eventType,
    wordOfTheDay: session.wordOfTheDay,
    token: generateSecureToken(16),
    timestamp: new Date().toISOString(),
    expiresAt: session.expiresAt
  };
  
  // Encode as base64 for QR code
  return btoa(JSON.stringify(qrData));
};

// Parse and validate QR code data
export const parseQRCodeData = (qrCodeString: string): any => {
  try {
    const decoded = atob(qrCodeString);
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Invalid QR code format');
  }
};

// Validate QR code session
export const validateQRCodeSession = (
  qrCodeData: string,
  currentWordOfTheDay: string,
  allowedTimeWindow: number = 30 // minutes
): { isValid: boolean; error?: string; sessionData?: any } => {
  try {
    const sessionData = parseQRCodeData(qrCodeData);
    
    // Check if QR code has expired
    const expiresAt = new Date(sessionData.expiresAt);
    const now = new Date();
    
    if (now > expiresAt) {
      return { isValid: false, error: 'QR code has expired' };
    }
    
    // Validate word of the day
    if (sessionData.wordOfTheDay !== currentWordOfTheDay) {
      return { isValid: false, error: 'Invalid word of the day' };
    }
    
    // Check time window (optional additional security)
    const timestamp = new Date(sessionData.timestamp);
    const timeDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60); // minutes
    
    if (timeDiff > allowedTimeWindow) {
      return { isValid: false, error: 'QR code is too old' };
    }
    
    return { isValid: true, sessionData };
    
  } catch (error) {
    return { isValid: false, error: 'Invalid QR code data' };
  }
};

// Generate QR code session for an event
export const generateQRCodeSession = (
  eventName: string,
  eventType: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other',
  eventId?: string,
  durationMinutes: number = 180 // 3 hours default
): Partial<QRCodeSession> => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (durationMinutes * 60 * 1000));
  const wordOfTheDay = generateWordOfTheDay(now);
  
  const session: Partial<QRCodeSession> = {
    eventId,
    eventName,
    eventType,
    wordOfTheDay,
    generatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true,
    attendanceCount: 0
  };
  
  session.qrCodeData = createQRCodeData(session);
  
  return session;
};

// Check if user can check in (prevent duplicate check-ins)
export const canUserCheckIn = (
  userId: string,
  eventId: string,
  existingAttendance: any[],
  allowMultipleCheckIns: boolean = false
): { canCheckIn: boolean; reason?: string } => {
  if (allowMultipleCheckIns) {
    return { canCheckIn: true };
  }
  
  // Check if user already checked in for this event today
  const today = new Date().toISOString().split('T')[0];
  const existingCheckIn = existingAttendance.find(record => 
    record.userId === userId && 
    record.eventId === eventId &&
    record.checkInTime.startsWith(today)
  );
  
  if (existingCheckIn) {
    return { 
      canCheckIn: false, 
      reason: 'You have already checked in for this event today' 
    };
  }
  
  return { canCheckIn: true };
};

// Format QR code for display (add visual formatting)
export const formatQRCodeForDisplay = (qrData: string): string => {
  // Add prefix to identify as Fellowship Connect QR code
  return `FC-ATTEND:${qrData}`;
};

// Validate QR code format
export const isValidQRCodeFormat = (qrString: string): boolean => {
  return qrString.startsWith('FC-ATTEND:') && qrString.length > 20;
};

// Extract QR data from formatted string
export const extractQRData = (formattedQR: string): string => {
  if (!isValidQRCodeFormat(formattedQR)) {
    throw new Error('Invalid QR code format');
  }
  
  return formattedQR.replace('FC-ATTEND:', '');
};

// Generate offline attendance token (for when internet is not available)
export const generateOfflineToken = (
  userId: string,
  eventName: string,
  timestamp: string
): string => {
  const offlineData = {
    userId,
    eventName,
    timestamp,
    offline: true,
    token: generateSecureToken(12)
  };
  
  return btoa(JSON.stringify(offlineData));
};

// Validate offline token
export const validateOfflineToken = (token: string): { isValid: boolean; data?: any } => {
  try {
    const data = JSON.parse(atob(token));
    
    if (!data.offline || !data.userId || !data.eventName || !data.timestamp) {
      return { isValid: false };
    }
    
    return { isValid: true, data };
  } catch (error) {
    return { isValid: false };
  }
};

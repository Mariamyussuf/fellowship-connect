/**
 * QR Code generation and scanning utility for attendance check-ins
 */

// Types for QR code data
export interface AttendanceQRData {
  eventId?: string;
  eventType: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other';
  eventName?: string;
  validUntil: string; // ISO date string for when the QR code expires
  checkInToken: string; // Unique token to prevent duplicate check-ins
}

/**
 * Generates attendance QR code data for an event
 * 
 * @param eventId - Optional ID of the event
 * @param eventType - The type of event
 * @param eventName - Optional name of the event
 * @param validMinutes - How many minutes the QR code should be valid for (default: 30)
 * @returns QR code data as a JSON string
 */
export const generateAttendanceQRData = (
  eventId?: string,
  eventType: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other' = 'weekly',
  eventName?: string,
  validMinutes: number = 30
): string => {
  // Generate a random check-in token
  const checkInToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
  
  // Calculate expiration time
  const validUntil = new Date();
  validUntil.setMinutes(validUntil.getMinutes() + validMinutes);
  
  // Create QR data object
  const qrData: AttendanceQRData = {
    eventId,
    eventType,
    eventName,
    validUntil: validUntil.toISOString(),
    checkInToken
  };
  
  // Return JSON string for QR code
  return JSON.stringify(qrData);
};

/**
 * Parses QR code data and validates it
 * 
 * @param qrCodeData - The string data from the scanned QR code
 * @returns The parsed QR code data if valid, or null if invalid or expired
 */
export const parseAttendanceQRData = (qrCodeData: string): AttendanceQRData | null => {
  try {
    // Parse QR code data
    const parsedData = JSON.parse(qrCodeData) as AttendanceQRData;
    
    // Check if QR code has expired
    const validUntil = new Date(parsedData.validUntil);
    const now = new Date();
    
    if (now > validUntil) {
      console.error('QR code has expired');
      return null;
    }
    
    // Check if required fields are present
    if (!parsedData.eventType || !parsedData.checkInToken) {
      console.error('Invalid QR code data: missing required fields');
      return null;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
};
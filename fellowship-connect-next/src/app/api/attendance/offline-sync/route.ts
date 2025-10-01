import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { AttendanceService } from '@/services/server/attendance.service';
import { OfflineSyncSchema } from '@/lib/validation';

const attendanceService = new AttendanceService();

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authReq = request as any;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = OfflineSyncSchema.parse(body);
    
    const result = await attendanceService.syncOfflineAttendance(validatedData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Offline records synced successfully',
        syncedCount: result.syncedCount
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Sync offline records API error:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
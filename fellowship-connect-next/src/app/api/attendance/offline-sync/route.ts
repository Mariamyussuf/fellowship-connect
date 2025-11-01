import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/services/server/attendance.service';
import { OfflineSyncSchema } from '@/lib/validation';

const attendanceService = new AttendanceService();

export async function POST(request: NextRequest) {
  try {
    const user = request.user;

    if (!user) {
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
  } catch (error: unknown) {
    console.error('Sync offline records API error:', error);
    
    // Handle Zod validation errors
    if (typeof error === 'object' && error !== null && (error as { name?: string }).name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: (error as { errors?: unknown }).errors
      }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
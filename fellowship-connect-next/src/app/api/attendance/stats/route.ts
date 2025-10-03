import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { AttendanceService } from '@/services/server/attendance.service';

// Define the authenticated request type for App Router
interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

const attendanceService = new AttendanceService();

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authReq = request as AuthenticatedRequest;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Default to 30 days ago
    const end = searchParams.get('end') || new Date().toISOString();
    
    const result = await attendanceService.getAttendanceStats(
      authReq.user.id,
      { start, end }
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        stats: result.stats
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Get statistics API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
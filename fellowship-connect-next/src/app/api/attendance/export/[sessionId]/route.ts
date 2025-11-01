import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/services/server/attendance.service';

const attendanceService = new AttendanceService();

function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

interface RouteContext {
  params: {
    sessionId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json({
        error: 'Session ID is required'
      }, { status: 400 });
    }
    const user = request.user;

    if (!user) {
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Check if user has admin role
    const userRole = user.role || 'member';
    const allowedRoles = ['admin', 'super-admin'];
    const hasRole = allowedRoles.includes(userRole);
    
    if (!hasRole) {
      return NextResponse.json({
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    // Get format from query parameters
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'json') as 'csv' | 'json';
    
    const ipAddress = getClientIP(request);
    const result = await attendanceService.exportAttendance(sessionId, format, ipAddress);
    
    if (result.success) {
      return new NextResponse(result.data, {
        status: 200,
        headers: {
          'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
          'Content-Disposition': `attachment; filename="attendance-export-${sessionId}.${format}"`
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Export attendance API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
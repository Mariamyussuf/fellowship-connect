import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { requireRole } from '@/middleware/rbac';
import { AttendanceService } from '@/services/server/attendance.service';

const attendanceService = new AttendanceService();

export async function GET(request: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  try {
    // Get the params from the context
    const params = await context.params;
    // Authenticate user
    const authReq = request as any;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Check if user has admin role
    const userRole = authReq.user.role || 'member';
    const allowedRoles = ['admin', 'super-admin'];
    const hasRole = allowedRoles.includes(userRole);
    
    if (!hasRole) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    // Get format from query parameters
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'json') as 'csv' | 'json';
    
    const result = await attendanceService.exportAttendance(params.sessionId, format);
    
    if (result.success) {
      return new NextResponse(result.data, {
        status: 200,
        headers: {
          'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
          'Content-Disposition': `attachment; filename=\"attendance-export-${params.sessionId}.${format}\"`
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Export attendance API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
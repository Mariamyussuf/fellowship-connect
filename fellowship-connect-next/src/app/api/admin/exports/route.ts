import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/services/server/admin.service';

const adminService = new AdminService();

// Get client IP from request
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

export async function GET(request: NextRequest) {
  try {
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection') || 'users';
    const format = (searchParams.get('format') as 'csv' | 'json') || 'json';
    
    // Get filters
    const filters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'collection' && key !== 'format') {
        filters[key] = value;
      }
    });
    
    const userId = authReq.user.uid;
    const ipAddress = getClientIP(request);
    
    const result = await adminService.exportData(collection, format, filters, userId, ipAddress);
    
    if (result.success) {
      // Set appropriate content type based on format
      const contentType = format === 'csv' ? 'text/csv' : 'application/json';
      const fileName = `export-${collection}-${new Date().toISOString().split('T')[0]}.${format}`;
      
      return new NextResponse(result.data, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Export data API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
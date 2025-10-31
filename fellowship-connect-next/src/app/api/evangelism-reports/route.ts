import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { requireRole } from '@/middleware/rbac';
import { PrayerService } from '@/services/server/prayer.service';
import { SubmitEvangelismReportSchema } from '@/lib/validation';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// Define the authenticated request type for App Router
interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

const prayerService = new PrayerService();

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authReq = request as AuthenticatedRequest;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = SubmitEvangelismReportSchema.parse(body);
    
    const result = await prayerService.submitEvangelismReport(
      authReq.user.uid,
      {
        title: validatedData.title,
        description: validatedData.description,
        location: validatedData.location,
        peopleReached: validatedData.peopleReached,
        conversions: validatedData.conversions,
        followUpRequired: validatedData.followUpRequired,
        followUpNotes: validatedData.followUpNotes
      }
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Evangelism report submitted successfully',
        reportId: result.reportId
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Submit evangelism report API error:', error);
    
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
    const filters: Record<string, unknown> = {};
    
    // Convert pagination to limit/lastDoc
    let limit = 10;
    if (searchParams.get('limit')) {
      limit = parseInt(searchParams.get('limit') || '10');
    }
    
    const result = await prayerService.getEvangelismReports(
      filters,
      { limit }
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        evangelismReports: result.reports
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('List evangelism reports API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
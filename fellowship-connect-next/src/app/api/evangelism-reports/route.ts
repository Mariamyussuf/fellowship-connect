import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { PrayerService } from '@/services/server/prayer.service';
import { SubmitEvangelismReportSchema } from '@/lib/validation';

const prayerService = new PrayerService();

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
    const validatedData = SubmitEvangelismReportSchema.parse(body);
    
    const result = await prayerService.submitEvangelismReport(
      authReq.user.id,
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
  } catch (error: any) {
    console.error('Submit evangelism report API error:', error);
    
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
    const filters: any = {};
    
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
  } catch (error: any) {
    console.error('List evangelism reports API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
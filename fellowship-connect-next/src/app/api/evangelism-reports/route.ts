import { NextRequest, NextResponse } from 'next/server';
import { PrayerService } from '@/services/server/prayer.service';
import { SubmitEvangelismReportSchema } from '@/lib/validation';

const prayerService = new PrayerService();

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
    const validatedData = SubmitEvangelismReportSchema.parse(body);

    const result = await prayerService.submitEvangelismReport(
      user.uid,
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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = request.user;

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Check if user has admin role
    const userRole = user.role || 'member';
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
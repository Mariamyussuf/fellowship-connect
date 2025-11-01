import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/services/server/notification.service';

const notificationService = new NotificationService();

export async function GET(request: NextRequest) {
  try {
    const user = request.user;

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    
    // Convert pagination to limit/lastDoc
    let limit = 10;
    if (searchParams.get('limit')) {
      limit = parseInt(searchParams.get('limit') || '10');
    }
    
    const result = await notificationService.getNotificationHistory(
      user.uid,
      { limit }
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        notifications: result.notifications
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Get notification history API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
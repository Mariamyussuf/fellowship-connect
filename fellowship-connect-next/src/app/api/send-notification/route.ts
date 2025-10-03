import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/authMiddleware';
import { sendNotification } from '../notifications/controller';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    const { user } = authResult;
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Transform the mock notification format to our new format
    const notificationData = {
      title: body.title,
      body: body.body,
      recipients: [user.uid], // Send to current user for demo
      type: 'push'
    };
    
    const result = await sendNotification(notificationData, user);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Send notification API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
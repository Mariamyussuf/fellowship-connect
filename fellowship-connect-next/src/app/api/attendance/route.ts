import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/services/server/attendance.service';
import { CreateSessionSchema } from '@/lib/validation';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// Define the authenticated request type for App Router
interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

const attendanceService = new AttendanceService();

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
    
    // Check if user has admin role
    const userRole = authReq.user.role || 'member';
    const allowedRoles = ['admin', 'super-admin', 'chaplain'];
    const hasRole = allowedRoles.includes(userRole);
    
    if (!hasRole) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = CreateSessionSchema.parse(body);
    
    const result = await attendanceService.createSession(
      validatedData.name,
      validatedData.location,
      validatedData.duration,
      authReq.user.uid
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        session: result.session
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Create session API error:', error);
    
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

// GET handler for getting all sessions or user-specific sessions
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
    const userId = searchParams.get('userId');
    
    // If requesting all sessions, check permissions
    if (!userId || userId !== authReq.user.uid) {
      const userRole = authReq.user.role || 'member';
      const allowedRoles = ['admin', 'super-admin', 'chaplain'];
      const hasRole = allowedRoles.includes(userRole);
      
      if (!hasRole) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions'
        }, { status: 403 });
      }
    }
    
    const { getFirebaseAdmin } = await import('@/lib/firebase-admin');
    const { db } = getFirebaseAdmin();
    
    let query: FirebaseFirestore.Query = db.collection('qrCodeSessions');
    
    // Filter by user if specified and user has permission
    if (userId) {
      query = query.where('createdBy', '==', userId);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const sessions: FirebaseFirestore.DocumentData[] = [];
    snapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return NextResponse.json({
      success: true,
      sessions
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Get sessions API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
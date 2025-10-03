import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

// Define the authenticated request type for App Router
interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get user from auth middleware
    const user = (request as AuthenticatedRequest).user;
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Get Firebase Admin SDK
    const { db } = getFirebaseAdmin();
    
    // Fetch user profile from Firestore
    const userDoc = await db.collection('users').doc(user.id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found'
      }, { status: 404 });
    }
    
    const userProfile = userDoc.data();
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ...userProfile
      }
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Get user API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
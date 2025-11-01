import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

interface VerificationResponse {
  success: boolean;
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json<VerificationResponse>({ success: false }, { status: 401 });
  }

  try {
    const { auth, db } = getFirebaseAdmin();

    if (!auth) {
      return NextResponse.json<VerificationResponse>({ success: false }, { status: 500 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    let role = (decodedClaims.role as string | undefined) || 'member';

    if (db) {
      try {
        const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          if (data && typeof data.role === 'string') {
            role = data.role;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch user role for verification:', error);
      }
    }

    return NextResponse.json<VerificationResponse>({
      success: true,
      user: {
        id: decodedClaims.uid,
        role,
        email: decodedClaims.email ?? undefined
      }
    });
  } catch (error) {
    console.error('Session verification failed:', error);
    return NextResponse.json<VerificationResponse>({ success: false }, { status: 401 });
  }
}

export const runtime = 'nodejs';

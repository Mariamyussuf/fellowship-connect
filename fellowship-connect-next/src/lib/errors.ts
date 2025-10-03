/**
 * Custom error classes for the application
 */

/**
 * Base custom error class
 */
export class CustomError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation error
 */
export class ValidationError extends CustomError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends CustomError {
  constructor(
    message: string = 'Authentication required'
  ) {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends CustomError {
  constructor(
    message: string = 'Insufficient permissions'
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends CustomError {
  constructor(
    message: string = 'Resource not found'
  ) {
    super(message, 'NOT_FOUND_ERROR', 404);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends CustomError {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429);
  }
}

/**
 * Service error
 */
export class ServiceError extends CustomError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'SERVICE_ERROR', 500, details);
  }
}

interface FirebaseError {
  code: string;
  message: string;
}

interface ZodError {
  name: string;
  errors: unknown[];
}

interface ErrorInfo {
  code: string;
  status: number;
}

interface ErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
  };
  status: number;
}

/**
 * Error handler middleware
 * @param error Error object
 * @returns Formatted error response
 */
export function handleApiError(error: unknown) {
  // Handle known custom errors
  if (error instanceof CustomError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString()
      },
      status: error.statusCode
    };
  }
  
  // Handle Zod validation errors
  if (typeof error === 'object' && error !== null && (error as ZodError).name === 'ZodError') {
    const zodError = error as ZodError;
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: zodError.errors,
        timestamp: new Date().toISOString()
      },
      status: 400
    };
  }
  
  // Handle Firebase errors
  if (typeof error === 'object' && error !== null && (error as FirebaseError).code) {
    const firebaseError = error as FirebaseError;
    const firebaseErrorMap: Record<string, ErrorInfo> = {
      'auth/email-already-exists': { code: 'EMAIL_EXISTS', status: 409 },
      'auth/invalid-email': { code: 'INVALID_EMAIL', status: 400 },
      'auth/invalid-password': { code: 'INVALID_PASSWORD', status: 400 },
      'auth/user-not-found': { code: 'USER_NOT_FOUND', status: 404 },
      'auth/wrong-password': { code: 'INVALID_CREDENTIALS', status: 401 },
      'auth/too-many-requests': { code: 'RATE_LIMIT_EXCEEDED', status: 429 }
    };
    
    const errorInfo = firebaseErrorMap[firebaseError.code] || { code: 'FIREBASE_ERROR', status: 500 };
    
    return {
      success: false,
      error: {
        code: errorInfo.code,
        message: firebaseError.message,
        details: { firebaseCode: firebaseError.code },
        timestamp: new Date().toISOString()
      },
      status: errorInfo.status
    };
  }
  
  // Handle generic errors
  const errorMessage = error instanceof Error ? error.message : 'Internal server error';
  
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: errorMessage,
      timestamp: new Date().toISOString()
    },
    status: 500
  };
}
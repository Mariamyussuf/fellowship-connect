import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '../firebase/auth';
import { registrationSchema, type RegistrationFormData } from '../utils/validationSchemas';

const Register = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const router = useRouter();
  
  // Check if Firebase is ready
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // This will ensure Firebase is initialized
        await import('../lib/firebase');
        setFirebaseReady(true);
      } catch (err) {
        console.error('Firebase not ready:', err);
        setError('Authentication service is not available. Please try again later.');
      }
    };
    
    checkFirebase();
  }, []);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    disabled: !firebaseReady
  });
  
  const onSubmit = async (data: RegistrationFormData) => {
    if (!firebaseReady) {
      setError('Authentication service is not ready. Please wait a moment and try again.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Register user with Firebase Authentication
      await registerUser(data.email, data.password, {
        displayName: data.displayName,
        birthday: data.birthday,
        role: 'member' // Default role for new registrations
      });
      
      // Redirect to the member registration form to complete profile
      router.push('/complete-profile');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create an account. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Fellowship Connect</h1>
        <h2>Create an Account</h2>
        
        {!firebaseReady && (
          <div className="info-message">Initializing authentication service...</div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              {...register('displayName')}
              placeholder="Enter your display name"
              disabled={!firebaseReady}
            />
            {errors.displayName && (
              <span className="error">{errors.displayName.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="birthday">Date of Birth</label>
            <input
              type="date"
              id="birthday"
              {...register('birthday')}
              disabled={!firebaseReady}
            />
            {errors.birthday && (
              <span className="error">{errors.birthday.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              placeholder="Enter your email"
              disabled={!firebaseReady}
            />
            {errors.email && (
              <span className="error">{errors.email.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register('password')}
              placeholder="Enter your password"
              disabled={!firebaseReady}
            />
            {errors.password && (
              <span className="error">{errors.password.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword')}
              placeholder="Confirm your password"
              disabled={!firebaseReady}
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword.message}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || !firebaseReady}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-links">
          <span>Already have an account? <Link href="/login">Login</Link></span>
        </div>
      </div>
    </div>
  );
};

export default Register;
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '../firebase/auth';
import { registrationSchema, type RegistrationFormData } from '../utils/validationSchemas';

const Register = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema)
  });
  
  const onSubmit = async (data: RegistrationFormData) => {
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
      setError(err instanceof Error ? err.message : 'Failed to create an account. Please try again.');
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
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              {...register('displayName')}
              placeholder="Enter your display name"
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
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword.message}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
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
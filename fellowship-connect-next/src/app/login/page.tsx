'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import BUCCFLogo from '../../assets/BUCCF-LOGO.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { login, loading: authLoading } = useAuth();

  // Show loading state while auth context is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl font-medium text-blue-900">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      
      // Save email to localStorage if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      // Handle specific Firebase errors
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const error = err as { code?: string; message?: string };
        if (error.code === 'auth/configuration-not-found') {
          setError('Firebase configuration error. Please contact the administrator.');
        } else if (error.code === 'auth/invalid-credential') {
          setError('Invalid email or password. Please try again.');
        } else if (error.code === 'auth/user-not-found') {
          setError('No user found with this email address.');
        } else if (error.code === 'auth/wrong-password') {
          setError('Incorrect password. Please try again.');
        } else if (error.code === 'auth/too-many-requests') {
          setError('Too many failed login attempts. Please try again later.');
        } else if (error.code === 'auth/network-request-failed') {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(error.message || 'Failed to sign in. Please check your credentials and try again.');
        }
      } else {
        setError('Failed to sign in. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-100">
                  <Image
                    src={BUCCFLogo}
                    alt="BUCCF Logo"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
                  BUCCF
                </h1>
                <p className="text-xs text-blue-600 -mt-1 opacity-80 font-medium">Campus Fellowship</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-orange-500 hover:bg-orange-50/50 font-medium">
                Home
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-500 hover:bg-orange-50/50 font-medium">
                About
              </Link>
              <Link href="/#fellowships" className="text-gray-700 hover:text-orange-500 hover:bg-orange-50/50 font-medium">
                Fellowships
              </Link>
              <Link href="/#events" className="text-gray-700 hover:text-orange-500 hover:bg-orange-50/50 font-medium">
                Events
              </Link>
              <Link href="/#contact" className="text-gray-700 hover:text-orange-500 hover:bg-orange-50/50 font-medium">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/register" className="text-blue-900 font-medium hover:text-orange-500">
                Register
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <div className="w-6 h-6 relative">
                  <span className="absolute top-0 left-0 w-full h-0.5 bg-gray-700"></span>
                  <span className="absolute top-2 left-0 w-full h-0.5 bg-gray-700"></span>
                  <span className="absolute top-4 left-0 w-full h-0.5 bg-gray-700"></span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50/50">
              Home
            </Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50/50">
              About
            </Link>
            <Link href="/#fellowships" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50/50">
              Fellowships
            </Link>
            <Link href="/#events" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50/50">
              Events
            </Link>
            <Link href="/#contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50/50">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left side - Branding */}
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                  Welcome
                </div>
                <div className="mt-2 text-blue-900">
                  Back to <span className="text-orange-500">Fellowship</span>
                </div>
              </h1>
              
              <p className="text-2xl leading-relaxed max-w-2xl font-medium text-blue-600">
                Continue your spiritual journey with our vibrant community of university students united in faith, 
                friendship, and purpose.
              </p>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="lg:w-1/2 w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-blue-900 mb-2">
                    Sign in to your account
                  </h2>
                  <p className="text-blue-600">
                    Continue your fellowship journey
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {error}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-blue-900 mb-2">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="your.email@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="password" className="block text-sm font-medium text-blue-900">
                          Password
                        </label>
                        <Link href="/forgot-password" className="text-sm font-medium text-orange-500 hover:text-orange-600">
                          Forgot password?
                        </Link>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-900">
                      Remember me
                    </label>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </div>
                      ) : (
                        'Sign in'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-blue-600">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-bold text-orange-500 hover:text-orange-600">
                      Register now
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import BUCCFLogo from '../../assets/BUCCF-LOGO.jpg';

export default function NewRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const router = useRouter();
  const { signup } = useAuth();

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength === 3) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!fullName.trim()) {
      return setError('Please enter your full name');
    }
    
    if (!email) {
      return setError('Please enter your email');
    }
    
    if (!department) {
      return setError('Please enter your department');
    }
    
    if (!college) {
      return setError('Please enter your college');
    }
    
    if (!password) {
      return setError('Please enter a password');
    }
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (passwordStrength < 3) {
      return setError('Please choose a stronger password');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await signup(email, password, fullName, department, college);
      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please try logging in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Account registration is currently disabled. Please contact support.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError('Failed to create an account. Please try again.');
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
              <Link href="/login" className="text-blue-900 font-medium hover:text-orange-500">
                Login
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
        {isClient && (
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
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left side - Branding */}
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                  Join Our
                </div>
                <div className="mt-2 text-blue-900">
                  <span className="text-orange-500">Fellowship</span> Community
                </div>
              </h1>
              
              <p className="text-2xl leading-relaxed max-w-2xl font-medium text-blue-600">
                Become part of a vibrant community of university students united in faith, 
                friendship, and purpose. Discover your place in God's story at Bells University.
              </p>
            </div>

          </div>

          {/* Right side - Registration Form */}
          <div className="lg:w-1/2 w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-blue-900 mb-2">
                    Create Account
                  </h2>
                  <p className="text-blue-600">
                    Join our campus fellowship community
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
                
                {success && (
                  <div className="rounded-xl bg-green-50 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          {success}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="full-name" className="block text-sm font-medium text-blue-900 mb-2">
                        Full Name
                      </label>
                      <input
                        id="full-name"
                        name="fullName"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-blue-900 mb-2">
                        Department
                      </label>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="college" className="block text-sm font-medium text-blue-900 mb-2">
                        College
                      </label>
                      <input
                        id="college"
                        name="college"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your college"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email-address" className="block text-sm font-medium text-blue-900 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email-address"
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
                      <label htmlFor="password" className="block text-sm font-medium text-blue-900 mb-2">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-blue-900 mb-2">
                        Confirm Password
                      </label>
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {password && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Password Strength:</span>
                        <span className={`font-medium ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength === 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getPasswordStrengthColor()}`} 
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Use at least 8 characters with a mix of letters, numbers & symbols
                      </p>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </form>
                
                <div className="mt-8 text-center">
                  <p className="text-blue-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-orange-500 hover:text-orange-600">
                      Sign in
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
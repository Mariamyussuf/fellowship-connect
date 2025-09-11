'use client';

import { useAuth } from '../../contexts/AuthContext';
import SharedLogin from '../../components/common/SharedLogin';

export default function LoginPage() {
  const { loading: authLoading } = useAuth();

  // Show loading state while auth context is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return <SharedLogin />;
}
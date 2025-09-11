'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    } else if (!loading && currentUser && !isAdmin) {
      router.push('/dashboard');
    } else if (!loading && currentUser && isAdmin) {
      setChecked(true);
    }
  }, [currentUser, isAdmin, loading, router]);

  if (loading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
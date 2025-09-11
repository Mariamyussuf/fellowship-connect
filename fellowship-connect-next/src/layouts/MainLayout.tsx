import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../firebase/auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentUser, userProfile, isAdmin, loading } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <Link href="/dashboard">Fellowship Connect</Link>
        </div>
        {currentUser && (
          <nav className="main-nav">
            <ul>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/attendance">Attendance</Link></li>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/gallery">Photo Gallery</Link></li>
              <li><Link href="/prayer-requests">Prayer Requests</Link></li>
              <li><Link href="/testimonies">Testimonies</Link></li>
              <li><Link href="/resources">Resources</Link></li>
              <li><Link href="/service">Service</Link></li>
              
              {isAdmin && (
                <li className="admin-menu">
                  <span>Admin</span>
                  <div className="dropdown">
                    <Link href="/admin/members">Member Management</Link>
                  </div>
                </li>
              )}
              
              <li className="user-menu">
                <span>{userProfile?.displayName || currentUser.email}</span>
                <div className="dropdown">
                  <Link href="/profile">Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </li>
            </ul>
          </nav>
        )}
      </header>
      
      <main className="app-main">
        {children}
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Fellowship Connect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../firebase/auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentUser, userProfile, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
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
          <Link to="/dashboard">Fellowship Connect</Link>
        </div>
        {currentUser && (
          <nav className="main-nav">
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/attendance">Attendance</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/gallery">Photo Gallery</Link></li>
              <li><Link to="/prayer-requests">Prayer Requests</Link></li>
              <li><Link to="/testimonies">Testimonies</Link></li>
              <li><Link to="/resources">Resources</Link></li>
              <li><Link to="/service">Service</Link></li>
              
              {isAdmin && (
                <li className="admin-menu">
                  <span>Admin</span>
                  <div className="dropdown">
                    <Link to="/admin/members">Member Management</Link>
                  </div>
                </li>
              )}
              
              <li className="user-menu">
                <span>{userProfile?.displayName || currentUser.email}</span>
                <div className="dropdown">
                  <Link to="/profile">Profile</Link>
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
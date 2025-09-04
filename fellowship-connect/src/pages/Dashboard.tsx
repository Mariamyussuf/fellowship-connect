import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { db } from '../firebase/config';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import type { Event, Announcement } from '../types';

interface DashboardStats {
  totalMembers: number;
  todayAttendance: number;
  upcomingEvents: number;
  recentPrayerRequests: number;
}

const Dashboard = () => {
  const { userProfile, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    todayAttendance: 0,
    upcomingEvents: 0,
    recentPrayerRequests: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total members
        const membersSnapshot = await getDocs(collection(db, 'users'));
        const totalMembers = membersSnapshot.size;
        
        // Fetch today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('date', '>=', today.toISOString())
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const todayAttendance = attendanceSnapshot.size;
        
        // Fetch upcoming events
        const upcomingEventsQuery = query(
          collection(db, 'events'),
          where('date', '>=', today.toISOString()),
          orderBy('date'),
          limit(5)
        );
        const eventsSnapshot = await getDocs(upcomingEventsQuery);
        const events = eventsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Event));
        
        // Fetch recent prayer requests
        const prayerRequestsQuery = query(
          collection(db, 'prayerRequests'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const prayerRequestsSnapshot = await getDocs(prayerRequestsQuery);
        
        // Fetch announcements
        const announcementsQuery = query(
          collection(db, 'announcements'),
          orderBy('date', 'desc'),
          limit(5)
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        const latestAnnouncements = announcementsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Announcement));
        
        // Update state with fetched data
        setStats({
          totalMembers,
          todayAttendance,
          upcomingEvents: eventsSnapshot.size,
          recentPrayerRequests: prayerRequestsSnapshot.size
        });
        
        setUpcomingEvents(events);
        setAnnouncements(latestAnnouncements);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return <MainLayout><div>Loading dashboard data...</div></MainLayout>;
  }
  
  return (
    <MainLayout>
      <div className="dashboard">
        <h1>Welcome, {userProfile?.displayName || 'Fellow'}</h1>
        
        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Members</h3>
            <div className="stat-value">{stats.totalMembers}</div>
            <Link to="/admin/members">View All</Link>
          </div>
          
          <div className="stat-card">
            <h3>Today's Attendance</h3>
            <div className="stat-value">{stats.todayAttendance}</div>
            <Link to="/attendance">Check In</Link>
          </div>
          
          <div className="stat-card">
            <h3>Upcoming Events</h3>
            <div className="stat-value">{stats.upcomingEvents}</div>
            <Link to="/events">View Events</Link>
          </div>
          
          <div className="stat-card">
            <h3>Prayer Requests</h3>
            <div className="stat-value">{stats.recentPrayerRequests}</div>
            <Link to="/prayer-requests">View Requests</Link>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/attendance" className="action-button">
              Check In
            </Link>
            <Link to="/prayer-requests/new" className="action-button">
              Submit Prayer Request
            </Link>
            <Link to="/testimonies/new" className="action-button">
              Share Testimony
            </Link>
            <Link to="/events" className="action-button">
              View Events
            </Link>
          </div>
        </div>
        
        {/* Announcements */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Announcements</h2>
            {isAdmin && (
              <Link to="/announcements/new" className="btn-small">
                New Announcement
              </Link>
            )}
          </div>
          
          <div className="announcements-list">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-item">
                  <h3>{announcement.title}</h3>
                  <p>{announcement.content}</p>
                  <small>
                    Posted on {new Date(announcement.date).toLocaleDateString()}
                  </small>
                </div>
              ))
            ) : (
              <p>No announcements at this time.</p>
            )}
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <Link to="/events" className="view-all">
              View All Events
            </Link>
          </div>
          
          <div className="events-list">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link to={`/events/${event.id}`} key={event.id} className="event-item">
                  <h3>{event.title}</h3>
                  <p>
                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                </Link>
              ))
            ) : (
              <p>No upcoming events at this time.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
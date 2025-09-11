'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Define the interface for event objects
interface EventType {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description: string;
  registered: boolean;
}

export default function EventsPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventType[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
    
    // Simulate fetching events
    if (currentUser) {
      setEvents([
        { 
          id: 1, 
          title: 'Sunday Service', 
          date: '2023-05-21', 
          time: '9:00 AM', 
          location: 'Main Sanctuary', 
          type: 'service',
          description: 'Join us for our weekly Sunday service with worship and teaching.',
          registered: true
        },
        { 
          id: 2, 
          title: 'Bible Study', 
          date: '2023-05-24', 
          time: '6:00 PM', 
          location: 'Room 201', 
          type: 'study',
          description: 'Dive deep into the Word of God with our Bible study group.',
          registered: false
        },
        { 
          id: 3, 
          title: 'Youth Fellowship', 
          date: '2023-05-26', 
          time: '7:00 PM', 
          location: 'Youth Hall', 
          type: 'fellowship',
          description: 'Connect with other young believers in our weekly fellowship.',
          registered: true
        },
        { 
          id: 4, 
          title: 'Prayer Meeting', 
          date: '2023-05-28', 
          time: '5:00 PM', 
          location: 'Prayer Room', 
          type: 'prayer',
          description: 'Join us for a time of corporate prayer and intercession.',
          registered: false
        },
      ]);
    }
  }, [currentUser, loading, router]);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'registered') return event.registered;
    if (filter === 'not-registered') return !event.registered;
    return true;
  });

  const handleRegister = (id: number) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, registered: !event.registered } : event
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">Fellowship Connect</h1>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="/attendance" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Attendance
                </a>
                <a href="/events" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Events
                </a>
                <a href="/profile" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Profile
                </a>
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Events
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="filter" className="block text-sm font-medium text-gray-700">Filter by:</label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Events</option>
                  <option value="registered">Registered</option>
                  <option value="not-registered">Not Registered</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{event.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 capitalize">{event.type}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${event.registered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {event.registered ? 'Registered' : 'Not Registered'}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {event.date} at {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {event.location}
                </div>
                <p className="text-sm text-gray-500 mb-4">{event.description}</p>
                <button
                  onClick={() => handleRegister(event.id)}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    event.registered 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {event.registered ? 'Cancel Registration' : 'Register for Event'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
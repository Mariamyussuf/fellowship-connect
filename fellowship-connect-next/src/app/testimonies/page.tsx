'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Define a simplified type for the local testimonies
interface LocalTestimony {
  id: string;
  title: string;
  content: string;
  memberName: string;
  submittedAt: string;
  likes: number;
}

export default function TestimoniesPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [testimonies, setTestimonies] = useState<LocalTestimony[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
    
    // Simulate fetching testimonies
    if (currentUser) {
      setTestimonies([
        { 
          id: '1', 
          title: 'God\'s Faithfulness in Job Loss', 
          content: 'Last year I lost my job unexpectedly. I was devastated and didn\'t know how I would provide for my family. But I continued to trust God and pray. Within two weeks, I received a call for an interview at a company I had never heard of. God gave me favor and I was offered a position with better pay than my previous job. Truly, God is faithful!', 
          memberName: 'Sarah Johnson', 
          submittedAt: '2023-05-10',
          likes: 24
        },
        { 
          id: '2', 
          title: 'Healing from Chronic Illness', 
          content: 'For three years I struggled with a chronic illness that doctors couldn\'t diagnose. I was in constant pain and had lost hope. Our church prayed for me consistently. One day during prayer, I felt God\'s presence and peace wash over me. The next day my symptoms disappeared completely. The doctors were amazed when my follow-up tests showed complete healing. Praise God for His miraculous power!', 
          memberName: 'Michael Brown', 
          submittedAt: '2023-04-22',
          likes: 37
        },
        { 
          id: '3', 
          title: 'Restoration in Marriage', 
          content: 'My spouse and I were on the brink of divorce. We had tried counseling but nothing seemed to work. A friend suggested we attend the marriage enrichment seminar at our church. During the seminar, we both encountered God\'s love in a new way. He showed us how to forgive and love unconditionally. Today, our marriage is stronger than ever. God truly is the God of restoration!', 
          memberName: 'David Wilson', 
          submittedAt: '2023-04-15',
          likes: 18
        },
      ]);
    }
  }, [currentUser, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulate submitting testimony
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowForm(false);
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Error submitting testimony:', error);
    }
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
                <a href="/events" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Events
                </a>
                <a href="/testimonies" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Testimonies
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
              Testimonies
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Share Your Testimony
            </button>
          </div>
        </div>

        {/* New Testimony Form */}
        {showForm && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Share Your Testimony</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Tell how God has worked in your life</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">Your Testimony</label>
                  <textarea
                    id="content"
                    name="content"
                    rows={6}
                    value={formData.content}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Share Testimony
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Testimonies List */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonies.map((testimony) => (
            <div key={testimony.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{testimony.title}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">By {testimony.memberName} on {testimony.submittedAt}</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <p className="text-gray-700">{testimony.content}</p>
                <div className="mt-4 flex items-center">
                  <button className="flex items-center text-sm text-gray-500 hover:text-blue-600">
                    <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    {testimony.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
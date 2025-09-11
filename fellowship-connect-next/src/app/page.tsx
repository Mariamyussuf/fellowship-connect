'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BUCCFLogo from '../assets/BUCCF-LOGO.jpg';

export default function Home() {
  const [memberCount, setMemberCount] = useState(0);
  const [fellowshipCount, setFellowshipCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Animate counters on load
    const timer1 = setTimeout(() => setMemberCount(150), 500);
    const timer2 = setTimeout(() => setFellowshipCount(15), 1000);
    const timer3 = setTimeout(() => setEventCount(32), 1500);
    
    // Handle scroll for navigation
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const fellowships = [
    {
      id: 1,
      name: 'Worship Fellowship',
      description: 'Experience God through music, praise, and heartfelt worship',
      icon: '🎵',
      members: '125+',
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: 2,
      name: 'Bible Study Groups',
      description: 'Deep dive into Scripture with passionate discussions',
      icon: '📖',
      members: '180+',
      color: 'from-green-500 to-green-700'
    },
    {
      id: 3,
      name: 'Prayer Ministry',
      description: 'Interceding for our community and campus with power',
      icon: '🙏',
      members: '95+',
      color: 'from-blue-500 to-blue-700'
    }
  ];

  const events = [
    {
      id: 1,
      title: 'New Year Revival Conference',
      date: '2025-01-15',
      time: '6:00 PM',
      location: 'Main Auditorium',
      type: 'Conference',
      attendees: 120,
      maxAttendees: 150,
      image: '🔥'
    },
    {
      id: 2,
      title: 'Youth Leadership Summit',
      date: '2025-01-22',
      time: '10:00 AM',
      location: 'Conference Hall',
      type: 'Summit',
      attendees: 85,
      maxAttendees: 100,
      image: '👑'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-2xl border-b border-white/20' : 'bg-transparent'}`}>
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
              <Link href="/" className="text-orange-500 bg-orange-50 font-medium">
                Home
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-500 hover:bg-orange-50/50 font-medium">
                About Fellowship Connect
              </Link>
              <Link href="/church-about" className="text-gray-700 hover:text-orange-500 hover:bg-orange-50/50 font-medium">
                About BUCCF Church
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
              <Link href="/login" className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
                Join Us
              </Link>
            </div>

            <button className="md:hidden p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
              <div className="w-6 h-6 relative">
                <span className="absolute top-0 left-0 w-full h-0.5 bg-gray-700"></span>
                <span className="absolute top-2 left-0 w-full h-0.5 bg-gray-700"></span>
                <span className="absolute top-4 left-0 w-full h-0.5 bg-gray-700"></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden flex items-center bg-gray-50">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-orange-500/5"></div>
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-blue-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-orange-200/15 to-orange-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-semibold shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-blue-600">Growing Together in Faith & Community</span>
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-black leading-none">
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                  Connect.
                </div>
                <div className="bg-gradient-to-r from-blue-900 via-purple-700 to-orange-500 bg-clip-text text-transparent mt-2">
                  Serve.
                </div>
                <div className="mt-2 text-blue-900">
                  <span className="inline-block">Grow.</span>
                </div>
              </h1>
              
              <p className="text-2xl leading-relaxed max-w-2xl font-medium text-blue-600">
                Join a vibrant community of <span className="font-bold text-orange-500">university students</span> united in faith, 
                friendship, and purpose. Discover your place in <span className="font-bold text-blue-900">God&apos;s story</span> at Bells University.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/register" className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/25 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Join Our Fellowship</span>
                </Link>
                
                <Link href="/#events" className="group bg-white/95 backdrop-blur-sm text-blue-900 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white transition-all duration-300 border-2 border-blue-100 hover:border-blue-300 shadow-xl hover:shadow-2xl flex items-center justify-center">
                  <span>View Events</span>
                </Link>
              </div>

              {/* Live stats bar */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="group cursor-pointer">
                    <div className="text-3xl font-black text-orange-500 group-hover:scale-110 transition-transform duration-300">
                      {memberCount}+
                    </div>
                    <div className="text-sm font-medium text-blue-600">Active Members</div>
                  </div>
                  <div className="group cursor-pointer border-x border-gray-200">
                    <div className="text-3xl font-black text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      {fellowshipCount}
                    </div>
                    <div className="text-sm font-medium text-blue-600">Fellowships</div>
                  </div>
                  <div className="group cursor-pointer">
                    <div className="text-3xl font-black text-green-500 group-hover:scale-110 transition-transform duration-300">
                      {eventCount}+
                    </div>
                    <div className="text-sm font-medium text-blue-600">Events/Month</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl transform hover:scale-105 transition-all duration-500 border border-white/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 text-center space-y-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl mx-auto flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300">
                      <span className="text-4xl text-white group-hover:scale-110 transition-transform duration-300">❤️</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-black mb-3 text-blue-900">
                      {memberCount}+ Students
                    </h3>
                    <p className="text-lg font-medium text-blue-600">
                      United in Faith & Fellowship
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                    <div className="text-center group cursor-pointer">
                      <div className="text-2xl font-black text-orange-500 group-hover:scale-110 transition-transform duration-300">
                        {fellowshipCount}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Fellowships</div>
                    </div>
                    <div className="text-center group cursor-pointer">
                      <div className="text-2xl font-black text-blue-500 group-hover:scale-110 transition-transform duration-300">
                        {eventCount}+
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Events</div>
                    </div>
                    <div className="text-center group cursor-pointer">
                      <div className="text-2xl font-black text-green-500 group-hover:scale-110 transition-transform duration-300">
                        7+
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Years</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-3xl shadow-2xl animate-bounce hover:animate-none hover:scale-110 transition-all duration-300 cursor-pointer">
                <span className="text-2xl">📖</span>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-3xl shadow-2xl animate-bounce hover:animate-none hover:scale-110 transition-all duration-300 cursor-pointer" style={{ animationDelay: '1s' }}>
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
          }
          
          @keyframes float-delayed {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-30px, 30px) rotate(-120deg); }
            66% { transform: translate(20px, -20px) rotate(-240deg); }
          }
          
          .animate-float {
            animation: float 20s ease-in-out infinite;
          }
          
          .animate-float-delayed {
            animation: float-delayed 25s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Fellowships Section */}
      <section id="fellowships" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg">
              <span className="font-semibold text-blue-600">Find Your Community</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black mb-8 text-blue-900">
              Discover Your
              <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
                Fellowship
              </span>
            </h2>
            <p className="text-2xl max-w-4xl mx-auto font-medium leading-relaxed text-blue-600">
              Connect with like-minded believers, grow in your spiritual journey, and make lifelong friendships 
              through our diverse and vibrant fellowship communities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {fellowships.map((fellowship, index) => (
              <div
                key={fellowship.id}
                className="group relative transform transition-all duration-700 hover:scale-105 cursor-pointer"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`relative bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 group-hover:border-white/40 bg-gradient-to-br ${fellowship.color}`}>
                  <div className="p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="relative z-10">
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {fellowship.icon}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{fellowship.name}</h3>
                      <p className="text-white/90 leading-relaxed">{fellowship.description}</p>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-6 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-50 rounded-full px-4 py-2">
                        <span className="font-bold text-gray-700">{fellowship.members}</span>
                        <span className="text-gray-500 ml-1">members</span>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                    </div>
                    
                    <Link href="/register" className={`w-full bg-gradient-to-r ${fellowship.color} text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 group-hover:shadow-xl transform hover:scale-105 text-center block`}>
                      Join Fellowship
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/#events" className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 flex items-center mx-auto w-fit">
              Explore All Ministries
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg">
              <span className="font-semibold text-blue-600">What&apos;s Coming Up</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black mb-8 text-blue-900">
              Upcoming
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
                Events
              </span>
            </h2>
            <p className="text-2xl max-w-4xl mx-auto font-medium leading-relaxed text-blue-600">
              Join us for transformative experiences that will strengthen your faith, build lasting relationships, 
              and equip you for Kingdom impact.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="group relative transform transition-all duration-700 cursor-pointer"
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/20 group-hover:border-blue-200">
                  <div className="relative bg-gradient-to-br from-blue-600 to-blue-900 p-8 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {event.image}
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500">
                          {event.type}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-100 transition-colors duration-300">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-blue-100">
                      <span className="font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', month: 'short', day: 'numeric'
                        })} at {event.time}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium">{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium">{event.attendees}/{event.maxAttendees} registered</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Registration Progress</span>
                        <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-1000 bg-orange-500"
                          style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-green-600">Free</span>
                      </div>
                      <Link href="/register" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 group-hover:shadow-lg transform hover:scale-105">
                        Register Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/events" className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 flex items-center mx-auto w-fit">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-16 shadow-2xl border border-white/20">
            <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-orange-50 rounded-full px-6 py-3 mb-8 shadow-lg">
              <span className="font-bold text-orange-700">Your Journey Starts Here</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-tight">
              Ready to Begin Your
              <span className="block bg-gradient-to-r from-orange-300 to-yellow-300 bg-clip-text text-transparent mt-2">
                Faith Journey?
              </span>
            </h2>
            
            <p className="text-2xl mb-12 max-w-4xl mx-auto font-medium leading-relaxed">
              Take the next step in your spiritual growth. Join a fellowship, attend an event, or simply connect 
              with our vibrant community. We&apos;re here to support and encourage you every step of the way.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register" className="group relative bg-gradient-to-r from-white to-gray-100 text-blue-900 px-12 py-6 rounded-3xl font-bold text-2xl hover:from-gray-100 hover:to-white transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-white/25 flex items-center justify-center overflow-hidden">
                <span className="relative z-10">Join a Fellowship Today</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
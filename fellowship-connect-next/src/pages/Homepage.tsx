import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, Bell, BookOpen, Calendar, CheckCircle, ChevronRight, Clock, Globe, Heart, Mail, MapPin, MessageCircle, Phone, Play, Send, Shield, Sparkles, Star, Users, X } from 'lucide-react';
import Image from 'next/image';

// Advanced color palette with CSS custom properties for theming
const colorSystem = {
  brightCobalt: '#3C6098',
  patience: '#E6DDD6',
  silverBird: '#FBF5F0',
  dancingMist: '#BFC8D8',
  fibonacciBlue: '#112358',
  aegeanSky: '#E48B59',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

// Advanced hooks for enhanced functionality
const useScrollAnimation = (threshold = 0.1): [React.RefObject<HTMLElement | null>, boolean] => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold, rootMargin: '50px 0px -50px 0px' }
    );
    
    const currentRef = ref.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};

const useAnimatedCounter = (end: number, duration = 2000, start = 0): [number, () => void, boolean] => {
  const [count, setCount] = useState<number>(start);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationFrameId = useRef<number | null>(null);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * easeOutCubic));

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    animationFrameId.current = requestAnimationFrame(animate);
  }, [start, end, duration, isAnimating]);

  useEffect(() => {
    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return [count, startAnimation, isAnimating];
};


// Types for notification system
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  isEntering?: boolean;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: number) => void;
}

// Advanced notification system
const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            transform transition-all duration-500 ease-out
            ${notification.isEntering ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20
            p-4 max-w-sm flex items-start space-x-3
          `}
        >
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-white text-sm
            ${notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'warning' ? 'bg-yellow-500' :
              notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
          `}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
             notification.type === 'info' ? <Bell className="w-4 h-4" /> :
             <Star className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
            <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
          </div>
          <button
            onClick={() => onDismiss(notification.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Data models
interface Fellowship {
  id: number;
  name: string;
  description: string;
  icon: string;
  members: string;
  color: string;
  bgGradient: string;
  stats: { events: number; satisfaction: number };
  testimonial: string;
}

interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  attendees: number;
  maxAttendees: number;
  description: string;
  speakers: string[];
  image: string;
  price: string;
  tags: string[];
  urgency: 'low' | 'medium' | 'high';
}

// Advanced Navigation with scroll detection and mobile optimization
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Update active section based on scroll position
      const sections = ['home', 'fellowships', 'events', 'contact'];
      let currentSection = 'home';
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = sectionId;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Fellowships', href: '#fellowships' },
    { name: 'Events', href: '#events' },
    { name: 'Resources', href: '#resources' }
  ];

  return (
    <nav className={`
      fixed w-full z-50 transition-all duration-500
      ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-2xl border-b border-white/20' : 'bg-transparent'}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Enhanced Logo with animation */}
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-100">
                <Image
                  src="https://placehold.co/128x128/3C6098/FFFFFF?text=BUCCF"
                  alt="BUCCF Logo"
                  width={56}
                  height={56}
                  className="object-cover"
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

          {/* Desktop Navigation with active indicators */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`
                  relative px-3 py-2 rounded-full transition-all duration-300 font-medium
                  ${activeSection === item.href.slice(1)
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/50'
                  }
                `}
              >
                {item.name}
                {activeSection === item.href.slice(1) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
                )}
              </a>
            ))}
            <button className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
              Join Us
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Enhanced Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <div className="w-6 h-6 relative">
              <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-700 transition-all duration-300 ${isOpen ? 'rotate-45' : '-translate-y-2'}`}></span>
              <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-700 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-700 transition-all duration-300 ${isOpen ? '-rotate-45' : 'translate-y-2'}`}></span>
            </div>
          </button>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div className={`
          md:hidden overflow-hidden transition-all duration-500 ease-out
          ${isOpen ? 'max-h-screen opacity-100 pb-6' : 'max-h-0 opacity-0'}
        `}>
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl mt-2 p-6 shadow-2xl border border-white/20">
            {navItems.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-4 text-gray-700 hover:text-orange-500 transition-colors font-medium border-b border-gray-100 last:border-0"
                onClick={() => setIsOpen(false)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.name}
              </a>
            ))}
            <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl mt-6 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg">
              Join Our Community
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Advanced Hero with dynamic content and interactions
const Hero = () => {
  const [memberCount, startMemberCount] = useAnimatedCounter(847, 3000);
  const [fellowshipCount, startFellowshipCount] = useAnimatedCounter(15, 2500);
  const [eventCount, startEventCount] = useAnimatedCounter(32, 2000);
  const [heroRef, isHeroVisible] = useScrollAnimation(0.3);

  useEffect(() => {
    if (isHeroVisible) {
      startMemberCount();
      startFellowshipCount();
      startEventCount();
    }
  }, [isHeroVisible, startMemberCount, startFellowshipCount, startEventCount]);

  return (
    <section
      id="home"
      ref={heroRef}
      className="min-h-screen relative overflow-hidden flex items-center"
      style={{ backgroundColor: colorSystem.silverBird }}
    >
      {/* Advanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-orange-500/5"></div>

        {/* Floating geometric shapes with CSS animations */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-blue-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-orange-200/15 to-orange-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-purple-200/10 to-pink-200/5 rounded-full blur-2xl animate-pulse"></div>

        {/* Subtle pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cross-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30,10 L30,50 M10,30 L50,30" stroke="currentColor" strokeWidth="2" className="text-blue-900"/>
            </pattern>
          </defs>
          <rect fill="url(#cross-pattern)" width="100%" height="100%"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Enhanced Content */}
          <div className={`space-y-8 transform transition-all duration-1000 ${isHeroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-semibold shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <Sparkles className="w-4 h-4 mr-2 text-orange-500 group-hover:rotate-12 transition-transform" />
              <span style={{ color: colorSystem.brightCobalt }}>Growing Together in Faith & Community</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-black leading-none">
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent hover:from-blue-500 hover:to-blue-800 transition-all duration-500">
                Connect.
              </div>
              <div className="bg-gradient-to-r from-blue-900 via-purple-700 to-orange-500 bg-clip-text text-transparent hover:from-blue-800 hover:to-orange-400 transition-all duration-500 mt-2">
                Serve.
              </div>
              <div className="mt-2" style={{ color: colorSystem.fibonacciBlue }}>
                <span className="inline-block hover:scale-105 transition-transform duration-300">Grow.</span>
              </div>
            </h1>

            <p className="text-2xl leading-relaxed max-w-2xl font-medium" style={{ color: colorSystem.brightCobalt }}>
              Join a vibrant community of <span className="font-bold text-orange-500">university students</span> united in faith,
              friendship, and purpose. Discover your place in <span className="font-bold" style={{ color: colorSystem.fibonacciBlue }}>God&apos;s story</span> at Bells University.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <button className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/25 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-white/20 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative z-10">Join Our Fellowship</span>
                <ArrowRight className="ml-3 w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
              </button>

              <button className="group bg-white/95 backdrop-blur-sm text-blue-900 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white transition-all duration-300 border-2 border-blue-100 hover:border-blue-300 shadow-xl hover:shadow-2xl flex items-center justify-center">
                <Play className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <span>Watch Welcome Video</span>
              </button>
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

          {/* Enhanced Visual Element */}
          <div className={`relative transform transition-all duration-1000 delay-300 ${isHeroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="relative">
              {/* Main feature card with advanced interactions */}
              <div className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl transform hover:scale-105 transition-all duration-500 border border-white/20 overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 text-center space-y-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl mx-auto flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300">
                      <Heart className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-black mb-3" style={{ color: colorSystem.fibonacciBlue }}>
                      {memberCount}+ Students
                    </h3>
                    <p className="text-lg font-medium" style={{ color: colorSystem.brightCobalt }}>
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

              {/* Enhanced floating elements with better animations */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-3xl shadow-2xl animate-bounce hover:animate-none hover:scale-110 transition-all duration-300 cursor-pointer">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-3xl shadow-2xl animate-bounce hover:animate-none hover:scale-110 transition-all duration-300 cursor-pointer" style={{ animationDelay: '1s' }}>
                <Users className="w-8 h-8" />
              </div>
              <div className="absolute top-1/2 -left-4 bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-2xl shadow-xl animate-pulse hover:scale-110 transition-all duration-300 cursor-pointer">
                <Star className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
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
  );
};

// Enhanced Fellowships Section with swipe interactions
const FellowshipsSection = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation(0.2);
  const [selectedFellowship, setSelectedFellowship] = useState<Fellowship | null>(null);

  const fellowships: Fellowship[] = [
    {
      id: 1,
      name: 'Worship Fellowship',
      description: 'Experience God through music, praise, and heartfelt worship',
      icon: '🎵',
      members: '125+',
      color: 'from-purple-500 to-purple-700',
      bgGradient: 'from-purple-50 to-purple-100',
      stats: { events: 24, satisfaction: 98 },
      testimonial: "The worship fellowship changed my relationship with God through music!"
    },
    {
      id: 2,
      name: 'Bible Study Groups',
      description: 'Deep dive into Scripture with passionate discussions',
      icon: '📖',
      members: '180+',
      color: 'from-green-500 to-green-700',
      bgGradient: 'from-green-50 to-green-100',
      stats: { events: 48, satisfaction: 97 },
      testimonial: "I discovered so much truth through our weekly Bible studies."
    },
    {
      id: 3,
      name: 'Prayer Ministry',
      description: 'Interceding for our community and campus with power',
      icon: '🙏',
      members: '95+',
      color: 'from-blue-500 to-blue-700',
      bgGradient: 'from-blue-50 to-blue-100',
      stats: { events: 36, satisfaction: 99 },
      testimonial: "Experiencing God's faithfulness through answered prayers daily."
    },
    {
      id: 4,
      name: 'Evangelism Team',
      description: 'Boldly sharing the Gospel message across campus',
      icon: '📢',
      members: '67+',
      color: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      stats: { events: 20, satisfaction: 96 },
      testimonial: "Leading others to Christ has strengthened my own faith journey."
    },
    {
      id: 5,
      name: 'Service Corps',
      description: 'Serving our community with Christ&#39;s love and compassion',
      icon: '❤️',
      members: '110+',
      color: 'from-red-500 to-pink-600',
      bgGradient: 'from-red-50 to-pink-50',
      stats: { events: 32, satisfaction: 98 },
      testimonial: "Serving others has taught me the true meaning of love."
    },
    {
      id: 6,
      name: 'Tech Ministry',
      description: 'Leveraging technology for Kingdom advancement',
      icon: '💻',
      members: '55+',
      color: 'from-indigo-500 to-purple-600',
      bgGradient: 'from-indigo-50 to-purple-50',
      stats: { events: 16, satisfaction: 95 },
      testimonial: "Using my tech skills to serve God has been incredibly fulfilling."
    }
  ];

  return (
    <section
      id="fellowships"
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: colorSystem.patience }}
    >
      {/* Section background enhancements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-20 transform transition-all duration-1000 ${isSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg">
            <Users className="w-5 h-5 mr-2 text-orange-500" />
            <span className="font-semibold" style={{ color: colorSystem.brightCobalt }}>Find Your Community</span>
          </div>

          <h2 className="text-5xl lg:text-7xl font-black mb-8" style={{ color: colorSystem.fibonacciBlue }}>
            Discover Your
            <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
              Fellowship
            </span>
          </h2>
          <p className="text-2xl max-w-4xl mx-auto font-medium leading-relaxed" style={{ color: colorSystem.brightCobalt }}>
            Connect with like-minded believers, grow in your spiritual journey, and make lifelong friendships
            through our diverse and vibrant fellowship communities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {fellowships.map((fellowship, index) => (
            <div
              key={fellowship.id}
              className={`
                group relative transform transition-all duration-700 hover:scale-105 cursor-pointer
                ${isSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
              `}
              style={{ transitionDelay: `${index * 150}ms` }}
              onClick={() => setSelectedFellowship(fellowship)}
            >
              {/* Enhanced fellowship card */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 group-hover:border-white/40">
                {/* Card header with gradient */}
                <div className={`bg-gradient-to-br ${fellowship.color} p-8 text-white relative overflow-hidden`}>
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

                {/* Card content */}
                <div className="p-8 space-y-6">
                  {/* Member count with animation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-gray-50 rounded-full px-4 py-2">
                      <Users className="w-4 h-4 mr-2 text-orange-500" />
                      <span className="font-bold text-gray-700">{fellowship.members}</span>
                      <span className="text-gray-500 ml-1">members</span>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="font-bold text-lg text-blue-600">{fellowship.stats.events}</div>
                      <div className="text-xs text-gray-500">Events/Year</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="font-bold text-lg text-green-500">{fellowship.stats.satisfaction}%</div>
                      <div className="text-xs text-gray-500">Satisfaction</div>
                    </div>
                  </div>

                  {/* Testimonial preview */}
                  <blockquote className="text-sm italic text-gray-600 border-l-4 border-orange-200 pl-4">
                    &#34;{fellowship.testimonial.substring(0, 60)}...&#34;
                  </blockquote>

                  {/* CTA Button */}
                  <button className={`w-full bg-gradient-to-r ${fellowship.color} text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 group-hover:shadow-xl transform hover:scale-105`}>
                    Join Fellowship
                  </button>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`text-center transform transition-all duration-1000 delay-300 ${isSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 flex items-center mx-auto">
            Explore All Ministries
            <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Fellowship Detail Modal */}
      {selectedFellowship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100">
            <div className={`bg-gradient-to-br ${selectedFellowship.color} p-8 text-white relative`}>
              <button
                onClick={() => setSelectedFellowship(null)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-6xl mb-4">{selectedFellowship.icon}</div>
              <h3 className="text-3xl font-bold mb-4">{selectedFellowship.name}</h3>
              <p className="text-xl text-white/90">{selectedFellowship.description}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{selectedFellowship.members}</div>
                  <div className="text-sm text-gray-500">Active Members</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-green-500">{selectedFellowship.stats.events}</div>
                  <div className="text-sm text-gray-500">Events/Year</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-orange-500">{selectedFellowship.stats.satisfaction}%</div>
                  <div className="text-sm text-gray-500">Satisfaction</div>
                </div>
              </div>

              <blockquote className="text-lg italic text-gray-700 border-l-4 border-orange-200 pl-6 py-4 bg-orange-50 rounded-r-xl">
                &#34;{selectedFellowship.testimonial}&#34;
              </blockquote>

              <div className="flex space-x-4">
                <button className={`flex-1 bg-gradient-to-r ${selectedFellowship.color} text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300`}>
                  Join This Fellowship
                </button>
                <button className="px-8 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-gray-300 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Enhanced Events Section with real-time features
const EventsSection = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation(0.2);
  const [, setSelectedEvent] = useState<EventItem | null>(null);

  const events: EventItem[] = [
    {
      id: 1,
      title: 'New Year Revival Conference',
      date: '2025-01-15',
      time: '6:00 PM',
      location: 'Main Auditorium',
      type: 'Conference',
      attendees: 350,
      maxAttendees: 500,
      description: 'Start the year with a powerful encounter with God. Join us for three days of worship, teaching, and fellowship.',
      speakers: ['Rev. Dr. John Smith', 'Pastor Mary Johnson'],
      image: '🔥',
      price: 'Free',
      tags: ['Worship', 'Teaching', 'Fellowship'],
      urgency: 'high'
    },
    {
      id: 2,
      title: 'Youth Leadership Summit',
      date: '2025-01-22',
      time: '10:00 AM',
      location: 'Conference Hall',
      type: 'Summit',
      attendees: 180,
      maxAttendees: 200,
      description: 'Equipping the next generation of Christian leaders with practical skills and spiritual wisdom.',
      speakers: ['Dr. Sarah Wilson', 'Pastor David Brown'],
      image: '👑',
      price: '₦5,000',
      tags: ['Leadership', 'Training', 'Networking'],
      urgency: 'medium'
    },
    {
      id: 3,
      title: 'Campus Evangelism Outreach',
      date: '2025-01-29',
      time: '2:00 PM',
      location: 'Campus Grounds',
      type: 'Outreach',
      attendees: 125,
      maxAttendees: 300,
      description: 'Join us as we share the love of Christ with our fellow students across the campus.',
      speakers: ['Evangelism Team'],
      image: '📢',
      price: 'Free',
      tags: ['Evangelism', 'Outreach', 'Service'],
      urgency: 'low'
    }
  ];

  return (
    <section
      id="events"
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: colorSystem.silverBird }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-20 transform transition-all duration-1000 ${isSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg">
            <Calendar className="w-5 h-5 mr-2 text-orange-500" />
            <span className="font-semibold" style={{ color: colorSystem.brightCobalt }}>What&apos;s Coming Up</span>
          </div>

          <h2 className="text-5xl lg:text-7xl font-black mb-8" style={{ color: colorSystem.fibonacciBlue }}>
            Upcoming
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Events
            </span>
          </h2>
          <p className="text-2xl max-w-4xl mx-auto font-medium leading-relaxed" style={{ color: colorSystem.brightCobalt }}>
            Join us for transformative experiences that will strengthen your faith, build lasting relationships,
            and equip you for Kingdom impact.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`
                group relative transform transition-all duration-700 cursor-pointer
                ${isSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
              `}
              style={{ transitionDelay: `${index * 200}ms` }}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/20 group-hover:border-blue-200">
                {/* Event header with dynamic styling */}
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-900 p-8 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="relative z-10 flex items-start justify-between mb-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {event.image}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        event.urgency === 'high' ? 'bg-red-500' :
                        event.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        {event.type}
                      </div>
                      {event.urgency === 'high' && (
                        <div className="mt-2 text-xs bg-red-500/20 px-2 py-1 rounded-full animate-pulse">
                          Almost Full!
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-100 transition-colors duration-300">
                    {event.title}
                  </h3>
                  <div className="flex items-center text-blue-100">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Event details */}
                <div className="p-8 space-y-6">
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>

                  {/* Event info grid */}
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-3 text-orange-500" />
                      <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-orange-500" />
                      <span className="font-medium">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-5 h-5 mr-3 text-orange-500" />
                      <span className="font-medium">{event.attendees}/{event.maxAttendees} registered</span>
                    </div>
                  </div>

                  {/* Attendance progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Registration Progress</span>
                      <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          event.urgency === 'high' ? 'bg-red-500' :
                          event.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span key={tag} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-green-600">{event.price}</span>
                    </div>
                    <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 group-hover:shadow-lg transform hover:scale-105">
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`text-center transform transition-all duration-1000 delay-500 ${isSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 flex items-center mx-auto">
            View All Events
            <Calendar className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

// Enhanced CTA Section with interactive elements
const CTASection = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation(0.3);

  return (
    <section
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: colorSystem.dancingMist }}
    >
      {/* Enhanced background with more dynamic elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-orange-300/15 to-orange-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-gradient-to-br from-purple-300/15 to-pink-300/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-green-300/20 to-green-500/10 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className={`transform transition-all duration-1000 ${isSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white/95 backdrop-blur-xl rounded-[3rem] p-16 shadow-2xl border border-white/30 relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-orange-50/20"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-orange-50 rounded-full px-6 py-3 mb-8 shadow-lg">
                <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                <span className="font-bold text-orange-700">Your Journey Starts Here</span>
              </div>

              <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-tight" style={{ color: colorSystem.fibonacciBlue }}>
                Ready to Begin Your
                <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
                  Faith Journey?
                </span>
              </h2>

              <p className="text-2xl mb-12 max-w-4xl mx-auto font-medium leading-relaxed" style={{ color: colorSystem.brightCobalt }}>
                Take the next step in your spiritual growth. Join a fellowship, attend an event, or simply connect
                with our vibrant community. We&#39;re here to support and encourage you every step of the way.
              </p>

              {/* Enhanced journey steps */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {[
                  { icon: Users, title: 'Connect', desc: 'Join a fellowship group that matches your interests and grow with like-minded believers', color: 'from-blue-600 to-blue-800' },
                  { icon: Heart, title: 'Serve', desc: 'Make a meaningful difference in your community through our various service opportunities', color: 'from-orange-500 to-orange-700' },
                  { icon: BookOpen, title: 'Grow', desc: 'Deepen your faith through Bible studies, discipleship, and spiritual mentoring', color: 'from-green-500 to-green-700' }
                ].map((step, index) => (
                  <div
                    key={step.title}
                    className={`text-center group transform transition-all duration-500 hover:scale-105 ${isSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                    style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                  >
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl mx-auto flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}>
                        <step.icon className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: colorSystem.fibonacciBlue }}>
                      {step.title}
                    </h3>
                    <p className="text-lg leading-relaxed" style={{ color: colorSystem.brightCobalt }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Enhanced CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="group relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 text-white px-12 py-6 rounded-3xl font-bold text-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">Join a Fellowship Today</span>
                  <ArrowRight className="ml-3 w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                </button>

                <button className="group bg-white text-orange-600 border-2 border-orange-500 px-12 py-6 rounded-3xl font-bold text-2xl hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center">
                  <MessageCircle className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  <span>Get in Touch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Enhanced Footer with comprehensive information
const Footer = () => {
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscriptionEmail) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setSubscriptionEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-blue-900 text-blue-200 py-20 relative overflow-hidden" id="contact">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-800 opacity-50"></div>
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/subtle-carbon.png')]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Brand and Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                  <Image
                    src="https://placehold.co/128x128/3C6098/FFFFFF?text=BUCCF"
                    alt="BUCCF Logo"
                    width={48}
                    height={48}
                    className="object-contain rounded-lg"
                  />
              </div>
               <div>
                <h3 className="text-2xl font-bold text-white">BUCCF</h3>
                <p className="text-sm text-blue-300">Bells University Fellowship</p>
              </div>
            </div>
            <p className="text-blue-300 leading-relaxed">
              A community of students growing in faith, serving with love, and impacting the campus for Christ.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-3 text-sm font-semibold shadow-lg hover:bg-white/20 transition-colors">
                <Globe className="w-4 h-4 mr-2 text-blue-300" />
                <span className="text-blue-400">Contact</span>
              </a>
              <a href="#" className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-3 text-sm font-semibold shadow-lg hover:bg-white/20 transition-colors">
                <Phone className="w-4 h-4 mr-2 text-blue-300" />
                <span className="text-blue-400">Call Us</span>
              </a>
              <a href="#" className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-3 text-sm font-semibold shadow-lg hover:bg-white/20 transition-colors">
                <Mail className="w-4 h-4 mr-2 text-blue-300" />
                <span className="text-blue-400">Email</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Quick Links</h4>
            <nav className="space-y-3">
              <a href="#" className="text-blue-300 hover:text-white transition-colors">Home</a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors">About</a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors">Fellowships</a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors">Events</a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors">Resources</a>
            </nav>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Join Our Newsletter</h4>
            <p className="text-blue-300 leading-relaxed">
              Stay informed with updates about events and latest developments. Simply provide your email
              below.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"><Users className="w-5 h-5"/></a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"><Heart className="w-5 h-5"/></a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"><BookOpen className="w-5 h-5"/></a>
            </div>
          </div>

          {/* Quick Links and Contact */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-white text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-blue-300 hover:text-orange-400 transition-colors">Home</a></li>
                <li><a href="#about" className="text-blue-300 hover:text-orange-400 transition-colors">About</a></li>
                <li><a href="#fellowships" className="text-blue-300 hover:text-orange-400 transition-colors">Fellowships</a></li>
                <li><a href="#events" className="text-blue-300 hover:text-orange-400 transition-colors">Events</a></li>
              </ul>
            </div>
             <div>
              <h4 className="font-bold text-white text-lg mb-4">Contact</h4>
               <ul className="space-y-2">
                <li className="flex items-start"><Phone className="w-4 h-4 mr-2 mt-1 text-orange-400 flex-shrink-0"/> <span className="text-blue-300">+234 123 456 7890</span></li>
                <li className="flex items-start"><Mail className="w-4 h-4 mr-2 mt-1 text-orange-400 flex-shrink-0"/> <span className="text-blue-300">contact@buccf.org</span></li>
                <li className="flex items-start"><MapPin className="w-4 h-4 mr-2 mt-1 text-orange-400 flex-shrink-0"/> <span className="text-blue-300">Bells University, Ota</span></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h4 className="font-bold text-white text-lg mb-4">Newsletter</h4>
            <p className="text-blue-300 mb-4">Get the latest updates and encouragement in your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                value={subscriptionEmail}
                onChange={(e) => setSubscriptionEmail(e.target.value)}
                placeholder="Your Email"
                className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-4 py-2 text-white placeholder-blue-300 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
              <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-r-lg font-semibold hover:bg-orange-600 transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </form>
            {subscribed && <p className="text-green-400 mt-2 text-sm">Thank you for subscribing!</p>}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-blue-800/50 text-center text-blue-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Bells University Campus Christian Fellowship. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};


// Quick Prayer Request Component
const QuickPrayerRequest = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (request.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setRequest('');
        setName('');
        setIsOpen(false);
      }, 3000);
    }
  };

  return (
    <>
      {/* Floating Prayer Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-110 group"
        title="Submit Prayer Request"
      >
        <div className="relative">
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🙏</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </button>

      {/* Prayer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl transform transition-all duration-300">
            {submitted ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-6">✨</div>
                <h3 className="text-2xl font-bold text-green-600 mb-4">Prayer Request Received!</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Thank you for sharing your heart with us. Our prayer team will lift you up in prayer.
                  Remember, God hears every prayer and cares deeply for you.
                </p>
                <div className="bg-green-50 rounded-2xl p-4 mt-6">
                  <p className="text-green-700 italic">
                    &#34;The prayer of a righteous person is powerful and effective.&#34; - James 5:16
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white rounded-t-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🙏</span>
                      <h3 className="text-2xl font-bold">Prayer Request</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-purple-100 mt-2">
                    Share your prayer request with our community
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Your Name (Optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="How should we address you?"
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Prayer Request*</label>
                    <textarea
                      value={request}
                      onChange={(e) => setRequest(e.target.value)}
                      placeholder="Share what's on your heart. We're here to pray with you..."
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="bg-purple-50 rounded-2xl p-4">
                    <p className="text-purple-700 text-sm">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Your privacy matters to us. Prayer requests are handled confidentially by our prayer team.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!request.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Prayer Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Live Stats Component
const LiveStats = () => {
  const [stats, setStats] = useState({
    onlineMembers: 47,
    todaysPrayers: 23,
    upcomingEvents: 3,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        onlineMembers: Math.max(10, prev.onlineMembers + Math.floor(Math.random() * 5) - 2),
        todaysPrayers: prev.todaysPrayers + (Math.random() > 0.8 ? 1 : 0),
        upcomingEvents: 3,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-24 left-6 z-40 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20 hidden lg:block">
      <div className="space-y-3">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          {stats.onlineMembers} Members Online
        </div>
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Heart className="w-4 h-4 mr-2 text-red-500"/>
          {stats.todaysPrayers} Prayers Today
        </div>
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Calendar className="w-4 h-4 mr-2 text-blue-500"/>
          {stats.upcomingEvents} Upcoming Events
        </div>
      </div>
    </div>
  );
};

// Main Homepage Component with notification system
const Homepage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'isEntering'>) => {
    const id = Date.now();
    const newNotification = { ...notification, id, isEntering: false };
    setNotifications(prev => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isEntering: true } : n)
      );
    }, 100);

    setTimeout(() => dismissNotification(id), 5000);
  }, []);

  const dismissNotification = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isEntering: false } : n)
    );
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 500);
  };

  useEffect(() => {
    const timer1 = setTimeout(() => {
      addNotification({
        type: 'info',
        title: 'Welcome to BUCCF!',
        message: 'Discover your community and grow in faith with us.'
      });
    }, 2000);

    const timer2 = setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'New Event Alert',
        message: 'Youth Leadership Summit - Register now!'
      });
    }, 5000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  }, [addNotification]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <Navigation />
      <Hero />
      <FellowshipsSection />
      <EventsSection />
      <CTASection />
      <Footer />
      <QuickPrayerRequest />
      <LiveStats />
    </div>
  );
};

export default Homepage;


'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BUCCFLogo from '../../assets/BUCCF-LOGO.jpg';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <Image 
                  src={BUCCFLogo} 
                  alt="BUCCF Logo" 
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Fellowship Connect</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
              <Link href="/about" className="text-blue-600 font-medium">About</Link>
              <Link href="/#fellowships" className="text-gray-600 hover:text-blue-600">Fellowships</Link>
              <Link href="/#events" className="text-gray-600 hover:text-blue-600">Events</Link>
              <Link href="/#contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
            </nav>
            <div>
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Fellowship Connect</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Empowering church communities with technology to strengthen fellowship and faith.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => setActiveTab('mission')}
                      className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'mission' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      Our Mission
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('vision')}
                      className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'vision' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      Our Vision
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('values')}
                      className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'values' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      Core Values
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      Our History
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:w-3/4">
              <div className="bg-white rounded-lg shadow p-8">
                {activeTab === 'mission' && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                    <p className="text-gray-600 mb-6">
                      Fellowship Connect is dedicated to strengthening the bonds within church communities by providing 
                      innovative technology solutions that facilitate meaningful connections, enhance fellowship experiences, 
                      and support the spiritual growth of every member.
                    </p>
                    <p className="text-gray-600 mb-6">
                      We believe that technology, when used thoughtfully, can be a powerful tool for bringing people 
                      together in faith and fellowship. Our platform is designed to remove barriers to communication 
                      and participation, making it easier for church members to engage with one another and with their 
                      spiritual journey.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-8">
                      <p className="text-gray-700 italic">
                        &quot;And let us consider how we may spur one another on toward love and good deeds, 
                        not giving up meeting together, as some are in the habit of doing, but encouraging one another.&quot; 
                        - Hebrews 10:24-25
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'vision' && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
                    <p className="text-gray-600 mb-6">
                      We envision a world where every church member feels deeply connected to their faith community, 
                      where technology bridges distances and differences, and where the love of Christ is shared and 
                      experienced through meaningful digital fellowship.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Connected Communities</h3>
                        <p className="text-gray-600">
                          Churches where every member feels valued, supported, and actively engaged in the life of the community.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Spiritual Growth</h3>
                        <p className="text-gray-600">
                          Platforms that nurture personal faith journeys and facilitate deeper understanding of Scripture.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Inclusive Fellowship</h3>
                        <p className="text-gray-600">
                          Technology that welcomes all members, regardless of age, technical ability, or physical presence.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Impact</h3>
                        <p className="text-gray-600">
                          Tools that enable churches to extend their reach and impact beyond their physical boundaries.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'values' && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Core Values</h2>
                    <div className="space-y-8">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                          <HeartIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-semibold text-gray-900">Love and Compassion</h3>
                          <p className="mt-2 text-gray-600">
                            We are committed to creating platforms that reflect Christ&apos;s love and compassion for all people.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                          <ShieldIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-semibold text-gray-900">Integrity and Trust</h3>
                          <p className="mt-2 text-gray-600">
                            We build trust through transparent practices, secure technology, and ethical treatment of user data.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-purple-100 p-3 rounded-full">
                          <SparklesIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-semibold text-gray-900">Innovation</h3>
                          <p className="mt-2 text-gray-600">
                            We embrace creative solutions that enhance spiritual growth and community engagement.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                          <UsersIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-semibold text-gray-900">Community</h3>
                          <p className="mt-2 text-gray-600">
                            We prioritize the needs of church communities and the strengthening of fellowship bonds.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our History</h2>
                    <div className="space-y-8">
                      <div className="border-l-4 border-blue-500 pl-4 py-1">
                        <h3 className="text-xl font-semibold text-gray-900">2020: The Beginning</h3>
                        <p className="mt-2 text-gray-600">
                          Fellowship Connect was founded by a group of church leaders and technology professionals who 
                          recognized the need for better digital tools to support church communities, especially during 
                          times when physical gatherings were limited.
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4 py-1">
                        <h3 className="text-xl font-semibold text-gray-900">2021: First Release</h3>
                        <p className="mt-2 text-gray-600">
                          We launched our first platform with basic member management and communication features, 
                          serving a handful of churches in the local community.
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4 py-1">
                        <h3 className="text-xl font-semibold text-gray-900">2022: Expansion</h3>
                        <p className="mt-2 text-gray-600">
                          Based on user feedback, we expanded our feature set to include event management, 
                          prayer request tracking, and small group coordination tools.
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4 py-1">
                        <h3 className="text-xl font-semibold text-gray-900">2023: Growth</h3>
                        <p className="mt-2 text-gray-600">
                          We partnered with over 100 churches across multiple denominations and added 
                          multilingual support and mobile applications.
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4 py-1">
                        <h3 className="text-xl font-semibold text-gray-900">2024: Today and Tomorrow</h3>
                        <p className="mt-2 text-gray-600">
                          Today, Fellowship Connect serves thousands of churches and millions of members worldwide. 
                          We continue to innovate and expand our offerings to meet the evolving needs of modern 
                          faith communities.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Strengthen Your Fellowship?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of churches already using Fellowship Connect to enhance their community engagement.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300">
              Get Started Free
            </Link>
            <Link href="/#contact" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition duration-300">
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Icon components
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
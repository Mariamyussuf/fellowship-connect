'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BUCCFLogo from '../../assets/BUCCF-LOGO.jpg';

const ChurchAboutPage: React.FC = () => {
  const leadership = [
    { name: 'John Doe', role: 'President', bio: 'Leading the fellowship with wisdom and compassion for over 10 years.' },
    { name: ' Jane Smith', role: 'Vice President', bio: 'Passionate about youth ministry and community outreach.' },
    { name: 'Deacon Mike Johnson', role: 'Prayer coordinator', bio: 'Coordinating various ministries and ensuring smooth operations.' },
    { name: 'Sister Mary Williams', role: 'Welfare Coordinator', bio: 'Caring for the needs of our community members.' }
  ];

  const values = [
    { title: 'Faith', description: 'Grounded in biblical truth and unwavering trust in God', icon: '✝️' },
    { title: 'Fellowship', description: 'Building meaningful relationships and community bonds', icon: '🤝' },
    { title: 'Service', description: 'Serving God and others with love and dedication', icon: '❤️' },
    { title: 'Growth', description: 'Continuous spiritual and personal development', icon: '🌱' },
    { title: 'Unity', description: 'Embracing diversity while maintaining unity in Christ', icon: '🕊️' },
    { title: 'Excellence', description: 'Striving for excellence in all we do for God&apos;s glory', icon: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
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
              <h1 className="ml-3 text-2xl font-bold text-gray-900">BUCCF</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
              <Link href="/church-about" className="text-blue-600 font-medium">About Church</Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600">About Platform</Link>
              <Link href="/#fellowships" className="text-gray-600 hover:text-blue-600">Fellowships</Link>
              <Link href="/#events" className="text-gray-600 hover:text-blue-600">Events</Link>
              <Link href="/#contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
            </div>
            <div>
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About BUCCF Church</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Bells University Campus Christian Fellowship is more than just a church - 
            we&apos;re a family united by faith, committed to growing together in Christ.
          </p>
        </div>
      </section>
      
      {/* Main Content */}
      <div className="py-5">
        {/* Our Story */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Bells University Campus Christian Fellowship is more than just a church - 
                we&apos;re a family united by faith, committed to growing together in Christ.
              </p>
              <p className="text-gray-600 mb-4">
                Founded in 2016, Bells University Campus Christian Fellowship began as a small 
                group of students seeking to create a space for authentic Christian fellowship on campus. 
                What started with just few members has grown into a vibrant community of over 150 active 
                participants.
              </p>
              <p className="text-gray-600 mb-4">
                Our journey has been marked by God&apos;s faithfulness, community support, and a shared 
                commitment to living out the Gospel in our daily lives. We&apos;ve weathered challenges, 
                celebrated victories, and consistently focused on our mission to be a beacon of 
                hope and love in the university community.
              </p>
              <p className="text-gray-600">
                Today, BUCCF continues to be a place where students, faculty, and community members 
                can find spiritual nourishment, genuine friendships, and opportunities to serve others 
                in meaningful ways.
              </p>
            </div>
            <div>
              <div className="rounded-full overflow-hidden w-full h-full">
                <Image 
                  src={BUCCFLogo} 
                  alt="BUCCF Logo" 
                  width={400}
                  height={400}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-blue-500 rounded-lg shadow">
              <div className="bg-blue-600 text-white p-4">
                <h3 className="text-2xl font-bold mb-0">Our Mission</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  To create a loving, inclusive community where university students and community 
                  members can grow in their relationship with Christ, support one another through 
                  authentic fellowship, and serve others with the transformative love of Jesus.
                </p>
                <p className="text-gray-600">
                  We are committed to providing spiritual guidance, practical support, and 
                  opportunities for meaningful service that impact both our local community 
                  and the world beyond.
                </p>
              </div>
            </div>
            <div className="bg-white border border-green-500 rounded-lg shadow">
              <div className="bg-green-600 text-white p-4">
                <h3 className="text-2xl font-bold mb-0">Our Vision</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  To be a thriving, Christ-centered community that transforms lives, strengthens 
                  families, and positively impacts the university and surrounding areas through 
                  the power of the Gospel.
                </p>
                <p className="text-gray-600">
                  We envision a future where every member is equipped to live out their faith 
                  boldly, serve with passion, and make disciples who will continue this legacy 
                  for generations to come.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <div>
            <h2 className="text-3xl font-bold text-center mb-5">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="text-5xl mb-4">
                    {value.icon}
                  </div>
                  <h5 className="text-xl font-bold mb-2">{value.title}</h5>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <div>
            <h2 className="text-3xl font-bold text-center mb-5">Leadership Team</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {leadership.map((leader, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="mb-4">
                    <div className="bg-blue-600 rounded-full w-20 h-20 flex items-center justify-center text-white mx-auto text-2xl">
                      👤
                    </div>
                  </div>
                  <h5 className="text-xl font-bold">{leader.name}</h5>
                  <p className="text-blue-600 font-bold mb-2">{leader.role}</p>
                  <p className="text-gray-600 text-sm">{leader.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What We Believe */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <div className="lg:w-8/12 mx-auto">
            <div className="bg-gray-900 text-white rounded-lg">
              <div className="bg-gray-800 p-4">
                <h3 className="text-2xl font-bold text-center mb-0">What We Believe</h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-xl font-bold mb-2">The Bible</h5>
                    <p className="text-gray-300 text-sm mb-4">
                      We believe the Bible is the inspired, infallible Word of God and our 
                      ultimate authority for faith and practice.
                    </p>
                    
                    <h5 className="text-xl font-bold mb-2">Jesus Christ</h5>
                    <p className="text-gray-300 text-sm mb-4">
                      We believe Jesus Christ is the Son of God, fully divine and fully human, 
                      who died for our sins and rose again.
                    </p>
                    
                    <h5 className="text-xl font-bold mb-2">Salvation</h5>
                    <p className="text-gray-300 text-sm mb-4">
                      We believe salvation is by grace through faith in Jesus Christ alone, 
                      not by works or human effort.
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold mb-2">The Trinity</h5>
                    <p className="text-gray-300 text-sm mb-4">
                      We believe in one God eternally existing in three persons: 
                      Father, Son, and Holy Spirit.
                    </p>
                    
                    <h5 className="text-xl font-bold mb-2">The Church</h5>
                    <p className="text-gray-300 text-sm mb-4">
                      We believe the church is the body of Christ, called to worship, 
                      fellowship, discipleship, and service.
                    </p>
                    
                    <h5 className="text-xl font-bold mb-2">Eternal Life</h5>
                    <p className="text-gray-300 text-sm">
                      We believe in the resurrection of the dead and eternal life 
                      for all who trust in Jesus Christ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <div>
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-3xl font-bold text-center mb-6">BUCCF by the Numbers</h3>
              <div className="grid md:grid-cols-4 text-center">
                <div>
                  <h2 className="text-4xl font-bold text-blue-600">500+</h2>
                  <p className="text-gray-600">Active Members</p>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-green-600">12</h2>
                  <p className="text-gray-600">Active Ministries</p>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-yellow-600">30+</h2>
                  <p className="text-gray-600">Years of Service</p>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-indigo-600">100+</h2>
                  <p className="text-gray-600">Events Annually</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchAboutPage;
'use client';

import React from 'react';
import Link from 'next/link';

const FirstTimers: React.FC = () => {
  const whatToExpect = [
    { title: 'Warm Welcome', description: 'Our greeters will welcome you at the door and help you find your way around.', icon: '🤝' },
    { title: 'Casual Atmosphere', description: 'Come as you are! We believe in creating a comfortable, non-judgmental environment.', icon: '👕' },
    { title: 'Inspiring Worship', description: 'Experience uplifting music, heartfelt prayers, and practical biblical teaching.', icon: '🎵' },
    { title: 'Genuine Community', description: 'Meet friendly people who are excited to get to know you and support your journey.', icon: '👥' }
  ];

  const serviceFlow = [
    { time: '15 minutes before', activity: 'Arrive and get settled', description: 'Find parking, grab a seat, and meet some friendly faces' },
    { time: 'Service starts', activity: 'Welcome & Announcements', description: 'Brief welcome and important community updates' },
    { time: '10 minutes', activity: 'Worship & Praise', description: 'Uplifting songs and worship music' },
    { time: '25 minutes', activity: 'Message', description: 'Practical, biblical teaching relevant to daily life' },
    { time: '5 minutes', activity: 'Closing & Fellowship', description: 'Prayer, closing song, and time to connect with others' }
  ];

  const nextSteps = [
    { step: 1, title: 'Attend a Service', description: 'Join us for any of our regular services to experience our community firsthand.' },
    { step: 2, title: 'Meet with a Pastor', description: 'Schedule a casual coffee chat with one of our pastoral team members.' },
    { step: 3, title: 'Join a Small Group', description: 'Connect with others in a smaller, more intimate setting for deeper relationships.' },
    { step: 4, title: 'Explore Ministry', description: 'Discover ways to use your gifts and talents to serve others in our community.' }
  ];

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto text-center">
          <h1 className="display-4 mb-4">Welcome, First-Time Visitors!</h1>
          <p className="lead">
            We&apos;re so excited you&apos;re considering joining our community! Here&apos;s everything 
            you need to know to feel comfortable and prepared for your first visit.
          </p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="row mb-5">
        <div className="col-lg-10 mx-auto">
          <div className="alert alert-primary text-center">
            <h4>You Belong Here!</h4>
            <p className="mb-0">
              Whether you&apos;re exploring faith for the first time, returning to church after a break, 
              or looking for a new church home, BUCCF is a place where you can belong, grow, and serve. 
              We can&apos;t wait to meet you!
            </p>
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="row mb-5">
        <div className="col">
          <h2 className="text-center mb-5">What to Expect</h2>
          <div className="row">
            {whatToExpect.map((item, index) => (
              <div className="col-md-6 col-lg-3 mb-4" key={index}>
                <div className="card text-center h-100">
                  <div className="card-body">
                    <div style={{ fontSize: '3rem' }} className="mb-3">
                      {item.icon}
                    </div>
                    <h5>{item.title}</h5>
                    <p className="text-muted">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Times & Locations */}
      <div className="row mb-5">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Service Times</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>Sunday Services</h6>
                <p className="mb-1"><strong>9:00 AM</strong> - Main Service</p>
                <p className="mb-3"><strong>11:30 AM</strong> - Second Service</p>
              </div>
              
              <div className="mb-3">
                <h6>Weekday Programs</h6>
                <p className="mb-1"><strong>Wednesday 6:00 PM</strong> - Bible Study</p>
                <p className="mb-3"><strong>Friday 7:00 PM</strong> - Youth Service</p>
              </div>

              <div className="alert alert-info mb-0">
                <small>
                  <strong>First-Timer Tip:</strong> We recommend the 9:00 AM service for a 
                  slightly smaller, more intimate experience, or 11:30 AM for our larger, 
                  more energetic service.
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">Location & Parking</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>Main Chapel</h6>
                <p className="mb-1">Bells University Main Campus</p>
                <p className="mb-3">Iwo-Osogbo Road, Iwo, Osun State</p>
              </div>

              <div className="mb-3">
                <h6>Parking</h6>
                <p className="mb-3">Free parking available in designated areas near the chapel</p>
              </div>

              <div className="mb-3">
                <h6>Getting There</h6>
                <p className="mb-1">• Campus shuttles available on Sundays</p>
                <p className="mb-1">• Clear signage from main campus entrance</p>
                <p className="mb-3">• Volunteers available to help with directions</p>
              </div>

              <button className="btn btn-outline-success btn-sm">
                📍 View Campus Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Flow */}
      <div className="row mb-5">
        <div className="col">
          <h2 className="text-center mb-5">Typical Service Flow</h2>
          <div className="row">
            {serviceFlow.map((item, index) => (
              <div className="col-lg-2 col-md-4 mb-4" key={index}>
                <div className="card text-center h-100">
                  <div className="card-body">
                    <div className="mb-2">
                      <span className="badge bg-primary mb-2">{item.time}</span>
                    </div>
                    <h6>{item.activity}</h6>
                    <p className="text-muted small">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="col-lg-2 col-md-4 mb-4">
              <div className="card text-center h-100 border-success">
                <div className="card-body">
                  <div className="mb-2">
                    <span className="badge bg-success mb-2">After service</span>
                  </div>
                  <h6>Stay & Connect</h6>
                  <p className="text-muted small">Optional time to meet people and ask questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0 text-center">Frequently Asked Questions</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>What should I wear?</h6>
                  <p className="small text-muted mb-3">
                    Come as you are! You&apos;ll see everything from casual to business attire. 
                    Comfort is key - wear what makes you feel confident.
                  </p>

                  <h6>Should I bring anything?</h6>
                  <p className="small text-muted mb-3">
                    Just yourself! We provide Bibles, and there&apos;s no pressure to give 
                    financially as a visitor.
                  </p>

                  <h6>What about my children?</h6>
                  <p className="small text-muted mb-3">
                    Children are welcome in all services. We also have age-appropriate 
                    programs during Sunday services.
                  </p>
                </div>
                <div className="col-md-6">
                  <h6>How long is the service?</h6>
                  <p className="small text-muted mb-3">
                    About 75-90 minutes total. You&apos;re free to leave at any time if needed.
                  </p>

                  <h6>Will I be put on the spot?</h6>
                  <p className="small text-muted mb-3">
                    Never! We don&apos;t ask visitors to stand up or introduce themselves. 
                    Participation is always voluntary.
                  </p>

                  <h6>What if I have questions?</h6>
                  <p className="small text-muted mb-3">
                    Our greeters and pastoral team are always available to answer 
                    questions before or after service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="row mb-5">
        <div className="col">
          <h2 className="text-center mb-5">Your Next Steps</h2>
          <div className="row">
            {nextSteps.map((step, index) => (
              <div className="col-md-6 col-lg-3 mb-4" key={index}>
                <div className="card text-center h-100">
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center text-white"
                           style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}>
                        {step.step}
                      </div>
                    </div>
                    <h5>{step.title}</h5>
                    <p className="text-muted">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact & Connect */}
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h3 className="mb-4">Ready to Connect?</h3>
              <p className="mb-4">
                We&apos;d love to meet you and answer any questions you might have. 
                Don&apos;t hesitate to reach out!
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/contact" className="btn btn-primary">
                  Contact Us
                </Link>
                <Link href="/register" className="btn btn-success">
                  Join Our Community
                </Link>
                <button className="btn btn-outline-info">
                  📞 Call Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Welcome */}
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="card border-primary">
            <div className="card-body text-center">
              <h4 className="text-primary mb-3">Special Welcome for You!</h4>
              <p className="mb-3">
                As a first-time visitor, we&apos;d love to give you a small welcome gift and 
                connect you with someone who can help answer any questions you might have.
              </p>
              <p className="mb-4">
                Look for our <strong>Welcome Team</strong> members wearing blue name tags - 
                they&apos;re specifically there to help first-time visitors feel at home.
              </p>
              <div className="alert alert-success mb-0">
                <strong>Pro Tip:</strong> Arrive 10-15 minutes early to get settled, 
                grab some coffee, and meet a few friendly faces before the service begins!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimers;
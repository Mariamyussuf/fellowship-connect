import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Homepage: React.FC = () => {
  const serviceTimes = [
    { day: 'Sunday', time: '9:00 AM', type: 'Main Service' },
    { day: 'Sunday', time: '11:30 AM', type: 'Second Service' },
    { day: 'Wednesday', time: '6:00 PM', type: 'Bible Study' },
    { day: 'Friday', time: '7:00 PM', type: 'Youth Service' }
  ];

  const ministries = [
    { name: 'Children Ministry', description: 'Nurturing young hearts for Christ', icon: '👶' },
    { name: 'Youth Ministry', description: 'Empowering the next generation', icon: '🎯' },
    { name: 'Choir Ministry', description: 'Worship through music and song', icon: '🎵' },
    { name: 'Ushering Ministry', description: 'Welcoming and serving visitors', icon: '🤝' },
    { name: 'Evangelism Ministry', description: 'Spreading the Gospel message', icon: '📢' },
    { name: 'Welfare Ministry', description: 'Caring for those in need', icon: '❤️' }
  ];

  const upcomingEvents = [
    { title: 'New Year Revival', date: '2025-01-05', time: '6:00 PM' },
    { title: 'Youth Conference', date: '2025-01-15', time: '10:00 AM' },
    { title: 'Marriage Seminar', date: '2025-01-22', time: '2:00 PM' }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-4">
                Welcome to Baptist University Christian Community Fellowship
              </h1>
              <p className="lead mb-4">
                A vibrant community of believers committed to growing in faith, 
                fellowship, and service. Join us as we journey together in Christ.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/register" className="btn btn-light btn-lg">
                  Join Our Community
                </Link>
                <Link to="/about" className="btn btn-outline-light btn-lg">
                  Learn More
                </Link>
              </div>
            </Col>
            <Col lg={4} className="text-center">
              <div className="hero-image">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '200px', height: '200px' }}>
                  <span style={{ fontSize: '4rem' }}>⛪</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Service Times */}
      <section className="py-5">
        <Container>
          <Row>
            <Col lg={6}>
              <h2 className="mb-4">Service Times</h2>
              <div className="service-times">
                {serviceTimes.map((service, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">{service.type}</h5>
                        <p className="text-muted mb-0">{service.day}</p>
                      </div>
                      <Badge bg="primary" className="fs-6">{service.time}</Badge>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
            <Col lg={6}>
              <h2 className="mb-4">Quick Actions</h2>
              <div className="d-grid gap-3">
                <Link to="/attendance" className="btn btn-outline-primary btn-lg">
                  📱 Check In to Service
                </Link>
                <Link to="/prayer-requests" className="btn btn-outline-success btn-lg">
                  🙏 Submit Prayer Request
                </Link>
                <Link to="/events" className="btn btn-outline-info btn-lg">
                  📅 View Upcoming Events
                </Link>
                <Link to="/resources" className="btn btn-outline-warning btn-lg">
                  📚 Access Resources
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Ministries */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Our Ministries</h2>
          <Row>
            {ministries.map((ministry, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <Card className="h-100 text-center">
                  <Card.Body>
                    <div className="ministry-icon mb-3" style={{ fontSize: '3rem' }}>
                      {ministry.icon}
                    </div>
                    <h5>{ministry.name}</h5>
                    <p className="text-muted">{ministry.description}</p>
                    <Link to="/ministries" className="btn btn-outline-primary">
                      Learn More
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Upcoming Events */}
      <section className="py-5">
        <Container>
          <Row>
            <Col lg={8}>
              <h2 className="mb-4">Upcoming Events</h2>
              {upcomingEvents.map((event, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col md={8}>
                        <h5 className="mb-1">{event.title}</h5>
                        <p className="text-muted mb-0">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                      </Col>
                      <Col md={4} className="text-end">
                        <Link to="/events" className="btn btn-primary">
                          RSVP
                        </Link>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
              <div className="text-center mt-4">
                <Link to="/events" className="btn btn-outline-primary">
                  View All Events
                </Link>
              </div>
            </Col>
            <Col lg={4}>
              <Card className="bg-primary text-white">
                <Card.Body className="text-center">
                  <h4 className="mb-3">First Time Visitor?</h4>
                  <p className="mb-4">
                    We'd love to welcome you to our community! 
                    Learn what to expect and how to get connected.
                  </p>
                  <Link to="/first-timers" className="btn btn-light">
                    Visitor Information
                  </Link>
                </Card.Body>
              </Card>

              <Card className="mt-4">
                <Card.Body className="text-center">
                  <h5 className="mb-3">Stay Connected</h5>
                  <div className="d-flex justify-content-center gap-3">
                    <a href="#" className="btn btn-outline-primary">
                      📺 YouTube
                    </a>
                    <a href="#" className="btn btn-outline-primary">
                      📷 Instagram
                    </a>
                    <a href="#" className="btn btn-outline-primary">
                      🐦 Twitter
                    </a>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mission Statement */}
      <section className="py-5 bg-dark text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="mb-4">Our Mission</h2>
              <p className="lead">
                To create a loving community where university students can grow in their 
                relationship with Christ, support one another through fellowship, and 
                serve others with the love of Jesus.
              </p>
              <blockquote className="blockquote mt-4">
                <p className="mb-0">
                  "Therefore encourage one another and build each other up, 
                  just as in fact you are doing."
                </p>
                <footer className="blockquote-footer mt-2">
                  <cite title="Source Title">1 Thessalonians 5:11</cite>
                </footer>
              </blockquote>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Information */}
      <section className="py-5">
        <Container>
          <Row>
            <Col md={6}>
              <h3 className="mb-4">Contact Us</h3>
              <div className="contact-info">
                <p><strong>📍 Location:</strong> Baptist University Campus</p>
                <p><strong>📞 Phone:</strong> +234 XXX XXX XXXX</p>
                <p><strong>✉️ Email:</strong> info@buccf.org</p>
                <p><strong>🕐 Office Hours:</strong> Mon-Fri, 9:00 AM - 5:00 PM</p>
              </div>
              <Link to="/contact" className="btn btn-primary">
                Get in Touch
              </Link>
            </Col>
            <Col md={6}>
              <h3 className="mb-4">Campus Map</h3>
              <div className="map-placeholder bg-light rounded d-flex align-items-center justify-content-center" 
                   style={{ height: '200px' }}>
                <span className="text-muted">Interactive Campus Map</span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Homepage;

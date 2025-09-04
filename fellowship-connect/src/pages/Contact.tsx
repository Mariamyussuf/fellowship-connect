import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setShowSuccess(true);
      setLoading(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general'
      });
    }, 1000);
  };

  const contactInfo = [
    { icon: '📍', title: 'Address', details: 'Baptist University Campus\nIwo-Osogbo Road, Iwo\nOsun State, Nigeria' },
    { icon: '📞', title: 'Phone', details: '+234 XXX XXX XXXX\n+234 XXX XXX XXXX' },
    { icon: '✉️', title: 'Email', details: 'info@buccf.org\npastor@buccf.org\nwelfare@buccf.org' },
    { icon: '🕐', title: 'Office Hours', details: 'Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 2:00 PM\nSunday: After Service' }
  ];

  const campusLocations = [
    { name: 'Main Campus Chapel', address: 'Baptist University Main Campus', services: 'Sunday 9:00 AM & 11:30 AM' },
    { name: 'Student Center', address: 'Student Activities Building', services: 'Wednesday Bible Study 6:00 PM' },
    { name: 'Youth Center', address: 'Recreation Complex', services: 'Friday Youth Service 7:00 PM' }
  ];

  return (
    <Container className="py-5">
      {/* Header */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto text-center">
          <h1 className="display-4 mb-4">Contact Us</h1>
          <p className="lead">
            We'd love to hear from you! Whether you have questions, need prayer, 
            or want to get involved, don't hesitate to reach out.
          </p>
        </Col>
      </Row>

      <Row>
        {/* Contact Form */}
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Send us a Message</h3>
            </Card.Header>
            <Card.Body>
              {showSuccess && (
                <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
                  Thank you for your message! We'll get back to you within 24-48 hours.
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your email"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="general">General Inquiry</option>
                        <option value="prayer">Prayer Request</option>
                        <option value="ministry">Ministry Information</option>
                        <option value="events">Events & Programs</option>
                        <option value="membership">Membership</option>
                        <option value="welfare">Welfare/Support</option>
                        <option value="technical">Technical Support</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Subject *</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief subject of your message"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Please share your message, questions, or concerns..."
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" size="lg" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Contact Information</h4>
            </Card.Header>
            <Card.Body>
              {contactInfo.map((info, index) => (
                <div key={index} className="mb-4">
                  <div className="d-flex align-items-start">
                    <div className="me-3" style={{ fontSize: '1.5rem' }}>
                      {info.icon}
                    </div>
                    <div>
                      <h6 className="mb-1">{info.title}</h6>
                      <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-line' }}>
                        {info.details}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Emergency Contact</h4>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                <strong>24/7 Prayer Line:</strong><br />
                +234 XXX XXX XXXX
              </p>
              <p className="mb-2">
                <strong>Pastoral Emergency:</strong><br />
                +234 XXX XXX XXXX
              </p>
              <p className="text-muted small">
                For urgent pastoral care, counseling, or emergency situations.
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h4 className="mb-0">Follow Us</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <a href="#" className="btn btn-outline-danger">
                  📺 YouTube Channel
                </a>
                <a href="#" className="btn btn-outline-primary">
                  📘 Facebook Page
                </a>
                <a href="#" className="btn btn-outline-info">
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

      {/* Campus Locations */}
      <Row className="mt-5">
        <Col>
          <h2 className="mb-4">Campus Locations</h2>
          <Row>
            {campusLocations.map((location, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card>
                  <Card.Body>
                    <h5>{location.name}</h5>
                    <p className="text-muted mb-2">{location.address}</p>
                    <p className="small">
                      <strong>Services:</strong><br />
                      {location.services}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Map Section */}
      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Find Us on Campus</h4>
            </Card.Header>
            <Card.Body>
              <div className="bg-light rounded d-flex align-items-center justify-content-center" 
                   style={{ height: '300px' }}>
                <div className="text-center">
                  <div style={{ fontSize: '4rem' }}>🗺️</div>
                  <h5 className="mt-3">Interactive Campus Map</h5>
                  <p className="text-muted">
                    Detailed campus map with all BUCCF locations and meeting points
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FAQ Section */}
      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Frequently Asked Questions</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>What should I expect on my first visit?</h6>
                  <p className="small text-muted mb-3">
                    Come as you are! Our services are welcoming and casual. 
                    You'll find friendly faces and a warm atmosphere.
                  </p>

                  <h6>Do I need to register before attending?</h6>
                  <p className="small text-muted mb-3">
                    No registration required for services. However, registering 
                    helps us keep you updated on events and opportunities.
                  </p>

                  <h6>What programs are available for students?</h6>
                  <p className="small text-muted mb-3">
                    We offer Bible studies, small groups, ministry opportunities, 
                    social events, and academic year programs.
                  </p>
                </Col>
                <Col md={6}>
                  <h6>How can I get involved in ministry?</h6>
                  <p className="small text-muted mb-3">
                    Speak with any of our ministry leaders or fill out a 
                    volunteer interest form. We have opportunities for everyone!
                  </p>

                  <h6>Is there parking available?</h6>
                  <p className="small text-muted mb-3">
                    Yes, free parking is available near all our meeting locations 
                    on campus. Look for designated BUCCF parking areas.
                  </p>

                  <h6>What if I need prayer or counseling?</h6>
                  <p className="small text-muted mb-3">
                    Our pastoral team is available for prayer, counseling, and 
                    spiritual guidance. Contact us anytime for support.
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;

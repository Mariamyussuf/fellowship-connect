import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const About: React.FC = () => {
  const leadership = [
    { name: 'Pastor John Doe', role: 'Senior Pastor', bio: 'Leading the fellowship with wisdom and compassion for over 10 years.' },
    { name: 'Rev. Jane Smith', role: 'Associate Pastor', bio: 'Passionate about youth ministry and community outreach.' },
    { name: 'Deacon Mike Johnson', role: 'Head of Ministries', bio: 'Coordinating various ministries and ensuring smooth operations.' },
    { name: 'Sister Mary Williams', role: 'Welfare Coordinator', bio: 'Caring for the needs of our community members.' }
  ];

  const values = [
    { title: 'Faith', description: 'Grounded in biblical truth and unwavering trust in God', icon: '✝️' },
    { title: 'Fellowship', description: 'Building meaningful relationships and community bonds', icon: '🤝' },
    { title: 'Service', description: 'Serving God and others with love and dedication', icon: '❤️' },
    { title: 'Growth', description: 'Continuous spiritual and personal development', icon: '🌱' },
    { title: 'Unity', description: 'Embracing diversity while maintaining unity in Christ', icon: '🕊️' },
    { title: 'Excellence', description: 'Striving for excellence in all we do for God\'s glory', icon: '⭐' }
  ];

  return (
    <Container className="py-5">
      {/* Header */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto text-center">
          <h1 className="display-4 mb-4">About BUCCF</h1>
          <p className="lead">
            Baptist University Christian Community Fellowship is more than just a church - 
            we're a family united by faith, committed to growing together in Christ.
          </p>
        </Col>
      </Row>

      {/* Our Story */}
      <Row className="mb-5">
        <Col lg={6}>
          <h2 className="mb-4">Our Story</h2>
          <p>
            Founded in 1995, Baptist University Christian Community Fellowship began as a small 
            group of students seeking to create a space for authentic Christian fellowship on campus. 
            What started with just 12 members has grown into a vibrant community of over 500 active 
            participants.
          </p>
          <p>
            Our journey has been marked by God's faithfulness, community support, and a shared 
            commitment to living out the Gospel in our daily lives. We've weathered challenges, 
            celebrated victories, and consistently focused on our mission to be a beacon of 
            hope and love in the university community.
          </p>
          <p>
            Today, BUCCF continues to be a place where students, faculty, and community members 
            can find spiritual nourishment, genuine friendships, and opportunities to serve others 
            in meaningful ways.
          </p>
        </Col>
        <Col lg={6}>
          <div className="bg-light rounded p-4 h-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <div style={{ fontSize: '6rem' }}>📖</div>
              <h4 className="mt-3">30+ Years of Ministry</h4>
              <p className="text-muted">Serving the university community since 1995</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Mission & Vision */}
      <Row className="mb-5">
        <Col md={6}>
          <Card className="h-100 border-primary">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Our Mission</h3>
            </Card.Header>
            <Card.Body>
              <p>
                To create a loving, inclusive community where university students and community 
                members can grow in their relationship with Christ, support one another through 
                authentic fellowship, and serve others with the transformative love of Jesus.
              </p>
              <p>
                We are committed to providing spiritual guidance, practical support, and 
                opportunities for meaningful service that impact both our local community 
                and the world beyond.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 border-success">
            <Card.Header className="bg-success text-white">
              <h3 className="mb-0">Our Vision</h3>
            </Card.Header>
            <Card.Body>
              <p>
                To be a thriving, Christ-centered community that transforms lives, strengthens 
                families, and positively impacts the university and surrounding areas through 
                the power of the Gospel.
              </p>
              <p>
                We envision a future where every member is equipped to live out their faith 
                boldly, serve with passion, and make disciples who will continue this legacy 
                for generations to come.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Core Values */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-5">Our Core Values</h2>
          <Row>
            {values.map((value, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <Card className="text-center h-100">
                  <Card.Body>
                    <div style={{ fontSize: '3rem' }} className="mb-3">
                      {value.icon}
                    </div>
                    <h5>{value.title}</h5>
                    <p className="text-muted">{value.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Leadership Team */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-5">Leadership Team</h2>
          <Row>
            {leadership.map((leader, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="mb-3">
                      <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center text-white"
                           style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                        👤
                      </div>
                    </div>
                    <h5>{leader.name}</h5>
                    <p className="text-primary fw-bold">{leader.role}</p>
                    <p className="text-muted small">{leader.bio}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* What We Believe */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Header className="bg-dark text-white">
              <h3 className="mb-0 text-center">What We Believe</h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>The Bible</h5>
                  <p className="small">
                    We believe the Bible is the inspired, infallible Word of God and our 
                    ultimate authority for faith and practice.
                  </p>
                  
                  <h5>Jesus Christ</h5>
                  <p className="small">
                    We believe Jesus Christ is the Son of God, fully divine and fully human, 
                    who died for our sins and rose again.
                  </p>
                  
                  <h5>Salvation</h5>
                  <p className="small">
                    We believe salvation is by grace through faith in Jesus Christ alone, 
                    not by works or human effort.
                  </p>
                </Col>
                <Col md={6}>
                  <h5>The Trinity</h5>
                  <p className="small">
                    We believe in one God eternally existing in three persons: 
                    Father, Son, and Holy Spirit.
                  </p>
                  
                  <h5>The Church</h5>
                  <p className="small">
                    We believe the church is the body of Christ, called to worship, 
                    fellowship, discipleship, and service.
                  </p>
                  
                  <h5>Eternal Life</h5>
                  <p className="small">
                    We believe in the resurrection of the dead and eternal life 
                    for all who trust in Jesus Christ.
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
      <Row className="mb-5">
        <Col>
          <Card className="bg-light">
            <Card.Body>
              <h3 className="text-center mb-4">BUCCF by the Numbers</h3>
              <Row className="text-center">
                <Col md={3}>
                  <h2 className="text-primary">500+</h2>
                  <p>Active Members</p>
                </Col>
                <Col md={3}>
                  <h2 className="text-success">12</h2>
                  <p>Active Ministries</p>
                </Col>
                <Col md={3}>
                  <h2 className="text-warning">30+</h2>
                  <p>Years of Service</p>
                </Col>
                <Col md={3}>
                  <h2 className="text-info">100+</h2>
                  <p>Events Annually</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Tab, Tabs, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import EvangelismReportForm from '../components/engagement/EvangelismReportForm';
import { EngagementService } from '../services/engagementService';
import type { EvangelismReport } from '../types';

const EvangelismReports: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeKey, setActiveKey] = useState('submit');
  const [featuredReports, setFeaturedReports] = useState<EvangelismReport[]>([]);
  const [myReports, setMyReports] = useState<EvangelismReport[]>([]);
  const [loading, setLoading] = useState(true);

  const engagementService = EngagementService.getInstance();

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load featured reports
      const featured = await engagementService.getEvangelismReports({
        featured: true,
        status: 'approved',
        limit: 20
      });
      setFeaturedReports(featured);

      // Load user's own reports if logged in
      if (currentUser) {
        const userReports = await engagementService.getEvangelismReports({
          userId: currentUser.uid,
          limit: 50
        });
        setMyReports(userReports);
      }

    } catch (error) {
      console.error('Error loading evangelism reports:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, engagementService]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleSubmitSuccess = () => {
    loadReports();
    setActiveKey('my-reports');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };

    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const EvangelismReportCard: React.FC<{ 
    report: EvangelismReport; 
    showStatus?: boolean;
    showStats?: boolean;
  }> = ({ report, showStatus = false, showStats = true }) => (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-1">{report.title}</h5>
            <small className="text-muted">
              By {report.userName} • {formatDate(report.date)}
              {report.location && ` • ${report.location}`}
            </small>
          </div>
          <div className="d-flex gap-2">
            {report.featured && <Badge bg="primary">Featured</Badge>}
            {showStatus && getStatusBadge(report.status)}
          </div>
        </div>
        
        <p className="text-muted mb-3">{report.description}</p>
        
        {showStats && (report.peopleReached || report.conversions) && (
          <Row className="mb-3">
            {report.peopleReached && (
              <Col sm={6}>
                <div className="text-center p-2 bg-light rounded">
                  <h4 className="text-primary mb-0">{report.peopleReached}</h4>
                  <small className="text-muted">People Reached</small>
                </div>
              </Col>
            )}
            {report.conversions && (
              <Col sm={6}>
                <div className="text-center p-2 bg-light rounded">
                  <h4 className="text-success mb-0">{report.conversions}</h4>
                  <small className="text-muted">Decisions Made</small>
                </div>
              </Col>
            )}
          </Row>
        )}

        {report.followUpRequired && report.followUpNotes && (
          <Alert variant="info" className="mb-0">
            <strong>Follow-up Needed:</strong> {report.followUpNotes}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Evangelism Reports</h2>
          <p className="text-muted">Share your evangelism experiences and get inspired by others</p>
        </Col>
      </Row>

      <Tabs
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k || 'submit')}
        className="mb-4"
      >
        <Tab eventKey="submit" title="Submit Report">
          <Row>
            <Col lg={8} className="mx-auto">
              <EvangelismReportForm onSubmitSuccess={handleSubmitSuccess} />
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="featured" title={`Featured Stories (${featuredReports.length})`}>
          <Row>
            <Col lg={10} className="mx-auto">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : featuredReports.length === 0 ? (
                <Alert variant="info">
                  No featured evangelism stories yet. Submit your reports to potentially be featured!
                </Alert>
              ) : (
                <>
                  <Alert variant="success">
                    <strong>Inspiring Stories:</strong> These evangelism reports have been selected 
                    to encourage and inspire our community in outreach efforts.
                  </Alert>
                  
                  {featuredReports.map(report => (
                    <EvangelismReportCard 
                      key={report.id} 
                      report={report} 
                      showStats={true}
                    />
                  ))}
                </>
              )}
            </Col>
          </Row>
        </Tab>

        {currentUser && (
          <Tab eventKey="my-reports" title={`My Reports (${myReports.length})`}>
            <Row>
              <Col lg={10} className="mx-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : myReports.length === 0 ? (
                  <Alert variant="info">
                    You haven&apos;t submitted any evangelism reports yet. Use the &quot;Submit Report&quot; tab to share your experiences!
                  </Alert>
                ) : (
                  <>
                    <Alert variant="primary">
                      <strong>Your Evangelism Reports:</strong> Track your submitted reports and their approval status.
                    </Alert>
                    
                    {myReports.map(report => (
                      <EvangelismReportCard 
                        key={report.id} 
                        report={report} 
                        showStatus={true}
                        showStats={true}
                      />
                    ))}
                  </>
                )}
              </Col>
            </Row>
          </Tab>
        )}

        <Tab eventKey="impact" title="Community Impact">
          <Row>
            <Col lg={10} className="mx-auto">
              <div className="row g-4 mb-4">
                <div className="col-md-3">
                  <Card className="text-center">
                    <Card.Body>
                      <h2 className="text-primary mb-1">247</h2>
                      <small className="text-muted">Total People Reached</small>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-3">
                  <Card className="text-center">
                    <Card.Body>
                      <h2 className="text-success mb-1">43</h2>
                      <small className="text-muted">Decisions for Christ</small>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-3">
                  <Card className="text-center">
                    <Card.Body>
                      <h2 className="text-info mb-1">28</h2>
                      <small className="text-muted">Active Evangelists</small>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-3">
                  <Card className="text-center">
                    <Card.Body>
                      <h2 className="text-warning mb-1">156</h2>
                      <small className="text-muted">Reports Submitted</small>
                    </Card.Body>
                  </Card>
                </div>
              </div>

              <Card>
                <Card.Header>
                  <h5 className="mb-0">Our Evangelism Impact</h5>
                </Card.Header>
                <Card.Body>
                  <p>
                    Our church community is actively engaged in sharing the Gospel and making disciples. 
                    Through various evangelism efforts including personal witnessing, community outreach, 
                    campus evangelism, and special events, we&#39;re seeing God work in amazing ways.
                  </p>

                  <h6>Recent Highlights</h6>
                  <ul>
                    <li>Campus outreach events reaching over 100 students monthly</li>
                    <li>Community service projects opening doors for Gospel conversations</li>
                    <li>Personal evangelism training equipping members for effective witnessing</li>
                    <li>Follow-up discipleship programs for new believers</li>
                    <li>Partnership with local churches for city-wide evangelism efforts</li>
                  </ul>

                  <h6>Evangelism Methods Being Used</h6>
                  <Row>
                    <Col md={6}>
                      <ul className="small">
                        <li>Personal one-on-one conversations</li>
                        <li>Campus outreach and events</li>
                        <li>Community service evangelism</li>
                        <li>Digital and social media outreach</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <ul className="small">
                        <li>Street evangelism and open-air preaching</li>
                        <li>Workplace witnessing</li>
                        <li>Friendship evangelism</li>
                        <li>Special evangelistic events</li>
                      </ul>
                    </Col>
                  </Row>

                  <Alert variant="primary" className="mt-3">
                    <h6>Get Involved</h6>
                    <p className="mb-0">
                      Want to join our evangelism efforts? Contact our evangelism coordinator 
                      at evangelism@buccf.org or attend our monthly evangelism training sessions.
                    </p>
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="resources" title="Evangelism Resources">
          <Row>
            <Col lg={8} className="mx-auto">
              <div className="row g-4">
                <div className="col-md-6">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Training Materials</h5>
                    </Card.Header>
                    <Card.Body>
                      <ul>
                        <li>Personal Evangelism Training Guide</li>
                        <li>Gospel Presentation Methods</li>
                        <li>Handling Common Questions</li>
                        <li>Cultural Sensitivity in Evangelism</li>
                        <li>Follow-up and Discipleship</li>
                      </ul>
                      <Button variant="outline-primary" size="sm">
                        Access Training Materials
                      </Button>
                    </Card.Body>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Evangelism Tools</h5>
                    </Card.Header>
                    <Card.Body>
                      <ul>
                        <li>Gospel tracts and literature</li>
                        <li>Scripture memory cards</li>
                        <li>Testimony templates</li>
                        <li>Conversation starters</li>
                        <li>Digital evangelism apps</li>
                      </ul>
                      <Button variant="outline-primary" size="sm">
                        Download Tools
                      </Button>
                    </Card.Body>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Upcoming Events</h5>
                    </Card.Header>
                    <Card.Body>
                      <ul>
                        <li>Monthly Evangelism Training - 1st Saturday</li>
                        <li>Campus Outreach - Every Friday</li>
                        <li>Community Service Day - 3rd Saturday</li>
                        <li>Evangelism Prayer Meeting - Wednesdays</li>
                      </ul>
                      <Button variant="outline-primary" size="sm">
                        View Calendar
                      </Button>
                    </Card.Body>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Support & Mentorship</h5>
                    </Card.Header>
                    <Card.Body>
                      <ul>
                        <li>Evangelism mentorship program</li>
                        <li>Prayer support for evangelists</li>
                        <li>Encouragement and accountability</li>
                        <li>Sharing experiences and testimonies</li>
                      </ul>
                      <Button variant="outline-primary" size="sm">
                        Join Mentorship
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              </div>

              <Alert variant="success" className="mt-4">
                <h6>Scripture Encouragement</h6>
                <p className="mb-0">
                  &#34;Therefore go and make disciples of all nations, baptizing them in the name 
                  of the Father and of the Son and of the Holy Spirit, and teaching them to 
                  obey everything I have commanded you.&#34; - Matthew 28:19-20
                </p>
              </Alert>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default EvangelismReports;

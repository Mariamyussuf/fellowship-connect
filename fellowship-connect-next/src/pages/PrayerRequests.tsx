import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Tab, Tabs, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import PrayerRequestForm from '../components/engagement/PrayerRequestForm';
import { EngagementService } from '../services/engagementService';
import type { PrayerRequest } from '../types';

const PrayerRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeKey, setActiveKey] = useState('submit');
  const [publicRequests, setPublicRequests] = useState<PrayerRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const engagementService = EngagementService.getInstance();

  const loadPrayerRequests = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load public prayer requests
      const publicReqs = await engagementService.getPrayerRequests({
        isPublic: true,
        limit: 50
      });
      setPublicRequests(publicReqs);

      // Load user's own requests if logged in
      if (currentUser) {
        const userReqs = await engagementService.getPrayerRequests({
          userId: currentUser.uid,
          limit: 50
        });
        setMyRequests(userReqs);
      }

    } catch (error) {
      console.error('Error loading prayer requests:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, engagementService]);

  useEffect(() => {
    loadPrayerRequests();
  }, [currentUser, loadPrayerRequests]);

  const handleSubmitSuccess = () => {
    loadPrayerRequests();
    setActiveKey('my-requests');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      general: 'primary',
      health: 'danger',
      family: 'success',
      finances: 'warning',
      relationships: 'info',
      career: 'secondary',
      spiritual: 'primary',
      community: 'success',
      other: 'secondary'
    };

    return (
      <Badge bg={variants[category] || 'secondary'}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const PrayerRequestCard: React.FC<{ request: PrayerRequest; showActions?: boolean }> = ({ 
    request, 
    showActions = false 
  }) => (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1">{request.title}</h6>
            <small className="text-muted">
              By {request.isAnonymous ? 'Anonymous' : request.userName} • {formatDate(request.createdAt)}
            </small>
          </div>
          <div className="d-flex gap-2">
            {getCategoryBadge(request.category)}
            {request.isAnswered && <Badge bg="success">Answered</Badge>}
          </div>
        </div>
        
        <p className="text-muted mb-3">{request.content}</p>
        
        {request.isAnswered && request.answerNote && (
          <Alert variant="success" className="mb-3">
            <strong>Praise Report:</strong> {request.answerNote}
          </Alert>
        )}

        {showActions && (
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm">
              🙏 Pray for This
            </Button>
            {!request.isAnswered && (
              <Button variant="outline-success" size="sm">
                ✅ Mark as Answered
              </Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Prayer Requests</h2>
          <p className="text-muted">Submit prayer requests and join others in prayer</p>
        </Col>
      </Row>

      <Tabs
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k || 'submit')}
        className="mb-4"
      >
        <Tab eventKey="submit" title="Submit Request">
          <Row>
            <Col lg={8} className="mx-auto">
              <PrayerRequestForm onSubmitSuccess={handleSubmitSuccess} />
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="public" title={`Public Requests (${publicRequests.length})`}>
          <Row>
            <Col lg={10} className="mx-auto">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : publicRequests.length === 0 ? (
                <Alert variant="info">
                  No public prayer requests at this time. Be the first to submit one!
                </Alert>
              ) : (
                <>
                  <Alert variant="info">
                    <strong>Join in Prayer:</strong> These are prayer requests that members have chosen 
                    to share publicly so the community can pray together.
                  </Alert>
                  
                  {publicRequests.map(request => (
                    <PrayerRequestCard 
                      key={request.id} 
                      request={request} 
                      showActions={true}
                    />
                  ))}
                </>
              )}
            </Col>
          </Row>
        </Tab>

        {currentUser && (
          <Tab eventKey="my-requests" title={`My Requests (${myRequests.length})`}>
            <Row>
              <Col lg={10} className="mx-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : myRequests.length === 0 ? (
                  <Alert variant="info">
                    You haven&apos;t submitted any prayer requests yet. Use the &quot;Submit Request&quot; tab to share your prayer needs.
                  </Alert>
                ) : (
                  <>
                    <Alert variant="success">
                      <strong>Your Prayer Requests:</strong> Track your submitted requests and share praise reports when prayers are answered.
                    </Alert>
                    
                    {myRequests.map(request => (
                      <PrayerRequestCard 
                        key={request.id} 
                        request={request} 
                        showActions={false}
                      />
                    ))}
                  </>
                )}
              </Col>
            </Row>
          </Tab>
        )}

        <Tab eventKey="guidelines" title="Prayer Guidelines">
          <Row>
            <Col lg={8} className="mx-auto">
              <Card>
                <Card.Header>
                  <h4 className="mb-0">Prayer Request Guidelines</h4>
                </Card.Header>
                <Card.Body>
                  <h5>How to Submit Effective Prayer Requests</h5>
                  <ul>
                    <li><strong>Be Specific:</strong> Provide enough detail for meaningful prayer</li>
                    <li><strong>Be Appropriate:</strong> Keep requests suitable for community sharing</li>
                    <li><strong>Be Honest:</strong> Share genuine needs and concerns</li>
                    <li><strong>Be Hopeful:</strong> Remember that God hears and answers prayer</li>
                  </ul>

                  <h5 className="mt-4">Privacy Options</h5>
                  <ul>
                    <li><strong>Public Requests:</strong> Visible to all members for community prayer</li>
                    <li><strong>Private Requests:</strong> Only seen by designated prayer team members</li>
                    <li><strong>Anonymous Requests:</strong> Your name is not displayed with the request</li>
                  </ul>

                  <h5 className="mt-4">What Happens to Your Request</h5>
                  <ul>
                    <li>All requests are reviewed by our pastoral team</li>
                    <li>Private requests are shared only with our prayer team</li>
                    <li>Public requests may be mentioned in prayer meetings</li>
                    <li>You&apos;ll be contacted if follow-up is needed</li>
                    <li>We celebrate answered prayers together!</li>
                  </ul>

                  <h5 className="mt-4">Categories Explained</h5>
                  <Row>
                    <Col md={6}>
                      <ul className="small">
                        <li><strong>General:</strong> General life situations</li>
                        <li><strong>Health:</strong> Physical and mental health needs</li>
                        <li><strong>Family:</strong> Family relationships and situations</li>
                        <li><strong>Finances:</strong> Financial challenges and provision</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <ul className="small">
                        <li><strong>Relationships:</strong> Friendships and relationships</li>
                        <li><strong>Career:</strong> Work and career guidance</li>
                        <li><strong>Spiritual:</strong> Spiritual growth and guidance</li>
                        <li><strong>Community:</strong> Community and church needs</li>
                      </ul>
                    </Col>
                  </Row>

                  <Alert variant="primary" className="mt-4">
                    <h6>Remember:</h6>
                    <p className="mb-0">
                      &quot;Do not be anxious about anything, but in every situation, by prayer and petition, 
                      with thanksgiving, present your requests to God.&quot; - Philippians 4:6
                    </p>
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default PrayerRequests;

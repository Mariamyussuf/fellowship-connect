import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Tabs, Card, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import WelfareRequestForm from '../components/engagement/WelfareRequestForm';
import { EngagementService } from '../services/engagementService';
import type { WelfareRequest } from '../types';

const WelfareSupport: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeKey, setActiveKey] = useState('submit');
  const [myRequests, setMyRequests] = useState<WelfareRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const engagementService = EngagementService.getInstance();

  useEffect(() => {
    if (currentUser) {
      loadMyRequests();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadMyRequests = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userReqs = await engagementService.getWelfareRequests({
        userId: currentUser.uid,
        limit: 50
      });
      setMyRequests(userReqs);
    } catch (error) {
      console.error('Error loading welfare requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSuccess = () => {
    loadMyRequests();
    setActiveKey('my-requests');
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
      reviewed: 'info',
      approved: 'success',
      completed: 'success',
      declined: 'danger'
    };

    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants: Record<string, string> = {
      low: 'success',
      medium: 'warning',
      high: 'danger',
      critical: 'danger'
    };

    return (
      <Badge bg={variants[urgency] || 'secondary'}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
      </Badge>
    );
  };

  const WelfareRequestCard: React.FC<{ request: WelfareRequest }> = ({ request }) => (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1">{request.title}</h6>
            <small className="text-muted">
              Submitted {formatDate(request.createdAt)} • {request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)} Assistance
            </small>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {getStatusBadge(request.status)}
            {getUrgencyBadge(request.urgency)}
          </div>
        </div>
        
        <p className="text-muted mb-3">{request.description}</p>
        
        {request.adminNotes && (
          <Alert variant="info" className="mb-0">
            <strong>Update from Welfare Team:</strong> {request.adminNotes}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Welfare Support</h2>
          <p className="text-muted">Request assistance during difficult times - we're here to help</p>
        </Col>
      </Row>

      <Tabs
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k || 'submit')}
        className="mb-4"
      >
        <Tab eventKey="submit" title="Request Assistance">
          <Row>
            <Col lg={8} className="mx-auto">
              <WelfareRequestForm onSubmitSuccess={handleSubmitSuccess} />
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
                    You haven't submitted any welfare requests yet. Use the "Request Assistance" tab if you need support.
                  </Alert>
                ) : (
                  <>
                    <Alert variant="success">
                      <strong>Your Welfare Requests:</strong> Track the status of your assistance requests below.
                    </Alert>
                    
                    {myRequests.map(request => (
                      <WelfareRequestCard key={request.id} request={request} />
                    ))}
                  </>
                )}
              </Col>
            </Row>
          </Tab>
        )}

        <Tab eventKey="resources" title="Available Resources">
          <Row>
            <Col lg={10} className="mx-auto">
              <div className="row g-4">
                <div className="col-md-6">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Financial Assistance</h5>
                    </Card.Header>
                    <Card.Body>
                      <ul>
                        <li>Emergency financial support</li>
                        <li>Utility bill assistance</li>
                        <li>Rent/accommodation support</li>
                        <li>Educational fee assistance</li>
                        <li>Medical expense support</li>
                      </ul>
                      <p className="text-muted small">
                        Available based on need assessment and available funds
                      </p>
                    </Card.Body>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Food Support</h5>
                    </Card.Header>
                    <Card.Body>
                      <ul>
                        <li>Emergency food packages</li>
                        <li>Meal vouchers</li>
                        <li>Connection to local food banks</li>
                        <li>Grocery assistance</li>
                        <li>Special dietary needs support</li>
                      </ul>
                      <p className="text-muted small">
                        Coordinated through our food ministry partners
                      </p>
                    </Card.Body>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Housing Support</h5>
                    </Card.Header>
                    <Card.Body>
                      <ul>
                        <li>Temporary accommodation assistance</li>
                        <li>Housing search support</li>
                        <li>Connection to housing programs</li>
                        <li>Deposit assistance</li>
                        <li>Housing counseling</li>
                      </ul>
                      <p className="text-muted small">
                        Working with local housing organizations
                      </p>
                    </Card.Body>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Additional Support</h5>
                    </Card.Header>
                    <Card.Body>
                      <ul>
                        <li>Transportation assistance</li>
                        <li>Medical support coordination</li>
                        <li>Counseling referrals</li>
                        <li>Job search assistance</li>
                        <li>Legal aid connections</li>
                      </ul>
                      <p className="text-muted small">
                        Connecting you with appropriate resources
                      </p>
                    </Card.Body>
                  </Card>
                </div>
              </div>

              <Alert variant="primary" className="mt-4">
                <h6>Our Commitment to You</h6>
                <p className="mb-0">
                  Every request is handled with complete confidentiality and compassion. 
                  Our welfare team is trained to assess needs and connect you with appropriate 
                  resources, both within our church and in the broader community.
                </p>
              </Alert>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="guidelines" title="Guidelines & FAQ">
          <Row>
            <Col lg={8} className="mx-auto">
              <Card>
                <Card.Header>
                  <h4 className="mb-0">Welfare Support Guidelines</h4>
                </Card.Header>
                <Card.Body>
                  <h5>Who Can Request Assistance?</h5>
                  <ul>
                    <li>Church members and regular attendees</li>
                    <li>Visitors and community members in crisis situations</li>
                    <li>Family members of church members</li>
                    <li>Anyone referred by church leadership</li>
                  </ul>

                  <h5 className="mt-4">How the Process Works</h5>
                  <ol>
                    <li><strong>Submit Request:</strong> Complete the assistance request form</li>
                    <li><strong>Initial Review:</strong> Welfare coordinator reviews within 24 hours</li>
                    <li><strong>Assessment:</strong> Phone or in-person meeting to assess needs</li>
                    <li><strong>Resource Matching:</strong> Connect with appropriate assistance</li>
                    <li><strong>Follow-up:</strong> Ongoing support and check-ins as needed</li>
                  </ol>

                  <h5 className="mt-4">Urgency Levels</h5>
                  <ul>
                    <li><strong>Critical:</strong> Immediate danger or crisis (within hours)</li>
                    <li><strong>High:</strong> Urgent need requiring quick response (1-2 days)</li>
                    <li><strong>Medium:</strong> Important need (within a week)</li>
                    <li><strong>Low:</strong> General assistance (flexible timeline)</li>
                  </ul>

                  <h5 className="mt-4">Frequently Asked Questions</h5>
                  
                  <h6>Is there a limit to how much assistance I can receive?</h6>
                  <p className="small">
                    Assistance is based on available resources and individual circumstances. 
                    We work with each person to develop sustainable solutions.
                  </p>

                  <h6>Will my request be kept confidential?</h6>
                  <p className="small">
                    Yes, all welfare requests are handled with strict confidentiality. 
                    Information is only shared with authorized welfare team members.
                  </p>

                  <h6>What if I need immediate help?</h6>
                  <p className="small">
                    For emergencies, mark your request as "Critical" and also call our 
                    emergency pastoral line at +234 XXX XXX XXXX.
                  </p>

                  <h6>Can I help others through the welfare ministry?</h6>
                  <p className="small">
                    Yes! Contact our welfare coordinator about volunteering opportunities 
                    or making donations to support others in need.
                  </p>

                  <Alert variant="warning" className="mt-4">
                    <h6>Emergency Situations</h6>
                    <p className="mb-0">
                      If you're in immediate danger or facing a life-threatening emergency, 
                      please call emergency services (911) first, then contact our pastoral emergency line.
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

export default WelfareSupport;

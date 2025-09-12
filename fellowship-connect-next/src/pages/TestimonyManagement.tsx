import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { testimonyService } from '../services/testimonyService';
import TestimonyRegistrationForm from '../components/testimony/TestimonyRegistrationForm';
import TestimonyCard from '../components/testimony/TestimonyCard';
import type { Testimony } from '../types';
import { Timestamp } from 'firebase/firestore';

const TestimonyManagement: React.FC = () => {
  const { isAdmin, userProfile } = useAuth();
  const [activeKey, setActiveKey] = useState('register');
  const [loading, setLoading] = useState(false);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [pendingTestimonies, setPendingTestimonies] = useState<Testimony[]>([]);
  const [stats, setStats] = useState<{total: number; approved: number; pending: number; rejected: number; featured: number; totalViews: number; totalLikes: number; categories: Record<string, number>} | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [selectedTestimony, setSelectedTestimony] = useState<Testimony | null>(null);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject'>('approve');
  const [moderationNotes, setModerationNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTestimonies, pending, statistics] = await Promise.all([
        testimonyService.getTestimonies(),
        testimonyService.getPendingTestimonies(),
        testimonyService.getTestimonyStats()
      ]);

      setTestimonies(allTestimonies);
      setPendingTestimonies(pending);
      setStats(statistics);
    } catch (err) {
      setError('Failed to load testimony data');
      console.error('Error loading testimony data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setSuccess('Testimony registered successfully!');
    loadData();
  };

  const handleViewTestimony = (testimony: Testimony) => {
    setSelectedTestimony(testimony);
    setShowViewModal(true);
    // Increment view count only if testimony has an id
    if (testimony.id) {
      testimonyService.incrementViewCount(testimony.id);
    }
  };

  const handleModerateClick = (testimony: Testimony, action: 'approve' | 'reject') => {
    setSelectedTestimony(testimony);
    setModerationAction(action);
    setModerationNotes('');
    setShowModerationModal(true);
  };

  const handleModerationSubmit = async () => {
    // Add null checks before calling the service
    if (!selectedTestimony?.id || !userProfile?.uid) {
      setError('Missing required information for moderation');
      return;
    }

    try {
      await testimonyService.moderateTestimony(
        selectedTestimony.id,
        moderationAction,
        userProfile.uid,
        moderationNotes
      );

      setSuccess(`Testimony ${moderationAction}d successfully!`);
      setShowModerationModal(false);
      loadData();
    } catch (err) {
      setError(`Failed to ${moderationAction} testimony`);
      console.error('Error moderating testimony:', err);
    }
  };

  const handleToggleFeatured = async (testimony: Testimony) => {
    // Add null check for testimony.id
    if (!testimony.id) {
      setError('Cannot toggle featured status: testimony ID is missing');
      return;
    }
    
    try {
      await testimonyService.toggleFeatured(testimony.id, !testimony.featured);
      setSuccess(`Testimony ${testimony.featured ? 'unfeatured' : 'featured'} successfully!`);
      loadData();
    } catch (err) {
      setError('Failed to update featured status');
      console.error('Error toggling featured:', err);
    }
  };

  if (!isAdmin) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Access denied. This page is only available to administrators.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-heart-fill me-2 text-primary"></i>
            Testimony Management
          </h2>
          <p className="text-muted">Register and moderate member testimonies</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Statistics Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{stats.total}</h3>
                <small className="text-muted">Total Testimonies</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">{stats.pending}</h3>
                <small className="text-muted">Pending Review</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">{stats.approved}</h3>
                <small className="text-muted">Approved</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">{stats.featured}</h3>
                <small className="text-muted">Featured</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k || 'register')} className="mb-4">
        <Tab eventKey="register" title={
          <span>
            <i className="bi bi-plus-circle me-2"></i>
            Register Testimony
          </span>
        }>
          <TestimonyRegistrationForm onSuccess={handleRegistrationSuccess} />
        </Tab>

        <Tab eventKey="pending" title={
          <span>
            <i className="bi bi-clock me-2"></i>
            Pending Review
            {pendingTestimonies.length > 0 && (
              <Badge bg="warning" className="ms-2">{pendingTestimonies.length}</Badge>
            )}
          </span>
        }>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading pending testimonies...</p>
            </div>
          ) : (
            <Row>
              {pendingTestimonies.length === 0 ? (
                <Col>
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    No testimonies pending review.
                  </Alert>
                </Col>
              ) : (
                pendingTestimonies.map(testimony => (
                  <Col key={testimony.id} md={6} lg={4} className="mb-4">
                    <TestimonyCard
                      testimony={testimony}
                      showActions={true}
                      isAdmin={true}
                      onView={handleViewTestimony}
                      onModerate={handleModerateClick}
                    />
                  </Col>
                ))
              )}
            </Row>
          )}
        </Tab>

        <Tab eventKey="all" title={
          <span>
            <i className="bi bi-list me-2"></i>
            All Testimonies
          </span>
        }>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading testimonies...</p>
            </div>
          ) : (
            <Row>
              {testimonies.length === 0 ? (
                <Col>
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    No testimonies found.
                  </Alert>
                </Col>
              ) : (
                testimonies.map(testimony => (
                  <Col key={testimony.id} md={6} lg={4} className="mb-4">
                    <TestimonyCard
                      testimony={testimony}
                      showActions={true}
                      isAdmin={true}
                      onView={handleViewTestimony}
                      onModerate={handleModerateClick}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  </Col>
                ))
              )}
            </Row>
          )}
        </Tab>
      </Tabs>

      {/* View Testimony Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedTestimony?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTestimony && (
            <>
              <div className="mb-3">
                <Badge bg="primary" className="me-2">{selectedTestimony.category}</Badge>
                <Badge bg={selectedTestimony.status === 'approved' ? 'success' : 
                           selectedTestimony.status === 'pending' ? 'warning' : 'danger'}>
                  {selectedTestimony.status}
                </Badge>
                {selectedTestimony.featured && (
                  <Badge bg="warning" className="ms-2">Featured</Badge>
                )}
              </div>

              <div className="mb-3">
                <strong>By:</strong> {selectedTestimony.isAnonymous ? 'Anonymous' : selectedTestimony.memberName}
                {selectedTestimony.dateOfTestimony && (
                  <span className="ms-3">
                    <strong>Date:</strong> {new Date(selectedTestimony.dateOfTestimony).toLocaleDateString()}
                  </span>
                )}
                {selectedTestimony.location && (
                  <span className="ms-3">
                    <strong>Location:</strong> {selectedTestimony.location}
                  </span>
                )}
              </div>

              <div className="mb-3">
                <strong>Testimony:</strong>
                <p className="mt-2">{selectedTestimony.content}</p>
              </div>

              {selectedTestimony.tags && selectedTestimony.tags.length > 0 && (
                <div className="mb-3">
                  <strong>Tags:</strong>
                  <div className="mt-1">
                    {selectedTestimony.tags.map((tag, index) => (
                      <Badge key={index} bg="light" text="dark" className="me-1">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTestimony.witnessedBy && (
                <div className="mb-3">
                  <strong>Witnessed By:</strong> {selectedTestimony.witnessedBy}
                </div>
              )}

              <div className="text-muted small">
                <div>Views: {selectedTestimony.viewCount || 0} | Likes: {selectedTestimony.likes || 0}</div>
                <div>Submitted: {
                  selectedTestimony.createdAt instanceof Timestamp 
                    ? selectedTestimony.createdAt.toDate().toLocaleString() 
                    : typeof selectedTestimony.createdAt === 'string' 
                      ? new Date(selectedTestimony.createdAt).toLocaleString() 
                      : 'Unknown'
                }</div>
                {selectedTestimony.moderatedAt && (
                  <div>Moderated: {
                    selectedTestimony.moderatedAt instanceof Timestamp 
                      ? selectedTestimony.moderatedAt.toDate().toLocaleString() 
                      : typeof selectedTestimony.moderatedAt === 'string' 
                        ? new Date(selectedTestimony.moderatedAt).toLocaleString() 
                        : 'Unknown'
                  }</div>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Moderation Modal */}
      <Modal show={showModerationModal} onHide={() => setShowModerationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {moderationAction === 'approve' ? 'Approve' : 'Reject'} Testimony
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to <strong>{moderationAction}</strong> this testimony?
          </p>
          {selectedTestimony && (
            <div className="mb-3 p-3 bg-light rounded">
              <strong>{selectedTestimony.title}</strong>
              <p className="mb-0 text-muted">{selectedTestimony.content.substring(0, 100)}...</p>
            </div>
          )}
          <Form.Group>
            <Form.Label>Moderation Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={moderationNotes}
              onChange={(e) => setModerationNotes(e.target.value)}
              placeholder="Add any notes about this moderation decision..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModerationModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={moderationAction === 'approve' ? 'success' : 'danger'}
            onClick={handleModerationSubmit}
          >
            {moderationAction === 'approve' ? 'Approve' : 'Reject'} Testimony
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TestimonyManagement;

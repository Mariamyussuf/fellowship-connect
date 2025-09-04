import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col, Badge } from 'react-bootstrap';
import { testimonyService } from '../../services/testimonyService';
import { useAuth } from '../../context/AuthContext';

interface TestimonyRegistrationFormProps {
  onSuccess?: () => void;
}

const TestimonyRegistrationForm: React.FC<TestimonyRegistrationFormProps> = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    memberName: '',
    memberEmail: '',
    title: '',
    content: '',
    category: '',
    dateOfTestimony: '',
    location: '',
    witnessedBy: '',
    tags: '',
    isAnonymous: false,
    contactPermission: true,
    mediaUrls: ''
  });

  const categories = [
    'Salvation',
    'Healing',
    'Provision',
    'Deliverance',
    'Restoration',
    'Breakthrough',
    'Answered Prayer',
    'Life Transformation',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const testimonyData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        mediaUrls: formData.mediaUrls ? formData.mediaUrls.split(',').map(url => url.trim()) : []
      };

      await testimonyService.registerTestimony(testimonyData, userProfile.uid);
      
      setSuccess('Testimony registered successfully! It will be reviewed by our moderation team.');
      setFormData({
        memberName: '',
        memberEmail: '',
        title: '',
        content: '',
        category: '',
        dateOfTestimony: '',
        location: '',
        witnessedBy: '',
        tags: '',
        isAnonymous: false,
        contactPermission: true,
        mediaUrls: ''
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to register testimony. Please try again.');
      console.error('Error registering testimony:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-heart-fill me-2"></i>
          Register New Testimony
        </h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Member Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="memberName"
                  value={formData.memberName}
                  onChange={handleInputChange}
                  required
                  placeholder="Full name of the person giving testimony"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Member Email</Form.Label>
                <Form.Control
                  type="email"
                  name="memberEmail"
                  value={formData.memberEmail}
                  onChange={handleInputChange}
                  placeholder="Optional contact email"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Testimony Title *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Brief, descriptive title for the testimony"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Testimony Content *</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              placeholder="Share the full testimony - what God has done, how it happened, and the impact it has had..."
            />
            <Form.Text className="text-muted">
              Please provide as much detail as possible to encourage others.
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date of Testimony</Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfTestimony"
                  value={formData.dateOfTestimony}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Where did this happen? (e.g., Church service, home, etc.)"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Witnessed By</Form.Label>
                <Form.Control
                  type="text"
                  name="witnessedBy"
                  value={formData.witnessedBy}
                  onChange={handleInputChange}
                  placeholder="Who else witnessed this testimony?"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Comma-separated tags (e.g., miracle, faith, prayer, healing)"
            />
            <Form.Text className="text-muted">
              Add relevant tags to help others find similar testimonies.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Media URLs</Form.Label>
            <Form.Control
              type="text"
              name="mediaUrls"
              value={formData.mediaUrls}
              onChange={handleInputChange}
              placeholder="Comma-separated URLs for photos or videos (optional)"
            />
          </Form.Group>

          <div className="mb-3">
            <Form.Check
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              label="Submit anonymously (name will not be displayed publicly)"
            />
          </div>

          <div className="mb-3">
            <Form.Check
              type="checkbox"
              name="contactPermission"
              checked={formData.contactPermission}
              onChange={handleInputChange}
              label="Allow church leadership to contact for follow-up or clarification"
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Badge bg="info" className="me-2">
                <i className="bi bi-info-circle me-1"></i>
                Admin Registration
              </Badge>
              <small className="text-muted">
                All testimonies require moderation before being published.
              </small>
            </div>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className="px-4"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Registering...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Register Testimony
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TestimonyRegistrationForm;

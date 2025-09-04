import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { EngagementService } from '../../services/engagementService';
import type { WelfareRequest } from '../../types';

interface WelfareRequestFormProps {
  onSubmitSuccess?: (requestId: string) => void;
}

const WelfareRequestForm: React.FC<WelfareRequestFormProps> = ({ onSubmitSuccess }) => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requestType: 'financial' as const,
    urgency: 'medium' as const,
    email: userProfile?.email || '',
    phoneNumber: userProfile?.phoneNumber || '',
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const engagementService = EngagementService.getInstance();

  const requestTypes = [
    { value: 'financial', label: 'Financial Assistance' },
    { value: 'food', label: 'Food Support' },
    { value: 'accommodation', label: 'Housing/Accommodation' },
    { value: 'medical', label: 'Medical Support' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - Can wait a few weeks', color: 'success' },
    { value: 'medium', label: 'Medium - Needed within a week', color: 'warning' },
    { value: 'high', label: 'High - Needed within 2-3 days', color: 'danger' },
    { value: 'critical', label: 'Critical - Urgent assistance needed', color: 'danger' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !userProfile) {
      setError('Please log in to submit a welfare request');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestData: Omit<WelfareRequest, 'id'> = {
        userId: currentUser.uid,
        userName: formData.isAnonymous ? 'Anonymous' : (userProfile.displayName || userProfile.fullName || 'Unknown User'),
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        requestType: formData.requestType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        urgency: formData.urgency,
        status: 'pending',
        isAnonymous: formData.isAnonymous,
        createdAt: new Date().toISOString()
      };

      const requestId = await engagementService.createWelfareRequest(requestData);
      
      setSuccess('Your welfare request has been submitted successfully. Our welfare team will review it and contact you soon.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requestType: 'financial',
        urgency: 'medium',
        email: userProfile?.email || '',
        phoneNumber: userProfile?.phoneNumber || '',
        isAnonymous: false
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(requestId);
      }

    } catch (error) {
      setError('Failed to submit welfare request. Please try again.');
      console.error('Error submitting welfare request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h4 className="mb-0">Request Welfare Assistance</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Alert variant="info">
          <h6>Confidential Support Available</h6>
          <p className="mb-0 small">
            Our welfare ministry is here to help during difficult times. All requests are handled 
            with complete confidentiality and compassion. Don't hesitate to reach out - we're here for you.
          </p>
        </Alert>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type of Assistance Needed *</Form.Label>
                <Form.Select
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                >
                  {requestTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Urgency Level *</Form.Label>
                <Form.Select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                >
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Request Title *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief description of your need"
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Detailed Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please provide details about your situation and the specific help you need. Include any relevant circumstances, timeline, or other information that would help us assist you better."
              required
              disabled={loading}
            />
            <Form.Text className="text-muted">
              The more details you provide, the better we can understand and assist with your needs.
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your email address"
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  For follow-up communication
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  For urgent matters or direct contact
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              label="Submit this request anonymously"
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Your identity will be kept confidential from other members, but our welfare team will still be able to contact you.
            </Form.Text>
          </Form.Group>

          <Alert variant="warning">
            <h6>What Happens Next:</h6>
            <ul className="mb-0 small">
              <li>Your request will be reviewed by our welfare coordinator within 24 hours</li>
              <li>You'll be contacted to discuss your needs and available assistance</li>
              <li>All information is kept strictly confidential</li>
              <li>We'll work with you to develop an appropriate support plan</li>
              <li>Follow-up support and check-ins will be provided as needed</li>
            </ul>
          </Alert>

          <div className="d-grid">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
            >
              {loading ? 'Submitting...' : 'Submit Welfare Request'}
            </Button>
          </div>
        </Form>

        <div className="mt-4 pt-3 border-top">
          <h6>Emergency Contacts</h6>
          <p className="small text-muted mb-1">
            <strong>Immediate Emergency:</strong> Call 911 or local emergency services
          </p>
          <p className="small text-muted mb-1">
            <strong>Pastoral Emergency:</strong> +234 XXX XXX XXXX (24/7)
          </p>
          <p className="small text-muted mb-0">
            <strong>Welfare Coordinator:</strong> welfare@buccf.org
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WelfareRequestForm;

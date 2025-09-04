import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { EngagementService } from '../../services/engagementService';
import type { PrayerRequest } from '../../types';

interface PrayerRequestFormProps {
  onSubmitSuccess?: (requestId: string) => void;
}

const PrayerRequestForm: React.FC<PrayerRequestFormProps> = ({ onSubmitSuccess }) => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    isAnonymous: false,
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const engagementService = EngagementService.getInstance();

  const categories = [
    'general',
    'health',
    'family',
    'finances',
    'relationships',
    'career',
    'spiritual',
    'community',
    'other'
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
      setError('Please log in to submit a prayer request');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestData: Omit<PrayerRequest, 'id'> = {
        userId: currentUser.uid,
        userName: formData.isAnonymous ? 'Anonymous' : (userProfile.displayName || userProfile.fullName || 'Unknown User'),
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        isAnonymous: formData.isAnonymous,
        isPublic: formData.isPublic,
        createdAt: new Date().toISOString()
      };

      const requestId = await engagementService.createPrayerRequest(requestData);
      
      setSuccess('Your prayer request has been submitted successfully. Our prayer team will be praying for you!');
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'general',
        isAnonymous: false,
        isPublic: true
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(requestId);
      }

    } catch (error) {
      setError('Failed to submit prayer request. Please try again.');
      console.error('Error submitting prayer request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h4 className="mb-0">Submit a Prayer Request</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Prayer Request Title *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title for your prayer request"
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={loading}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prayer Request Details *</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Please share your prayer request in detail. Our prayer team will keep this confidential."
              required
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Share as much or as little as you're comfortable with. All requests are treated with care and confidentiality.
            </Form.Text>
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  label="Submit anonymously"
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Your name will not be shown with this request
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  label="Allow others to pray for this request"
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Other members can see and pray for this request
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Alert variant="info">
            <h6>How Prayer Requests Work:</h6>
            <ul className="mb-0 small">
              <li>All requests are reviewed by our pastoral team</li>
              <li>Private requests are only seen by designated prayer team members</li>
              <li>Public requests may be shared in prayer meetings (with your permission)</li>
              <li>You'll be notified when your request is being prayed for</li>
              <li>You can update us on answered prayers anytime</li>
            </ul>
          </Alert>

          <div className="d-grid">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
            >
              {loading ? 'Submitting...' : 'Submit Prayer Request'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PrayerRequestForm;

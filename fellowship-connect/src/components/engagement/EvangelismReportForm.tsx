import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { EngagementService } from '../../services/engagementService';
import type { EvangelismReport } from '../../types';

interface EvangelismReportFormProps {
  onSubmitSuccess?: (reportId: string) => void;
}

const EvangelismReportForm: React.FC<EvangelismReportFormProps> = ({ onSubmitSuccess }) => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    peopleReached: '',
    conversions: '',
    followUpRequired: false,
    followUpNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const engagementService = EngagementService.getInstance();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setError('Please log in to submit an evangelism report');
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
      const reportData: Omit<EvangelismReport, 'id'> = {
        userId: currentUser.uid,
        userName: userProfile.displayName || userProfile.fullName || 'Unknown User',
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        date: formData.date,
        peopleReached: formData.peopleReached ? parseInt(formData.peopleReached) : undefined,
        conversions: formData.conversions ? parseInt(formData.conversions) : undefined,
        followUpRequired: formData.followUpRequired,
        followUpNotes: formData.followUpNotes.trim(),
        status: 'pending',
        featured: false,
        createdAt: new Date().toISOString()
      };

      const reportId = await engagementService.createEvangelismReport(reportData);
      
      setSuccess('Your evangelism report has been submitted successfully! It will be reviewed and may be featured on our evangelism wall.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        peopleReached: '',
        conversions: '',
        followUpRequired: false,
        followUpNotes: ''
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(reportId);
      }

    } catch (error) {
      setError('Failed to submit evangelism report. Please try again.');
      console.error('Error submitting evangelism report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h4 className="mb-0">Submit Evangelism Report</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Alert variant="info">
          <h6>Share Your Evangelism Experience</h6>
          <p className="mb-0 small">
            Help inspire others by sharing your evangelism activities! Your reports may be featured 
            to encourage and motivate other members in their outreach efforts.
          </p>
        </Alert>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Activity Title *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title describing your evangelism activity"
              required
              disabled={loading}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Where did this take place?"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Activity Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your evangelism activity in detail. What did you do? How did it go? What were the highlights? Any challenges faced?"
              required
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Share your experience, methods used, and any meaningful interactions or outcomes.
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>People Reached (Approximate)</Form.Label>
                <Form.Control
                  type="number"
                  name="peopleReached"
                  value={formData.peopleReached}
                  onChange={handleInputChange}
                  placeholder="Number of people you shared with"
                  min="0"
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Approximate number of people you interacted with
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Conversions/Decisions</Form.Label>
                <Form.Control
                  type="number"
                  name="conversions"
                  value={formData.conversions}
                  onChange={handleInputChange}
                  placeholder="Number who made decisions"
                  min="0"
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  People who made decisions for Christ or showed serious interest
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="followUpRequired"
              checked={formData.followUpRequired}
              onChange={handleInputChange}
              label="Follow-up required"
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Check if there are people who need follow-up contact or discipleship
            </Form.Text>
          </Form.Group>

          {formData.followUpRequired && (
            <Form.Group className="mb-3">
              <Form.Label>Follow-up Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="followUpNotes"
                value={formData.followUpNotes}
                onChange={handleInputChange}
                placeholder="Provide details about follow-up needs, contact information, or specific prayer requests for individuals"
                disabled={loading}
              />
              <Form.Text className="text-muted">
                This information will be shared with our discipleship team for appropriate follow-up.
              </Form.Text>
            </Form.Group>
          )}

          <Alert variant="success">
            <h6>Impact & Encouragement</h6>
            <ul className="mb-0 small">
              <li>Your reports help track our collective evangelism impact</li>
              <li>Inspiring stories may be shared (with your permission) to encourage others</li>
              <li>Follow-up information helps our discipleship team connect with new contacts</li>
              <li>All reports are reviewed by ministry leaders for accuracy and appropriateness</li>
            </ul>
          </Alert>

          <div className="d-grid">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
            >
              {loading ? 'Submitting...' : 'Submit Evangelism Report'}
            </Button>
          </div>
        </Form>

        <div className="mt-4 pt-3 border-top">
          <h6>Evangelism Resources</h6>
          <p className="small text-muted mb-1">
            <strong>Training Materials:</strong> Access evangelism training resources in our Resource Library
          </p>
          <p className="small text-muted mb-1">
            <strong>Evangelism Coordinator:</strong> evangelism@buccf.org
          </p>
          <p className="small text-muted mb-0">
            <strong>Need Support?</strong> Contact our evangelism team for guidance, training, or partnership opportunities
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EvangelismReportForm;

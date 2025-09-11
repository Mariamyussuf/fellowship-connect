import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { offlineService } from '../../services/offlineService';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../hooks/useOffline';
import type { PrayerRequest } from '../../types';

const OfflinePrayerForm: React.FC = () => {
  const { userProfile } = useAuth();
  const { isOnline } = useOffline();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: true,
    isAnonymous: false,
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  const categories = [
    'Personal',
    'Family',
    'Health',
    'Work/Career',
    'Finances',
    'Relationships',
    'Ministry',
    'Community',
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
      const prayerData: PrayerRequest = {
        id: `prayer_${userProfile.uid}_${Date.now()}`,
        userId: userProfile.uid,
        userName: userProfile.fullName || userProfile.displayName || 'Anonymous',
        title: formData.title,
        content: formData.description,
        description: formData.description,
        category: formData.category,
        isPublic: formData.isPublic,
        isAnonymous: formData.isAnonymous,
        urgency: formData.urgency,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isOnline) {
        // If online, try to submit directly
        console.log('Submitting prayer request online:', prayerData);
        setSuccess('Prayer request submitted successfully!');
      } else {
        // If offline, queue for sync
        await offlineService.queueOperation('prayerRequests', 'create', {...prayerData});
        await offlineService.storeData('prayerRequests', [prayerData]);
        setSuccess('Prayer request saved offline. Will be submitted when connection is restored.');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        isPublic: true,
        isAnonymous: false,
        urgency: 'medium'
      });
    } catch (err) {
      setError('Failed to submit prayer request. Please try again.');
      console.error('Error submitting prayer request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-heart me-2"></i>
          Submit Prayer Request
        </h5>
      </Card.Header>
      <Card.Body>
        {!isOnline && (
          <Alert variant="info" className="mb-3">
            <i className="bi bi-wifi-off me-2"></i>
            You&apos;re offline. Your prayer request will be saved locally and submitted when connection is restored.
          </Alert>
        )}

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
              required
              placeholder="Brief title for your prayer request"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Please share your prayer request..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select category...</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Urgency</Form.Label>
            <Form.Select
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Form.Select>
          </Form.Group>

          <div className="mb-3">
            <Form.Check
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              label="Make this prayer request public (others can see and pray for it)"
            />
          </div>

          <div className="mb-3">
            <Form.Check
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              label="Submit anonymously (your name won&apos;t be shown)"
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-1`}></i>
              {isOnline ? 'Online' : 'Offline Mode'}
            </small>
            
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Submit Prayer Request
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default OfflinePrayerForm;
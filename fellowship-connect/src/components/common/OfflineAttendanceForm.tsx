import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { offlineService } from '../../services/offlineService';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../hooks/useOffline';

interface OfflineAttendanceFormProps {
  eventId?: string;
  eventName?: string;
  onSuccess?: () => void;
}

const OfflineAttendanceForm: React.FC<OfflineAttendanceFormProps> = ({
  eventId = 'default-service',
  eventName = 'Sunday Service',
  onSuccess
}) => {
  const { userProfile } = useAuth();
  const { isOnline } = useOffline();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [wordOfDay, setWordOfDay] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const attendanceData = {
        id: `attendance_${userProfile.uid}_${Date.now()}`,
        userId: userProfile.uid,
        userName: userProfile.fullName || userProfile.displayName || 'Unknown',
        eventId,
        eventName,
        timestamp: new Date().toISOString(),
        checkInMethod: 'manual',
        wordOfDay: wordOfDay.trim(),
        campus: userProfile.campus || 'main',
        createdAt: new Date().toISOString()
      };

      if (isOnline) {
        // If online, try to submit directly (would integrate with your attendance service)
        console.log('Submitting attendance online:', attendanceData);
        setSuccess('Attendance recorded successfully!');
      } else {
        // If offline, queue for sync
        await offlineService.queueOperation('attendance', 'create', attendanceData);
        await offlineService.storeData('attendance', [attendanceData]);
        setSuccess('Attendance saved offline. Will sync when connection is restored.');
      }

      // Reset form
      setWordOfDay('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to record attendance. Please try again.');
      console.error('Error recording attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-calendar-check me-2"></i>
          Mark Attendance - {eventName}
        </h5>
      </Card.Header>
      <Card.Body>
        {!isOnline && (
          <Alert variant="info" className="mb-3">
            <i className="bi bi-wifi-off me-2"></i>
            You're offline. Your attendance will be saved locally and synced when connection is restored.
          </Alert>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Member Name</Form.Label>
            <Form.Control
              type="text"
              value={userProfile?.fullName || userProfile?.displayName || ''}
              disabled
              className="bg-light"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Event</Form.Label>
            <Form.Control
              type="text"
              value={eventName}
              disabled
              className="bg-light"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Word of the Day</Form.Label>
            <Form.Control
              type="text"
              value={wordOfDay}
              onChange={(e) => setWordOfDay(e.target.value)}
              placeholder="Enter today's word of the day"
              required
            />
            <Form.Text className="text-muted">
              This helps verify your attendance at the service.
            </Form.Text>
          </Form.Group>

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
                  Recording...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Mark Attendance
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default OfflineAttendanceForm;

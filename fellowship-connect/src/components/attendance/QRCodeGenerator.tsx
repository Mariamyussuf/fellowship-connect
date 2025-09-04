import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { AttendanceService } from '../../services/attendanceService';
import type { QRCodeSession } from '../../types';

interface QRCodeGeneratorProps {
  onSessionCreated?: (session: QRCodeSession) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ onSessionCreated }) => {
  const { userProfile } = useAuth();
  const [eventName, setEventName] = useState('Sunday Service');
  const [eventType, setEventType] = useState<'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other'>('weekly');
  const [duration, setDuration] = useState(180); // 3 hours
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<QRCodeSession | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const attendanceService = AttendanceService.getInstance();

  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const activeSession = await attendanceService.getActiveQRCodeSession();
      if (activeSession) {
        setCurrentSession(activeSession);
        generateQRCodeImage(activeSession.qrCodeData);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const generateQRCodeImage = async (qrData: string) => {
    try {
      // For now, we'll create a simple data URL representation
      // In production, you'd use a proper QR code library
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 200;
      
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', 100, 100);
        ctx.fillText('(Scan with app)', 100, 120);
        ctx.fillText(`Data: ${qrData.substring(0, 20)}...`, 100, 140);
        
        setQrCodeDataUrl(canvas.toDataURL());
      }
    } catch (error) {
      console.error('Error generating QR code image:', error);
    }
  };

  const handleGenerateQRCode = async () => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const session = await attendanceService.createQRCodeSession(
        eventName,
        eventType,
        userProfile.uid,
        undefined,
        duration
      );

      setCurrentSession(session);
      generateQRCodeImage(session.qrCodeData);
      setSuccess('QR Code generated successfully!');
      
      if (onSessionCreated) {
        onSessionCreated(session);
      }

    } catch (error) {
      setError('Failed to generate QR code. Please try again.');
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateSession = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      await attendanceService.deactivateQRCodeSession(currentSession.id!);
      setCurrentSession(null);
      setQrCodeDataUrl(null);
      setSuccess('QR Code session deactivated.');
    } catch (error) {
      setError('Failed to deactivate session.');
    } finally {
      setLoading(false);
    }
  };

  const formatExpiryTime = (expiresAt: string) => {
    const date = new Date(expiresAt);
    return date.toLocaleString();
  };

  const getCurrentWordOfTheDay = () => {
    return attendanceService.getCurrentWordOfTheDay();
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">QR Code Generator</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {currentSession ? (
          <div>
            <div className="text-center mb-4">
              <h6>Active QR Code Session</h6>
              <div className="mb-3">
                {qrCodeDataUrl && (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="border"
                    style={{ maxWidth: '200px' }}
                  />
                )}
              </div>
              
              <div className="mb-3">
                <strong>Event:</strong> {currentSession.eventName}<br />
                <strong>Type:</strong> {currentSession.eventType}<br />
                <strong>Word of the Day:</strong> <span className="badge bg-primary">{currentSession.wordOfTheDay}</span><br />
                <strong>Expires:</strong> {formatExpiryTime(currentSession.expiresAt)}<br />
                <strong>Attendance Count:</strong> {currentSession.attendanceCount || 0}
              </div>

              <Button 
                variant="danger" 
                onClick={handleDeactivateSession}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Deactivate Session'}
              </Button>
            </div>
          </div>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Type</Form.Label>
              <Form.Select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
              >
                <option value="weekly">Weekly Service</option>
                <option value="special">Special Event</option>
                <option value="retreat">Retreat</option>
                <option value="holiday">Holiday Service</option>
                <option value="outreach">Outreach</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duration (minutes)</Form.Label>
              <Form.Control
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min="30"
                max="720"
              />
              <Form.Text className="text-muted">
                How long should this QR code remain active?
              </Form.Text>
            </Form.Group>

            <div className="mb-3">
              <Alert variant="info">
                <strong>Today's Word of the Day:</strong> <span className="badge bg-primary">{getCurrentWordOfTheDay()}</span>
                <br />
                <small>Members will need to enter this word when scanning the QR code.</small>
              </Alert>
            </div>

            <Button 
              variant="primary" 
              onClick={handleGenerateQRCode}
              disabled={loading || !eventName.trim()}
              className="w-100"
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Generate QR Code'}
            </Button>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default QRCodeGenerator;

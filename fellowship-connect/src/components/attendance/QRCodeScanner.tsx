import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Form, Alert, Modal, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { AttendanceService } from '../../services/attendanceService';
import type { VisitorInfo } from '../../types';

interface QRCodeScannerProps {
  onCheckInSuccess?: (attendanceId: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onCheckInSuccess }) => {
  const { currentUser, userProfile } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState('');
  const [wordOfTheDay, setWordOfTheDay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [isVisitorCheckIn, setIsVisitorCheckIn] = useState(false);
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo>({
    fullName: '',
    phoneNumber: '',
    email: '',
    invitedBy: '',
    isFirstTime: true
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const attendanceService = AttendanceService.getInstance();

  useEffect(() => {
    // Get current word of the day
    const currentWord = attendanceService.getCurrentWordOfTheDay();
    setWordOfTheDay(currentWord);
  }, []);

  const startCamera = async () => {
    try {
      setScanning(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      setError('Unable to access camera. Please check permissions or use manual entry.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // In a real implementation, you would use a QR code detection library here
    // For now, we'll simulate QR code detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log('Image data captured for QR detection:', imageData.data.length);

    // Simulate QR code detection (replace with actual QR code library)
    // This is just a placeholder
    setTimeout(() => {
      // Simulate finding a QR code
      const simulatedQRData = 'FC-ATTEND:eyJzZXNzaW9uSWQiOiJzaW11bGF0ZWQiLCJldmVudE5hbWUiOiJTdW5kYXkgU2VydmljZSIsImV2ZW50VHlwZSI6IndlZWtseSIsIndvcmRPZlRoZURheSI6IkZBSVRIIiwidG9rZW4iOiJhYmMxMjMiLCJ0aW1lc3RhbXAiOiIyMDI0LTEyLTI5VDIxOjUwOjAwLjAwMFoiLCJleHBpcmVzQXQiOiIyMDI0LTEyLTMwVDAzOjUwOjAwLjAwMFoifQ==';
      handleQRCodeDetected(simulatedQRData);
    }, 2000);
  };

  const handleQRCodeDetected = (qrData: string) => {
    stopCamera();
    processQRCode(qrData);
  };

  const handleManualEntry = () => {
    if (!manualEntry.trim()) {
      setError('Please enter QR code data');
      return;
    }
    processQRCode(manualEntry);
  };

  const processQRCode = async (qrData: string) => {
    if (!currentUser || !userProfile) {
      setError('Please log in to check in');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Extract QR data if it has the FC-ATTEND prefix
      let cleanQRData = qrData;
      if (qrData.startsWith('FC-ATTEND:')) {
        cleanQRData = qrData.replace('FC-ATTEND:', '');
      }

      const result = await attendanceService.checkInWithQRCode(
        cleanQRData,
        currentUser.uid,
        userProfile.displayName || userProfile.fullName || 'Unknown User',
        isVisitorCheckIn,
        isVisitorCheckIn ? visitorInfo : undefined
      );

      if (result.success) {
        setSuccess(result.message);
        setManualEntry('');
        
        if (onCheckInSuccess && result.attendanceId) {
          onCheckInSuccess(result.attendanceId);
        }

        // Reset visitor info
        if (isVisitorCheckIn) {
          setIsVisitorCheckIn(false);
          setShowVisitorModal(false);
          setVisitorInfo({
            fullName: '',
            phoneNumber: '',
            email: '',
            invitedBy: '',
            isFirstTime: true
          });
        }
      } else {
        setError(result.message);
      }

    } catch (error) {
      setError('Failed to process check-in. Please try again.');
      console.error('Error processing QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorCheckIn = () => {
    setIsVisitorCheckIn(true);
    setShowVisitorModal(true);
  };

  const handleVisitorInfoSubmit = () => {
    if (!visitorInfo.fullName.trim()) {
      setError('Visitor name is required');
      return;
    }
    setShowVisitorModal(false);
    // The actual check-in will happen when QR code is processed
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Check In</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <div className="mb-3">
            <Alert variant="info">
              <strong>Today's Word of the Day:</strong> <span className="badge bg-primary">{wordOfTheDay}</span>
              <br />
              <small>You'll need to confirm this word when scanning the QR code.</small>
            </Alert>
          </div>

          {scanning ? (
            <div className="text-center mb-3">
              <video
                ref={videoRef}
                style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
                className="border rounded"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="mt-3">
                <Button variant="primary" onClick={captureFrame} className="me-2">
                  Capture QR Code
                </Button>
                <Button variant="secondary" onClick={stopCamera}>
                  Stop Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center mb-3">
              <Button 
                variant="primary" 
                onClick={startCamera}
                disabled={loading}
                className="mb-3"
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Start Camera Scanner'}
              </Button>
            </div>
          )}

          <hr />

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Manual QR Code Entry</Form.Label>
              <Form.Control
                type="text"
                value={manualEntry}
                onChange={(e) => setManualEntry(e.target.value)}
                placeholder="Paste QR code data here"
                disabled={loading}
              />
              <Form.Text className="text-muted">
                If camera doesn't work, you can manually enter the QR code data.
              </Form.Text>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                variant="success" 
                onClick={handleManualEntry}
                disabled={loading || !manualEntry.trim()}
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Check In'}
              </Button>

              <Button 
                variant="outline-primary" 
                onClick={handleVisitorCheckIn}
                disabled={loading}
              >
                Check In as Visitor
              </Button>
            </div>
          </Form>

          {isVisitorCheckIn && (
            <Alert variant="warning" className="mt-3">
              <strong>Visitor Mode Active</strong><br />
              You are checking in as a visitor. Please fill in your information when prompted.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Visitor Information Modal */}
      <Modal show={showVisitorModal} onHide={() => setShowVisitorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Visitor Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                value={visitorInfo.fullName}
                onChange={(e) => setVisitorInfo({...visitorInfo, fullName: e.target.value})}
                placeholder="Enter your full name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={visitorInfo.phoneNumber}
                onChange={(e) => setVisitorInfo({...visitorInfo, phoneNumber: e.target.value})}
                placeholder="Enter your phone number"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={visitorInfo.email}
                onChange={(e) => setVisitorInfo({...visitorInfo, email: e.target.value})}
                placeholder="Enter your email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Invited By</Form.Label>
              <Form.Control
                type="text"
                value={visitorInfo.invitedBy}
                onChange={(e) => setVisitorInfo({...visitorInfo, invitedBy: e.target.value})}
                placeholder="Who invited you?"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                checked={visitorInfo.isFirstTime}
                onChange={(e) => setVisitorInfo({...visitorInfo, isFirstTime: e.target.checked})}
                label="This is my first time visiting"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVisitorModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleVisitorInfoSubmit}>
            Continue Check-In
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QRCodeScanner;

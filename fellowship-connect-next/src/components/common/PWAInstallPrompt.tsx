import React, { useState } from 'react';
import { Alert, Button, Modal, Card } from 'react-bootstrap';
import { usePWA } from '../../hooks/usePWA';

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installApp, updateAvailable, updateApp } = usePWA();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowInstallModal(false);
    }
  };

  const handleUpdate = () => {
    updateApp();
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || dismissed || !isInstallable) {
    return null;
  }

  // Check if previously dismissed
  if (localStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      <Alert variant="info" className="mb-0 rounded-0 border-0">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <i className="bi bi-download me-2"></i>
            <span>Install Fellowship Connect for a better experience!</span>
          </div>
          <div>
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="me-2"
              onClick={() => setShowInstallModal(true)}
            >
              Install
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleDismiss}
            >
              ×
            </Button>
          </div>
        </div>
      </Alert>

      {/* Update Available Banner */}
      {updateAvailable && (
        <Alert variant="warning" className="mb-0 rounded-0 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="bi bi-arrow-clockwise me-2"></i>
              <span>A new version is available!</span>
            </div>
            <Button 
              variant="outline-warning" 
              size="sm"
              onClick={handleUpdate}
            >
              Update
            </Button>
          </div>
        </Alert>
      )}

      {/* Install Modal */}
      <Modal show={showInstallModal} onHide={() => setShowInstallModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-phone me-2"></i>
            Install Fellowship Connect
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="mb-3">
              <i className="bi bi-app display-1 text-primary"></i>
            </div>
            <h5>Get the full app experience</h5>
            <p className="text-muted">
              Install Fellowship Connect on your device for faster access and offline capabilities.
            </p>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <i className="bi bi-lightning-charge text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                  <h6>Faster Loading</h6>
                  <small className="text-muted">Instant access without browser overhead</small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-6 mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <i className="bi bi-wifi-off text-info mb-2" style={{ fontSize: '2rem' }}></i>
                  <h6>Offline Access</h6>
                  <small className="text-muted">Works even without internet connection</small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-6 mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <i className="bi bi-bell text-success mb-2" style={{ fontSize: '2rem' }}></i>
                  <h6>Push Notifications</h6>
                  <small className="text-muted">Stay updated with church activities</small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-6 mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <i className="bi bi-house text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                  <h6>Home Screen</h6>
                  <small className="text-muted">Quick access from your device</small>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInstallModal(false)}>
            Not Now
          </Button>
          <Button variant="primary" onClick={handleInstall}>
            <i className="bi bi-download me-2"></i>
            Install App
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PWAInstallPrompt;

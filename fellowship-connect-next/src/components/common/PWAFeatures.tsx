import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { usePWA } from '../../hooks/usePWA';

const PWAFeatures: React.FC = () => {
  const { 
    isInstalled, 
    isOnline, 
    shareContent, 
    requestNotificationPermission,
    subscribeToPushNotifications 
  } = usePWA();

  const handleShare = async () => {
    const success = await shareContent({
      title: 'Fellowship Connect',
      text: 'Join our church community with Fellowship Connect!',
      url: window.location.origin
    });
    
    if (!success) {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  const handleNotificationSetup = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        // Send subscription to your server
        console.log('Push subscription:', subscription);
        alert('Notifications enabled successfully!');
      }
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-phone me-2"></i>
          App Features
        </h5>
      </Card.Header>
      <Card.Body>
        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <i className={`bi ${isInstalled ? 'bi-check-circle text-success' : 'bi-circle text-muted'} me-2`}></i>
              <span>Installed as App</span>
              {isInstalled && <Badge bg="success" className="ms-2">Active</Badge>}
            </div>
          </div>
          
          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <i className={`bi ${isOnline ? 'bi-wifi text-success' : 'bi-wifi-off text-warning'} me-2`}></i>
              <span>Connection Status</span>
              <Badge bg={isOnline ? 'success' : 'warning'} className="ms-2">
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
          
          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-database text-info me-2"></i>
              <span>Offline Storage</span>
              <Badge bg="info" className="ms-2">Ready</Badge>
            </div>
          </div>
          
          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-arrow-repeat text-primary me-2"></i>
              <span>Background Sync</span>
              <Badge bg="primary" className="ms-2">Active</Badge>
            </div>
          </div>
        </div>

        <hr />

        <div className="d-flex gap-2 flex-wrap">
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleShare}
          >
            <i className="bi bi-share me-1"></i>
            Share App
          </Button>
          
          <Button 
            variant="outline-success" 
            size="sm"
            onClick={handleNotificationSetup}
          >
            <i className="bi bi-bell me-1"></i>
            Enable Notifications
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PWAFeatures;

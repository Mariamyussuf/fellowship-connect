import React from 'react';
import { Alert, Badge, Button, Modal, ProgressBar } from 'react-bootstrap';
import { useOffline } from '../../hooks/useOffline';

interface OfflineIndicatorProps {
  showDetails?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ showDetails = false }) => {
  const { isOnline, lastSyncTime, storageUsage, clearOfflineData } = useOffline();
  const [showModal, setShowModal] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

  const formatLastSync = (timestamp: number): string => {
    if (timestamp === 0) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const handleClearData = async () => {
    setClearing(true);
    try {
      await clearOfflineData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    } finally {
      setClearing(false);
    }
  };

  if (!showDetails && isOnline) {
    return null; // Don't show anything when online and not showing details
  }

  return (
    <>
      <div className="d-flex align-items-center">
        <Badge 
          bg={isOnline ? 'success' : 'warning'} 
          className="me-2"
        >
          <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-1`}></i>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
        
        {showDetails && (
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-info-circle me-1"></i>
            Details
          </Button>
        )}
      </div>

      {!isOnline && (
        <Alert variant="warning" className="mt-2 mb-0">
          <i className="bi bi-exclamation-triangle me-2"></i>
          You&#39;re currently offline. Your data will be saved locally and synced when connection is restored.
        </Alert>
      )}

      {/* Offline Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-database me-2"></i>
            Offline Storage Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center">
                  <i className={`bi ${isOnline ? 'bi-wifi text-success' : 'bi-wifi-off text-warning'} display-4`}></i>
                  <h5 className="mt-2">{isOnline ? 'Online' : 'Offline'}</h5>
                  <p className="text-muted mb-0">
                    {isOnline ? 'Connected to server' : 'Working offline'}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center">
                  <i className="bi bi-clock-history display-4 text-info"></i>
                  <h5 className="mt-2">Last Sync</h5>
                  <p className="text-muted mb-0">
                    {formatLastSync(lastSyncTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h6>Storage Usage</h6>
            <div className="d-flex justify-content-between mb-2">
              <span>Used: {storageUsage.usedFormatted}</span>
              <span>Available: {storageUsage.quotaFormatted}</span>
            </div>
            <ProgressBar 
              now={storageUsage.percentage} 
              variant={storageUsage.percentage > 80 ? 'danger' : storageUsage.percentage > 60 ? 'warning' : 'success'}
            />
            <small className="text-muted">
              {storageUsage.percentage.toFixed(1)}% of available storage used
            </small>
          </div>

          <div className="mb-4">
            <h6>Offline Features</h6>
            <ul className="list-unstyled">
              <li><i className="bi bi-check-circle text-success me-2"></i>View cached content</li>
              <li><i className="bi bi-check-circle text-success me-2"></i>Submit forms (synced when online)</li>
              <li><i className="bi bi-check-circle text-success me-2"></i>Mark attendance (synced when online)</li>
              <li><i className="bi bi-check-circle text-success me-2"></i>Browse testimonies and resources</li>
              <li><i className="bi bi-x-circle text-danger me-2"></i>Real-time updates</li>
              <li><i className="bi bi-x-circle text-danger me-2"></i>Live streaming</li>
            </ul>
          </div>

          {storageUsage.percentage > 80 && (
            <Alert variant="warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Storage is getting full. Consider clearing offline data to free up space.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-danger" 
            onClick={handleClearData}
            disabled={clearing}
          >
            {clearing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Clearing...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Clear Offline Data
              </>
            )}
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OfflineIndicator;

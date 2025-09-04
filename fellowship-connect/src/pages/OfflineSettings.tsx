import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, ProgressBar, Table } from 'react-bootstrap';
import { useOffline } from '../hooks/useOffline';
import OfflineIndicator from '../components/common/OfflineIndicator';
import OfflineAttendanceForm from '../components/common/OfflineAttendanceForm';
import OfflinePrayerForm from '../components/common/OfflinePrayerForm';
import PWAFeatures from '../components/common/PWAFeatures';

const OfflineSettings: React.FC = () => {
  const { lastSyncTime, storageUsage, clearOfflineData } = useOffline();
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showTestForms, setShowTestForms] = useState(false);

  const formatLastSync = (timestamp: number): string => {
    if (timestamp === 0) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const handleClearData = async () => {
    setClearing(true);
    try {
      await clearOfflineData();
      setShowClearModal(false);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    } finally {
      setClearing(false);
    }
  };

  const getStorageColor = (percentage: number) => {
    if (percentage > 80) return 'danger';
    if (percentage > 60) return 'warning';
    return 'success';
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-database me-2"></i>
            Offline Settings & Storage
          </h2>
          <p className="text-muted">Manage offline data and sync settings</p>
        </Col>
      </Row>

      {/* Connection Status */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">Connection Status</h5>
                  <OfflineIndicator showDetails={true} />
                </div>
                <div className="text-end">
                  <div className="text-muted small">Last Sync</div>
                  <div>{formatLastSync(lastSyncTime)}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* PWA Features */}
      <Row className="mb-4">
        <Col>
          <PWAFeatures />
        </Col>
      </Row>

      {/* Storage Usage */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Storage Usage</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Used: {storageUsage.usedFormatted}</span>
                  <span>Available: {storageUsage.quotaFormatted}</span>
                </div>
                <ProgressBar 
                  now={storageUsage.percentage} 
                  variant={getStorageColor(storageUsage.percentage)}
                  style={{ height: '10px' }}
                />
                <small className="text-muted">
                  {storageUsage.percentage.toFixed(1)}% of available storage used
                </small>
              </div>

              {storageUsage.percentage > 80 && (
                <Alert variant="warning" className="mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Storage is getting full. Consider clearing offline data to free up space.
                </Alert>
              )}

              <Button 
                variant="outline-danger" 
                onClick={() => setShowClearModal(true)}
                className="me-2"
              >
                <i className="bi bi-trash me-2"></i>
                Clear Offline Data
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Offline Features</h5>
            </Card.Header>
            <Card.Body>
              <Table size="sm" className="mb-0">
                <tbody>
                  <tr>
                    <td><i className="bi bi-check-circle text-success me-2"></i>View Content</td>
                  </tr>
                  <tr>
                    <td><i className="bi bi-check-circle text-success me-2"></i>Submit Forms</td>
                  </tr>
                  <tr>
                    <td><i className="bi bi-check-circle text-success me-2"></i>Mark Attendance</td>
                  </tr>
                  <tr>
                    <td><i className="bi bi-check-circle text-success me-2"></i>Prayer Requests</td>
                  </tr>
                  <tr>
                    <td><i className="bi bi-x-circle text-danger me-2"></i>Live Updates</td>
                  </tr>
                  <tr>
                    <td><i className="bi bi-x-circle text-danger me-2"></i>Live Streaming</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Offline Forms Demo */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Test Offline Forms</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowTestForms(!showTestForms)}
              >
                {showTestForms ? 'Hide' : 'Show'} Forms
              </Button>
            </Card.Header>
            {showTestForms && (
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <OfflineAttendanceForm />
                  </Col>
                  <Col md={6} className="mb-3">
                    <OfflinePrayerForm />
                  </Col>
                </Row>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>

      {/* How It Works */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">How Offline Mode Works</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center mb-3">
                    <i className="bi bi-download display-4 text-primary"></i>
                    <h6 className="mt-2">Data Caching</h6>
                    <p className="text-muted small">
                      Important data is automatically cached locally using IndexedDB for offline access.
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center mb-3">
                    <i className="bi bi-clock-history display-4 text-warning"></i>
                    <h6 className="mt-2">Queue & Sync</h6>
                    <p className="text-muted small">
                      Actions performed offline are queued and automatically synced when connection returns.
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center mb-3">
                    <i className="bi bi-shield-check display-4 text-success"></i>
                    <h6 className="mt-2">Data Safety</h6>
                    <p className="text-muted small">
                      Your data is safely stored locally and protected from loss during network outages.
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Clear Data Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Clear Offline Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            This will permanently delete all offline data including cached content and pending sync items.
          </Alert>
          <p>Are you sure you want to clear all offline data? This action cannot be undone.</p>
          <ul className="text-muted">
            <li>Cached testimonies and content</li>
            <li>Offline form submissions waiting to sync</li>
            <li>Stored attendance records</li>
            <li>Prayer requests and other engagement data</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
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
                Clear Data
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OfflineSettings;

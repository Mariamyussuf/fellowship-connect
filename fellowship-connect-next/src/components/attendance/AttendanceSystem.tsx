import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import QRCodeGenerator from './QRCodeGenerator';
import QRCodeScanner from './QRCodeScanner';
import AttendanceHistory from './AttendanceHistory';
import { AttendanceService } from '../../services/attendanceService';
import type { AttendanceRecord, QRCodeSession } from '../../types';

const AttendanceSystem: React.FC = () => {
  const { userProfile, isAdmin } = useAuth();
  const [activeKey, setActiveKey] = useState('checkin');
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [currentSession, setCurrentSession] = useState<QRCodeSession | null>(null);
  const [loading, setLoading] = useState(true);

  const attendanceService = AttendanceService.getInstance();

  const loadTodayAttendance = useCallback(async () => {
    try {
      const attendance = await attendanceService.getTodayAttendance();
      setTodayAttendance(attendance);
    } catch (err) {
      console.error('Error loading today\'s attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [attendanceService]);

  const checkActiveSession = useCallback(async () => {
    try {
      const session = await attendanceService.getActiveQRCodeSession();
      setCurrentSession(session);
    } catch (err) {
      console.error('Error checking active session:', err);
    }
  }, [attendanceService]);

  useEffect(() => {
    loadTodayAttendance();
    checkActiveSession();
  }, [checkActiveSession, loadTodayAttendance]);

  const handleSessionCreated = (session: QRCodeSession) => {
    setCurrentSession(session);
    loadTodayAttendance();
  };

  const handleCheckInSuccess = (_attendanceId: string) => {
    loadTodayAttendance();
    // Optionally switch to attendance tab to show the new record
    setActiveKey('attendance');
  };

  const getTodayStats = () => {
    const members = todayAttendance.filter(record => !record.isVisitor).length;
    const visitors = todayAttendance.filter(record => record.isVisitor).length;
    const total = todayAttendance.length;

    return { members, visitors, total };
  };

  const stats = getTodayStats();

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Attendance System</h2>
          <p className="text-muted">QR Code based attendance tracking with word-of-the-day validation</p>
        </Col>
      </Row>

      {/* Today's Stats */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{stats.total}</h3>
              <p className="mb-0">Total Check-ins Today</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{stats.members}</h3>
              <p className="mb-0">Members</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{stats.visitors}</h3>
              <p className="mb-0">Visitors</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Current Session Status */}
      {currentSession && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Active Session:</strong> {currentSession.eventName}
                  <Badge bg="primary" className="ms-2">{currentSession.wordOfTheDay}</Badge>
                </div>
                <div>
                  <small>Expires: {new Date(currentSession.expiresAt).toLocaleString()}</small>
                </div>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      <Tabs
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k || 'checkin')}
        className="mb-3"
      >
        <Tab eventKey="checkin" title="Check In">
          <Row>
            <Col lg={8} className="mx-auto">
              <QRCodeScanner onCheckInSuccess={handleCheckInSuccess} />
            </Col>
          </Row>
        </Tab>

        {isAdmin && (
          <Tab eventKey="generate" title="Generate QR Code">
            <Row>
              <Col lg={8} className="mx-auto">
                <QRCodeGenerator onSessionCreated={handleSessionCreated} />
              </Col>
            </Row>
          </Tab>
        )}

        <Tab eventKey="attendance" title={`Today's Attendance (${stats.total})`}>
          <AttendanceHistory 
            attendanceRecords={todayAttendance}
            loading={loading}
            showDateFilter={false}
            title="Today's Attendance"
          />
        </Tab>

        <Tab eventKey="history" title="My History">
          <AttendanceHistory 
            userId={userProfile?.uid}
            showDateFilter={true}
            title="My Attendance History"
          />
        </Tab>

        {isAdmin && (
          <Tab eventKey="reports" title="Reports">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Attendance Reports</h5>
              </Card.Header>
              <Card.Body>
                <p>Detailed attendance reports and analytics will be available here.</p>
                <div className="row">
                  <div className="col-md-6">
                    <h6>Quick Stats</h6>
                    <ul className="list-unstyled">
                      <li><strong>Today:</strong> {stats.total} check-ins</li>
                      <li><strong>Members:</strong> {stats.members}</li>
                      <li><strong>Visitors:</strong> {stats.visitors}</li>
                      <li><strong>Active Session:</strong> {currentSession ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Recent Activity</h6>
                    {todayAttendance.slice(0, 5).map((record, index) => (
                      <div key={index} className="mb-2">
                        <small>
                          <strong>{record.userName}</strong> 
                          {record.isVisitor && <Badge bg="info" className="ms-1">Visitor</Badge>}
                          <br />
                          <span className="text-muted">
                            {new Date(record.checkInTime).toLocaleTimeString()}
                          </span>
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        )}
      </Tabs>
    </Container>
  );
};

export default AttendanceSystem;

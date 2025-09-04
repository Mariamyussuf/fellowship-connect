import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { AttendanceService } from '../../services/attendanceService';
import type { AttendanceRecord } from '../../types';

interface AttendanceHistoryProps {
  userId?: string;
  attendanceRecords?: AttendanceRecord[];
  loading?: boolean;
  showDateFilter?: boolean;
  title?: string;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  userId,
  attendanceRecords,
  loading: externalLoading = false,
  showDateFilter = true,
  title = "Attendance History"
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  const attendanceService = AttendanceService.getInstance();

  useEffect(() => {
    if (attendanceRecords) {
      setRecords(attendanceRecords);
    } else if (userId) {
      loadUserAttendance();
    }
  }, [userId, attendanceRecords]);

  useEffect(() => {
    if (showDateFilter && (startDate || endDate) && userId) {
      loadUserAttendance();
    }
  }, [startDate, endDate, userId]);

  const loadUserAttendance = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const userRecords = await attendanceService.getUserAttendanceHistory(userId, 100);
      setRecords(userRecords);
    } catch (error) {
      console.error('Error loading user attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    if (eventTypeFilter && record.eventType !== eventTypeFilter) {
      return false;
    }

    if (startDate && new Date(record.checkInTime) < new Date(startDate)) {
      return false;
    }

    if (endDate && new Date(record.checkInTime) > new Date(endDate + 'T23:59:59')) {
      return false;
    }

    return true;
  });

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getEventTypeBadge = (eventType: string) => {
    const variants: Record<string, string> = {
      weekly: 'primary',
      special: 'success',
      retreat: 'warning',
      holiday: 'danger',
      outreach: 'info',
      other: 'secondary'
    };

    return (
      <Badge bg={variants[eventType] || 'secondary'}>
        {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
      </Badge>
    );
  };

  const getCheckInMethodBadge = (method: string) => {
    const variants: Record<string, string> = {
      qrcode: 'success',
      admin: 'warning',
      self: 'info',
      offline: 'secondary'
    };

    const labels: Record<string, string> = {
      qrcode: 'QR Code',
      admin: 'Admin',
      self: 'Self',
      offline: 'Offline'
    };

    return (
      <Badge bg={variants[method] || 'secondary'}>
        {labels[method] || method}
      </Badge>
    );
  };

  const isLoading = loading || externalLoading;

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">{title}</h5>
      </Card.Header>
      <Card.Body>
        {showDateFilter && (
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Event Type</Form.Label>
                <Form.Select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="weekly">Weekly</option>
                  <option value="special">Special</option>
                  <option value="retreat">Retreat</option>
                  <option value="holiday">Holiday</option>
                  <option value="outreach">Outreach</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        )}

        {isLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2">Loading attendance records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <Alert variant="info">
            No attendance records found for the selected criteria.
          </Alert>
        ) : (
          <>
            <div className="mb-3">
              <small className="text-muted">
                Showing {filteredRecords.length} of {records.length} records
              </small>
            </div>

            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Type</th>
                    <th>Method</th>
                    {!userId && <th>Name</th>}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, index) => {
                    const { date, time } = formatDateTime(record.checkInTime);
                    return (
                      <tr key={record.id || index}>
                        <td>{date}</td>
                        <td>{time}</td>
                        <td>{record.eventName || 'N/A'}</td>
                        <td>{getEventTypeBadge(record.eventType)}</td>
                        <td>{getCheckInMethodBadge(record.checkInMethod)}</td>
                        {!userId && (
                          <td>
                            {record.userName}
                            {record.isVisitor && (
                              <Badge bg="info" className="ms-1">Visitor</Badge>
                            )}
                          </td>
                        )}
                        <td>
                          {record.isVisitor ? (
                            <div>
                              <Badge bg="info">Visitor</Badge>
                              {record.visitorInfo?.isFirstTime && (
                                <Badge bg="success" className="ms-1">First Time</Badge>
                              )}
                            </div>
                          ) : (
                            <Badge bg="primary">Member</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {/* Summary Statistics */}
            <div className="mt-4 pt-3 border-top">
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <h6 className="text-primary">{filteredRecords.length}</h6>
                    <small className="text-muted">Total Check-ins</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h6 className="text-success">
                      {filteredRecords.filter(r => !r.isVisitor).length}
                    </h6>
                    <small className="text-muted">Members</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h6 className="text-info">
                      {filteredRecords.filter(r => r.isVisitor).length}
                    </h6>
                    <small className="text-muted">Visitors</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h6 className="text-warning">
                      {filteredRecords.filter(r => r.checkInMethod === 'qrcode').length}
                    </h6>
                    <small className="text-muted">QR Check-ins</small>
                  </div>
                </Col>
              </Row>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default AttendanceHistory;

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Table, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { AdminService } from '../services/adminService';
import type { FellowshipUser, PrayerRequest, WelfareRequest, EvangelismReport } from '../types';

const AdminDashboard: React.FC = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [activeKey, setActiveKey] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [members, setMembers] = useState<FellowshipUser[]>([]);
  const [pendingPrayerRequests, setPendingPrayerRequests] = useState<PrayerRequest[]>([]);
  const [pendingWelfareRequests, setPendingWelfareRequests] = useState<WelfareRequest[]>([]);
  const [pendingEvangelismReports, setPendingEvangelismReports] = useState<EvangelismReport[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FellowshipUser | null>(null);
  const [attendanceReport, setAttendanceReport] = useState<any>(null);

  const adminService = AdminService.getInstance();

  useEffect(() => {
    if (isAdmin || isSuperAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, isSuperAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        stats,
        membersList,
        prayerReqs,
        welfareReqs,
        evangelismReps,
        attendance
      ] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getAllMembers({ limit: 100, orderBy: 'name' }),
        adminService.getPrayerRequestsForModeration(),
        adminService.getWelfareRequestsForReview(),
        adminService.getEvangelismReportsForModeration(),
        adminService.getAttendanceReport({ 
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
        })
      ]);

      setSystemStats(stats);
      setMembers(membersList);
      setPendingPrayerRequests(prayerReqs);
      setPendingWelfareRequests(welfareReqs);
      setPendingEvangelismReports(evangelismReps);
      setAttendanceReport(attendance);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberRoleUpdate = async (userId: string, newRole: 'member' | 'admin' | 'super-admin') => {
    try {
      await adminService.updateMemberRole(userId, newRole);
      await loadDashboardData();
      setShowMemberModal(false);
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const handleMemberStatusUpdate = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      await adminService.updateMemberStatus(userId, status);
      await loadDashboardData();
      setShowMemberModal(false);
    } catch (error) {
      console.error('Error updating member status:', error);
    }
  };

  const handlePrayerRequestModeration = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await adminService.moderatePrayerRequest(requestId, action);
      await loadDashboardData();
    } catch (error) {
      console.error('Error moderating prayer request:', error);
    }
  };

  const handleWelfareRequestUpdate = async (
    requestId: string, 
    status: 'reviewed' | 'approved' | 'completed' | 'declined'
  ) => {
    try {
      await adminService.updateWelfareRequestStatus(requestId, status);
      await loadDashboardData();
    } catch (error) {
      console.error('Error updating welfare request:', error);
    }
  };

  const handleEvangelismReportModeration = async (
    reportId: string, 
    action: 'approve' | 'reject', 
    featured: boolean = false
  ) => {
    try {
      await adminService.moderateEvangelismReport(reportId, action, featured);
      await loadDashboardData();
    } catch (error) {
      console.error('Error moderating evangelism report:', error);
    }
  };

  const exportMemberData = async (format: 'csv' | 'json') => {
    try {
      const data = await adminService.exportMemberData(format);
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting member data:', error);
    }
  };

  if (!isAdmin && !isSuperAdmin) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Access denied. You need admin privileges to view this page.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Church management and oversight</p>
        </Col>
      </Row>

      <Tabs
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k || 'overview')}
        className="mb-4"
      >
        <Tab eventKey="overview" title="Overview">
          <Row className="g-4">
            {/* System Statistics */}
            <Col lg={3} md={6}>
              <Card>
                <Card.Body className="text-center">
                  <h3 className="text-primary">{systemStats?.members?.total || 0}</h3>
                  <p className="mb-0">Total Members</p>
                  <small className="text-muted">
                    +{systemStats?.members?.newThisMonth || 0} this month
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card>
                <Card.Body className="text-center">
                  <h3 className="text-success">{systemStats?.attendance?.recentTotal || 0}</h3>
                  <p className="mb-0">Recent Attendance</p>
                  <small className="text-muted">Last 30 days</small>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card>
                <Card.Body className="text-center">
                  <h3 className="text-warning">{pendingPrayerRequests.length + pendingWelfareRequests.length + pendingEvangelismReports.length}</h3>
                  <p className="mb-0">Pending Reviews</p>
                  <small className="text-muted">Requires attention</small>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card>
                <Card.Body className="text-center">
                  <h3 className="text-info">{systemStats?.attendance?.uniqueRecentAttendees || 0}</h3>
                  <p className="mb-0">Active Members</p>
                  <small className="text-muted">Recent attendees</small>
                </Card.Body>
              </Card>
            </Col>

            {/* Quick Actions */}
            <Col lg={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Pending Moderation</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Prayer Requests</span>
                    <Badge bg="primary">{pendingPrayerRequests.length}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Welfare Requests</span>
                    <Badge bg="warning">{pendingWelfareRequests.length}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Evangelism Reports</span>
                    <Badge bg="success">{pendingEvangelismReports.length}</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Member Distribution</h5>
                </Card.Header>
                <Card.Body>
                  {systemStats?.members?.byRole && Object.entries(systemStats.members.byRole).map(([role, count]) => (
                    <div key={role} className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-capitalize">{role}s</span>
                      <Badge bg="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="members" title={`Members (${members.length})`}>
          <Row className="mb-3">
            <Col>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" onClick={() => exportMemberData('csv')}>
                  Export CSV
                </Button>
                <Button variant="outline-secondary" onClick={() => exportMemberData('json')}>
                  Export JSON
                </Button>
              </div>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Campus</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id}>
                      <td>{member.fullName || member.displayName}</td>
                      <td>{member.email}</td>
                      <td>
                        <Badge bg={member.role === 'super-admin' ? 'danger' : member.role === 'admin' ? 'warning' : 'primary'}>
                          {member.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={member.status === 'active' ? 'success' : 'secondary'}>
                          {member.status || 'active'}
                        </Badge>
                      </td>
                      <td>{member.campus || 'Main'}</td>
                      <td>{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowMemberModal(true);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="moderation" title={`Moderation (${pendingPrayerRequests.length + pendingWelfareRequests.length + pendingEvangelismReports.length})`}>
          <Row className="g-4">
            {/* Prayer Requests */}
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Prayer Requests ({pendingPrayerRequests.length})</h6>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {pendingPrayerRequests.map(request => (
                    <div key={request.id} className="border-bottom pb-2 mb-2">
                      <h6>{request.title}</h6>
                      <p className="small text-muted">{request.content.substring(0, 100)}...</p>
                      <div className="d-flex gap-1">
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handlePrayerRequestModeration(request.id!, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handlePrayerRequestModeration(request.id!, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingPrayerRequests.length === 0 && (
                    <p className="text-muted">No pending prayer requests</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Welfare Requests */}
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Welfare Requests ({pendingWelfareRequests.length})</h6>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {pendingWelfareRequests.map(request => (
                    <div key={request.id} className="border-bottom pb-2 mb-2">
                      <h6>{request.title}</h6>
                      <Badge bg={request.urgency === 'critical' ? 'danger' : request.urgency === 'high' ? 'warning' : 'info'}>
                        {request.urgency} priority
                      </Badge>
                      <p className="small text-muted mt-1">{request.description.substring(0, 100)}...</p>
                      <div className="d-flex gap-1 flex-wrap">
                        <Button 
                          size="sm" 
                          variant="info"
                          onClick={() => handleWelfareRequestUpdate(request.id!, 'reviewed')}
                        >
                          Review
                        </Button>
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleWelfareRequestUpdate(request.id!, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handleWelfareRequestUpdate(request.id!, 'declined')}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingWelfareRequests.length === 0 && (
                    <p className="text-muted">No pending welfare requests</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Evangelism Reports */}
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Evangelism Reports ({pendingEvangelismReports.length})</h6>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {pendingEvangelismReports.map(report => (
                    <div key={report.id} className="border-bottom pb-2 mb-2">
                      <h6>{report.title}</h6>
                      <p className="small text-muted">{report.description.substring(0, 100)}...</p>
                      {report.peopleReached && (
                        <small className="text-info">Reached: {report.peopleReached} people</small>
                      )}
                      <div className="d-flex gap-1 flex-wrap mt-1">
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleEvangelismReportModeration(report.id!, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="warning"
                          onClick={() => handleEvangelismReportModeration(report.id!, 'approve', true)}
                        >
                          Feature
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handleEvangelismReportModeration(report.id!, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingEvangelismReports.length === 0 && (
                    <p className="text-muted">No pending evangelism reports</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="reports" title="Reports">
          <Row className="g-4">
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Attendance Report (Last 30 Days)</h5>
                </Card.Header>
                <Card.Body>
                  {attendanceReport && (
                    <>
                      <Row className="mb-3">
                        <Col md={3}>
                          <div className="text-center">
                            <h4 className="text-primary">{attendanceReport.statistics.totalAttendance}</h4>
                            <small>Total Attendance</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center">
                            <h4 className="text-success">{attendanceReport.statistics.uniqueAttendees}</h4>
                            <small>Unique Attendees</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center">
                            <h4 className="text-info">{attendanceReport.statistics.averagePerEvent}</h4>
                            <small>Avg Per Event</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center">
                            <h4 className="text-warning">
                              {Object.keys(attendanceReport.statistics.attendanceByDate).length}
                            </h4>
                            <small>Active Days</small>
                          </div>
                        </Col>
                      </Row>

                      <h6>Check-in Methods</h6>
                      {Object.entries(attendanceReport.statistics.attendanceByMethod).map(([method, count]) => (
                        <div key={method} className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-capitalize">{method}</span>
                          <Badge bg="secondary">{count as number}</Badge>
                        </div>
                      ))}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">System Health</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Active Members</span>
                    <Badge bg="success">{systemStats?.members?.byStatus?.active || 0}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Inactive Members</span>
                    <Badge bg="secondary">{systemStats?.members?.byStatus?.inactive || 0}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Total Engagement</span>
                    <Badge bg="info">
                      {(systemStats?.engagement?.prayerRequests || 0) + 
                       (systemStats?.engagement?.welfareRequests || 0) + 
                       (systemStats?.engagement?.evangelismReports || 0)}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Weekly Avg Attendance</span>
                    <Badge bg="primary">{systemStats?.attendance?.averageWeekly || 0}</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Member Edit Modal */}
      <Modal show={showMemberModal} onHide={() => setShowMemberModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMember && (
            <>
              <h6>{selectedMember.fullName || selectedMember.displayName}</h6>
              <p className="text-muted">{selectedMember.email}</p>
              
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <div className="d-flex gap-2">
                  <Button 
                    size="sm" 
                    variant={selectedMember.role === 'member' ? 'primary' : 'outline-primary'}
                    onClick={() => handleMemberRoleUpdate(selectedMember.id!, 'member')}
                  >
                    Member
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedMember.role === 'admin' ? 'warning' : 'outline-warning'}
                    onClick={() => handleMemberRoleUpdate(selectedMember.id!, 'admin')}
                  >
                    Admin
                  </Button>
                  {isSuperAdmin && (
                    <Button 
                      size="sm" 
                      variant={selectedMember.role === 'super-admin' ? 'danger' : 'outline-danger'}
                      onClick={() => handleMemberRoleUpdate(selectedMember.id!, 'super-admin')}
                    >
                      Super Admin
                    </Button>
                  )}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <div className="d-flex gap-2">
                  <Button 
                    size="sm" 
                    variant={selectedMember.status === 'active' ? 'success' : 'outline-success'}
                    onClick={() => handleMemberStatusUpdate(selectedMember.id!, 'active')}
                  >
                    Active
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedMember.status === 'inactive' ? 'secondary' : 'outline-secondary'}
                    onClick={() => handleMemberStatusUpdate(selectedMember.id!, 'inactive')}
                  >
                    Inactive
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedMember.status === 'suspended' ? 'danger' : 'outline-danger'}
                    onClick={() => handleMemberStatusUpdate(selectedMember.id!, 'suspended')}
                  >
                    Suspended
                  </Button>
                </div>
              </Form.Group>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;

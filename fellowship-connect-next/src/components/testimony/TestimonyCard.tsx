import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import type { Testimony } from '../../types';

interface TestimonyCardProps {
  testimony: Testimony;
  showActions?: boolean;
  onView?: (testimony: Testimony) => void;
  onEdit?: (testimony: Testimony) => void;
  onModerate?: (testimony: Testimony, action: 'approve' | 'reject') => void;
  onToggleFeatured?: (testimony: Testimony) => void;
  isAdmin?: boolean;
}

const TestimonyCard: React.FC<TestimonyCardProps> = ({
  testimony,
  showActions = false,
  onView,
  onEdit,
  onModerate,
  onToggleFeatured,
  isAdmin = false
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'salvation': return 'bi-heart-fill';
      case 'healing': return 'bi-bandaid-fill';
      case 'provision': return 'bi-gift-fill';
      case 'deliverance': return 'bi-shield-fill-check';
      case 'restoration': return 'bi-arrow-clockwise';
      case 'breakthrough': return 'bi-lightning-fill';
      case 'answered prayer': return 'bi-chat-heart-fill';
      case 'life transformation': return 'bi-arrow-up-circle-fill';
      default: return 'bi-star-fill';
    }
  };

  const formatDate = (timestamp: string | Date | { toDate: () => Date } | null | undefined) => {
    if (!timestamp) return '';
    
    // Handle Firebase Timestamp-like objects
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle Date objects
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    
    // Handle string dates
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleDateString();
    }
    
    return '';
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card className="h-100 testimony-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <i className={`${getCategoryIcon(testimony.category)} me-2 text-primary`}></i>
          <span className="fw-bold">{testimony.category}</span>
          {testimony.featured && (
            <Badge bg="warning" className="ms-2">
              <i className="bi bi-star-fill me-1"></i>
              Featured
            </Badge>
          )}
        </div>
        <Badge bg={getStatusVariant(testimony.status)}>
          {testimony.status.charAt(0).toUpperCase() + testimony.status.slice(1)}
        </Badge>
      </Card.Header>

      <Card.Body>
        <Card.Title className="h5 mb-2">{testimony.title}</Card.Title>
        
        <Card.Text className="text-muted mb-2">
          {testimony.isAnonymous ? 'Anonymous' : testimony.memberName}
          {testimony.dateOfTestimony && (
            <span className="ms-2">• {formatDate(testimony.dateOfTestimony)}</span>
          )}
          {testimony.location && (
            <span className="ms-2">• {testimony.location}</span>
          )}
        </Card.Text>

        <Card.Text className="mb-3">
          {truncateContent(testimony.content)}
        </Card.Text>

        {testimony.tags && testimony.tags.length > 0 && (
          <div className="mb-3">
            {testimony.tags.map((tag, index) => (
              <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <Row className="text-muted small">
          <Col>
            <i className="bi bi-eye me-1"></i>
            {testimony.viewCount || 0} views
          </Col>
          <Col>
            <i className="bi bi-heart me-1"></i>
            {testimony.likes || 0} likes
          </Col>
          <Col className="text-end">
            {formatDate(testimony.createdAt)}
          </Col>
        </Row>
      </Card.Body>

      {showActions && (
        <Card.Footer className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => onView?.(testimony)}
                className="me-2"
              >
                <i className="bi bi-eye me-1"></i>
                View
              </Button>
              {isAdmin && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => onEdit?.(testimony)}
                  className="me-2"
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit
                </Button>
              )}
            </div>

            {isAdmin && testimony.status === 'pending' && (
              <div>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onModerate?.(testimony, 'approve')}
                  className="me-2"
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onModerate?.(testimony, 'reject')}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Reject
                </Button>
              </div>
            )}

            {isAdmin && testimony.status === 'approved' && (
              <Button
                variant={testimony.featured ? "warning" : "outline-warning"}
                size="sm"
                onClick={() => onToggleFeatured?.(testimony)}
              >
                <i className={`bi bi-star${testimony.featured ? '-fill' : ''} me-1`}></i>
                {testimony.featured ? 'Unfeature' : 'Feature'}
              </Button>
            )}
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default TestimonyCard;

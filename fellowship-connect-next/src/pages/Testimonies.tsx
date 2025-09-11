import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { testimonyService } from '../services/testimonyService';
import TestimonyCard from '../components/testimony/TestimonyCard';
import type { Testimony } from '../types';

const Testimonies: React.FC = () => {
  const [activeKey, setActiveKey] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [featuredTestimonies, setFeaturedTestimonies] = useState<Testimony[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<{total: number; approved: number; pending: number; rejected: number; featured: number; totalViews: number; totalLikes: number; categories: Record<string, number>} | null>(null);

  const categories = [
    'All',
    'Salvation',
    'Healing',
    'Provision',
    'Deliverance',
    'Restoration',
    'Breakthrough',
    'Answered Prayer',
    'Life Transformation',
    'Other'
  ];

  useEffect(() => {
    loadTestimonies();
  }, []);

  const loadTestimonies = async () => {
    setLoading(true);
    try {
      const [featured, all, statistics] = await Promise.all([
        testimonyService.getPublicTestimonies({ featured: true, limit: 6 }),
        testimonyService.getPublicTestimonies({ limit: 50 }),
        testimonyService.getTestimonyStats()
      ]);

      setFeaturedTestimonies(featured);
      setTestimonies(all);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading testimonies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTestimony = (testimony: Testimony) => {
    // Increment view count only if testimony has an id
    if (testimony.id) {
      testimonyService.incrementViewCount(testimony.id);
    }
  };

  const filteredTestimonies = testimonies.filter(testimony => {
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || testimony.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      testimony.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimony.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimony.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 className="display-4 mb-3">
              <i className="bi bi-heart-fill me-3 text-primary"></i>
              Testimonies
            </h1>
            <p className="lead text-muted">
              Witness the amazing works of God in our community
            </p>
          </div>
        </Col>
      </Row>

      {/* Statistics */}
      {stats && (
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center bg-primary text-white">
              <Card.Body>
                <h3>{stats.approved}</h3>
                <small>Published Testimonies</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center bg-warning text-white">
              <Card.Body>
                <h3>{stats.featured}</h3>
                <small>Featured Stories</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center bg-info text-white">
              <Card.Body>
                <h3>{stats.totalViews}</h3>
                <small>Total Views</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k || 'featured')} className="mb-4">
        <Tab eventKey="featured" title={
          <span>
            <i className="bi bi-star-fill me-2"></i>
            Featured Stories
          </span>
        }>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading featured testimonies...</p>
            </div>
          ) : (
            <>
              {featuredTestimonies.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <i className="bi bi-info-circle me-2"></i>
                  No featured testimonies available at the moment.
                </Alert>
              ) : (
                <>
                  <div className="mb-4 text-center">
                    <p className="text-muted">
                      These are some of the most inspiring testimonies from our community
                    </p>
                  </div>
                  <Row>
                    {featuredTestimonies.map(testimony => (
                      <Col key={testimony.id} md={6} lg={4} className="mb-4">
                        <TestimonyCard
                          testimony={testimony}
                          showActions={true}
                          onView={handleViewTestimony}
                        />
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </>
          )}
        </Tab>

        <Tab eventKey="all" title={
          <span>
            <i className="bi bi-collection me-2"></i>
            All Testimonies
          </span>
        }>
          {/* Search and Filter Controls */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search testimonies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category === 'All' ? '' : category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading testimonies...</p>
            </div>
          ) : (
            <>
              {filteredTestimonies.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <i className="bi bi-info-circle me-2"></i>
                  {searchTerm || selectedCategory ? 
                    'No testimonies match your search criteria.' : 
                    'No testimonies available at the moment.'
                  }
                </Alert>
              ) : (
                <>
                  <div className="mb-3">
                    <small className="text-muted">
                      Showing {filteredTestimonies.length} of {testimonies.length} testimonies
                    </small>
                  </div>
                  <Row>
                    {filteredTestimonies.map(testimony => (
                      <Col key={testimony.id} md={6} lg={4} className="mb-4">
                        <TestimonyCard
                          testimony={testimony}
                          showActions={true}
                          onView={handleViewTestimony}
                        />
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </>
          )}
        </Tab>

        <Tab eventKey="categories" title={
          <span>
            <i className="bi bi-tags me-2"></i>
            By Category
          </span>
        }>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <Row>
              {categories.slice(1).map(category => {
                const categoryTestimonies = testimonies.filter(t => t.category === category);
                const categoryCount = categoryTestimonies.length;
                
                if (categoryCount === 0) return null;

                return (
                  <Col key={category} md={6} lg={4} className="mb-4">
                    <Card className="h-100 category-card" style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedCategory(category);
                            setActiveKey('all');
                          }}>
                      <Card.Body className="text-center">
                        <div className="mb-3">
                          <i className={`bi ${getCategoryIcon(category)} display-4 text-primary`}></i>
                        </div>
                        <Card.Title>{category}</Card.Title>
                        <Badge bg="primary">{categoryCount} testimonies</Badge>
                        <Card.Text className="mt-2 text-muted small">
                          {getCategoryDescription(category)}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Tab>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-light mt-5">
        <Card.Body className="text-center py-4">
          <h4>Have a testimony to share?</h4>
          <p className="text-muted mb-3">
            We&apos;d love to hear how God has worked in your life. Contact our church leadership to share your story.
          </p>
          <Button variant="primary" href="/contact">
            <i className="bi bi-envelope me-2"></i>
            Contact Us
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
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

const getCategoryDescription = (category: string) => {
  switch (category.toLowerCase()) {
    case 'salvation': return 'Stories of accepting Jesus Christ';
    case 'healing': return 'Physical and emotional healing testimonies';
    case 'provision': return 'God\'s provision in times of need';
    case 'deliverance': return 'Freedom from bondage and addiction';
    case 'restoration': return 'Restored relationships and situations';
    case 'breakthrough': return 'Breakthrough in difficult circumstances';
    case 'answered prayer': return 'Specific prayers that were answered';
    case 'life transformation': return 'Complete life changes through Christ';
    default: return 'Other amazing works of God';
  }
};

export default Testimonies;

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Testimony } from '../types';

/**
 * Service for testimony management including admin registration and moderation
 */
export class TestimonyService {
  private static instance: TestimonyService;
  
  static getInstance(): TestimonyService {
    if (!TestimonyService.instance) {
      TestimonyService.instance = new TestimonyService();
    }
    return TestimonyService.instance;
  }

  // Admin-only testimony registration
  async registerTestimony(testimonyData: {
    memberName: string;
    memberEmail?: string;
    title: string;
    content: string;
    category: string;
    dateOfTestimony: string;
    location?: string;
    witnessedBy?: string;
    tags?: string[];
    isAnonymous?: boolean;
    contactPermission?: boolean;
    mediaUrls?: string[];
  }, adminId: string): Promise<string> {
    try {
      const testimony: Omit<Testimony, 'id'> = {
        ...testimonyData,
        status: 'pending',
        submittedBy: adminId,
        submittedAt: Timestamp.now(),
        moderatedBy: null,
        moderatedAt: null,
        moderationNotes: '',
        featured: false,
        viewCount: 0,
        likes: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'testimonies'), testimony);
      return docRef.id;
    } catch (error) {
      console.error('Error registering testimony:', error);
      throw error;
    }
  }

  // Get testimonies with filtering
  async getTestimonies(options: {
    status?: 'pending' | 'approved' | 'rejected';
    category?: string;
    featured?: boolean;
    limit?: number;
    orderBy?: 'recent' | 'popular' | 'featured';
  } = {}): Promise<Testimony[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (options.status) {
        constraints.push(where('status', '==', options.status));
      }

      if (options.category) {
        constraints.push(where('category', '==', options.category));
      }

      if (options.featured !== undefined) {
        constraints.push(where('featured', '==', options.featured));
      }

      // Add ordering
      if (options.orderBy === 'popular') {
        constraints.push(orderBy('likes', 'desc'));
      } else if (options.orderBy === 'featured') {
        constraints.push(orderBy('featured', 'desc'));
        constraints.push(orderBy('createdAt', 'desc'));
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }

      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, 'testimonies'), ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Testimony));
    } catch (error) {
      console.error('Error getting testimonies:', error);
      throw error;
    }
  }

  // Get public testimonies (approved only)
  async getPublicTestimonies(options: {
    category?: string;
    featured?: boolean;
    limit?: number;
  } = {}): Promise<Testimony[]> {
    return this.getTestimonies({
      ...options,
      status: 'approved'
    });
  }

  // Get pending testimonies for moderation
  async getPendingTestimonies(): Promise<Testimony[]> {
    return this.getTestimonies({
      status: 'pending',
      orderBy: 'recent'
    });
  }

  // Moderate testimony (approve/reject)
  async moderateTestimony(
    testimonyId: string, 
    action: 'approve' | 'reject',
    moderatorId: string,
    notes?: string
  ): Promise<void> {
    try {
      const testimonyRef = doc(db, 'testimonies', testimonyId);
      await updateDoc(testimonyRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        moderatedBy: moderatorId,
        moderatedAt: Timestamp.now(),
        moderationNotes: notes || '',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error moderating testimony:', error);
      throw error;
    }
  }

  // Toggle featured status
  async toggleFeatured(testimonyId: string, featured: boolean): Promise<void> {
    try {
      const testimonyRef = doc(db, 'testimonies', testimonyId);
      await updateDoc(testimonyRef, {
        featured,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating featured status:', error);
      throw error;
    }
  }

  // Update testimony
  async updateTestimony(testimonyId: string, updates: Partial<Testimony>): Promise<void> {
    try {
      const testimonyRef = doc(db, 'testimonies', testimonyId);
      await updateDoc(testimonyRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating testimony:', error);
      throw error;
    }
  }

  // Delete testimony
  async deleteTestimony(testimonyId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'testimonies', testimonyId));
    } catch (error) {
      console.error('Error deleting testimony:', error);
      throw error;
    }
  }

  // Increment view count
  async incrementViewCount(testimonyId: string): Promise<void> {
    try {
      const testimonyRef = doc(db, 'testimonies', testimonyId);
      const testimony = await this.getTestimonies();
      const current = testimony.find(t => t.id === testimonyId);
      if (current) {
        await updateDoc(testimonyRef, {
          viewCount: (current.viewCount || 0) + 1,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Don't throw error for view count updates
    }
  }

  // Get testimony statistics
  async getTestimonyStats() {
    try {
      const [approved, pending, rejected] = await Promise.all([
        this.getTestimonies({ status: 'approved' }),
        this.getTestimonies({ status: 'pending' }),
        this.getTestimonies({ status: 'rejected' })
      ]);

      const featured = approved.filter(t => t.featured);
      const totalViews = approved.reduce((sum, t) => sum + (t.viewCount || 0), 0);
      const totalLikes = approved.reduce((sum, t) => sum + (t.likes || 0), 0);

      return {
        total: approved.length + pending.length + rejected.length,
        approved: approved.length,
        pending: pending.length,
        rejected: rejected.length,
        featured: featured.length,
        totalViews,
        totalLikes,
        categories: this.getCategoryStats(approved)
      };
    } catch (error) {
      console.error('Error getting testimony stats:', error);
      throw error;
    }
  }

  private getCategoryStats(testimonies: Testimony[]) {
    const stats: Record<string, number> = {};
    testimonies.forEach(testimony => {
      stats[testimony.category] = (stats[testimony.category] || 0) + 1;
    });
    return stats;
  }
}

export const testimonyService = TestimonyService.getInstance();

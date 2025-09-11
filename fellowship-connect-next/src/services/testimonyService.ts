import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Testimony } from '../types';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

// Create a new testimony
export const createTestimony = async (testimony: Omit<Testimony, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'testimonies'), {
      ...testimony,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...testimony, status: 'pending', createdAt: Timestamp.now() };
  } catch (error) {
    console.error('Error creating testimony:', error);
    throw error;
  }
};

// Get testimonies for a user with pagination
export const getUserTestimonies = async (userId: string, lastDoc: QueryDocumentSnapshot | null = null, pageSize = 10) => {
  try {
    let q = query(
      collection(db, 'testimonies'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const testimonies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimony));
    return { testimonies, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching user testimonies:', error);
    throw error;
  }
};

// Get all testimonies for admin with pagination
export const getAllTestimonies = async (lastDoc: QueryDocumentSnapshot | null = null, pageSize = 20) => {
  try {
    let q = query(
      collection(db, 'testimonies'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const testimonies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimony));
    return { testimonies, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching all testimonies:', error);
    throw error;
  }
};

// Get approved testimonies for public display with pagination
export const getApprovedTestimonies = async (lastDoc: QueryDocumentSnapshot | null = null, pageSize = 20) => {
  try {
    let q = query(
      collection(db, 'testimonies'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const testimonies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimony));
    return { testimonies, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching approved testimonies:', error);
    throw error;
  }
};

// Update testimony status
export const updateTestimonyStatus = async (testimonyId: string, status: 'approved' | 'rejected' | 'pending') => {
  try {
    await updateDoc(doc(db, 'testimonies', testimonyId), { status, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('Error updating testimony status:', error);
    throw error;
  }
};

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

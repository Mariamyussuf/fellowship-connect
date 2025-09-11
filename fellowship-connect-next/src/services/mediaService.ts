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
  getDoc,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { 
  Sermon, 
  Resource 
} from '../types';

/**
 * Service for managing media content including sermons, resources, and streaming
 */

export class MediaService {
  private static instance: MediaService;
  
  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  // Create a new sermon
  async createSermon(sermonData: Omit<Sermon, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'sermons'), {
        ...sermonData,
        createdAt: Timestamp.now(),
        viewCount: 0,
        downloadCount: 0
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating sermon:', error);
      throw new Error('Failed to create sermon');
    }
  }

  // Get all sermons with optional filtering
  async getSermons(
    filters: {
      preacher?: string;
      series?: string;
      tags?: string[];
      limit?: number;
    } = {}
  ): Promise<Sermon[]> {
    try {
      let q = query(
        collection(db, 'sermons'),
        orderBy('date', 'desc')
      );

      if (filters.preacher) {
        q = query(q, where('preacher', '==', filters.preacher));
      }

      if (filters.series) {
        q = query(q, where('series', '==', filters.series));
      }

      if (filters.tags && filters.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filters.tags));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sermon[];

    } catch (error) {
      console.error('Error getting sermons:', error);
      return [];
    }
  }

  // Get a single sermon by ID
  async getSermon(sermonId: string): Promise<Sermon | null> {
    try {
      const docRef = doc(db, 'sermons', sermonId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Sermon;
      }

      return null;
    } catch (error) {
      console.error('Error getting sermon:', error);
      return null;
    }
  }

  // Update sermon view count
  async incrementViewCount(sermonId: string): Promise<void> {
    try {
      const sermonRef = doc(db, 'sermons', sermonId);
      await updateDoc(sermonRef, {
        viewCount: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  // Update sermon download count
  async incrementDownloadCount(sermonId: string): Promise<void> {
    try {
      const sermonRef = doc(db, 'sermons', sermonId);
      await updateDoc(sermonRef, {
        downloadCount: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  }

  // Search sermons by text
  async searchSermons(searchTerm: string): Promise<Sermon[]> {
    try {
      // Note: Firestore doesn't have full-text search built-in
      // This is a basic implementation - in production, consider using Algolia or similar
      const allSermons = await this.getSermons({ limit: 100 });
      
      const searchLower = searchTerm.toLowerCase();
      
      return allSermons.filter(sermon => 
        sermon.title.toLowerCase().includes(searchLower) ||
        sermon.description?.toLowerCase().includes(searchLower) ||
        sermon.preacher.toLowerCase().includes(searchLower) ||
        sermon.series?.toLowerCase().includes(searchLower) ||
        sermon.scripture?.toLowerCase().includes(searchLower) ||
        sermon.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );

    } catch (error) {
      console.error('Error searching sermons:', error);
      return [];
    }
  }

  // Get sermon series
  async getSermonSeries(): Promise<string[]> {
    try {
      const sermons = await this.getSermons();
      const series = new Set<string>();
      
      sermons.forEach(sermon => {
        if (sermon.series) {
          series.add(sermon.series);
        }
      });

      return Array.from(series).sort();
    } catch (error) {
      console.error('Error getting sermon series:', error);
      return [];
    }
  }

  // Get unique preachers
  async getPreachers(): Promise<string[]> {
    try {
      const sermons = await this.getSermons();
      const preachers = new Set<string>();
      
      sermons.forEach(sermon => {
        preachers.add(sermon.preacher);
      });

      return Array.from(preachers).sort();
    } catch (error) {
      console.error('Error getting preachers:', error);
      return [];
    }
  }

  // Create a resource
  async createResource(resourceData: Omit<Resource, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'resources'), {
        ...resourceData,
        createdAt: Timestamp.now(),
        downloadCount: 0
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw new Error('Failed to create resource');
    }
  }

  // Get resources with filtering
  async getResources(
    filters: {
      category?: string;
      uploadedBy?: string;
      limit?: number;
    } = {}
  ): Promise<Resource[]> {
    try {
      let q = query(
        collection(db, 'resources'),
        orderBy('createdAt', 'desc')
      );

      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters.uploadedBy) {
        q = query(q, where('uploadedBy', '==', filters.uploadedBy));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];

    } catch (error) {
      console.error('Error getting resources:', error);
      return [];
    }
  }

  // Update resource download count
  async incrementResourceDownloadCount(resourceId: string): Promise<void> {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        downloadCount: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing resource download count:', error);
    }
  }

  // Get resource categories
  async getResourceCategories(): Promise<string[]> {
    try {
      const resources = await this.getResources();
      const categories = new Set<string>();
      
      resources.forEach(resource => {
        categories.add(resource.category);
      });

      return Array.from(categories).sort();
    } catch (error) {
      console.error('Error getting resource categories:', error);
      return [];
    }
  }

  // Search resources
  async searchResources(searchTerm: string): Promise<Resource[]> {
    try {
      const allResources = await this.getResources({ limit: 100 });
      
      const searchLower = searchTerm.toLowerCase();
      
      return allResources.filter(resource => 
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.category.toLowerCase().includes(searchLower) ||
        resource.fileName.toLowerCase().includes(searchLower)
      );

    } catch (error) {
      console.error('Error searching resources:', error);
      return [];
    }
  }

  // Get popular sermons (by view count)
  async getPopularSermons(limitCount: number = 10): Promise<Sermon[]> {
    try {
      const q = query(
        collection(db, 'sermons'),
        orderBy('viewCount', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sermon[];

    } catch (error) {
      console.error('Error getting popular sermons:', error);
      return [];
    }
  }

  // Get recent sermons
  async getRecentSermons(limitCount: number = 10): Promise<Sermon[]> {
    try {
      return await this.getSermons({ limit: limitCount });
    } catch (error) {
      console.error('Error getting recent sermons:', error);
      return [];
    }
  }

  // Update sermon
  async updateSermon(sermonId: string, updates: Partial<Sermon>): Promise<boolean> {
    try {
      const sermonRef = doc(db, 'sermons', sermonId);
      await updateDoc(sermonRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating sermon:', error);
      return false;
    }
  }

  // Delete sermon (soft delete by marking as inactive)
  async deleteSermon(sermonId: string): Promise<boolean> {
    try {
      const sermonRef = doc(db, 'sermons', sermonId);
      await updateDoc(sermonRef, {
        active: false,
        deletedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error deleting sermon:', error);
      return false;
    }
  }

  // Get media statistics
  async getMediaStats(): Promise<{
    totalSermons: number;
    totalResources: number;
    totalViews: number;
    totalDownloads: number;
    popularSeries: { name: string; count: number }[];
  }> {
    try {
      const [sermons, resources] = await Promise.all([
        this.getSermons(),
        this.getResources()
      ]);

      const totalViews = sermons.reduce((sum, sermon) => sum + (sermon.viewCount || 0), 0);
      const totalDownloads = resources.reduce((sum, resource) => sum + (resource.downloadCount || 0), 0);

      // Count sermons by series
      const seriesCount: Record<string, number> = {};
      sermons.forEach(sermon => {
        if (sermon.series) {
          seriesCount[sermon.series] = (seriesCount[sermon.series] || 0) + 1;
        }
      });

      const popularSeries = Object.entries(seriesCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSermons: sermons.length,
        totalResources: resources.length,
        totalViews,
        totalDownloads,
        popularSeries
      };

    } catch (error) {
      console.error('Error getting media stats:', error);
      return {
        totalSermons: 0,
        totalResources: 0,
        totalViews: 0,
        totalDownloads: 0,
        popularSeries: []
      };
    }
  }
}

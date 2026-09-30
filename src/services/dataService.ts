import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import initialContent from '../data/contentData.json';
import { Product, Competition, MediaLibraryItem, SiteSettings, HomepageConfig } from '../types';

const PRODUCTS_COL = 'products';
const COMPETITIONS_COL = 'competitions';
const MEDIA_COL = 'media';
const SETTINGS_COL = 'site_settings';
const HOMEPAGE_COL = 'homepage_config';

export const dataService = {
  // Fetch site settings
  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const docRef = doc(db, SETTINGS_COL, 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as SiteSettings;
        try {
          localStorage.setItem('donghoi_site_settings', JSON.stringify(data));
        } catch (_) {}
        return data;
      }
    } catch (error) {
      console.warn('Failed to load site settings from firestore, trying local storage:', error);
    }

    try {
      const cached = localStorage.getItem('donghoi_site_settings');
      if (cached) {
        return JSON.parse(cached) as SiteSettings;
      }
    } catch (_) {}

    return initialContent.siteSettings as SiteSettings;
  },

  // Save site settings (Admin only)
  async saveSiteSettings(settings: SiteSettings): Promise<void> {
    const updatedWithTimestamp = {
      ...settings,
      updatedAt: new Date().toISOString()
    };

    // 1. Immediately cache in localStorage for zero-latency UI updates
    try {
      localStorage.setItem('donghoi_site_settings', JSON.stringify(updatedWithTimestamp));
    } catch (_) {}

    // 2. Persist to Firestore
    const path = `${SETTINGS_COL}/main`;
    try {
      await setDoc(doc(db, SETTINGS_COL, 'main'), updatedWithTimestamp, { merge: true });
    } catch (error) {
      console.warn('Firestore setDoc failed, kept in local persistent cache:', error);
    }
  },

  // Fetch Homepage Config
  async getHomepageConfig(): Promise<HomepageConfig> {
    try {
      const docRef = doc(db, HOMEPAGE_COL, 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as HomepageConfig;
        try {
          localStorage.setItem('donghoi_homepage_config', JSON.stringify(data));
        } catch (_) {}
        return data;
      }
    } catch (error) {
      console.warn('Failed to load homepage config from firestore, using local:', error);
    }

    try {
      const cached = localStorage.getItem('donghoi_homepage_config');
      if (cached) {
        return JSON.parse(cached) as HomepageConfig;
      }
    } catch (_) {}

    return initialContent.homepageConfig as HomepageConfig;
  },

  // Save Homepage Config (Admin only)
  async saveHomepageConfig(config: HomepageConfig): Promise<void> {
    const updated = {
      ...config,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('donghoi_homepage_config', JSON.stringify(updated));
    } catch (_) {}

    const path = `${HOMEPAGE_COL}/main`;
    try {
      await setDoc(doc(db, HOMEPAGE_COL, 'main'), updated, { merge: true });
    } catch (error) {
      console.warn('Firestore homepage config write warning:', error);
    }
  },

  // Get Competitions
  async getCompetitions(includeUnpublished = false): Promise<Competition[]> {
    try {
      const colRef = collection(db, COMPETITIONS_COL);
      const q = includeUnpublished ? colRef : query(colRef, where('isPublished', '==', true));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Competition));
        try {
          localStorage.setItem('donghoi_competitions', JSON.stringify(list));
        } catch (_) {}
        return list;
      }
    } catch (error) {
      console.warn('Firestore competitions fetch fallback:', error);
    }

    try {
      const cached = localStorage.getItem('donghoi_competitions');
      if (cached) {
        const parsed = JSON.parse(cached) as Competition[];
        return parsed.filter(c => includeUnpublished || c.isPublished);
      }
    } catch (_) {}

    return (initialContent.competitions as Competition[]).filter(c => includeUnpublished || c.isPublished);
  },

  // Save Competition
  async saveCompetition(competition: Partial<Competition>): Promise<string> {
    const now = new Date().toISOString();
    let compId = competition.id || `comp-${Date.now()}`;

    // Update in local cache
    try {
      const cached = localStorage.getItem('donghoi_competitions');
      let list: Competition[] = cached ? JSON.parse(cached) : [...initialContent.competitions as Competition[]];
      const index = list.findIndex(c => c.id === compId);
      const fullComp: Competition = {
        id: compId,
        slug: competition.slug || 'cuoc-thi',
        title: competition.title || '',
        description: competition.description || '',
        banner: competition.banner || '',
        status: competition.status || 'active',
        isPublished: competition.isPublished !== undefined ? competition.isPublished : true,
        date: competition.date || '',
        icon: competition.icon || 'Trophy',
        updatedAt: now,
        ...competition,
      };

      if (index >= 0) {
        list[index] = { ...list[index], ...fullComp };
      } else {
        list.push(fullComp);
      }
      localStorage.setItem('donghoi_competitions', JSON.stringify(list));
    } catch (_) {}

    // Persist to Firestore
    try {
      if (competition.id && !competition.id.startsWith('comp-')) {
        const docRef = doc(db, COMPETITIONS_COL, competition.id);
        await updateDoc(docRef, { ...competition, updatedAt: now });
        return competition.id;
      } else {
        const docRef = doc(db, COMPETITIONS_COL, compId);
        await setDoc(docRef, { ...competition, id: compId, createdAt: now, updatedAt: now }, { merge: true });
        return compId;
      }
    } catch (error) {
      console.warn('Firestore competition write fallback to local storage:', error);
      return compId;
    }
  },

  // Delete Competition
  async deleteCompetition(id: string): Promise<void> {
    try {
      const cached = localStorage.getItem('donghoi_competitions');
      if (cached) {
        const list = (JSON.parse(cached) as Competition[]).filter(c => c.id !== id);
        localStorage.setItem('donghoi_competitions', JSON.stringify(list));
      }
    } catch (_) {}

    try {
      await deleteDoc(doc(db, COMPETITIONS_COL, id));
    } catch (error) {
      console.warn('Firestore competition delete fallback:', error);
    }
  },

  // Get Products
  async getProducts(includeUnpublished = false): Promise<Product[]> {
    try {
      const colRef = collection(db, PRODUCTS_COL);
      const q = includeUnpublished ? colRef : query(colRef, where('isPublished', '==', true));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
        try {
          localStorage.setItem('donghoi_products', JSON.stringify(list));
        } catch (_) {}
        return list;
      }
    } catch (error) {
      console.warn('Firestore products fetch fallback:', error);
    }

    try {
      const cached = localStorage.getItem('donghoi_products');
      if (cached) {
        const parsed = JSON.parse(cached) as Product[];
        return parsed.filter(p => includeUnpublished || p.isPublished);
      }
    } catch (_) {}

    return (initialContent.products as Product[]).filter(p => includeUnpublished || p.isPublished);
  },

  // Save Product (Create or Update)
  async saveProduct(product: Partial<Product>): Promise<string> {
    const now = new Date().toISOString();
    const prodId = product.id || `prod-${Date.now()}`;

    // Update in local cache
    try {
      const cached = localStorage.getItem('donghoi_products');
      let list: Product[] = cached ? JSON.parse(cached) : [...initialContent.products as Product[]];
      const index = list.findIndex(p => p.id === prodId);
      const fullProd: Product = {
        id: prodId,
        title: product.title || '',
        type: product.type || 'news',
        studentName: product.studentName || '',
        studentClass: product.studentClass || '',
        description: product.description || '',
        content: product.content || '',
        thumbnail: product.thumbnail || '',
        images: product.images || [],
        isPublished: product.isPublished !== undefined ? product.isPublished : true,
        isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
        createdAt: product.createdAt || now.split('T')[0],
        updatedAt: now,
        ...product,
      };

      if (index >= 0) {
        list[index] = { ...list[index], ...fullProd };
      } else {
        list.unshift(fullProd); // Place newly added products at the top!
      }
      localStorage.setItem('donghoi_products', JSON.stringify(list));
    } catch (_) {}

    // Persist to Firestore
    try {
      const docRef = doc(db, PRODUCTS_COL, prodId);
      await setDoc(docRef, { ...product, id: prodId, updatedAt: now }, { merge: true });
      return prodId;
    } catch (error) {
      console.warn('Firestore product write fallback to local storage:', error);
      return prodId;
    }
  },

  // Delete Product
  async deleteProduct(id: string): Promise<void> {
    try {
      const cached = localStorage.getItem('donghoi_products');
      if (cached) {
        const list = (JSON.parse(cached) as Product[]).filter(p => p.id !== id);
        localStorage.setItem('donghoi_products', JSON.stringify(list));
      }
    } catch (_) {}

    try {
      await deleteDoc(doc(db, PRODUCTS_COL, id));
    } catch (error) {
      console.warn('Firestore product delete fallback:', error);
    }
  },

  // Get Media Items
  async getMediaLibrary(): Promise<MediaLibraryItem[]> {
    try {
      const colRef = collection(db, MEDIA_COL);
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as MediaLibraryItem));
        try {
          localStorage.setItem('donghoi_media', JSON.stringify(list));
        } catch (_) {}
        return list;
      }
    } catch (error) {
      console.warn('Firestore media fetch fallback:', error);
    }

    try {
      const cached = localStorage.getItem('donghoi_media');
      if (cached) {
        return JSON.parse(cached) as MediaLibraryItem[];
      }
    } catch (_) {}

    return initialContent.mediaLibrary as MediaLibraryItem[];
  },

  // Add Media Item
  async addMediaItem(item: Omit<MediaLibraryItem, 'id'>): Promise<string> {
    const medId = `med-${Date.now()}`;
    const newItem: MediaLibraryItem = { ...item, id: medId };

    try {
      const cached = localStorage.getItem('donghoi_media');
      const list: MediaLibraryItem[] = cached ? JSON.parse(cached) : [...initialContent.mediaLibrary as MediaLibraryItem[]];
      list.unshift(newItem);
      localStorage.setItem('donghoi_media', JSON.stringify(list));
    } catch (_) {}

    try {
      const docRef = doc(db, MEDIA_COL, medId);
      await setDoc(docRef, newItem, { merge: true });
      return medId;
    } catch (error) {
      console.warn('Firestore media write fallback:', error);
      return medId;
    }
  },

  // Delete Media Item
  async deleteMediaItem(id: string): Promise<void> {
    try {
      const cached = localStorage.getItem('donghoi_media');
      if (cached) {
        const list = (JSON.parse(cached) as MediaLibraryItem[]).filter(m => m.id !== id);
        localStorage.setItem('donghoi_media', JSON.stringify(list));
      }
    } catch (_) {}

    try {
      await deleteDoc(doc(db, MEDIA_COL, id));
    } catch (error) {
      console.warn('Firestore media delete fallback:', error);
    }
  },

  // Seed default data
  async seedInitialData(): Promise<{ success: boolean; count: number }> {
    let count = 0;
    try {
      await setDoc(doc(db, SETTINGS_COL, 'main'), initialContent.siteSettings, { merge: true });
      localStorage.setItem('donghoi_site_settings', JSON.stringify(initialContent.siteSettings));
      count++;

      await setDoc(doc(db, HOMEPAGE_COL, 'main'), initialContent.homepageConfig, { merge: true });
      localStorage.setItem('donghoi_homepage_config', JSON.stringify(initialContent.homepageConfig));
      count++;

      for (const comp of initialContent.competitions) {
        await setDoc(doc(db, COMPETITIONS_COL, comp.id), comp, { merge: true });
        count++;
      }
      localStorage.setItem('donghoi_competitions', JSON.stringify(initialContent.competitions));

      for (const prod of initialContent.products) {
        await setDoc(doc(db, PRODUCTS_COL, prod.id), prod, { merge: true });
        count++;
      }
      localStorage.setItem('donghoi_products', JSON.stringify(initialContent.products));

      for (const med of initialContent.mediaLibrary) {
        await setDoc(doc(db, MEDIA_COL, med.id), med, { merge: true });
        count++;
      }
      localStorage.setItem('donghoi_media', JSON.stringify(initialContent.mediaLibrary));

      return { success: true, count };
    } catch (error) {
      console.error('Seeding error:', error);
      throw error;
    }
  }
};

export type MediaType = 'video' | 'audio' | 'image' | 'gallery' | 'digital' | 'news';

export interface Product {
  id: string;
  title: string;
  type: MediaType;
  studentName: string;
  studentClass: string;
  description: string;
  content?: string;
  thumbnail: string;
  mediaUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  images?: string[];
  facebookUrl?: string;
  youtubeUrl?: string;
  category?: string;
  competitionId?: string;
  duration?: string;
  isPublished: boolean;
  isFeatured: boolean;
  views?: number;
  likes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Competition {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  banner: string;
  icon?: string;
  date?: string;
  status: 'active' | 'upcoming' | 'completed';
  totalSubmissions?: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaLibraryItem {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'cover' | 'thumbnail';
  url: string;
  size: string;
  uploadedAt: string;
}

export interface SiteSettings {
  siteName: string;
  schoolName: string;
  tagline: string;
  logoUrl: string;
  coverUrl: string;
  primaryColor: string;
  secondaryColor: string;
  lightBgColor?: string;
  veryLightBgColor?: string;
  titleColor?: string;
  bodyColor?: string;
  accentYellow?: string;
  facebookUrl: string;
  youtubeUrl: string;
  footerText: string;
  updatedAt?: string;
}

export interface HomepageSection {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
}

export interface HomepageConfig {
  sections: HomepageSection[];
  featuredProductIds: string[];
  updatedAt?: string;
}

// Типы для локальной базы данных

export interface Bank {
  id: string;
  name: string;
  short_name: string;
  logo_url: string;
  website_url: string;
  overall_rating: number;
  customer_service_rating: number;
  reliability_rating: number;
  processing_speed_rating: number;
  is_partner: boolean;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  bank_id: string;
  product_type: 'mortgage' | 'deposit' | 'credit' | 'card';
  name: string;
  description: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  min_term: number;
  max_term: number;
  fees: Record<string, number>;
  requirements: {
    min_income?: number;
    min_age: number;
    max_age?: number;
  };
  features: Record<string, boolean>;
  available_regions: string[];
  is_active: boolean;
  is_featured: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Comparison {
  id: string;
  user_id: string;
  product_ids: string[];
  created_at: string;
  parameters?: Record<string, unknown>;
}

export interface Recommendation {
  id: string;
  user_id: string;
  product_id: string;
  score: number;
  reasons: string[];
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface LocalStorageDB {
  banks: Bank[];
  products: Product[];
  userProfiles: Record<string, UserProfile>;
  comparisons: Comparison[];
  recommendations: Recommendation[];
  analytics: AnalyticsEvent[];
}

export interface ProductFilters {
  productType?: 'mortgage' | 'deposit' | 'credit' | 'card';
  bankId?: string;
  minRate?: number;
  maxRate?: number;
  region?: string;
  isActive?: boolean;
}

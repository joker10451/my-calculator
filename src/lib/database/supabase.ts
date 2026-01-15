import { createClient } from '@supabase/supabase-js';

// Типы для базы данных
export interface Database {
  public: {
    Tables: {
      banks: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          logo_url: string | null;
          website_url: string | null;
          overall_rating: number | null;
          customer_service_rating: number | null;
          reliability_rating: number | null;
          processing_speed_rating: number | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          license_number: string | null;
          central_bank_code: string | null;
          is_partner: boolean;
          commission_rate: number | null;
          referral_terms: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          logo_url?: string | null;
          website_url?: string | null;
          overall_rating?: number | null;
          customer_service_rating?: number | null;
          reliability_rating?: number | null;
          processing_speed_rating?: number | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          license_number?: string | null;
          central_bank_code?: string | null;
          is_partner?: boolean;
          commission_rate?: number | null;
          referral_terms?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          logo_url?: string | null;
          website_url?: string | null;
          overall_rating?: number | null;
          customer_service_rating?: number | null;
          reliability_rating?: number | null;
          processing_speed_rating?: number | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          license_number?: string | null;
          central_bank_code?: string | null;
          is_partner?: boolean;
          commission_rate?: number | null;
          referral_terms?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bank_products: {
        Row: {
          id: string;
          bank_id: string;
          product_type: 'mortgage' | 'deposit' | 'credit' | 'insurance';
          name: string;
          description: string | null;
          interest_rate: number;
          min_amount: number | null;
          max_amount: number | null;
          min_term: number | null;
          max_term: number | null;
          fees: Record<string, any>;
          requirements: Record<string, any>;
          features: Record<string, any>;
          promotional_rate: number | null;
          promo_valid_until: string | null;
          promo_conditions: string | null;
          available_regions: string[];
          is_active: boolean;
          is_featured: boolean;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bank_id: string;
          product_type: 'mortgage' | 'deposit' | 'credit' | 'insurance';
          name: string;
          description?: string | null;
          interest_rate: number;
          min_amount?: number | null;
          max_amount?: number | null;
          min_term?: number | null;
          max_term?: number | null;
          fees?: Record<string, any>;
          requirements?: Record<string, any>;
          features?: Record<string, any>;
          promotional_rate?: number | null;
          promo_valid_until?: string | null;
          promo_conditions?: string | null;
          available_regions?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bank_id?: string;
          product_type?: 'mortgage' | 'deposit' | 'credit' | 'insurance';
          name?: string;
          description?: string | null;
          interest_rate?: number;
          min_amount?: number | null;
          max_amount?: number | null;
          min_term?: number | null;
          max_term?: number | null;
          fees?: Record<string, any>;
          requirements?: Record<string, any>;
          features?: Record<string, any>;
          promotional_rate?: number | null;
          promo_valid_until?: string | null;
          promo_conditions?: string | null;
          available_regions?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          monthly_income: number | null;
          credit_score: number | null;
          employment_type: string | null;
          region: string | null;
          age_range: string | null;
          risk_tolerance: 'low' | 'medium' | 'high' | null;
          preferred_banks: string[];
          blacklisted_banks: string[];
          calculation_history: Record<string, any>[];
          product_interests: string[];
          last_active: string;
          session_count: number;
          conversion_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          monthly_income?: number | null;
          credit_score?: number | null;
          employment_type?: string | null;
          region?: string | null;
          age_range?: string | null;
          risk_tolerance?: 'low' | 'medium' | 'high' | null;
          preferred_banks?: string[];
          blacklisted_banks?: string[];
          calculation_history?: Record<string, any>[];
          product_interests?: string[];
          last_active?: string;
          session_count?: number;
          conversion_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_income?: number | null;
          credit_score?: number | null;
          employment_type?: string | null;
          region?: string | null;
          age_range?: string | null;
          risk_tolerance?: 'low' | 'medium' | 'high' | null;
          preferred_banks?: string[];
          blacklisted_banks?: string[];
          calculation_history?: Record<string, any>[];
          product_interests?: string[];
          last_active?: string;
          session_count?: number;
          conversion_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          score: number;
          reasoning: string[];
          context: Record<string, any>;
          shown_at: string;
          clicked_at: string | null;
          dismissed_at: string | null;
          applied_at: string | null;
          referral_link: string | null;
          referral_id: string | null;
          commission_potential: number | null;
          recommendation_type: 'automatic' | 'manual' | 'promoted';
          source: 'calculator' | 'comparison' | 'profile' | 'blog' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          score: number;
          reasoning?: string[];
          context?: Record<string, any>;
          shown_at?: string;
          clicked_at?: string | null;
          dismissed_at?: string | null;
          applied_at?: string | null;
          referral_link?: string | null;
          referral_id?: string | null;
          commission_potential?: number | null;
          recommendation_type?: 'automatic' | 'manual' | 'promoted';
          source?: 'calculator' | 'comparison' | 'profile' | 'blog' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          score?: number;
          reasoning?: string[];
          context?: Record<string, any>;
          shown_at?: string;
          clicked_at?: string | null;
          dismissed_at?: string | null;
          applied_at?: string | null;
          referral_link?: string | null;
          referral_id?: string | null;
          commission_potential?: number | null;
          recommendation_type?: 'automatic' | 'manual' | 'promoted';
          source?: 'calculator' | 'comparison' | 'profile' | 'blog' | null;
          created_at?: string;
        };
      };
      comparisons: {
        Row: {
          id: string;
          user_id: string | null;
          product_ids: string[];
          comparison_criteria: Record<string, any>;
          comparison_matrix: Record<string, any> | null;
          highlighted_products: string[];
          saved_at: string | null;
          shared_at: string | null;
          bookmark_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          product_ids: string[];
          comparison_criteria?: Record<string, any>;
          comparison_matrix?: Record<string, any> | null;
          highlighted_products?: string[];
          saved_at?: string | null;
          shared_at?: string | null;
          bookmark_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          product_ids?: string[];
          comparison_criteria?: Record<string, any>;
          comparison_matrix?: Record<string, any> | null;
          highlighted_products?: string[];
          saved_at?: string | null;
          shared_at?: string | null;
          bookmark_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      referral_analytics: {
        Row: {
          id: string;
          referral_id: string;
          user_id: string | null;
          product_id: string;
          bank_id: string;
          event_type: 'click' | 'view' | 'apply' | 'approve' | 'fund';
          event_timestamp: string;
          source: string | null;
          campaign: string | null;
          user_agent: string | null;
          ip_address: string | null;
          potential_commission: number | null;
          actual_commission: number | null;
          commission_status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          referral_id: string;
          user_id?: string | null;
          product_id: string;
          bank_id: string;
          event_type: 'click' | 'view' | 'apply' | 'approve' | 'fund';
          event_timestamp?: string;
          source?: string | null;
          campaign?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          potential_commission?: number | null;
          actual_commission?: number | null;
          commission_status?: 'pending' | 'confirmed' | 'paid' | 'cancelled';
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          referral_id?: string;
          user_id?: string | null;
          product_id?: string;
          bank_id?: string;
          event_type?: 'click' | 'view' | 'apply' | 'approve' | 'fund';
          event_timestamp?: string;
          source?: string | null;
          campaign?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          potential_commission?: number | null;
          actual_commission?: number | null;
          commission_status?: 'pending' | 'confirmed' | 'paid' | 'cancelled';
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}

// Конфигурация Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Утилиты для работы с базой данных
export class DatabaseError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const handleDatabaseError = (error: any): never => {
  console.error('Database error:', error);
  
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        throw new DatabaseError('Запись не найдена', 'NOT_FOUND', error);
      case '23505':
        throw new DatabaseError('Запись уже существует', 'DUPLICATE', error);
      case '23503':
        throw new DatabaseError('Нарушение внешнего ключа', 'FOREIGN_KEY', error);
      case '23514':
        throw new DatabaseError('Нарушение ограничения', 'CHECK_VIOLATION', error);
      default:
        throw new DatabaseError(error.message || 'Ошибка базы данных', error.code, error);
    }
  }
  
  throw new DatabaseError(error.message || 'Неизвестная ошибка базы данных', 'UNKNOWN', error);
};

// Типы для экспорта
export type Bank = Database['public']['Tables']['banks']['Row'];
export type BankInsert = Database['public']['Tables']['banks']['Insert'];
export type BankUpdate = Database['public']['Tables']['banks']['Update'];

export type BankProduct = Database['public']['Tables']['bank_products']['Row'];
export type BankProductInsert = Database['public']['Tables']['bank_products']['Insert'];
export type BankProductUpdate = Database['public']['Tables']['bank_products']['Update'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type Recommendation = Database['public']['Tables']['recommendations']['Row'];
export type RecommendationInsert = Database['public']['Tables']['recommendations']['Insert'];
export type RecommendationUpdate = Database['public']['Tables']['recommendations']['Update'];

export type Comparison = Database['public']['Tables']['comparisons']['Row'];
export type ComparisonInsert = Database['public']['Tables']['comparisons']['Insert'];
export type ComparisonUpdate = Database['public']['Tables']['comparisons']['Update'];

export type ReferralAnalytics = Database['public']['Tables']['referral_analytics']['Row'];
export type ReferralAnalyticsInsert = Database['public']['Tables']['referral_analytics']['Insert'];
export type ReferralAnalyticsUpdate = Database['public']['Tables']['referral_analytics']['Update'];
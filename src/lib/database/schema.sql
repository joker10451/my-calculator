-- Схема базы данных для системы сравнения и рекомендаций банковских продуктов
-- PostgreSQL (Supabase) Schema

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Таблица банков
CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  
  -- Рейтинги
  overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  customer_service_rating DECIMAL(3,2) CHECK (customer_service_rating >= 0 AND customer_service_rating <= 5),
  reliability_rating DECIMAL(3,2) CHECK (reliability_rating >= 0 AND reliability_rating <= 5),
  processing_speed_rating DECIMAL(3,2) CHECK (processing_speed_rating >= 0 AND processing_speed_rating <= 5),
  
  -- Контактная информация
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  
  -- Лицензии и регулирование
  license_number VARCHAR(50),
  central_bank_code VARCHAR(20),
  
  -- Партнерство
  is_partner BOOLEAN DEFAULT false,
  commission_rate DECIMAL(5,2) CHECK (commission_rate >= 0 AND commission_rate <= 100),
  referral_terms TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT banks_name_unique UNIQUE (name),
  CONSTRAINT banks_short_name_unique UNIQUE (short_name)
);

-- Таблица банковских продуктов
CREATE TABLE bank_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  product_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Основные параметры
  interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0),
  min_amount DECIMAL(15,2) CHECK (min_amount >= 0),
  max_amount DECIMAL(15,2) CHECK (max_amount >= min_amount OR max_amount IS NULL),
  min_term INTEGER CHECK (min_term > 0), -- в месяцах
  max_term INTEGER CHECK (max_term >= min_term OR max_term IS NULL),
  
  -- Комиссии и условия (JSON)
  fees JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  features JSONB DEFAULT '{}',
  
  -- Промо-условия
  promotional_rate DECIMAL(5,2) CHECK (promotional_rate >= 0),
  promo_valid_until DATE,
  promo_conditions TEXT,
  
  -- Региональность
  available_regions TEXT[] DEFAULT ARRAY['all'],
  
  -- Метаданные
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_product_type CHECK (product_type IN ('mortgage', 'deposit', 'credit', 'insurance')),
  CONSTRAINT bank_products_name_bank_unique UNIQUE (bank_id, name)
);

-- Таблица пользовательских профилей
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  
  -- Финансовая информация
  monthly_income DECIMAL(12,2) CHECK (monthly_income >= 0),
  credit_score INTEGER CHECK (credit_score >= 300 AND credit_score <= 850),
  employment_type VARCHAR(50),
  region VARCHAR(100),
  age_range VARCHAR(20),
  
  -- Предпочтения
  risk_tolerance VARCHAR(20) CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  preferred_banks UUID[],
  blacklisted_banks UUID[],
  
  -- История расчетов (JSON)
  calculation_history JSONB DEFAULT '[]',
  product_interests TEXT[] DEFAULT '{}',
  
  -- Поведенческие данные
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id),
  CONSTRAINT valid_employment_type CHECK (employment_type IN ('employee', 'self_employed', 'unemployed', 'retired', 'student'))
);

-- Таблица рекомендаций
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES bank_products(id) ON DELETE CASCADE,
  
  -- Параметры рекомендации
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  reasoning TEXT[],
  context JSONB DEFAULT '{}',
  
  -- Взаимодействие пользователя
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clicked_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  applied_at TIMESTAMP WITH TIME ZONE,
  
  -- Реферальная информация
  referral_link TEXT,
  referral_id UUID,
  commission_potential DECIMAL(10,2) CHECK (commission_potential >= 0),
  
  -- Метаданные
  recommendation_type VARCHAR(50) DEFAULT 'automatic',
  source VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_recommendation_type CHECK (recommendation_type IN ('automatic', 'manual', 'promoted')),
  CONSTRAINT valid_source CHECK (source IN ('calculator', 'comparison', 'profile', 'blog'))
);

-- Таблица сравнений
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  
  -- Сравниваемые продукты
  product_ids UUID[] NOT NULL,
  comparison_criteria JSONB DEFAULT '{}',
  
  -- Результаты
  comparison_matrix JSONB,
  highlighted_products UUID[],
  
  -- Взаимодействие
  saved_at TIMESTAMP WITH TIME ZONE,
  shared_at TIMESTAMP WITH TIME ZONE,
  bookmark_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT comparisons_min_products CHECK (array_length(product_ids, 1) >= 2)
);

-- Таблица реферальной аналитики
CREATE TABLE referral_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL,
  user_id UUID,
  product_id UUID NOT NULL REFERENCES bank_products(id) ON DELETE CASCADE,
  bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  
  -- События
  event_type VARCHAR(50) NOT NULL,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Контекст
  source VARCHAR(50),
  campaign VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  
  -- Финансовые данные
  potential_commission DECIMAL(10,2) CHECK (potential_commission >= 0),
  actual_commission DECIMAL(10,2) CHECK (actual_commission >= 0),
  commission_status VARCHAR(20) DEFAULT 'pending',
  
  -- Метаданные
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_event_type CHECK (event_type IN ('click', 'view', 'apply', 'approve', 'fund')),
  CONSTRAINT valid_commission_status CHECK (commission_status IN ('pending', 'confirmed', 'paid', 'cancelled'))
);

-- Индексы для оптимизации производительности

-- Индексы для банков
CREATE INDEX idx_banks_is_partner ON banks(is_partner);
CREATE INDEX idx_banks_overall_rating ON banks(overall_rating DESC);

-- Индексы для продуктов
CREATE INDEX idx_bank_products_bank_id ON bank_products(bank_id);
CREATE INDEX idx_bank_products_type ON bank_products(product_type);
CREATE INDEX idx_bank_products_active ON bank_products(is_active);
CREATE INDEX idx_bank_products_featured ON bank_products(is_featured);
CREATE INDEX idx_bank_products_rate ON bank_products(interest_rate);
CREATE INDEX idx_bank_products_regions ON bank_products USING GIN(available_regions);
CREATE INDEX idx_bank_products_search ON bank_products USING GIN(to_tsvector('russian', name || ' ' || COALESCE(description, '')));

-- Индексы для пользовательских профилей
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_region ON user_profiles(region);
CREATE INDEX idx_user_profiles_last_active ON user_profiles(last_active DESC);

-- Индексы для рекомендаций
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_product_id ON recommendations(product_id);
CREATE INDEX idx_recommendations_score ON recommendations(score DESC);
CREATE INDEX idx_recommendations_shown_at ON recommendations(shown_at DESC);
CREATE INDEX idx_recommendations_source ON recommendations(source);

-- Индексы для сравнений
CREATE INDEX idx_comparisons_user_id ON comparisons(user_id);
CREATE INDEX idx_comparisons_created_at ON comparisons(created_at DESC);
CREATE INDEX idx_comparisons_product_ids ON comparisons USING GIN(product_ids);

-- Индексы для аналитики
CREATE INDEX idx_referral_analytics_referral_id ON referral_analytics(referral_id);
CREATE INDEX idx_referral_analytics_user_id ON referral_analytics(user_id);
CREATE INDEX idx_referral_analytics_product_id ON referral_analytics(product_id);
CREATE INDEX idx_referral_analytics_bank_id ON referral_analytics(bank_id);
CREATE INDEX idx_referral_analytics_event_type ON referral_analytics(event_type);
CREATE INDEX idx_referral_analytics_timestamp ON referral_analytics(event_timestamp DESC);
CREATE INDEX idx_referral_analytics_commission_status ON referral_analytics(commission_status);

-- Функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_products_updated_at BEFORE UPDATE ON bank_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparisons_updated_at BEFORE UPDATE ON comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) политики для безопасности
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_analytics ENABLE ROW LEVEL SECURITY;

-- Политики для публичного доступа к банкам и продуктам
CREATE POLICY "Banks are viewable by everyone" ON banks FOR SELECT USING (true);
CREATE POLICY "Bank products are viewable by everyone" ON bank_products FOR SELECT USING (is_active = true);

-- Политики для пользовательских данных (пользователи видят только свои данные)
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own comparisons" ON comparisons FOR SELECT USING (auth.uid()::text = user_id::text);

-- Политики для аналитики (только для администраторов)
CREATE POLICY "Only admins can view analytics" ON referral_analytics FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id::text = auth.uid()::text 
    AND (calculation_history->>'is_admin')::boolean = true
  )
);
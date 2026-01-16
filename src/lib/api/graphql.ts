// GraphQL схема и резолверы для системы сравнения и рекомендаций
// Используется для гибких запросов данных

import { banksController, productsController, comparisonController } from './server';
import type { PaginationInput, ProductFilters, ComparisonInput, GraphQLContext } from '../../types/graphql';

// GraphQL схема в виде строки (SDL)
export const typeDefs = `
  scalar JSON
  scalar DateTime

  type Bank {
    id: ID!
    name: String!
    shortName: String!
    logoUrl: String
    websiteUrl: String
    overallRating: Float
    customerServiceRating: Float
    reliabilityRating: Float
    processingSpeedRating: Float
    phone: String
    email: String
    address: String
    licenseNumber: String
    centralBankCode: String
    isPartner: Boolean!
    commissionRate: Float
    referralTerms: String
    createdAt: DateTime!
    updatedAt: DateTime!
    products: [BankProduct!]!
  }

  type BankProduct {
    id: ID!
    bankId: ID!
    productType: ProductType!
    name: String!
    description: String
    interestRate: Float!
    minAmount: Float
    maxAmount: Float
    minTerm: Int
    maxTerm: Int
    fees: JSON
    requirements: JSON
    features: JSON
    promotionalRate: Float
    promoValidUntil: DateTime
    promoConditions: String
    availableRegions: [String!]!
    isActive: Boolean!
    isFeatured: Boolean!
    priority: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    bank: Bank!
  }

  type UserProfile {
    id: ID!
    userId: ID!
    monthlyIncome: Float
    creditScore: Int
    employmentType: String
    region: String
    ageRange: String
    riskTolerance: RiskTolerance
    preferredBanks: [ID!]!
    blacklistedBanks: [ID!]!
    calculationHistory: [JSON!]!
    productInterests: [String!]!
    lastActive: DateTime!
    sessionCount: Int!
    conversionCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Recommendation {
    id: ID!
    userId: ID!
    productId: ID!
    score: Float!
    reasoning: [String!]!
    context: JSON!
    shownAt: DateTime!
    clickedAt: DateTime
    dismissedAt: DateTime
    appliedAt: DateTime
    referralLink: String
    referralId: ID
    commissionPotential: Float
    recommendationType: RecommendationType!
    source: RecommendationSource
    createdAt: DateTime!
    product: BankProduct!
  }

  type Comparison {
    id: ID!
    userId: ID
    productIds: [ID!]!
    comparisonCriteria: JSON!
    comparisonMatrix: JSON
    highlightedProducts: [ID!]!
    savedAt: DateTime
    sharedAt: DateTime
    bookmarkId: ID
    createdAt: DateTime!
    updatedAt: DateTime!
    products: [BankProduct!]!
  }

  type ComparisonResult {
    products: [BankProduct!]!
    matrix: ComparisonMatrix!
    highlights: JSON!
    timestamp: DateTime!
  }

  type ComparisonMatrix {
    headers: [String!]!
    rows: [ComparisonRow!]!
  }

  type ComparisonRow {
    productId: ID!
    bank: String!
    product: String!
    interestRate: Float!
    minAmount: Float
    maxAmount: Float
    term: String!
    fees: Int!
    bankRating: Float
  }

  type ReferralAnalytics {
    id: ID!
    referralId: ID!
    userId: ID
    productId: ID!
    bankId: ID!
    eventType: EventType!
    eventTimestamp: DateTime!
    source: String
    campaign: String
    userAgent: String
    ipAddress: String
    potentialCommission: Float
    actualCommission: Float
    commissionStatus: CommissionStatus!
    metadata: JSON!
    createdAt: DateTime!
  }

  enum ProductType {
    MORTGAGE
    DEPOSIT
    CREDIT
    INSURANCE
  }

  enum RiskTolerance {
    LOW
    MEDIUM
    HIGH
  }

  enum RecommendationType {
    AUTOMATIC
    MANUAL
    PROMOTED
  }

  enum RecommendationSource {
    CALCULATOR
    COMPARISON
    PROFILE
    BLOG
  }

  enum EventType {
    CLICK
    VIEW
    APPLY
    APPROVE
    FUND
  }

  enum CommissionStatus {
    PENDING
    CONFIRMED
    PAID
    CANCELLED
  }

  input ProductFilters {
    productType: ProductType
    bankId: ID
    region: String
    minRate: Float
    maxRate: Float
    minAmount: Float
    maxAmount: Float
    isActive: Boolean
    isFeatured: Boolean
  }

  input PaginationInput {
    page: Int
    limit: Int
    offset: Int
  }

  input ComparisonInput {
    productIds: [ID!]!
    userId: ID
  }

  type Query {
    # Банки
    banks(pagination: PaginationInput): [Bank!]!
    bank(id: ID!): Bank
    partnerBanks: [Bank!]!

    # Продукты
    products(filters: ProductFilters, pagination: PaginationInput): [BankProduct!]!
    product(id: ID!): BankProduct
    featuredProducts(productType: ProductType): [BankProduct!]!

    # Сравнения
    compareProducts(input: ComparisonInput!): ComparisonResult!
    userComparisons(userId: ID!, pagination: PaginationInput): [Comparison!]!

    # Рекомендации
    userRecommendations(userId: ID!, pagination: PaginationInput): [Recommendation!]!

    # Профили пользователей
    userProfile(userId: ID!): UserProfile

    # Аналитика
    referralAnalytics(
      referralId: ID
      userId: ID
      productId: ID
      bankId: ID
      eventType: EventType
      pagination: PaginationInput
    ): [ReferralAnalytics!]!
  }

  type Mutation {
    # Создание и обновление профиля пользователя
    createUserProfile(input: CreateUserProfileInput!): UserProfile!
    updateUserProfile(userId: ID!, input: UpdateUserProfileInput!): UserProfile!

    # Сохранение сравнений
    saveComparison(input: SaveComparisonInput!): Comparison!

    # Отслеживание взаимодействий
    trackRecommendationClick(recommendationId: ID!): Boolean!
    trackRecommendationDismiss(recommendationId: ID!): Boolean!
    trackRecommendationApply(recommendationId: ID!): Boolean!

    # Реферальная аналитика
    trackReferralEvent(input: TrackReferralEventInput!): ReferralAnalytics!
  }

  input CreateUserProfileInput {
    userId: ID!
    monthlyIncome: Float
    creditScore: Int
    employmentType: String
    region: String
    ageRange: String
    riskTolerance: RiskTolerance
    preferredBanks: [ID!]
    blacklistedBanks: [ID!]
    productInterests: [String!]
  }

  input UpdateUserProfileInput {
    monthlyIncome: Float
    creditScore: Int
    employmentType: String
    region: String
    ageRange: String
    riskTolerance: RiskTolerance
    preferredBanks: [ID!]
    blacklistedBanks: [ID!]
    productInterests: [String!]
  }

  input SaveComparisonInput {
    userId: ID
    productIds: [ID!]!
    comparisonCriteria: JSON
    highlightedProducts: [ID!]
  }

  input TrackReferralEventInput {
    referralId: ID!
    userId: ID
    productId: ID!
    bankId: ID!
    eventType: EventType!
    source: String
    campaign: String
    userAgent: String
    ipAddress: String
    potentialCommission: Float
    actualCommission: Float
    metadata: JSON
  }
`;

// GraphQL резолверы
export const resolvers = {
  Query: {
    // Банки
    banks: async (_: unknown, { pagination }: { pagination?: PaginationInput }) => {
      const result = await banksController.getAllBanks(pagination);
      return result.success ? result.data : [];
    },

    bank: async (_: unknown, { id }: { id: string }) => {
      const result = await banksController.getBankById(id);
      return result.success ? result.data : null;
    },

    partnerBanks: async () => {
      const result = await banksController.getPartnerBanks();
      return result.success ? result.data : [];
    },

    // Продукты
    products: async (_: unknown, { filters, pagination }: { filters?: ProductFilters; pagination?: PaginationInput }) => {
      const result = await productsController.getProducts(filters, pagination);
      return result.success ? result.data : [];
    },

    product: async (_: unknown, { id }: { id: string }) => {
      const result = await productsController.getProductById(id);
      return result.success ? result.data : null;
    },

    featuredProducts: async (_: unknown, { productType }: { productType?: string }) => {
      const result = await productsController.getFeaturedProducts(productType?.toLowerCase());
      return result.success ? result.data : [];
    },

    // Сравнения
    compareProducts: async (_: unknown, { input }: { input: ComparisonInput }) => {
      const result = await comparisonController.compareProducts(input.productIds, input.userId);
      if (!result.success) {
        throw new Error(result.error || 'Ошибка сравнения продуктов');
      }
      return result.data;
    },

    // Заглушки для других запросов (будут реализованы в следующих задачах)
    userComparisons: async () => [],
    userRecommendations: async () => [],
    userProfile: async () => null,
    referralAnalytics: async () => []
  },

  Mutation: {
    // Заглушки для мутаций (будут реализованы в следующих задачах)
    createUserProfile: async () => {
      throw new Error('Не реализовано');
    },
    updateUserProfile: async () => {
      throw new Error('Не реализовано');
    },
    saveComparison: async () => {
      throw new Error('Не реализовано');
    },
    trackRecommendationClick: async () => false,
    trackRecommendationDismiss: async () => false,
    trackRecommendationApply: async () => false,
    trackReferralEvent: async () => {
      throw new Error('Не реализовано');
    }
  },

  // Резолверы для связанных полей
  Bank: {
    products: async (parent: { id: string }) => {
      const result = await productsController.getProducts({ bankId: parent.id });
      return result.success ? result.data : [];
    }
  },

  BankProduct: {
    bank: async (parent: { bank_id: string }) => {
      const result = await banksController.getBankById(parent.bank_id);
      return result.success ? result.data : null;
    }
  },

  Recommendation: {
    product: async (parent: { product_id: string }) => {
      const result = await productsController.getProductById(parent.product_id);
      return result.success ? result.data : null;
    }
  },

  Comparison: {
    products: async (parent: { product_ids: string[] }) => {
      const results = await Promise.all(
        parent.product_ids.map((id: string) => productsController.getProductById(id))
      );
      return results
        .filter(result => result.success)
        .map(result => result.data);
    }
  }
};

// Утилита для создания GraphQL контекста
export const createGraphQLContext = (req?: unknown): GraphQLContext => {
  return {
    // Здесь можно добавить пользователя, права доступа и т.д.
    user: req?.user || null,
    ip: req?.ip || null,
    userAgent: req?.get?.('User-Agent') || null
  };
};

// Типы для TypeScript
export interface GraphQLContext {
  user?: { id: string; email?: string };
  ip?: string;
  userAgent?: string;
}
// Типы для GraphQL резолверов

export interface GraphQLContext {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  ip?: string;
  userAgent?: string;
  req?: unknown;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface ProductFilters {
  productType?: string;
  bankId?: string;
  region?: string;
  minRate?: number;
  maxRate?: number;
  minAmount?: number;
  maxAmount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface ComparisonInput {
  productIds: string[];
  userId?: string;
}

export interface GraphQLResolverArgs<T = Record<string, unknown>> {
  _parent?: unknown;
  args: T;
  context?: GraphQLContext;
}

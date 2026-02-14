# Design Document: API Integration Fixes

## Overview

This design document outlines the implementation of critical fixes for API integration issues, PDF generation errors, and missing client implementations in the Считай.RU calculator system. The solution addresses CORS errors, PNG signature issues in PDF generation, and implements the missing Pravo.gov.ru client while establishing robust error handling and fallback mechanisms.

## Architecture

The enhanced system follows a resilient architecture with multiple layers of error handling and fallback mechanisms:

```
┌─────────────────────────────────────────┐
│           UI Components Layer           │
│     (Error Display, Loading States)     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Service Layer                   │
│  (PDF Service, API Manager, Cache)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       API Client Layer                  │
│ (CORS Proxy, Pravo Client, Error       │
│  Handler, Circuit Breaker)              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       External Services                 │
│ (data.gov.ru, pravo.gov.ru, CORS       │
│  Proxy Service)                         │
└─────────────────────────────────────────┘
```

## Components and Interfaces

### 1. CORS Proxy Integration

```typescript
interface CorsProxyConfig {
  proxyUrl: string;
  fallbackProxies: string[];
  timeout: number;
  retryAttempts: number;
}

interface CorsProxyClient {
  makeProxiedRequest<T>(originalUrl: string, options?: RequestInit): Promise<ApiResponse<T>>;
  testProxyAvailability(proxyUrl: string): Promise<boolean>;
  selectBestProxy(): Promise<string | null>;
}
```

### 2. Enhanced PDF Generator

```typescript
interface PdfGenerationOptions {
  quality: 'low' | 'medium' | 'high';
  fallbackFormat: 'html' | 'text' | 'json';
  validateImages: boolean;
  skipCorruptedImages: boolean;
  maxRetries: number;
}

interface ImageValidator {
  validateImageData(imageData: string): Promise<boolean>;
  repairImageData(imageData: string): Promise<string | null>;
  generateFallbackImage(width: number, height: number): string;
}

interface PdfService {
  exportToPDF(elementId: string, filename: string, options?: PdfGenerationOptions): Promise<PdfResult>;
  exportToAlternativeFormat(elementId: string, format: 'html' | 'text'): Promise<string>;
  validatePdfOutput(pdfData: Uint8Array): Promise<boolean>;
}

interface PdfResult {
  success: boolean;
  filename?: string;
  error?: string;
  fallbackFormat?: string;
  fallbackData?: string;
}
```

### 3. Pravo.gov.ru Client Implementation

```typescript
interface PravoGovRuClient extends ApiSourceClient {
  searchLegalDocuments(query: string, filters?: LegalSearchFilters): Promise<ApiResponse<LegalDocumentData[]>>;
  getDocumentById(documentId: string): Promise<ApiResponse<LegalDocumentData>>;
  getTaxCodeArticles(articleNumbers: string[]): Promise<ApiResponse<LegalArticle[]>>;
  getCourtFeeRegulations(): Promise<ApiResponse<CourtFeeRegulation[]>>;
  subscribeToUpdates(callback: (update: LegalUpdate) => void): void;
}

interface LegalSearchFilters {
  documentType?: 'law' | 'code' | 'regulation';
  dateFrom?: Date;
  dateTo?: Date;
  status?: 'active' | 'amended' | 'repealed';
  organization?: string;
}

interface CourtFeeRegulation {
  id: string;
  title: string;
  articleNumber: string;
  content: string;
  feeRules: CourtFeeApiRule[];
  lastModified: Date;
}

interface LegalUpdate {
  documentId: string;
  changeType: 'created' | 'modified' | 'repealed';
  timestamp: Date;
  summary: string;
}
```

### 4. Circuit Breaker Pattern

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringWindow: number;
}

interface CircuitBreaker {
  execute<T>(operation: () => Promise<T>): Promise<T>;
  getState(): 'closed' | 'open' | 'half-open';
  getFailureCount(): number;
  reset(): void;
}
```

### 5. Enhanced Error Handler

```typescript
interface ApiError {
  type: 'network' | 'cors' | 'authentication' | 'rate_limit' | 'server' | 'data_format';
  message: string;
  originalError?: Error;
  source: ApiSourceType;
  timestamp: Date;
  retryable: boolean;
}

interface ErrorRecoveryStrategy {
  canRecover(error: ApiError): boolean;
  recover(error: ApiError, context: any): Promise<any>;
  getRecoveryDelay(attemptNumber: number): number;
}

interface EnhancedErrorHandler {
  handleApiError(error: ApiError): Promise<ApiResponse<any>>;
  registerRecoveryStrategy(errorType: string, strategy: ErrorRecoveryStrategy): void;
  logError(error: ApiError, context?: any): void;
  getErrorStatistics(): ErrorStatistics;
}

interface ErrorStatistics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySource: Record<ApiSourceType, number>;
  recoverySuccessRate: number;
}
```

## Data Models

### Enhanced API Response Model
```typescript
interface EnhancedApiResponse<T> extends ApiResponse<T> {
  retryCount: number;
  responseTime: number;
  proxyUsed?: string;
  fallbackUsed: boolean;
  dataFreshness: 'fresh' | 'cached' | 'stale';
  warnings?: string[];
}
```

### CORS Proxy Response
```typescript
interface ProxyResponse<T> {
  success: boolean;
  data?: T;
  originalUrl: string;
  proxyUrl: string;
  headers: Record<string, string>;
  statusCode: number;
  responseTime: number;
}
```

### PDF Generation Result
```typescript
interface PdfGenerationResult {
  success: boolean;
  outputPath?: string;
  fileSize?: number;
  generationTime: number;
  imagesProcessed: number;
  imagesSkipped: number;
  warnings: string[];
  error?: string;
}
```

## Error Handling

### Error Classification and Recovery

1. **CORS Errors**
   - **Detection**: Failed fetch with CORS-related error messages
   - **Recovery**: Automatic proxy selection and retry
   - **Fallback**: Use cached data or default values

2. **PDF Generation Errors**
   - **Detection**: PNG signature errors, canvas rendering failures
   - **Recovery**: Image validation and repair, fallback images
   - **Fallback**: Alternative export formats (HTML, text)

3. **Network Errors**
   - **Detection**: Timeout, connection refused, DNS failures
   - **Recovery**: Exponential backoff retry with circuit breaker
   - **Fallback**: Cached data with staleness warnings

4. **Data Format Errors**
   - **Detection**: JSON parsing errors, schema validation failures
   - **Recovery**: Data transformation and normalization
   - **Fallback**: Default data structures

### Circuit Breaker Implementation

```typescript
class ApiCircuitBreaker implements CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime?: Date;
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private shouldAttemptReset(): boolean {
    return this.lastFailureTime && 
           Date.now() - this.lastFailureTime.getTime() > this.config.recoveryTimeout;
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }
}
```

## Testing Strategy

### Unit Testing Approach

**Testing Framework**: Vitest with MSW (Mock Service Worker) for API mocking
**Coverage Requirements**: 90% for critical error handling paths

**Test Categories**:
1. **CORS Proxy Tests**: Verify proxy selection and fallback mechanisms
2. **PDF Generation Tests**: Test image validation and error recovery
3. **Circuit Breaker Tests**: Verify state transitions and recovery logic
4. **Error Handler Tests**: Test error classification and recovery strategies
5. **Integration Tests**: End-to-end API failure scenarios

### Property-Based Testing Configuration

**Library**: fast-check
**Minimum iterations**: 100 per property test
**Test tagging format**: `Feature: api-integration-fixes, Property {number}: {property_text}`

### Dual Testing Approach
- **Unit tests**: Verify specific error scenarios and recovery mechanisms
- **Property tests**: Verify universal error handling properties across all inputs
- **Integration tests**: Test real API interactions with fallback scenarios

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

<function_calls>
<invoke name="prework">
<parameter name="featureName">api-integration-fixes

### Property 1: CORS Proxy Fallback
*For any* API request that encounters CORS restrictions, the system should automatically use a proxy service and successfully complete the request
**Validates: Requirements 1.1, 1.2**

### Property 2: Exponential Backoff Retry
*For any* failed API request, the retry delays should follow an exponential backoff pattern with each subsequent retry having a longer delay
**Validates: Requirements 1.3**

### Property 3: Fallback to Cache After Retries
*For any* API request that fails after all retry attempts are exhausted, the system should use cached data as fallback
**Validates: Requirements 1.4**

### Property 4: Comprehensive Request Logging
*For any* API request attempt (successful or failed), the system should generate appropriate log entries with request details and outcomes
**Validates: Requirements 1.5**

### Property 5: Network Recovery Detection
*For any* network connectivity restoration event, the system should automatically resume normal API operations without manual intervention
**Validates: Requirements 1.6**

### Property 6: Valid PDF Generation
*For any* valid content input, the PDF generator should create a valid PDF document without PNG signature errors or corruption
**Validates: Requirements 2.1**

### Property 7: Image Corruption Handling
*For any* corrupted or unavailable image resource during PDF generation, the system should use fallback images or skip problematic images gracefully
**Validates: Requirements 2.2**

### Property 8: Image Validation Before Processing
*For any* image resource processed during PDF generation, validation should occur before including it in the final PDF
**Validates: Requirements 2.3**

### Property 9: Clear PDF Error Messages
*For any* PDF generation failure, the system should provide clear, actionable error messages to the user
**Validates: Requirements 2.4**

### Property 10: Alternative Export Format Support
*For any* content that cannot be converted to PDF, the system should successfully export it in alternative formats (HTML, text)
**Validates: Requirements 2.5**

### Property 11: PDF Output Integrity Verification
*For any* successfully generated PDF, the system should verify the output file integrity before presenting it to the user
**Validates: Requirements 2.6**

### Property 12: Pravo Client Interface Completeness
*For any* type of legal document request, the Pravo.gov.ru client should provide appropriate methods for fetching and processing the data
**Validates: Requirements 3.1**

### Property 13: Legal Data Authentication and Retrieval
*For any* legal data request, the Pravo.gov.ru client should successfully authenticate and retrieve information from the API
**Validates: Requirements 3.2**

### Property 14: Legal Data Validation
*For any* legal data received from Pravo.gov.ru, the system should parse and validate it before using it in calculations
**Validates: Requirements 3.3**

### Property 15: Legal Data Cache Fallback
*For any* Pravo.gov.ru API unavailability scenario, the client should use cached legal data as fallback
**Validates: Requirements 3.4**

### Property 16: Automatic Legal Data Updates
*For any* new version of legal data available, the Pravo.gov.ru client should automatically update the cached data
**Validates: Requirements 3.5**

### Property 17: Structured Legal Data Access
*For any* type of legal data (tax rates, thresholds, regulatory changes), the Pravo.gov.ru client should provide structured access methods
**Validates: Requirements 3.6**

### Property 18: Universal API Fallback
*For any* external API unavailability scenario, the fallback system should provide cached or default data to maintain functionality
**Validates: Requirements 4.1**

### Property 19: Error Type Classification
*For any* error that occurs in the system, the error handler should correctly categorize it by type (network, authentication, data format, server errors)
**Validates: Requirements 4.2**

### Property 20: Data Freshness Messaging
*For any* critical data fetch failure, the error handler should display informative messages about data freshness and availability
**Validates: Requirements 4.3**

### Property 21: Cache Metadata Completeness
*For any* API response stored in cache, the cache manager should include timestamps and expiration dates
**Validates: Requirements 4.4**

### Property 22: Automatic Cache Refresh
*For any* cached data older than the acceptable threshold, the cache manager should attempt to refresh it automatically
**Validates: Requirements 4.5**

### Property 23: Circuit Breaker Pattern Implementation
*For any* sequence of failures, the error handler should implement circuit breaker pattern to prevent cascading failures
**Validates: Requirements 4.6**

### Property 24: API Performance Requirements
*For any* standard API operation, the system should complete data fetching requests within 5 seconds
**Validates: Requirements 5.1**

### Property 25: Loading Indicator Display
*For any* slow API response, the system should show loading indicators to provide user feedback
**Validates: Requirements 5.2**

### Property 26: Request Deduplication
*For any* set of identical API requests, the system should implement deduplication to avoid multiple unnecessary requests
**Validates: Requirements 5.3**

### Property 27: Parallel API Execution
*For any* scenario requiring multiple API calls, the system should execute them in parallel where possible to optimize performance
**Validates: Requirements 5.4**

### Property 28: Intelligent Caching Strategy
*For any* API usage pattern, the cache manager should implement intelligent caching strategies to minimize API calls
**Validates: Requirements 5.5**

### Property 29: Dynamic Timeout Adjustment
*For any* API response time pattern, the system should monitor response times and adjust timeout values dynamically
**Validates: Requirements 5.6**

### Property 30: Data Schema Validation
*For any* data received from external APIs, the system should validate it against expected schemas before using it
**Validates: Requirements 6.1**

### Property 31: Format Change Detection
*For any* API data format change, the system should detect incompatibilities and handle them gracefully
**Validates: Requirements 6.2**

### Property 32: Data Integrity Verification
*For any* data with available integrity information (checksums, version numbers), the system should verify data integrity
**Validates: Requirements 6.3**

### Property 33: Corrupted Data Rejection
*For any* corrupted data detected, the system should reject it and use fallback data instead
**Validates: Requirements 6.4**

### Property 34: Validation Failure Logging
*For any* data validation failure, the system should log detailed error information for debugging purposes
**Validates: Requirements 6.5**

### Property 35: Data Format Normalization
*For any* API response format variation, the system should implement data transformation layers to normalize different formats
**Validates: Requirements 6.6**

## Implementation Guidelines

### CORS Proxy Setup
- **Primary Proxy**: Use a reliable CORS proxy service (e.g., cors-anywhere, allorigins.win)
- **Fallback Proxies**: Configure multiple proxy services for redundancy
- **Proxy Health Monitoring**: Implement health checks for proxy services
- **Request Routing**: Intelligent proxy selection based on availability and performance

### PDF Generation Enhancement
- **Image Validation**: Implement comprehensive image format validation
- **Error Recovery**: Multiple fallback strategies for image processing failures
- **Alternative Formats**: Support for HTML and text export as PDF alternatives
- **Quality Control**: PDF integrity verification using PDF parsing libraries

### Pravo.gov.ru Integration
- **API Exploration**: Reverse engineer the Pravo.gov.ru API endpoints
- **Authentication**: Implement any required authentication mechanisms
- **Data Parsing**: Handle various response formats (HTML, XML, JSON)
- **Rate Limiting**: Respect API rate limits and implement backoff strategies

### Error Handling Strategy
- **Error Classification**: Systematic categorization of all error types
- **Recovery Mechanisms**: Specific recovery strategies for each error category
- **Circuit Breaker**: Prevent system overload during widespread failures
- **Graceful Degradation**: Maintain core functionality even during partial failures

### Performance Optimization
- **Request Batching**: Combine multiple API requests where possible
- **Intelligent Caching**: Cache strategies based on data volatility
- **Parallel Processing**: Concurrent API requests for independent data
- **Timeout Management**: Dynamic timeout adjustment based on historical performance

This design ensures robust, fault-tolerant API integration with comprehensive error handling, fallback mechanisms, and performance optimization while maintaining data integrity and user experience quality.
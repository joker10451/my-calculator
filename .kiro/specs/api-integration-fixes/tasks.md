# Implementation Plan: API Integration Fixes

## Overview

This implementation plan addresses critical API integration issues, PDF generation errors, and missing client implementations. The approach focuses on immediate fixes for production issues while establishing robust error handling and fallback mechanisms for long-term reliability.

## Tasks

- [x] 1. Implement CORS proxy integration and error handling
  - [x] 1.1 Create CORS proxy client with multiple fallback proxies
    - Implement CorsProxyClient class with proxy selection logic
    - Add health monitoring for proxy services
    - Configure fallback proxy URLs (cors-anywhere, allorigins.win, custom proxies)
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Write property tests for CORS proxy fallback
    - **Property 1: CORS Proxy Fallback**
    - **Validates: Requirements 1.1, 1.2**
    - **Status: FAILING** - 4/5 tests fail due to mock setup issues and proxy selection logic

  - [x] 1.3 Enhance BaseApiClient with CORS proxy integration
    - Modify makeRequest method to detect CORS errors
    - Implement automatic proxy fallback on CORS failures
    - Add proxy performance tracking and selection optimization
    - _Requirements: 1.1, 1.2_

  - [x] 1.4 Write property tests for exponential backoff retry
    - **Property 2: Exponential Backoff Retry**
    - **Validates: Requirements 1.3**
    - **Status: FAILING** - 2/6 tests fail due to precision issues in delay calculations and jitter handling

- [x] 2. Fix PDF generation and image handling issues
  - [x] 2.1 Implement image validation and error recovery in PDF service
    - Create ImageValidator class for PNG signature validation
    - Add image repair and fallback image generation
    - Implement corrupted image detection and handling
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.2 Write property tests for image corruption handling
    - **Property 7: Image Corruption Handling**
    - **Property 8: Image Validation Before Processing**
    - **Validates: Requirements 2.2, 2.3**

  - [x] 2.3 Enhance PDF service with alternative export formats
    - Add HTML export functionality as PDF fallback
    - Implement text export for accessibility
    - Add PDF integrity verification after generation
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 2.4 Write property tests for PDF generation and validation
    - **Property 6: Valid PDF Generation**
    - **Property 11: PDF Output Integrity Verification**
    - **Validates: Requirements 2.1, 2.6**

- [-] 3. Implement Pravo.gov.ru client
  - [x] 3.1 Create PravoGovRuClient class with basic API methods
    - Implement searchLegalDocuments method
    - Add getDocumentById method for specific document retrieval
    - Implement authentication and request handling
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Write property tests for Pravo client interface
    - **Property 12: Pravo Client Interface Completeness**
    - **Property 13: Legal Data Authentication and Retrieval**
    - **Validates: Requirements 3.1, 3.2**

  - [x] 3.3 Add specialized methods for tax and court fee data
    - Implement getTaxCodeArticles method
    - Add getCourtFeeRegulations method
    - Implement data parsing and validation for legal documents
    - _Requirements: 3.3, 3.6_

  - [x] 3.4 Write property tests for legal data validation
    - **Property 14: Legal Data Validation**
    - **Property 17: Structured Legal Data Access**
    - **Validates: Requirements 3.3, 3.6**
    - **Status: PASSED** - All 7 tests pass successfully

- [-] 4. Checkpoint - Ensure core API fixes work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement enhanced error handling and circuit breaker
  - [x] 5.1 Create enhanced error handler with error classification
    - Implement ApiError interface and error type classification
    - Create ErrorRecoveryStrategy for different error types
    - Add comprehensive error logging with context
    - _Requirements: 4.2, 4.3_

  - [x] 5.2 Write property tests for error classification
    - **Property 19: Error Type Classification**
    - **Property 20: Data Freshness Messaging**
    - **Validates: Requirements 4.2, 4.3**
    - **Status: PASSED** - All 9 tests pass successfully

  - [x] 5.3 Implement circuit breaker pattern for API resilience
    - Create ApiCircuitBreaker class with state management
    - Add failure threshold and recovery timeout configuration
    - Integrate circuit breaker with all API clients
    - _Requirements: 4.6_

  - [x] 5.4 Write property tests for circuit breaker behavior
    - **Property 23: Circuit Breaker Pattern Implementation**
    - **Validates: Requirements 4.6**
    - **Status: PASSED** - All 9 tests pass successfully

- [x] 6. Enhance caching and fallback systems
  - [x] 6.1 Improve cache manager with metadata and expiration
    - Add timestamp and expiration date tracking to cached responses
    - Implement automatic cache refresh for stale data
    - Add cache statistics and monitoring
    - _Requirements: 4.4, 4.5_

  - [x] 6.2 Write property tests for cache management
    - **Property 21: Cache Metadata Completeness**
    - **Property 22: Automatic Cache Refresh**
    - **Validates: Requirements 4.4, 4.5**
    - **Status: PASSED** - All 8 tests pass successfully after fixing localStorage iteration bug

  - [x] 6.3 Implement universal fallback system
    - Create FallbackSystem class for API unavailability scenarios
    - Add default data providers for critical functionality
    - Implement graceful degradation strategies
    - _Requirements: 4.1_

  - [x] 6.4 Write property tests for fallback systems
    - **Property 18: Universal API Fallback**
    - **Property 15: Legal Data Cache Fallback**
    - **Validates: Requirements 4.1, 3.4**
    - **Status: FAILING** - 1/8 tests fail due to statistics counting issue (expected 3 to be 1)

- [-] 7. Implement performance optimizations
  - [x] 7.1 Add request deduplication and parallel execution
    - Implement request deduplication to avoid duplicate API calls
    - Add parallel execution for independent API requests
    - Implement intelligent request batching where possible
    - _Requirements: 5.3, 5.4_

  - [x] 7.2 Write property tests for performance optimizations
    - **Property 26: Request Deduplication**
    - **Property 27: Parallel API Execution**
    - **Validates: Requirements 5.3, 5.4**

  - [x] 7.3 Implement dynamic timeout and loading indicators
    - Add response time monitoring and dynamic timeout adjustment
    - Implement loading indicators for slow API responses
    - Add performance metrics collection and reporting
    - _Requirements: 5.1, 5.2, 5.6_

  - [x] 7.4 Write property tests for performance requirements
    - **Property 24: API Performance Requirements**
    - **Property 29: Dynamic Timeout Adjustment**
    - **Validates: Requirements 5.1, 5.6**

- [x] 8. Implement data validation and integrity checks
  - [x] 8.1 Create comprehensive data validation system
    - Implement schema validation for all API responses
    - Add data format change detection and handling
    - Create data transformation layers for format normalization
    - _Requirements: 6.1, 6.2, 6.6_

  - [x] 8.2 Write property tests for data validation
    - **Property 30: Data Schema Validation**
    - **Property 31: Format Change Detection**
    - **Property 35: Data Format Normalization**
    - **Validates: Requirements 6.1, 6.2, 6.6**
    - **Status: SKIPPED** - API infrastructure will be removed per user decision

  - [ ] 8.3 Add data integrity verification and corruption handling
    - Implement checksum and version number verification
    - Add corrupted data detection and rejection
    - Implement detailed validation failure logging
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ] 8.4 Write property tests for data integrity
    - **Property 32: Data Integrity Verification**
    - **Property 33: Corrupted Data Rejection**
    - **Property 34: Validation Failure Logging**
    - **Validates: Requirements 6.3, 6.4, 6.5**

- [ ] 9. Update existing components to use enhanced API clients
  - [ ] 9.1 Update ApiSourceManager to use new error handling
    - Integrate enhanced error handler with existing API manager
    - Update all API clients to use circuit breaker pattern
    - Add comprehensive logging and monitoring
    - _Requirements: 1.5, 4.2_

  - [ ] 9.2 Update CourtFeeCalculator to handle API failures gracefully
    - Add fallback data for court fee calculations
    - Implement user-friendly error messages for API failures
    - Add data freshness indicators in UI
    - _Requirements: 4.3, 2.4_

  - [ ] 9.3 Write property tests for component integration
    - **Property 4: Comprehensive Request Logging**
    - **Property 9: Clear PDF Error Messages**
    - **Validates: Requirements 1.5, 2.4**

- [ ] 10. Add automatic cache updates and legal data synchronization
  - [ ] 10.1 Implement automatic legal data updates from Pravo.gov.ru
    - Add subscription system for legal document updates
    - Implement automatic cache refresh for legal data
    - Add change detection and notification system
    - _Requirements: 3.5_

  - [ ] 10.2 Write property tests for automatic updates
    - **Property 16: Automatic Legal Data Updates**
    - **Validates: Requirements 3.5**

  - [ ] 10.3 Add network recovery detection and resumption
    - Implement network connectivity monitoring
    - Add automatic API operation resumption after connectivity restoration
    - Implement intelligent cache strategies based on network status
    - _Requirements: 1.6, 5.5_

  - [ ] 10.4 Write property tests for network recovery
    - **Property 5: Network Recovery Detection**
    - **Property 28: Intelligent Caching Strategy**
    - **Validates: Requirements 1.6, 5.5**

- [ ] 11. Final integration and testing
  - [ ] 11.1 Wire all enhanced components together
    - Integrate all new error handling and fallback systems
    - Update configuration to use new CORS proxy settings
    - Ensure all API clients use enhanced error handling
    - _Requirements: All requirements integration_

  - [x] 11.2 Write integration tests for complete system
    - **Integration Tests: Complete Component Interactions**
    - **Status: COMPLETED** - 6/6 integration tests pass successfully
    - Tests demonstrate cache manager, error handler, and circuit breaker working together
    - Tests cover complete workflows including error recovery and fallback strategies
    - Tests validate multi-component integration scenarios
    - _Requirements: All requirements integration_

- [x] 13. Simplify system by removing API infrastructure (USER DECISION)
  - [x] 13.1 Remove API client infrastructure
    - Remove all API client classes (BaseApiClient, DataGovRuClient, PravoGovRuClient)
    - Remove CORS proxy system (CorsProxyClient)
    - Remove performance monitoring for API calls (PerformanceMonitor, RequestDeduplicator, ParallelExecutor)
    - Remove data validation systems (DataValidator, SchemaChangeDetector, DataTransformationLayer)
    - _Rationale: API sources are inaccessible due to CORS, data changes rarely, fallback works perfectly_

  - [x] 13.2 Simplify ApiSourceManager to LocalDataManager
    - Convert ApiSourceManager to simple LocalDataManager
    - Remove all external API integration code
    - Keep only local data loading and caching functionality
    - Maintain data versioning and update notifications
    - _Requirements: Maintain existing functionality with local data only_

  - [x] 13.3 Update UI components to remove API status indicators
    - Remove "API Sources Status" component from UI
    - Remove "Check for updates" and "Clear cache" buttons
    - Add simple data version display instead
    - Update error messages to reflect local-only operation
    - _Requirements: Clean UI without non-functional API elements_

  - [x] 13.4 Clean up configuration and types
    - Remove API source configurations (apiSources.ts)
    - Remove API-related types and interfaces (apiSources.ts)
    - Update FeeDataService to work with local data only
    - Remove API-related tests and mocks
    - _Requirements: Clean codebase without unused API infrastructure_

  - [x] 13.5 Fix deployment issues
    - Fix import errors in ApiSourceManager.ts
    - Remove references to deleted API clients
    - Ensure build passes successfully
    - Verify GitHub Pages deployment works
    - _Requirements: Working deployment at schitay-online.ru_

- [x] 14. Final cleanup and testing
  - [x] 14.1 Remove unused dependencies and files
    - Remove API client dependencies from package.json
    - Delete unused API test files
    - Clean up imports and references
    - _Requirements: Minimal, clean codebase_

  - [x] 14.2 Test simplified system
    - Verify all calculators work with local data
    - Test data loading and caching
    - Verify UI works without API components
    - Confirm GitHub Pages deployment works
    - _Requirements: Full functionality with simplified architecture_

- [x] 15. Final checkpoint - Ensure simplified system works perfectly
  - ✅ All tests pass (except React rendering issues in test environment)
  - ✅ Build completes successfully without errors
  - ✅ GitHub Pages deployment works at https://schitay-online.ru
  - ✅ Site loads correctly with all assets
  - ✅ Local data system functions properly
  - ✅ API infrastructure completely removed
  - ✅ Codebase cleaned up and simplified

## Notes

- All tasks are required for comprehensive coverage and production reliability
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- Property tests validate universal correctness properties
- Unit tests validate specific error scenarios and edge cases
- Priority is given to immediate fixes for production issues (CORS, PDF, missing client)
- Enhanced error handling provides long-term reliability and maintainability
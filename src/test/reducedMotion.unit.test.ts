/**
 * Unit tests for Reduced Motion support
 * Tests the useReducedMotion hook and related utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducedMotion, useAnimationProps, useConditionalAnimation } from '@/hooks/useReducedMotion';

describe('Reduced Motion Support', () => {
  let matchMediaMock: any;
  
  beforeEach(() => {
    // Mock window.matchMedia
    matchMediaMock = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('useReducedMotion', () => {
    it('should return false when user does not prefer reduced motion', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const { result } = renderHook(() => useReducedMotion());
      
      expect(result.current).toBe(false);
    });
    
    it('should return true when user prefers reduced motion', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const { result } = renderHook(() => useReducedMotion());
      
      expect(result.current).toBe(true);
    });
    
    it('should add event listener for media query changes', () => {
      const addEventListenerSpy = vi.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: addEventListenerSpy,
        removeEventListener: vi.fn(),
      });
      
      renderHook(() => useReducedMotion());
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });
    
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerSpy,
      });
      
      const { unmount } = renderHook(() => useReducedMotion());
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });
    
    it('should use fallback for older browsers without addEventListener', () => {
      const addListenerSpy = vi.fn();
      const removeListenerSpy = vi.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: undefined,
        removeEventListener: undefined,
        addListener: addListenerSpy,
        removeListener: removeListenerSpy,
      });
      
      const { unmount } = renderHook(() => useReducedMotion());
      
      expect(addListenerSpy).toHaveBeenCalledWith(expect.any(Function));
      
      unmount();
      
      expect(removeListenerSpy).toHaveBeenCalledWith(expect.any(Function));
    });
  });
  
  describe('useAnimationProps', () => {
    it('should return animation props when motion is not reduced', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const animationProps = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 },
      };
      
      const { result } = renderHook(() => useAnimationProps(animationProps));
      
      expect(result.current).toEqual(animationProps);
    });
    
    it('should return empty object when motion is reduced', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const animationProps = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 },
      };
      
      const { result } = renderHook(() => useAnimationProps(animationProps));
      
      expect(result.current).toEqual({});
    });
  });
  
  describe('useConditionalAnimation', () => {
    it('should return animated value when motion is not reduced', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const { result } = renderHook(() => 
        useConditionalAnimation(0.5, 0)
      );
      
      expect(result.current).toBe(0.5);
    });
    
    it('should return static value when motion is reduced', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const { result } = renderHook(() => 
        useConditionalAnimation(0.5, 0)
      );
      
      expect(result.current).toBe(0);
    });
    
    it('should work with different value types', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      // Test with strings
      const { result: stringResult } = renderHook(() => 
        useConditionalAnimation('animated', 'static')
      );
      expect(stringResult.current).toBe('static');
      
      // Test with objects
      const { result: objectResult } = renderHook(() => 
        useConditionalAnimation({ scale: 1.1 }, { scale: 1 })
      );
      expect(objectResult.current).toEqual({ scale: 1 });
    });
  });
  
  describe('Integration with motion-config', () => {
    it('should respect reduced motion in prefersReducedMotion function', async () => {
      const { prefersReducedMotion } = await import('@/lib/motion-config');
      
      matchMediaMock.mockReturnValue({
        matches: true,
      });
      
      expect(prefersReducedMotion()).toBe(true);
      
      matchMediaMock.mockReturnValue({
        matches: false,
      });
      
      expect(prefersReducedMotion()).toBe(false);
    });
  });
});

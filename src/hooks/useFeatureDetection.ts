import { useState, useEffect } from 'react';
import { getAllFeatureSupport, type FeatureSupport } from '@/lib/feature-detection';

/**
 * Hook to detect browser feature support
 * @returns Object with all feature support flags
 * 
 * @example
 * ```tsx
 * const { backdropFilter, grid } = useFeatureDetection();
 * 
 * return (
 *   <div className={backdropFilter ? 'backdrop-blur-lg' : 'bg-white/90'}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function useFeatureDetection(): FeatureSupport {
  const [features, setFeatures] = useState<FeatureSupport>({
    backdropFilter: true,
    grid: true,
    cssVariables: true,
    transforms: true,
    animations: true,
  });

  useEffect(() => {
    // Run feature detection on mount
    setFeatures(getAllFeatureSupport());
  }, []);

  return features;
}

/**
 * Hook to detect a specific feature support
 * @param feature - The feature to check
 * @returns true if the feature is supported, false otherwise
 * 
 * @example
 * ```tsx
 * const supportsBackdrop = useFeatureSupport('backdropFilter');
 * 
 * return (
 *   <div className={supportsBackdrop ? 'backdrop-blur-lg' : 'bg-white/90'}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function useFeatureSupport(feature: keyof FeatureSupport): boolean {
  const features = useFeatureDetection();
  return features[feature];
}

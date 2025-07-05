// Bundle Analyzer Configuration
// This file helps identify large dependencies and optimize bundle size

export const bundleAnalysis = {
  // Large dependencies to consider for optimization
  largeDependencies: [
    'react-query',
    'recharts',
    'framer-motion',
    'react-table',
    'react-select',
    'date-fns',
    'axios',
    'socket.io-client',
  ],

  // Dependencies that can be lazy loaded
  lazyLoadable: [
    'react-query',
    'recharts',
    'framer-motion',
    'react-table',
    'react-select',
  ],

  // Dependencies that can be tree-shaken
  treeShakeable: [
    'date-fns',
    'lodash',
    'ramda',
  ],

  // Performance monitoring
  performanceMetrics: {
    bundleSizeThreshold: 500 * 1024, // 500KB
    chunkSizeThreshold: 200 * 1024, // 200KB
    loadTimeThreshold: 3000, // 3 seconds
  },

  // Optimization recommendations
  recommendations: {
    codeSplitting: [
      'Split vendor and app bundles',
      'Use dynamic imports for routes',
      'Lazy load heavy components',
    ],
    treeShaking: [
      'Use ES6 imports instead of CommonJS',
      'Import specific functions instead of entire libraries',
      'Configure webpack for better tree shaking',
    ],
    caching: [
      'Implement proper cache headers',
      'Use content hashing for bundle names',
      'Configure service worker for caching',
    ],
  },
};

export const analyzeBundle = (bundleStats: any) => {
  const analysis: {
    totalSize: number;
    largeChunks: any[];
    recommendations: string[];
  } = {
    totalSize: 0,
    largeChunks: [],
    recommendations: [],
  };

  // Analyze bundle size
  if (bundleStats.totalSize > bundleAnalysis.performanceMetrics.bundleSizeThreshold) {
    analysis.recommendations.push('Bundle size is large, consider code splitting');
  }

  // Identify large chunks
  bundleStats.chunks?.forEach((chunk: any) => {
    if (chunk.size > bundleAnalysis.performanceMetrics.chunkSizeThreshold) {
      analysis.largeChunks.push({
        name: chunk.name,
        size: chunk.size,
        modules: chunk.modules,
      });
    }
  });

  return analysis;
}; 
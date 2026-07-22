import { apiClient } from './api/apiClient';

export const crashReporter = {
  logError: (error: any, componentName?: string) => {
    try {
      console.error(`[Mobile Crash Monitoring] Error in ${componentName || 'App'}:`, error);
      apiClient.post('/analytics/crash', {
        message: error?.message || String(error),
        stack: error?.stack,
        componentName,
      }).catch(() => {
        // Silent catch to avoid secondary exceptions
      });
    } catch {
      // Ignore fallback failures
    }
  },
};

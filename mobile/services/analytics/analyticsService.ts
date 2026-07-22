import { apiClient } from '../api/apiClient';

export interface MobileAnalyticsEvent {
  event: 'registration' | 'login' | 'booking_created' | 'booking_cancelled' | 'review_submitted' | 'vendor_approval' | 'app_open' | 'screen_view';
  properties?: Record<string, any>;
}

export const analyticsService = {
  track: async (eventName: MobileAnalyticsEvent['event'], properties?: Record<string, any>) => {
    try {
      console.log(`[Mobile Analytics]: ${eventName}`, properties || {});
      await apiClient.post('/analytics/event', {
        event: eventName,
        properties: {
          ...properties,
          platform: 'mobile',
        },
      }).catch(() => {
        // Silent fail for non-blocking telemetry
      });
    } catch {
      // Prevent any telemetry errors from interrupting UI
    }
  },
};

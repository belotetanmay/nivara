export interface AnalyticsEvent {
  event: 'registration' | 'login' | 'booking_created' | 'booking_cancelled' | 'review_submitted' | 'vendor_approval' | 'app_open' | 'screen_view';
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export function logAnalyticsEvent(payload: AnalyticsEvent) {
  const eventData = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };

  console.log(`[ANALYTICS EVENT]: ${payload.event.toUpperCase()} | User=${payload.userId || 'anonymous'}`, JSON.stringify(payload.properties || {}));
  
  return eventData;
}

import { apiClient } from '../api/apiClient';

export interface Van {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  amenities: string[];
  photos: string[];
  latitude: number;
  longitude: number;
  address: string;
  serviceRadius: number;
  price15: string | number;
  price30: string | number;
  price45: string | number;
  status: string;
  hasAttendant: boolean;
  attendantName?: string | null;
  serviceType: string;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  distance?: number;
  vendor: {
    id: string;
    businessName: string;
    bio: string;
    ratingAvg: number;
    verificationStatus: string;
  };
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  vanId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    name: string;
  };
}

export interface VanDetailsResponse {
  success: boolean;
  van: Van & {
    reviews: Review[];
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const customerService = {
  /**
   * Fetch all dynamic categories
   */
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/customer/categories');
      return response.data.categories || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  /**
   * Fetch all active wellness vans with optional filtering
   */
  getVans: async (filters?: {
    lat?: number;
    lng?: number;
    radius?: number;
    maxPrice?: number;
    amenities?: string;
    hasAttendant?: boolean;
  }): Promise<Van[]> => {
    try {
      const params: any = {};
      if (filters) {
        if (filters.lat !== undefined) params.lat = filters.lat;
        if (filters.lng !== undefined) params.lng = filters.lng;
        if (filters.radius !== undefined) params.radius = filters.radius;
        if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
        if (filters.amenities) params.amenities = filters.amenities;
        if (filters.hasAttendant !== undefined) params.hasAttendant = String(filters.hasAttendant);
      }
      
      const response = await apiClient.get('/customer/vans', { params });
      return response.data.vans || [];
    } catch (error) {
      console.error('Failed to fetch vans:', error);
      return [];
    }
  },

  /**
   * Fetch details for a specific van
   */
  getVanDetails: async (id: string): Promise<VanDetailsResponse | null> => {
    try {
      const response = await apiClient.get(`/customer/vans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch van details for ${id}:`, error);
      return null;
    }
  },

  /**
   * Fetch favorites list
   */
  getFavorites: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/customer/favorites');
      return response.data.favorites || [];
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      return [];
    }
  },

  /**
   * Add a vendor to favorites list
   */
  addFavorite: async (vendorId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post('/customer/favorites', { vendorId });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to add favorite',
      };
    }
  },

  /**
   * Remove a vendor from favorites list
   */
  removeFavorite: async (vendorId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.delete('/customer/favorites', {
        params: { vendorId },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to remove favorite',
      };
    }
  },

  /**
   * Fetch recently viewed vendors list
   */
  getRecentlyViewed: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/customer/recently-viewed');
      return response.data.recentlyViewed || [];
    } catch (error) {
      console.error('Failed to fetch recently viewed:', error);
      return [];
    }
  },

  /**
   * Log a view event for a vendor details page
   */
  addRecentlyViewed: async (vendorId: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post('/customer/recently-viewed', { vendorId });
      return response.data;
    } catch (error) {
      console.error('Failed to log recently viewed view event:', error);
      return { success: false };
    }
  },

  /**
   * Fetch dynamic notifications list
   */
  getNotifications: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    try {
      const response = await apiClient.get('/customer/notifications');
      return {
        notifications: response.data.notifications || [],
        unreadCount: response.data.unreadCount || 0,
      };
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }
  },

  /**
   * Mark a notification as read
   */
  markNotificationRead: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.patch('/customer/notifications', { id });
      return response.data;
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      return { success: false };
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async (): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.patch('/customer/notifications', { markAllAllRead: true });
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return { success: false };
    }
  },

  /**
   * Fetch customer bookings
   */
  getBookings: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/customer/bookings');
      return response.data.bookings || [];
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      return [];
    }
  },

  /**
   * Fetch available time slots for a van on a specific date (YYYY-MM-DD)
   */
  getSlots: async (vanId: string, dateStr: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/customer/vans/${vanId}/slots`, {
        params: { date: dateStr },
      });
      return response.data.slots || [];
    } catch (error) {
      console.error(`Failed to fetch slots for van ${vanId}:`, error);
      return [];
    }
  },

  /**
   * Create a new booking
   */
  createBooking: async (payload: {
    vanId: string;
    slotId: string;
    sessionLength: number;
    scent?: string;
    lighting?: string;
    audio?: string;
    includeParkingFee?: boolean;
  }): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
    try {
      const response = await apiClient.post('/customer/bookings', payload);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create booking',
      };
    }
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.delete(`/customer/bookings/${bookingId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to cancel booking',
      };
    }
  },

  /**
   * Submit a review for a completed booking
   */
  createReview: async (payload: {
    bookingId: string;
    rating: number;
    comment: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post('/customer/reviews', payload);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to submit review',
      };
    }
  },
};

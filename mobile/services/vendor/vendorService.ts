import { apiClient } from '../api/apiClient';

export interface VendorVanPayload {
  title: string;
  description: string;
  address: string;
  amenities: string[];
  photos: string[];
  price15: number;
  price30: number;
  price45: number;
  serviceRadius: number;
  hasAttendant: boolean;
  attendantName?: string | null;
}

export const vendorService = {
  /**
   * Fetch all vans belonging to vendor
   */
  getVendorVans: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/vendor/vans');
      return response.data.vans || [];
    } catch (error) {
      console.error('Failed to fetch vendor vans:', error);
      return [];
    }
  },

  /**
   * Create a new van listing
   */
  createVan: async (payload: VendorVanPayload): Promise<{ success: boolean; vanId?: string; error?: string }> => {
    try {
      const response = await apiClient.post('/vendor/vans', payload);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create van',
      };
    }
  },

  /**
   * Update an existing van listing
   */
  updateVan: async (vanId: string, payload: Partial<VendorVanPayload>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.put(`/vendor/vans/${vanId}`, payload);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update van',
      };
    }
  },

  /**
   * Delete a van listing
   */
  deleteVan: async (vanId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.delete(`/vendor/vans/${vanId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete van',
      };
    }
  },

  /**
   * Toggle van status (ACTIVE vs INACTIVE)
   */
  toggleVanStatus: async (vanId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.patch(`/vendor/vans/${vanId}`, { status });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to toggle van status',
      };
    }
  },

  /**
   * Fetch vendor incoming bookings
   */
  getVendorBookings: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/vendor/bookings');
      return response.data.bookings || [];
    } catch (error) {
      console.error('Failed to fetch vendor bookings:', error);
      return [];
    }
  },

  /**
   * Update vendor booking status (CONFIRMED, COMPLETED, CANCELLED)
   */
  updateBookingStatus: async (bookingId: string, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.patch('/vendor/bookings', { bookingId, status });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update booking status',
      };
    }
  },

  /**
   * Fetch vendor dashboard metrics
   */
  getVendorStats: async (): Promise<{ totalEarnings: number; activeBookings: number; ratingAvg: number }> => {
    try {
      const response = await apiClient.get('/vendor/dashboard');
      return {
        totalEarnings: response.data.totalEarnings || 0,
        activeBookings: response.data.activeBookings || 0,
        ratingAvg: response.data.ratingAvg || 5.0,
      };
    } catch (error) {
      console.error('Failed to fetch vendor stats:', error);
      return { totalEarnings: 0, activeBookings: 0, ratingAvg: 5.0 };
    }
  },
};

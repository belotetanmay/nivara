import { create } from 'zustand';

interface GlobalState {
  isOnboarded: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearSearches: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  isOnboarded: false,
  completeOnboarding: () => set({ isOnboarded: true }),
  resetOnboarding: () => set({ isOnboarded: false }),
  recentSearches: [],
  addRecentSearch: (query) =>
    set((state) => {
      const filtered = state.recentSearches.filter((q) => q !== query);
      return { recentSearches: [query, ...filtered].slice(0, 10) };
    }),
  clearSearches: () => set({ recentSearches: [] }),
}));

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, SlidersHorizontal, Star, Trash2, X, MapPin, ShieldAlert } from 'lucide-react-native';
import { useGlobalStore } from '../../../store/globalStore';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Chip } from '../../../components/ui/Chip';
import { Card } from '../../../components/ui/Card';
import { Tag } from '../../../components/ui/Tag';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/feedback/Toast';
import { customerService, Van } from '../../../services/customer/customerService';
import { Skeleton } from '../../../components/ui/Skeleton';

const baseUri = (process.env.EXPO_PUBLIC_API_URL || 'https://nivara-ten.vercel.app/api').replace('/api', '');

const AMENITIES_LIST = ['Zero-Gravity Chair', 'Soundproofing', 'Aromatherapy', 'Ambient Lighting', 'Air Conditioning'];
const SORT_OPTIONS = [
  { label: 'Nearest First', value: 'distance' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Lowest Price', value: 'price' },
];

export default function SearchScreen() {
  const router = useRouter();
  const { show } = useToast();
  const searchParams = useLocalSearchParams<{ category?: string }>();
  
  const { recentSearches, addRecentSearch, clearSearches } = useGlobalStore();

  const [query, setQuery] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPriceLimit, setSelectedPriceLimit] = useState<number | undefined>(undefined);
  const [selectedSort, setSelectedSort] = useState<string>('distance');
  const [showFilters, setShowFilters] = useState(false);

  const [vans, setVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(false);

  const centerLat = 19.0596;
  const centerLng = 72.8295;

  const debounceTimer = useRef<any>(null);

  // Sync initial search query
  useEffect(() => {
    if (searchParams?.category) {
      setQuery(searchParams.category);
      triggerSearch(searchParams.category);
    } else {
      triggerSearch('');
    }
  }, [searchParams?.category]);

  const triggerSearch = async (searchQuery: string) => {
    setLoading(true);
    
    if (searchQuery.trim().length > 1) {
      addRecentSearch(searchQuery.trim());
    }

    try {
      const filters: any = {
        lat: centerLat,
        lng: centerLng,
        radius: 15,
      };

      if (selectedPriceLimit !== undefined) {
        filters.maxPrice = selectedPriceLimit;
      }

      if (selectedAmenities.length > 0) {
        filters.amenities = selectedAmenities.join(',');
      }

      let results = await customerService.getVans(filters);

      if (searchQuery.trim().length > 0) {
        const text = searchQuery.toLowerCase();
        results = results.filter((van) => {
          return (
            van.title.toLowerCase().includes(text) ||
            van.description.toLowerCase().includes(text) ||
            van.vendor.businessName.toLowerCase().includes(text) ||
            van.amenities.some((a) => a.toLowerCase().includes(text))
          );
        });
      }

      if (selectedSort === 'distance') {
        results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      } else if (selectedSort === 'rating') {
        results.sort((a, b) => (b.vendor.ratingAvg || 0) - (a.vendor.ratingAvg || 0));
      } else if (selectedSort === 'price') {
        results.sort((a, b) => parseFloat(String(a.price15)) - parseFloat(String(b.price15)));
      }

      setVans(results);
    } catch (err) {
      console.error(err);
      show('Failed to fetch search results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      triggerSearch(text);
    }, 500);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    triggerSearch(query);
  };

  const handleResetFilters = () => {
    setSelectedAmenities([]);
    setSelectedPriceLimit(undefined);
    setSelectedSort('distance');
    show('Filters reset', 'info');
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const selectHistoryQuery = (histQuery: string) => {
    setQuery(histQuery);
    triggerSearch(histQuery);
  };

  const getStartingPrice = (van: Van) => {
    const p15 = parseFloat(String(van.price15));
    const p30 = parseFloat(String(van.price30));
    return isNaN(p15) ? (isNaN(p30) ? '₹399' : `₹${p30}`) : `₹${p15}`;
  };

  const getVanPhoto = (photos: string[]) => {
    if (photos && photos[0]) {
      const path = photos[0].startsWith('/images/') ? '/van_demo.jpg' : photos[0];
      return { uri: baseUri + path };
    }
    return { uri: baseUri + '/van_demo.jpg' };
  };

  const renderVanCard = ({ item }: { item: Van }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(app)/(customer)/vans/${item.id}`)}
    >
      <Card style={styles.card}>
        <View style={styles.cardImageContainer}>
          <Image source={getVanPhoto(item.photos)} style={styles.cardImage} resizeMode="cover" />
        </View>

        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDistance}>
              {item.distance !== undefined ? `${item.distance.toFixed(1)} km away` : item.address}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Star size={14} color="#F97316" fill="#F97316" style={styles.starIcon} />
            <Text style={styles.ratingText}>
              {item.vendor.ratingAvg > 0 ? item.vendor.ratingAvg.toFixed(1) : '5.0'}
            </Text>
          </View>
        </View>

        <Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text>

        <View style={styles.tagsContainer}>
          {item.amenities.slice(0, 3).map((a) => (
            <Tag key={a} label={a.toUpperCase()} />
          ))}
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.startingLabel}>Starting from</Text>
            <Text style={styles.startingPrice}>{getStartingPrice(item)}</Text>
          </View>
          <Button
            title="Book Now"
            size="sm"
            onPress={() => router.push(`/(app)/(customer)/vans/${item.id}`)}
            style={styles.bookButton}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header Bar */}
      <View style={styles.header}>
        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Search Wellness Vans"
            style={styles.searchBar}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={20} color={showFilters ? '#FFFFFF' : '#0F2D52'} />
        </TouchableOpacity>
      </View>

      {/* Expanded Filters Drawer */}
      {showFilters && (
        <ScrollView style={styles.filtersDrawer} contentContainerStyle={styles.filtersDrawerContent}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort Results By</Text>
            <View style={styles.chipsRow}>
              {SORT_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  isSelected={selectedSort === opt.value}
                  onPress={() => setSelectedSort(opt.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Max Budget Limit</Text>
            <View style={styles.chipsRow}>
              {[250, 400, 600, 1000].map((price) => (
                <Chip
                  key={price}
                  label={`Under ₹${price}`}
                  isSelected={selectedPriceLimit === price}
                  onPress={() => setSelectedPriceLimit(price === selectedPriceLimit ? undefined : price)}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Filter by Amenity / Feature</Text>
            <View style={styles.chipsRow}>
              {AMENITIES_LIST.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  isSelected={selectedAmenities.includes(item)}
                  onPress={() => toggleAmenity(item)}
                />
              ))}
            </View>
          </View>

          <View style={styles.drawerActions}>
            <Button
              title="Reset Filters"
              variant="outline"
              onPress={handleResetFilters}
              style={styles.drawerResetButton}
            />
            <Button
              title="Apply Filters"
              onPress={handleApplyFilters}
              style={styles.drawerApplyButton}
            />
          </View>
        </ScrollView>
      )}

      {/* Main feed list */}
      {loading ? (
        <View style={styles.listContent}>
          {[1, 2, 3].map((k) => (
            <Card key={k} style={styles.card}>
              <Skeleton height={140} borderRadius={12} style={{ marginBottom: 14 }} />
              <Skeleton width="50%" height={20} style={{ marginBottom: 8 }} />
              <Skeleton width="80%" height={14} style={{ marginBottom: 14 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width="30%" height={24} />
                <Skeleton width="35%" height={36} borderRadius={8} />
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <FlatList
          data={vans}
          keyExtractor={(item) => item.id}
          renderItem={renderVanCard}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            query.trim().length === 0 && recentSearches.length > 0 ? (
              <View style={styles.historyContainer}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearSearches} style={styles.clearHistoryButton}>
                    <Trash2 size={14} color="#9CA3AF" />
                    <Text style={styles.clearHistoryText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.historyChips}>
                  {recentSearches.map((hQuery) => (
                    <TouchableOpacity
                      key={hQuery}
                      onPress={() => selectHistoryQuery(hQuery)}
                      style={styles.historyChip}
                      activeOpacity={0.7}
                    >
                      <Search size={12} color="#4B5563" style={styles.historyChipIcon} />
                      <Text style={styles.historyChipText}>{hQuery}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <ShieldAlert size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No wellness vans found</Text>
              <Text style={styles.emptySubtitle}>
                No wellness vans matching your parameters were found near Mumbai. Try resetting filters.
              </Text>
              <Button
                title="Reset Filters"
                variant="outline"
                onPress={() => {
                  handleResetFilters();
                  triggerSearch('');
                }}
                style={styles.emptyResetButton}
              />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  searchBarWrapper: {
    flex: 1,
    marginRight: 12,
  },
  searchBar: {},
  filterButton: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 12,
  },
  filterButtonActive: {
    backgroundColor: '#0F2D52',
    borderColor: '#0F2D52',
  },
  filtersDrawer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
    maxHeight: 300,
  },
  filtersDrawerContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    color: '#0F2D52',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  drawerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  drawerResetButton: {
    width: '48%',
    borderColor: '#E5E1D8',
  },
  drawerApplyButton: {
    width: '48%',
    backgroundColor: '#16A34A',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  card: {
    padding: 16,
    marginBottom: 20,
    borderColor: '#E5E1D8',
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E1D8',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    color: '#0F2D52',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDistance: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E1D8',
    paddingTop: 16,
  },
  startingLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  startingPrice: {
    color: '#0F2D52',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: '#0F2D52',
    borderRadius: 8,
  },
  historyContainer: {
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearHistoryText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  historyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  historyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  historyChipIcon: {
    marginRight: 6,
  },
  historyChipText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 9999,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#0F2D52',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  emptyResetButton: {
    borderColor: '#E5E1D8',
  },
}) as any;

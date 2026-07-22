import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MapPin, Star, Sparkles, Heart, Compass } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Card } from '../../../components/ui/Card';
import { Tag } from '../../../components/ui/Tag';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/feedback/Toast';
import { customerService, Van } from '../../../services/customer/customerService';
import { Skeleton } from '../../../components/ui/Skeleton';

const baseUri = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.93:3000/api').replace('/api', '');

export default function ExploreScreen() {
  const { user, isAuthenticated } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const [vans, setVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    
    // Load favorites in background
    customerService.getFavorites()
      .then(favs => setFavorites(favs))
      .catch(err => console.error('Failed to load favorites:', err));

    // Load active vans list
    try {
      const vansRes = await customerService.getVans();
      setVans(vansRes);
    } catch (err) {
      console.error('Failed to load active vans list:', err);
      show('Failed to sync nearby wellness vans.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    try {
      const [vansRes, favsRes] = await Promise.all([
        customerService.getVans().catch(() => []),
        customerService.getFavorites().catch(() => []),
      ]);
      setVans(vansRes);
      setFavorites(favsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleVanPress = (vanId: string) => {
    router.push(`/(app)/(customer)/vans/${vanId}`);
  };

  const isFavorite = (vendorId: string) => {
    return favorites.some(fav => fav.id === vendorId);
  };

  const handleToggleFavorite = async (vendorId: string) => {
    const favorited = isFavorite(vendorId);
    if (favorited) {
      const res = await customerService.removeFavorite(vendorId);
      if (res.success) {
        setFavorites(prev => prev.filter(fav => fav.id !== vendorId));
        show('Removed from favorites', 'info');
      } else {
        show(res.error || 'Failed to update favorite', 'error');
      }
    } else {
      const res = await customerService.addFavorite(vendorId);
      if (res.success) {
        const favsRes = await customerService.getFavorites();
        setFavorites(favsRes);
        show('Added to favorites!', 'success');
      } else {
        show(res.error || 'Failed to update favorite', 'error');
      }
    }
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

  // Derive categories and groups client-side
  const featuredVans = vans.slice(0, 2);
  const popularVans = [...vans].sort((a, b) => (b.vendor.ratingAvg || 0) - (a.vendor.ratingAvg || 0)).slice(0, 3);
  const nearbyVans = vans;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Hello Seeker</Text>
          <Text style={styles.headerTitle}>{user?.name || 'Sanctuary Seeker'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.navigate('/(app)/(customer)/notifications')}
          style={styles.notificationButton}
          activeOpacity={0.7}
        >
          <Bell size={20} color="#0F2D52" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#16A34A']} />
        }
      >
        <View style={styles.innerContainer}>
          {/* Custom Search Trigger */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.navigate('/(app)/(customer)/search')}
            style={styles.searchBar}
          >
            <View pointerEvents="none">
              <SearchBar
                placeholder="Search Wellness Vans"
                editable={false}
              />
            </View>
          </TouchableOpacity>

          {/* Map Location Banner */}
          <Card style={styles.locationCard}>
            <View style={styles.locationIconWrapper}>
              <MapPin size={20} color="#16A34A" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationSubtitle}>Your current location</Text>
              <Text style={styles.locationTitle}>Bandra West, Mumbai</Text>
            </View>
            <Text style={styles.locationAction}>GPS Active</Text>
          </Card>

          {/* Featured Section */}
          {featuredVans.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Featured Wellness Vans</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
                {featuredVans.map((van) => (
                  <TouchableOpacity
                    key={van.id}
                    onPress={() => handleVanPress(van.id)}
                    activeOpacity={0.9}
                    style={styles.featuredCard}
                  >
                    <Image source={getVanPhoto(van.photos)} style={styles.featuredImage} resizeMode="cover" />
                    <View style={styles.featuredCardInfo}>
                      <Text numberOfLines={1} style={styles.featuredVanTitle}>{van.title}</Text>
                      <Text numberOfLines={1} style={styles.featuredVendorName}>{van.vendor.businessName}</Text>
                      <View style={styles.rowBetween}>
                        <View style={styles.ratingRow}>
                          <Star size={14} color="#F97316" fill="#F97316" />
                          <Text style={styles.ratingText}> {van.vendor.ratingAvg.toFixed(1)}</Text>
                        </View>
                        <Text style={styles.featuredPrice}>{getStartingPrice(van)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Popular Section */}
          {popularVans.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Popular Sanctuary Pods</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
                {popularVans.map((van) => (
                  <TouchableOpacity
                    key={van.id}
                    onPress={() => handleVanPress(van.id)}
                    activeOpacity={0.9}
                    style={styles.popularCard}
                  >
                    <Image source={getVanPhoto(van.photos)} style={styles.popularImage} resizeMode="cover" />
                    <View style={styles.featuredCardInfo}>
                      <Text numberOfLines={1} style={styles.featuredVanTitle}>{van.title}</Text>
                      <View style={styles.rowBetween}>
                        <View style={styles.ratingRow}>
                          <Star size={12} color="#F97316" fill="#F97316" />
                          <Text style={styles.ratingText}> {van.vendor.ratingAvg.toFixed(1)}</Text>
                        </View>
                        <Text style={styles.featuredPrice}>{getStartingPrice(van)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Nearby Wellness Vans */}
          <Text style={styles.sectionTitle}>Nearby Wellness Vans</Text>
          {loading ? (
            <View style={styles.vansContainer}>
              {[1, 2].map((k) => (
                <Card key={k} style={styles.vanCard}>
                  <Skeleton height={180} borderRadius={12} style={{ marginBottom: 16 }} />
                  <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
                  <Skeleton width="40%" height={14} style={{ marginBottom: 16 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton width="30%" height={24} />
                    <Skeleton width="35%" height={36} borderRadius={8} />
                  </View>
                </Card>
              ))}
            </View>
          ) : nearbyVans.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Sparkles size={32} color="#9CA3AF" />
              <Text style={styles.emptyText}>No wellness vans are active near you.</Text>
            </Card>
          ) : (
            <View style={styles.vansContainer}>
              {nearbyVans.map((van) => {
                const fav = isFavorite(van.vendorId);
                return (
                  <Card key={van.id} style={styles.vanCard}>
                    <View style={styles.vanImageContainer}>
                      <Image source={getVanPhoto(van.photos)} style={styles.vanImage} resizeMode="cover" />
                      <TouchableOpacity
                        onPress={() => handleToggleFavorite(van.vendorId)}
                        style={styles.favBadge}
                        activeOpacity={0.7}
                      >
                        <Heart size={18} color={fav ? '#EF4444' : '#6B7280'} fill={fav ? '#EF4444' : 'transparent'} />
                      </TouchableOpacity>
                      {van.vendor.verificationStatus === 'APPROVED' && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.vanInfoRow}>
                      <View style={styles.vanTitleCol}>
                        <Text style={styles.vanTitle}>{van.title}</Text>
                        <Text style={styles.vanDistance}>
                          {van.distance !== undefined ? `${van.distance.toFixed(1)} km away` : van.address}
                        </Text>
                      </View>
                      <View style={styles.vanRatingBadge}>
                        <Star size={14} color="#F97316" fill="#F97316" style={styles.starIconFill} />
                        <Text style={styles.vanRatingText}>
                          {van.vendor.ratingAvg > 0 ? van.vendor.ratingAvg.toFixed(1) : '5.0'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tagsRow}>
                      {van.amenities.slice(0, 3).map((tag) => (
                        <Tag key={tag} label={tag.toUpperCase()} />
                      ))}
                    </View>

                    <View style={styles.vanFooter}>
                      <View>
                        <Text style={styles.priceLabel}>Starting from</Text>
                        <Text style={styles.priceText}>{getStartingPrice(van)}</Text>
                      </View>
                      <Button
                        title="Book Now"
                        size="sm"
                        onPress={() => handleVanPress(van.id)}
                        style={styles.bookButton}
                      />
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#0F2D52',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'System',
    marginTop: 2,
  },
  notificationButton: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 9999,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  searchBar: {
    marginBottom: 20,
  },
  locationCard: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E1D8',
    borderWidth: 1,
    borderRadius: 12,
  },
  locationIconWrapper: {
    padding: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 9999,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
  locationTitle: {
    color: '#0F2D52',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 1,
  },
  locationAction: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredScroll: {
    flexDirection: 'row',
  },
  featuredCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#E5E1D8',
  },
  featuredCardInfo: {
    padding: 12,
  },
  featuredVanTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginBottom: 2,
  },
  featuredVendorName: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  popularCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  popularImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E5E1D8',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F2D52',
  },
  featuredPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  vansContainer: {
    marginTop: 4,
  },
  vanCard: {
    padding: 16,
    marginBottom: 20,
    borderColor: '#E5E1D8',
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  vanImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E1D8',
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  vanImage: {
    width: '100%',
    height: '100%',
  },
  favBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  vanInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vanTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  vanTitle: {
    color: '#0F2D52',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vanDistance: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  vanRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  starIconFill: {
    marginRight: 4,
  },
  vanRatingText: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  vanFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E1D8',
    paddingTop: 16,
    marginTop: 4,
  },
  priceLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceText: {
    color: '#0F2D52',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: '#0F2D52',
    borderRadius: 8,
  },
}) as any;

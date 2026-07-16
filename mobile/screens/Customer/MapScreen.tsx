import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import apiClient from '../../services/api';
import { MapPin, Star, Sparkles, Scan, Calendar, LogOut } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function MapScreen({ navigation }: any) {
  const { logout, user } = useAuth();
  const [vans, setVans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 19.0760, // Mumbai centered
    longitude: 72.8777,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });

  useEffect(() => {
    fetchVans();
  }, []);

  const fetchVans = async () => {
    try {
      const response = await apiClient.get('/customer/vans');
      if (response.data.success) {
        setVans(response.data.vans);
        if (response.data.vans.length > 0) {
          const firstVan = response.data.vans[0];
          setRegion({
            latitude: firstVan.latitude,
            longitude: firstVan.longitude,
            latitudeDelta: 0.12,
            longitudeDelta: 0.12,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch vans', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  const renderVanCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.vanCard}
      onPress={() => navigation.navigate('VanDetails', { vanId: item.id })}
    >
      <View style={styles.vanCardHeader}>
        <Text style={styles.vanTitle}>{item.title}</Text>
        <View style={styles.ratingRow}>
          <Star size={12} color="#D4A373" fill="#D4A373" />
          <Text style={styles.ratingText}>
            {item.vendor?.ratingAvg ? item.vendor.ratingAvg.toFixed(1) : 'New'}
          </Text>
        </View>
      </View>

      <Text style={styles.vanAddress} numberOfLines={1}>
        <MapPin size={12} color="#8F8C87" /> {item.address}
      </Text>

      <View style={styles.vanCardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>₹{item.price15} <Text style={styles.priceUnit}>/ 30m</Text></Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('VanDetails', { vanId: item.id })}
        >
          <Sparkles size={14} color="#FFF" style={{ marginRight: 4 }} />
          <Text style={styles.bookButtonText}>Book Pod</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A2540" />
        <Text style={{ marginTop: 12, color: '#8F8C87' }}>Loading wellness pods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
        showsUserLocation
      >
        {vans.map((van: any) => (
          <Marker
            key={van.id}
            coordinate={{
              latitude: van.latitude,
              longitude: van.longitude,
            }}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerCircle}>
                <Sparkles size={16} color="#FFF" />
              </View>
              <View style={styles.markerArrow} />
            </View>

            <Callout
              tooltip
              onPress={() => navigation.navigate('VanDetails', { vanId: van.id })}
            >
              <View style={styles.calloutBubble}>
                <Text style={styles.calloutTitle}>{van.title}</Text>
                <Text style={styles.calloutPrice}>₹{van.price15} / 30-min session</Text>
                <Text style={styles.calloutLink}>Tap to view slots</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Header Overlay */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Sparkles size={16} color="#2C5234" style={{ marginRight: 6 }} />
            <Text style={styles.greetingText} numberOfLines={1}>{user?.name || 'Guest'}</Text>
          </View>
          <Text style={styles.headerSubtext} numberOfLines={1}>
            Role: {user?.role || 'CUSTOMER'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Bookings shortcut button */}
          <TouchableOpacity
            style={styles.bookingsButton}
            onPress={() => navigation.navigate('Bookings')}
          >
            <Calendar size={18} color="#FFF" />
          </TouchableOpacity>

          {/* Scanner button */}
          {(user?.role === 'VENDOR' || user?.role === 'ADMIN') && (
            <TouchableOpacity
              style={styles.scannerButton}
              onPress={() => navigation.navigate('ScanQR')}
            >
              <Scan size={18} color="#FFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut size={18} color="#0A2540" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sliding Sheet Overlay of Vans */}
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetBar} />
          <Text style={styles.sheetTitle}>Active Wellness Pods ({vans.length})</Text>
        </View>

        {vans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active wellness pods nearby.</Text>
          </View>
        ) : (
          <FlatList
            data={vans}
            renderItem={renderVanCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            snapToInterval={Dimensions.get('window').width * 0.85 + 16}
            decelerationRate="fast"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    ...StyleSheet.absoluteFillObject,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 32,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#FFFFFF', // solid white header card
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  greetingText: {
    color: '#0A2540',
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerSubtext: {
    color: '#8F8C87',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  bookingsButton: {
    backgroundColor: '#0A2540', // Deep Navy
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  scannerButton: {
    backgroundColor: '#2C5234', // Forest Green
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  logoutButton: {
    backgroundColor: '#FAF8F5',
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerCircle: {
    backgroundColor: '#2C5234', // Forest Green markers
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2C5234',
    marginTop: -1,
  },
  calloutBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    padding: 12,
    width: 170,
    alignItems: 'center',
  },
  calloutTitle: {
    color: '#0A2540',
    fontWeight: 'bold',
    fontSize: 13,
  },
  calloutPrice: {
    color: '#D4A373', // Amber price text
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  calloutLink: {
    color: '#2C5234',
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 6,
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF8F5', // Cream background for sliding drawer
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1.5,
    borderTopColor: '#E5E1D8',
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E1D8',
    borderRadius: 2,
    marginBottom: 8,
  },
  sheetTitle: {
    color: '#0A2540',
    fontSize: 15,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  vanCard: {
    backgroundColor: '#FFFFFF', // White cards inside list
    borderRadius: 20,
    padding: 16,
    width: Dimensions.get('window').width * 0.85,
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  vanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  vanTitle: {
    color: '#0A2540',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E1D8',
  },
  ratingText: {
    color: '#D4A373', // Amber accent
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  vanAddress: {
    color: '#8F8C87',
    fontSize: 12,
    marginBottom: 12,
  },
  vanCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceLabel: {
    color: '#8F8C87',
    fontSize: 10,
  },
  priceValue: {
    color: '#0A2540',
    fontSize: 15,
    fontWeight: 'bold',
  },
  priceUnit: {
    color: '#D4A373',
    fontSize: 11,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#2C5234', // Forest Green button
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8F8C87',
    fontSize: 14,
  },
});

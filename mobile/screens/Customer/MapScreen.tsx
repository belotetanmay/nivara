import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  Modal,
  Vibration,
  Image,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import apiClient from '../../services/api';
import {
  MapPin,
  Star,
  Sparkles,
  Scan,
  Calendar,
  LogOut,
  Clock,
  Compass,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function MapScreen({ navigation }: any) {
  const { logout, user } = useAuth();
  const [vans, setVans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mumbai initial center coordinate
  const [region, setRegion] = useState({
    latitude: 19.0760,
    longitude: 72.8777,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });

  // Active bookings & tracking states
  const [activeBooking, setActiveBooking] = useState<any | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const warnedBookingId = useRef<string | null>(null);

  // Polling interval refs
  const pollingTimer = useRef<any>(null);
  const countdownTimer = useRef<any>(null);

  useEffect(() => {
    fetchVans();
    startLivePolling();

    return () => {
      stopLivePolling();
    };
  }, []);

  const fetchVans = async () => {
    try {
      const response = await apiClient.get('/customer/vans');
      if (response.data.success) {
        setVans(response.data.vans);
        if (response.data.vans.length > 0 && loading) {
          const firstVan = response.data.vans[0];
          setRegion({
            latitude: firstVan.latitude,
            longitude: firstVan.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch vans', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Start live polling every 15 seconds (Ola/Uber and countdown tracking)
  const startLivePolling = () => {
    // Immediate call
    checkActiveBookings();

    pollingTimer.current = setInterval(() => {
      fetchVans();
      checkActiveBookings();
    }, 15000);
  };

  const stopLivePolling = () => {
    if (pollingTimer.current) clearInterval(pollingTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  };

  // 2. Fetch customer bookings and scan for active sessions running today
  const checkActiveBookings = async () => {
    try {
      const response = await apiClient.get('/customer/bookings');
      if (response.data.success) {
        const bookingsList = response.data.bookings || [];
        const now = new Date().getTime();

        // Find a booking that is currently active (between start time and end time) and status is CONFIRMED/PENDING
        const active = bookingsList.find((b: any) => {
          if (b.status !== 'CONFIRMED' && b.status !== 'PENDING') return false;
          const start = new Date(b.availability?.startTime).getTime();
          const end = start + b.sessionLength * 60 * 1000;
          return now >= start && now <= end;
        });

        if (active) {
          setActiveBooking(active);
          updateCountdown(active);
        } else {
          setActiveBooking(null);
          setTimeLeftStr('');
          setShowWarningModal(false);
        }
      }
    } catch (e) {
      console.warn('Failed to poll active bookings', e);
    }
  };

  // 3. Update the visual countdown progress
  const updateCountdown = (booking: any) => {
    const start = new Date(booking.availability?.startTime).getTime();
    const end = start + booking.sessionLength * 60 * 1000;
    const now = new Date().getTime();
    const secondsRemaining = Math.max(0, Math.round((end - now) / 1000));

    if (secondsRemaining <= 0) {
      setActiveBooking(null);
      setTimeLeftStr('');
      setShowWarningModal(false);
      return;
    }

    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    setTimeLeftStr(`${mins}:${secs < 10 ? '0' : ''}${secs}`);

    // Swiggy 10-Minute warning chime trigger
    if (secondsRemaining <= 600 && warnedBookingId.current !== booking.id) {
      warnedBookingId.current = booking.id;
      // Trigger haptic vibration warning to replicate Swiggy chime alert
      Vibration.vibrate([0, 500, 200, 500]);
      setShowWarningModal(true);
    }
  };

  // Action: Extend session by 30 mins
  const handleExtendSession = async () => {
    if (!activeBooking) return;
    try {
      const response = await apiClient.post(`/customer/bookings/${activeBooking.id}/extend`);
      if (response.data.success) {
        Alert.alert('Session Extended!', 'Your session has been extended by 30 minutes.');
        setShowWarningModal(false);
        warnedBookingId.current = null; // Reset warning trigger for extended duration
        checkActiveBookings();
      }
    } catch (err: any) {
      Alert.alert('Extension Failed', err.response?.data?.message || 'Could not extend session.');
    }
  };

  // Action: Release early
  const handleReleaseEarly = async () => {
    if (!activeBooking) return;
    try {
      const response = await apiClient.patch(`/customer/bookings/${activeBooking.id}/release`);
      if (response.data.success) {
        Alert.alert('Released Early', 'Thank you! Your wellness pod has been released for cleaning.');
        setShowWarningModal(false);
        setActiveBooking(null);
        checkActiveBookings();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not release session.');
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

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
        showsUserLocation
      >
        {/* Station Markers */}
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

            <Callout tooltip onPress={() => navigation.navigate('VanDetails', { vanId: van.id })}>
              <View style={styles.calloutBubble}>
                <Text style={styles.calloutTitle}>{van.title}</Text>
                <Text style={styles.calloutPrice}>₹{van.price15} / 30m session</Text>
                <Text style={styles.calloutLink}>Tap to view slots</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Ola/Uber Live Moving Van Marker (Dynamic location) */}
        {activeBooking && activeBooking.van?.currentLatitude && (
          <Marker
            coordinate={{
              latitude: activeBooking.van.currentLatitude,
              longitude: activeBooking.van.currentLongitude,
            }}
            title="Your Approaching Pod"
            description="Live Location"
          >
            <View style={styles.liveMarkerContainer}>
              <View style={styles.liveMarkerPulse} />
              <View style={styles.liveMarkerCircle}>
                <Compass size={18} color="#FFF" />
              </View>
            </View>
          </Marker>
        )}
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
          <TouchableOpacity style={styles.bookingsButton} onPress={() => navigation.navigate('Bookings')}>
            <Calendar size={18} color="#FFF" />
          </TouchableOpacity>

          {(user?.role === 'VENDOR' || user?.role === 'ADMIN') && (
            <TouchableOpacity style={styles.scannerButton} onPress={() => navigation.navigate('ScanQR')}>
              <Scan size={18} color="#FFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut size={18} color="#0A2540" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ola/Uber live ETA Panel & Swiggy countdown banner */}
      {activeBooking && (
        <View style={styles.trackingCard}>
          <View style={styles.trackingRow}>
            <Clock size={20} color="#D4A373" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.trackingTitle}>Nivara Zen Session Active</Text>
              <Text style={styles.trackingSubtitle}>
                Pod: {activeBooking.van?.title}
              </Text>
            </View>
            <View style={styles.timerBadge}>
              <Text style={styles.timerVal}>{timeLeftStr || '0:00'}</Text>
            </View>
          </View>

          {activeBooking.van?.currentLatitude ? (
            <View style={styles.etaInfoBox}>
              <Text style={styles.etaText}>📍 Your Wellness Pod is in transit! Live tracking active.</Text>
            </View>
          ) : (
            <View style={styles.etaInfoBox}>
              <Text style={styles.etaText}>✅ Currently boarded at pod station.</Text>
            </View>
          )}
        </View>
      )}

      {/* Sliding Sheet Overlay of Vans */}
      {!activeBooking && (
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
      )}

      {/* Swiggy/Zomato style 10-Minute Alert Modal */}
      {showWarningModal && activeBooking && (
        <Modal animationType="slide" transparent={true} visible={showWarningModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.swiggyCard}>
              <View style={styles.swiggyHeader}>
                <View style={styles.bellBadge}>
                  <AlertTriangle size={24} color="#D4A373" />
                </View>
                <Text style={styles.swiggyAlertTitle}>Session Ending Alert</Text>
                <TouchableOpacity onPress={() => setShowWarningModal(false)}>
                  <X size={20} color="#8F8C87" />
                </TouchableOpacity>
              </View>

              <Text style={styles.swiggyAlertDesc}>
                Your session inside <Text style={{ fontWeight: 'bold', color: '#0A2540' }}>{activeBooking.van?.title}</Text> ends in less than 10 minutes.
              </Text>

              <View style={styles.swiggyTimerRow}>
                <Text style={styles.swiggyTimerLabel}>Time Remaining:</Text>
                <Text style={styles.swiggyTimerVal}>{timeLeftStr}</Text>
              </View>

              <View style={styles.swiggyDivider} />

              <TouchableOpacity style={styles.swiggyExtendBtn} onPress={handleExtendSession}>
                <Sparkles size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.swiggyBtnText}>Extend Session (+30 min)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.swiggyReleaseBtn} onPress={handleReleaseEarly}>
                <CheckCircle size={16} color="#2C5234" style={{ marginRight: 6 }} />
                <Text style={styles.swiggyReleaseBtnText}>Release Pod Early</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#0A2540',
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  scannerButton: {
    backgroundColor: '#2C5234',
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
    backgroundColor: '#2C5234',
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
    color: '#D4A373',
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
  liveMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  liveMarkerPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 37, 64, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(10, 37, 64, 0.4)',
  },
  liveMarkerCircle: {
    backgroundColor: '#0A2540',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  trackingCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 36 : 20,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingTitle: {
    color: '#0A2540',
    fontWeight: 'bold',
    fontSize: 14,
  },
  trackingSubtitle: {
    color: '#8F8C87',
    fontSize: 12,
    marginTop: 2,
  },
  timerBadge: {
    backgroundColor: '#0A2540',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerVal: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  etaInfoBox: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E1D8',
  },
  etaText: {
    color: '#2C5234',
    fontSize: 12,
    fontWeight: '500',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF8F5',
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
    backgroundColor: '#FFFFFF',
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
    color: '#D4A373',
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
    backgroundColor: '#2C5234',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 64, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  swiggyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  swiggyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  bellBadge: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4A373',
    marginRight: 12,
  },
  swiggyAlertTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  swiggyAlertDesc: {
    color: '#8F8C87',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  swiggyTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E1D8',
    marginBottom: 20,
  },
  swiggyTimerLabel: {
    color: '#0A2540',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 8,
  },
  swiggyTimerVal: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  swiggyDivider: {
    height: 1,
    backgroundColor: '#E5E1D8',
    width: '100%',
    marginBottom: 16,
  },
  swiggyExtendBtn: {
    backgroundColor: '#0A2540',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  swiggyBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  swiggyReleaseBtn: {
    backgroundColor: '#FAF8F5',
    borderColor: '#E5E1D8',
    borderWidth: 1.5,
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  swiggyReleaseBtnText: {
    color: '#2C5234',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

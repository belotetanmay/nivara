import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Switch,
  ScrollView,
} from 'react-native';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  RefreshCw,
  LogOut,
  Scan,
  Compass,
  DollarSign,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Layers,
  MapPin,
} from 'lucide-react-native';

export default function VendorDashboardScreen({ navigation }: any) {
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [vans, setVans] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>({ totalEarnings: 0, completedSessionsCount: 0, utilizationRate: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tabs state: 'overview' | 'vans' | 'bookings'
  const [activeTab, setActiveTab] = useState<'overview' | 'vans' | 'bookings'>('overview');

  // GPS Simulation tracking
  const [simulatingVanId, setSimulatingVanId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/vendor/dashboard');
      if (response.data.success) {
        setProfile(response.data.vendorProfile);
        setBookings(response.data.bookings || []);
        setEarnings(response.data.earnings || { totalEarnings: 0, completedSessionsCount: 0, utilizationRate: 0 });
      }

      // Fetch vendor's vans for slot generation and simulation
      const vansResponse = await apiClient.get('/vendor/vans');
      if (vansResponse.data.success) {
        setVans(vansResponse.data.vans || []);
        const activeSimVan = (vansResponse.data.vans || []).find((v: any) => v.currentLatitude !== null);
        if (activeSimVan) {
          setSimulatingVanId(activeSimVan.id);
        }
      }
    } catch (e) {
      console.warn('Failed to load vendor dashboard', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleSignOut = async () => {
    await logout();
  };

  // Action: Generate Availability slots for today (MakeMyTrip style inventory controller)
  const handleGenerateSlots = async (vanId: string) => {
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    setLoading(true);
    try {
      const response = await apiClient.post('/vendor/availability/generate', {
        vanId,
        date: todayStr,
      });
      if (response.data.success) {
        Alert.alert(
          'Inventory Generated!',
          response.data.message || '12 standard hours slots generated successfully with cleaning buffer gaps.'
        );
        fetchDashboardData();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to generate availability slots.');
      setLoading(false);
    }
  };

  // Toggle GPS Simulation (Zomato/Uber style)
  const toggleGpsSimulation = async (vanId: string) => {
    const isSimulating = simulatingVanId === vanId;
    try {
      if (!isSimulating) {
        const startLat = 19.0596 + (Math.random() - 0.5) * 0.01;
        const startLng = 72.8295 + (Math.random() - 0.5) * 0.01;
        const response = await apiClient.patch(`/vendor/vans/${vanId}/gps`, {
          currentLatitude: startLat,
          currentLongitude: startLng,
        });

        if (response.data.success) {
          setSimulatingVanId(vanId);
          Alert.alert(
            'GPS Simulation Started',
            'Your van location is now updating dynamically. Customers will see you moving on the live map!'
          );
        }
      } else {
        const response = await apiClient.patch(`/vendor/vans/${vanId}/gps`, {
          currentLatitude: null,
          currentLongitude: null,
        });

        if (response.data.success) {
          setSimulatingVanId(null);
          Alert.alert('GPS Simulation Stopped', 'Van location has reverted to its permanent base address.');
        }
      }
      fetchDashboardData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update GPS simulation');
    }
  };

  // Confirm Check-In (Confirm Booking)
  const handleConfirmCheckIn = async (bookingId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.patch(`/vendor/bookings/${bookingId}/confirm`);
      if (response.data.success) {
        Alert.alert('Confirmed!', 'Traveler checked in successfully. Session is now active.');
        fetchDashboardData();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to confirm check-in');
      setLoading(false);
    }
  };

  // Complete Session (Complete Booking)
  const handleMarkComplete = async (booking: any) => {
    setLoading(true);
    try {
      const response = await apiClient.patch(`/vendor/bookings/${booking.id}/complete`, {
        actualDuration: booking.sessionLength,
      });
      if (response.data.success) {
        Alert.alert('Session Completed', 'The wellness session has been successfully marked as completed.');
        fetchDashboardData();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to complete session');
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#2C5234';
      case 'PENDING':
        return '#D4A373';
      default:
        return '#EF4444';
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A2540" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'http://192.168.1.93:3000/nivara_logo_transparent.png' }}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Partner Portal</Text>
          <Text style={styles.headerSub}>{profile?.businessName || 'Wellness Host'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <LogOut size={18} color="#0A2540" />
        </TouchableOpacity>
      </View>

      {/* Tabs Strip (MMT Style) */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
          { key: 'vans', label: 'My Vans & Inventory', icon: <Layers size={16} /> },
          { key: 'bookings', label: 'Bookings Queue', icon: <Calendar size={16} /> },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isSelected && styles.tabItemSelected]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabItemText, isSelected && styles.tabItemTextSelected]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} refreshing={refreshing} onRefresh={handleRefresh}>
        {/* Verification Status Progress Tracker Card (Always visible at top of Overview) */}
        {activeTab === 'overview' && (
          <View style={styles.kycCard}>
            <View style={styles.kycHeader}>
              <Text style={styles.kycTitle}>KYC Verification Tracker</Text>
              <View
                style={[
                  styles.miniBadge,
                  { backgroundColor: getStatusBadgeColor(profile?.verificationStatus || 'PENDING') + '15' },
                ]}
              >
                <Text
                  style={[
                    styles.miniBadgeText,
                    { color: getStatusBadgeColor(profile?.verificationStatus || 'PENDING') },
                  ]}
                >
                  {profile?.verificationStatus || 'PENDING'}
                </Text>
              </View>
            </View>

            {/* Verification checklist steps */}
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: '#2C5234' }]} />
              <Text style={styles.stepTextDone}>1. Partner Account Created</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: '#2C5234' }]} />
              <Text style={styles.stepTextDone}>2. Onboarding Details Submitted</Text>
            </View>
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      profile?.verificationStatus === 'APPROVED' ? '#2C5234' : '#D4A373',
                  },
                ]}
              />
              <Text
                style={
                  profile?.verificationStatus === 'APPROVED'
                    ? styles.stepTextDone
                    : styles.stepTextPending
                }
              >
                3. Founder Vetting & Van Listing Granted
              </Text>
            </View>
          </View>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <Text style={styles.sectionHeading}>Financials & Utilization</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <DollarSign size={22} color="#2C5234" style={{ marginBottom: 4 }} />
                <Text style={styles.metricVal}>₹{earnings.totalEarnings || 0}</Text>
                <Text style={styles.metricLabel}>Session Revenue</Text>
              </View>

              <View style={styles.metricCard}>
                <TrendingUp size={22} color="#0A2540" style={{ marginBottom: 4 }} />
                <Text style={styles.metricVal}>{earnings.utilizationRate || 0}%</Text>
                <Text style={styles.metricLabel}>Utilization Rate</Text>
              </View>

              <View style={styles.metricCard}>
                <Briefcase size={22} color="#D4A373" style={{ marginBottom: 4 }} />
                <Text style={styles.metricVal}>{earnings.completedSessionsCount || 0}</Text>
                <Text style={styles.metricLabel}>Sessions Finished</Text>
              </View>
            </View>

            {/* GPS Simulation Panel */}
            {vans.length > 0 && (
              <View style={styles.simulationCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Compass size={20} color="#0A2540" style={{ marginRight: 8 }} />
                  <Text style={styles.simCardTitle}>Van GPS Simulator (Ola/Uber Driver app mode)</Text>
                </View>
                <Text style={styles.simCardSubtitle}>
                  Simulate live coordinates movements for your vans. Customers will see your van moving on their live map.
                </Text>

                {vans.map((van) => {
                  const isSimulating = simulatingVanId === van.id;
                  return (
                    <View key={van.id} style={styles.vanSimRow}>
                      <Text style={styles.vanSimName} numberOfLines={1}>
                        {van.title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 11, color: isSimulating ? '#2C5234' : '#8F8C87', marginRight: 8, fontWeight: 'bold' }}>
                          {isSimulating ? 'DRIVING LIVE' : 'STATIONARY'}
                        </Text>
                        <Switch
                          value={isSimulating}
                          onValueChange={() => toggleGpsSimulation(van.id)}
                          trackColor={{ false: '#E5E1D8', true: '#2C5234' }}
                          thumbColor={isSimulating ? '#FAF8F5' : '#8F8C87'}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {/* 2. VANS & INVENTORY TAB */}
        {activeTab === 'vans' && (
          <View>
            <Text style={styles.sectionHeading}>My Wellness Fleet ({vans.length})</Text>
            {vans.length === 0 ? (
              <Text style={styles.noDataText}>No listed wellness vans found.</Text>
            ) : (
              vans.map((van) => (
                <View key={van.id} style={styles.vanInventoryCard}>
                  <View style={styles.vanInventoryHeader}>
                    <Text style={styles.vanInventoryTitle}>{van.title}</Text>
                    <View
                      style={[
                        styles.miniBadge,
                        { backgroundColor: getStatusBadgeColor(van.status) + '15' },
                      ]}
                    >
                      <Text style={[styles.miniBadgeText, { color: getStatusBadgeColor(van.status) }]}>
                        {van.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.vanInventoryAddress}>
                    <MapPin size={12} color="#8F8C87" /> {van.address}
                  </Text>

                  <View style={styles.vanInventorySpecs}>
                    <Text style={styles.vanSpecItem}>Base slot (30m): ₹{van.price15}</Text>
                    <Text style={styles.vanSpecItem}>Standard slot (45m): ₹{van.price30}</Text>
                    <Text style={styles.vanSpecItem}>Premium slot (60m): ₹{van.price45}</Text>
                  </View>

                  <View style={styles.vanInventoryActions}>
                    <TouchableOpacity
                      style={styles.generateBtn}
                      onPress={() => handleGenerateSlots(van.id)}
                    >
                      <Calendar size={14} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.generateBtnText}>Generate Availability Inventory</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 3. BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <View>
            <Text style={styles.sectionHeading}>Active & Upcoming Check-ins ({bookings.length})</Text>
            {bookings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AlertTriangle size={36} color="#8F8C87" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyText}>No reservations recorded yet.</Text>
              </View>
            ) : (
              bookings.map((item) => {
                const isPending = item.status === 'PENDING';
                const isConfirmed = item.status === 'CONFIRMED';
                const dateFormatted = new Date(item.availability?.startTime).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });
                const timeFormatted = new Date(item.availability?.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <View key={item.id} style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                      <Text style={styles.bookingCode}>{item.bookingCode}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusBadgeColor(item.status) + '15' },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: getStatusBadgeColor(item.status) }]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.bookingVanName}>{item.van?.title}</Text>
                    <Text style={styles.customerDetail}>
                      Customer: {item.customer?.name} ({item.customer?.email})
                    </Text>
                    <Text style={styles.timeDetail}>
                      Time Slot: {dateFormatted} at {timeFormatted} ({item.sessionLength}m)
                    </Text>

                    <View style={styles.specRow}>
                      <Text style={styles.specText}>🌸 {item.scent}</Text>
                      <Text style={styles.specText}>💡 {item.lighting}</Text>
                      <Text style={styles.specText}>🎵 {item.audio}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.cardActions}>
                      {isPending && (
                        <TouchableOpacity
                          style={styles.confirmBtn}
                          onPress={() => handleConfirmCheckIn(item.id)}
                        >
                          <Text style={styles.btnText}>Check-in Guest</Text>
                        </TouchableOpacity>
                      )}

                      {isConfirmed && (
                        <TouchableOpacity
                          style={styles.completeBtn}
                          onPress={() => handleMarkComplete(item)}
                        >
                          <Text style={styles.btnText}>Complete Session</Text>
                        </TouchableOpacity>
                      )}

                      {!isPending && !isConfirmed && (
                        <Text style={styles.noActionText}>No actions required</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating QR Scanner Trigger */}
      <TouchableOpacity style={styles.fabScanButton} onPress={() => navigation.navigate('ScanQR')}>
        <Scan size={24} color="#FFF" style={{ marginRight: 6 }} />
        <Text style={styles.fabScanText}>Open Scanner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  headerSub: {
    fontSize: 12,
    color: '#2C5234',
    fontWeight: '600',
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E1D8',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemSelected: {
    borderBottomColor: '#0A2540',
  },
  tabItemText: {
    color: '#8F8C87',
    fontSize: 12,
    fontWeight: '600',
  },
  tabItemTextSelected: {
    color: '#0A2540',
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  kycCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    marginBottom: 16,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kycTitle: {
    color: '#0A2540',
    fontSize: 14,
    fontWeight: 'bold',
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stepTextDone: {
    color: '#2C5234',
    fontSize: 12,
    fontWeight: '500',
  },
  stepTextPending: {
    color: '#8F8C87',
    fontSize: 12,
  },
  sectionHeading: {
    color: '#0A2540',
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  metricVal: {
    color: '#0A2540',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#8F8C87',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  simulationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    marginBottom: 16,
  },
  simCardTitle: {
    color: '#0A2540',
    fontSize: 14,
    fontWeight: 'bold',
  },
  simCardSubtitle: {
    color: '#8F8C87',
    fontSize: 12,
    marginBottom: 12,
  },
  vanSimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E1D8',
    marginBottom: 8,
  },
  vanSimName: {
    color: '#0A2540',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  vanInventoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    marginBottom: 16,
  },
  vanInventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vanInventoryTitle: {
    color: '#0A2540',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  vanInventoryAddress: {
    color: '#8F8C87',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  vanInventorySpecs: {
    backgroundColor: '#FAF8F5',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E1D8',
    marginBottom: 12,
  },
  vanSpecItem: {
    color: '#0A2540',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  vanInventoryActions: {
    alignItems: 'flex-start',
  },
  generateBtn: {
    backgroundColor: '#0A2540',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingCode: {
    color: '#0A2540',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  bookingVanName: {
    color: '#2C5234',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerDetail: {
    color: '#0A2540',
    fontSize: 12,
    marginBottom: 2,
  },
  timeDetail: {
    color: '#8F8C87',
    fontSize: 12,
    marginBottom: 8,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  specText: {
    color: '#0A2540',
    fontSize: 11,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E1D8',
    marginRight: 6,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E1D8',
    marginVertical: 12,
  },
  cardActions: {
    alignItems: 'stretch',
  },
  confirmBtn: {
    backgroundColor: '#2C5234',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBtn: {
    backgroundColor: '#0A2540',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  noActionText: {
    color: '#8F8C87',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  noDataText: {
    color: '#8F8C87',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8F8C87',
    fontSize: 13,
  },
  fabScanButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2C5234',
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  fabScanText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

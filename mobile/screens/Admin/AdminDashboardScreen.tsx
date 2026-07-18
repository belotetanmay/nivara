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
  ScrollView,
} from 'react-native';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Users,
  Compass,
  DollarSign,
  TrendingUp,
  Inbox,
  Clock,
  Layers,
} from 'lucide-react-native';

export default function AdminDashboardScreen({ navigation }: any) {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tabs state: 'overview' | 'queues' | 'logs'
  const [activeTab, setActiveTab] = useState<'overview' | 'queues' | 'logs'>('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (e) {
      console.warn('Failed to load admin stats', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleSignOut = async () => {
    await logout();
  };

  const renderBookingItem = ({ item }: { item: any }) => {
    const isSuccess = item.status === 'CONFIRMED' || item.status === 'COMPLETED';
    return (
      <View style={styles.bookingRow}>
        <View style={{ flex: 1.2 }}>
          <Text style={styles.bookingCode} numberOfLines={1}>
            {item.bookingCode}
          </Text>
          <Text style={styles.bookingDate}>
            {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={{ flex: 2 }}>
          <Text style={styles.bookingDetails} numberOfLines={1}>
            {item.customer?.name}
          </Text>
          <Text style={styles.bookingVan} numberOfLines={1}>
            {item.van?.title}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={styles.bookingPrice}>₹{item.payment?.amount || 0}</Text>
          <Text style={[styles.bookingStatus, { color: isSuccess ? '#2C5234' : '#EF4444' }]}>
            {item.status}
          </Text>
        </View>
      </View>
    );
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
          <Text style={styles.headerTitle}>Control Center</Text>
          <Text style={styles.headerSub}>Founder Portal</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <LogOut size={18} color="#0A2540" />
        </TouchableOpacity>
      </View>

      {/* Segmented Tab Bar (MMT Admin style) */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
          { key: 'queues', label: 'Approvals Inbox', icon: <Inbox size={16} /> },
          { key: 'logs', label: 'Recent Activity', icon: <Layers size={16} /> },
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
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <Text style={styles.sectionHeading}>Platform Financial Performance</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <DollarSign size={22} color="#2C5234" style={{ marginBottom: 4 }} />
                <Text style={styles.metricVal}>₹{stats?.gmv?.toLocaleString('en-IN') || 0}</Text>
                <Text style={styles.metricLabel}>Platform GMV</Text>
              </View>

              <View style={styles.metricCard}>
                <Users size={22} color="#0A2540" style={{ marginBottom: 4 }} />
                <Text style={styles.metricVal}>{stats?.totalUsers || 0}</Text>
                <Text style={styles.metricLabel}>Total Customers</Text>
              </View>

              <View style={styles.metricCard}>
                <Compass size={22} color="#D4A373" style={{ marginBottom: 4 }} />
                <Text style={styles.metricVal}>
                  {stats?.activeVans || 0}/{stats?.totalVans || 0}
                </Text>
                <Text style={styles.metricLabel}>Fleet Status</Text>
              </View>
            </View>

            {/* Platform statistics card */}
            <View style={styles.platformCard}>
              <Text style={styles.cardTitle}>Marketplace Statistics</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Service Bookings Placed:</Text>
                <Text style={styles.statVal}>{stats?.totalBookings || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Bookings Today:</Text>
                <Text style={styles.statVal}>{stats?.bookingsToday || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Registered Hosts (Vendors):</Text>
                <Text style={styles.statVal}>{stats?.totalVendors || 0}</Text>
              </View>
            </View>
          </>
        )}

        {/* 2. QUEUES TAB */}
        {activeTab === 'queues' && (
          <View>
            <Text style={styles.sectionHeading}>Pending Review Items</Text>
            <View style={styles.queuesColumn}>
              {/* KYC queue */}
              <TouchableOpacity
                style={styles.queueCard}
                onPress={() => navigation.navigate('AdminApprovals', { type: 'KYC' })}
              >
                <View style={styles.queueHeader}>
                  <Inbox size={20} color="#0A2540" />
                  <Text style={styles.queueBadge}>{stats?.pendingKycCount || 0} Pending</Text>
                </View>
                <Text style={styles.queueTitle}>KYC Verification Queue</Text>
                <Text style={styles.queueDesc}>
                  Verify customer identity documents to grant active booking access.
                </Text>
                <Text style={styles.queueLink}>Inspect Queue →</Text>
              </TouchableOpacity>

              {/* Host queue */}
              <TouchableOpacity
                style={styles.queueCard}
                onPress={() => navigation.navigate('AdminApprovals', { type: 'VANS' })}
              >
                <View style={styles.queueHeader}>
                  <ShieldAlert size={20} color="#2C5234" />
                  <Text style={styles.queueBadge}>{stats?.pendingVendorCount || 0} Pending</Text>
                </View>
                <Text style={styles.queueTitle}>Host Onboarding Queue</Text>
                <Text style={styles.queueDesc}>
                  Verify new partner signups and grant wellness van permissions.
                </Text>
                <Text style={styles.queueLink}>Inspect Queue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 3. LOGS TAB */}
        {activeTab === 'logs' && (
          <View>
            <Text style={styles.sectionHeading}>Recent Traveler Bookings Logs</Text>
            <FlatList
              data={stats?.recentBookings || []}
              keyExtractor={(item) => item.id}
              renderItem={renderBookingItem}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No recent booking logs.</Text>
                </View>
              }
            />
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 40,
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
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#8F8C87',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  platformCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#0A2540',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    color: '#8F8C87',
    fontSize: 13,
  },
  statVal: {
    color: '#0A2540',
    fontWeight: 'bold',
    fontSize: 13,
  },
  queuesColumn: {
    flexDirection: 'column',
  },
  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    marginBottom: 12,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  queueBadge: {
    color: '#D4A373',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#D4A373',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 'bold',
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 4,
  },
  queueDesc: {
    fontSize: 12,
    color: '#8F8C87',
    lineHeight: 16,
    marginBottom: 12,
  },
  queueLink: {
    fontSize: 11,
    color: '#2C5234',
    fontWeight: 'bold',
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  bookingCode: {
    color: '#0A2540',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bookingDate: {
    color: '#8F8C87',
    fontSize: 10,
    marginTop: 2,
  },
  bookingDetails: {
    color: '#0A2540',
    fontSize: 13,
    fontWeight: '500',
  },
  bookingVan: {
    color: '#8F8C87',
    fontSize: 11,
    marginTop: 2,
  },
  bookingPrice: {
    color: '#0A2540',
    fontWeight: 'bold',
    fontSize: 13,
  },
  bookingStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8F8C87',
    fontSize: 13,
  },
});

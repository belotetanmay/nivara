import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, Star, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/feedback/Toast';
import { vendorService } from '../../../services/vendor/vendorService';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function VendorDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { show } = useToast();

  const [stats, setStats] = useState({ totalEarnings: 0, activeBookings: 0, ratingAvg: 5.0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVendorData = async () => {
    setLoading(true);
    const [statsRes, bookingsRes] = await Promise.all([
      vendorService.getVendorStats(),
      vendorService.getVendorBookings(),
    ]);
    setStats(statsRes);
    setBookings(bookingsRes);
    setLoading(false);
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    const res = await vendorService.updateBookingStatus(bookingId, status);
    if (res.success) {
      show(`Booking status updated to ${status}`, 'success');
      loadVendorData();
    } else {
      show(res.error || 'Failed to update booking status', 'error');
    }
  };

  const formatDateTime = (startTimeStr?: string) => {
    if (!startTimeStr) return 'TBD';
    try {
      const date = new Date(startTimeStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return startTimeStr;
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {router.canGoBack() && (
            <TouchableOpacity onPress={handleBack} style={{ marginRight: 12, paddingVertical: 4 }} activeOpacity={0.7}>
              <ArrowLeft size={20} color="#0F2D52" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerSubtitle}>Wellness Partner</Text>
            <Text style={styles.headerTitle}>Vendor Dashboard</Text>
          </View>
        </View>
        <Avatar name={user?.name || 'John Partner'} size="md" />
      </View>

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <Skeleton width="80%" height={18} style={{ marginBottom: 20 }} />
          <View style={styles.metricsRow}>
            <Card style={styles.metricCardHalf}>
              <Skeleton width="50%" height={12} style={{ marginBottom: 8 }} />
              <Skeleton width="70%" height={24} />
            </Card>
            <Card style={styles.metricCardHalf}>
              <Skeleton width="50%" height={12} style={{ marginBottom: 8 }} />
              <Skeleton width="70%" height={24} />
            </Card>
            <Card style={styles.metricCardFull}>
              <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={24} />
            </Card>
          </View>
          <Skeleton width="50%" height={16} style={{ marginBottom: 14 }} />
          {[1, 2].map((k) => (
            <Card key={k} style={styles.sessionCard}>
              <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="40%" height={14} style={{ marginBottom: 12 }} />
              <Skeleton width="100%" height={36} borderRadius={8} />
            </Card>
          ))}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.greetingText}>
            Welcome back, {user?.name?.split(' ')[0] || 'Partner'}. Your Nivara fleet operations center.
          </Text>

          {/* Metric cards */}
          <View style={styles.metricsRow}>
            {/* Total Earnings */}
            <Card style={styles.metricCardHalf}>
              <Text style={styles.metricLabel}>Total Earnings</Text>
              <Text style={styles.metricValue}>₹{stats.totalEarnings.toLocaleString('en-IN')}</Text>
              <View style={styles.trendRow}>
                <ArrowUpRight size={14} color="#16A34A" />
                <Text style={styles.trendText}>Live Sync</Text>
              </View>
            </Card>

            {/* Active Bookings */}
            <Card style={styles.metricCardHalf}>
              <Text style={styles.metricLabel}>Active Bookings</Text>
              <Text style={styles.metricValue}>{stats.activeBookings}</Text>
              <Text style={styles.metricSubtext}>Pending / Confirmed</Text>
            </Card>

            {/* Average Rating */}
            <Card style={styles.metricCardFull}>
              <View>
                <Text style={styles.metricLabel}>Average Rating</Text>
                <Text style={styles.ratingValue}>{stats.ratingAvg.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>Guest Reviews Average</Text>
              </View>
              <View style={styles.ratingStarsBox}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    color={star <= Math.round(stats.ratingAvg) ? '#F97316' : '#E5E1D8'}
                    fill={star <= Math.round(stats.ratingAvg) ? '#F97316' : 'transparent'}
                  />
                ))}
              </View>
            </Card>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Incoming Reservations ({bookings.length})</Text>
          </View>

          {/* Incoming Sessions list */}
          {bookings.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Clock size={32} color="#9CA3AF" />
              <Text style={styles.emptyText}>No incoming customer booking requests yet.</Text>
            </Card>
          ) : (
            <View style={styles.sessionsList}>
              {bookings.map((b) => {
                const isPending = b.status === 'PENDING';
                const isConfirmed = b.status === 'CONFIRMED';
                const isCompleted = b.status === 'COMPLETED';

                return (
                  <Card key={b.id} style={styles.sessionCard}>
                    <View style={styles.sessionHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.customerName}>{b.customer?.name || 'Customer'}</Text>
                        <Text style={styles.sessionSubtitle} numberOfLines={1}>{b.sessionLength} Min Session • {b.van?.title}</Text>
                      </View>
                      <Badge
                        label={b.status}
                        variant={isConfirmed ? 'success' : isCompleted ? 'primary' : isPending ? 'warning' : 'secondary'}
                      />
                    </View>
                    
                    <View style={styles.timeTag}>
                      <Text style={styles.timeText}>{formatDateTime(b.availability?.startTime)}</Text>
                    </View>

                    <Text style={styles.codeText}>Booking Code: {b.bookingCode}</Text>

                    {/* Action buttons depending on state */}
                    <View style={styles.sessionActions}>
                      {isPending && (
                        <>
                          <Button
                            title="Accept"
                            leftIcon={<CheckCircle size={14} color="#FFFFFF" />}
                            size="sm"
                            onPress={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                            style={styles.acceptBtn}
                          />
                          <Button
                            title="Reject"
                            leftIcon={<XCircle size={14} color="#EF4444" />}
                            variant="outline"
                            size="sm"
                            onPress={() => handleUpdateStatus(b.id, 'CANCELLED')}
                            style={styles.rejectBtn}
                          />
                        </>
                      )}

                      {isConfirmed && (
                        <>
                          <Button
                            title="Complete Session"
                            leftIcon={<CheckCircle size={14} color="#FFFFFF" />}
                            size="sm"
                            onPress={() => handleUpdateStatus(b.id, 'COMPLETED')}
                            style={styles.acceptBtn}
                          />
                          <Button
                            title="Cancel"
                            variant="outline"
                            size="sm"
                            onPress={() => handleUpdateStatus(b.id, 'CANCELLED')}
                            style={styles.rejectBtn}
                          />
                        </>
                      )}

                      {isCompleted && (
                        <Text style={styles.completedTag}>Session Completed Successfully</Text>
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </ScrollView>
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  greetingText: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCardHalf: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
    minHeight: 110,
    justifyContent: 'space-between',
  },
  metricCardFull: {
    width: '100%',
    padding: 16,
    marginBottom: 20,
    borderRadius: 16,
    borderColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: '#0F2D52',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  trendText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  metricSubtext: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  ratingValue: {
    color: '#0F2D52',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  ratingCount: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  ratingStarsBox: {
    flexDirection: 'row',
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#0F2D52',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E1D8',
    borderRadius: 16,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  sessionsList: {
    marginTop: 4,
  },
  sessionCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  customerName: {
    color: '#0F2D52',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sessionSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  timeTag: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  timeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  codeText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 12,
  },
  sessionActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E1D8',
    paddingTop: 16,
  },
  acceptBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#16A34A',
    borderRadius: 8,
  },
  rejectBtn: {
    flex: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
  },
  completedTag: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
}) as any;

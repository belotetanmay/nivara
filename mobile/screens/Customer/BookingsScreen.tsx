import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import apiClient from '../../services/api';
import {
  Calendar,
  Clock,
  Smile,
  Tag,
  RefreshCw,
  X,
  CheckCircle,
  AlertTriangle,
  Heart,
  Star,
  Wallet,
  Hourglass,
  Sparkles,
} from 'lucide-react-native';

export default function BookingsScreen({ navigation }: any) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);

  // Review form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Tabs state: 'upcoming' | 'past' | 'cancelled'
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/customer/bookings');
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (e) {
      console.warn('Failed to load bookings', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Real-time computed metrics mirroring the website dashboard logic
  const totalMinutesRelaxed = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.sessionLength, 0);

  const upcomingCount = bookings
    .filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED')
    .length;

  const spent = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.payment?.amount || 0), 0);
  const walletBalance = Math.max(0, 2500 - spent);

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') {
      return b.status === 'PENDING' || b.status === 'CONFIRMED';
    } else if (activeTab === 'past') {
      return b.status === 'COMPLETED';
    } else {
      return b.status === 'CANCELLED';
    }
  });

  // Action: Cancel Booking (DELETE)
  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Reservation?',
      'Are you sure you want to cancel this wellness pod session? This action cannot be undone and your slot will be released.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Reservation',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await apiClient.delete(`/customer/bookings/${bookingId}`);
              if (response.data.success) {
                Alert.alert('Cancelled!', 'Your booking has been cancelled and refunded successfully.');
                fetchBookings();
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to cancel booking');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Action: Pay Overtime (POST)
  const handlePayOvertime = async (bookingId: string, amount: number) => {
    setLoading(true);
    try {
      const response = await apiClient.post(`/customer/bookings/${bookingId}/pay-overtime`);
      if (response.data.success) {
        Alert.alert('Payment Completed!', `Overtime fee of ₹${amount} paid successfully!`);
        fetchBookings();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Overtime payment failed');
      setLoading(false);
    }
  };

  // Action: Submit Review (POST)
  const handleSubmitReview = async () => {
    if (comment.trim().length < 20) {
      Alert.alert('Feedback Required', 'Please enter a review comment of at least 20 characters.');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await apiClient.post('/customer/reviews', {
        bookingId: reviewBooking.id,
        rating,
        comment: comment.trim(),
      });

      if (response.data.success) {
        Alert.alert('Thank You!', 'Your wellness review has been submitted successfully.');
        setReviewBooking(null);
        setComment('');
        setRating(5);
        fetchBookings();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#2C5234'; // Forest Green
      case 'PENDING':
        return '#D4A373'; // Amber
      case 'COMPLETED':
        return '#0A2540'; // Deep Navy
      case 'CANCELLED':
        return '#EF4444'; // Red
      default:
        return '#8F8C87';
    }
  };

  const renderBookingCard = ({ item }: { item: any }) => {
    const dateObj = new Date(item.availability?.startTime);
    const dateFormatted = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.vanTitle}>{item.van?.title || 'Wellness Pod'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.bookingAddress}>{item.van?.address}</Text>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Calendar size={14} color="#2C5234" />
            <Text style={styles.detailText}>{dateFormatted}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color="#2C5234" />
            <Text style={styles.detailText}>{timeFormatted} ({item.sessionLength}m)</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Smile size={14} color="#2C5234" />
            <Text style={styles.detailText}>{item.scent} • {item.lighting}</Text>
          </View>
          <View style={styles.detailItem}>
            <Tag size={14} color="#2C5234" />
            <Text style={styles.detailText}>Code: {item.bookingCode}</Text>
          </View>
        </View>

        {/* Overtime charge warnings */}
        {item.overtimeStatus === 'UNPAID' && (
          <View style={styles.overtimeAlertCard}>
            <AlertTriangle size={18} color="#D4A373" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.overtimeAlertTitle}>Unpaid Overtime Charge</Text>
              <Text style={styles.overtimeAlertDesc}>
                You stayed {item.overtimeMinutes}m over. Amount due: ₹{item.overtimeAmount}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.overtimePayBtn}
              onPress={() => handlePayOvertime(item.id, item.overtimeAmount)}
            >
              <Text style={styles.overtimePayBtnText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.cardActionsContainer}>
          {item.status !== 'CANCELLED' && (
            <TouchableOpacity
              style={styles.ticketButton}
              onPress={() => setSelectedBooking(item)}
            >
              <Text style={styles.ticketButtonText}>View QR Ticket</Text>
            </TouchableOpacity>
          )}

          {/* Cancel option for upcoming */}
          {(item.status === 'PENDING' || item.status === 'CONFIRMED') && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel Session</Text>
            </TouchableOpacity>
          )}

          {/* Write review option for past completed bookings */}
          {item.status === 'COMPLETED' && !item.review && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => setReviewBooking(item)}
            >
              <Heart size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.reviewButtonText}>Write Review</Text>
            </TouchableOpacity>
          )}

          {item.status === 'COMPLETED' && item.review && (
            <View style={styles.reviewedLabel}>
              <CheckCircle size={14} color="#2C5234" />
              <Text style={styles.reviewedLabelText}>Review Submitted</Text>
            </View>
          )}
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
        <TouchableOpacity style={styles.backNavButton} onPress={() => navigation.goBack()}>
          <X size={20} color="#0A2540" />
        </TouchableOpacity>
        {/* Prominent Logo Visibility in header */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Sparkles size={16} color="#2C5234" style={{ marginRight: 4 }} />
          <Text style={styles.headerTitle}>NIVARA</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh}>
          <RefreshCw size={18} color="#0A2540" />
        </TouchableOpacity>
      </View>

      {/* Metrics Section */}
      <View style={styles.metricsPane}>
        <View style={styles.metricCard}>
          <Wallet size={18} color="#2C5234" style={{ marginBottom: 4 }} />
          <Text style={styles.metricVal}>₹{walletBalance}</Text>
          <Text style={styles.metricLabel}>Zen Balance</Text>
        </View>
        <View style={styles.metricCard}>
          <Hourglass size={18} color="#0A2540" style={{ marginBottom: 4 }} />
          <Text style={styles.metricVal}>{totalMinutesRelaxed}m</Text>
          <Text style={styles.metricLabel}>Minutes Relaxed</Text>
        </View>
        <View style={styles.metricCard}>
          <Sparkles size={18} color="#D4A373" style={{ marginBottom: 4 }} />
          <Text style={styles.metricVal}>{upcomingCount}</Text>
          <Text style={styles.metricLabel}>Reserved Pods</Text>
        </View>
      </View>

      {/* Toggle Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' },
          { key: 'cancelled', label: 'Cancelled' },
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

      {filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AlertTriangle size={48} color="#8F8C87" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No reservations found.</Text>
          <Text style={styles.emptySubtitle}>Your sessions in this tab will show up here.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      {/* QR Ticket Modal */}
      {selectedBooking && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!selectedBooking}
          onRequestClose={() => setSelectedBooking(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.ticketContainer}>
              {/* Ticket Top */}
              <View style={styles.ticketTop}>
                <Text style={styles.ticketBrand}>NIVARA WELLNESS</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedBooking(null)}>
                  <X size={20} color="#0A2540" />
                </TouchableOpacity>
              </View>

              {/* Ticket Content */}
              <View style={styles.ticketBody}>
                <Text style={styles.ticketVanTitle}>{selectedBooking.van?.title}</Text>
                <Text style={styles.ticketVanAddress}>{selectedBooking.van?.address}</Text>

                <View style={styles.ticketDetailsGrid}>
                  <View style={styles.ticketDetail}>
                    <Text style={styles.ticketLabel}>DATE</Text>
                    <Text style={styles.ticketVal}>
                      {new Date(selectedBooking.availability?.startTime).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.ticketDetail}>
                    <Text style={styles.ticketLabel}>TIME</Text>
                    <Text style={styles.ticketVal}>
                      {new Date(selectedBooking.availability?.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={styles.ticketDetail}>
                    <Text style={styles.ticketLabel}>DURATION</Text>
                    <Text style={styles.ticketVal}>{selectedBooking.sessionLength} Min</Text>
                  </View>
                </View>

                {/* Custom settings info */}
                <View style={styles.customSpecsContainer}>
                  <Text style={styles.specsTitle}>Customized Environment:</Text>
                  <Text style={styles.specsText}>Scent: {selectedBooking.scent}</Text>
                  <Text style={styles.specsText}>Lighting: {selectedBooking.lighting}</Text>
                  <Text style={styles.specsText}>Acoustics: {selectedBooking.audio}</Text>
                </View>

                {/* Scannable QR Code */}
                <View style={styles.qrContainer}>
                  <Image
                    source={{
                      uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedBooking.bookingCode}`,
                    }}
                    style={styles.qrCode}
                  />
                  <Text style={styles.bookingCodeText}>{selectedBooking.bookingCode}</Text>
                </View>

                <View style={styles.ticketInstructionContainer}>
                  <CheckCircle size={14} color="#2C5234" />
                  <Text style={styles.ticketInstruction}>
                    Show this code to the attendant when boarding the wellness pod.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!reviewBooking}
          onRequestClose={() => setReviewBooking(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.reviewModalContainer}>
              <View style={styles.reviewModalHeader}>
                <Text style={styles.reviewModalTitle}>Rate Your Zen Session</Text>
                <TouchableOpacity onPress={() => setReviewBooking(null)}>
                  <X size={20} color="#0A2540" />
                </TouchableOpacity>
              </View>

              <Text style={styles.reviewModalVan}>{reviewBooking.van?.title}</Text>

              {/* Star selector */}
              <View style={styles.starSelectorRow}>
                {[1, 2, 3, 4, 5].map((starNum) => {
                  const isSelected = starNum <= rating;
                  return (
                    <TouchableOpacity key={starNum} onPress={() => setRating(starNum)}>
                      <Star
                        size={32}
                        color={isSelected ? '#D4A373' : '#E5E1D8'}
                        fill={isSelected ? '#D4A373' : 'transparent'}
                        style={{ marginHorizontal: 6 }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Comments */}
              <TextInput
                style={styles.reviewCommentsInput}
                placeholder="How was your experience? Scent, music, and chair comfort feedback (Min 20 characters)..."
                placeholderTextColor="#8F8C87"
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
              />

              <TouchableOpacity
                style={styles.submitReviewBtn}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitReviewBtnText}>Submit Feedback</Text>
                )}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  backNavButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2540',
    letterSpacing: 2,
  },
  metricsPane: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemSelected: {
    backgroundColor: '#0A2540', // Navy selected tab
  },
  tabItemText: {
    color: '#8F8C87',
    fontSize: 13,
  },
  tabItemTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vanTitle: {
    color: '#0A2540',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
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
  bookingAddress: {
    color: '#8F8C87',
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E1D8',
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  detailText: {
    color: '#0A2540',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  overtimeAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4A373',
    padding: 12,
    marginTop: 10,
  },
  overtimeAlertTitle: {
    color: '#D4A373',
    fontSize: 12,
    fontWeight: 'bold',
  },
  overtimeAlertDesc: {
    color: '#D4A373',
    fontSize: 11,
    marginTop: 1,
  },
  overtimePayBtn: {
    backgroundColor: '#D4A373',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  overtimePayBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  ticketButton: {
    backgroundColor: '#0A2540', // Deep Navy
    borderRadius: 12,
    height: 38,
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ticketButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cancelButton: {
    backgroundColor: '#FAF8F5',
    borderColor: '#E5E1D8',
    borderWidth: 1.5,
    borderRadius: 12,
    height: 38,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444', // Red cancellation text
    fontWeight: 'bold',
    fontSize: 13,
  },
  reviewButton: {
    backgroundColor: '#2C5234', // Forest Green
    borderRadius: 12,
    height: 38,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  reviewedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  reviewedLabelText: {
    color: '#2C5234',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#0A2540',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#8F8C87',
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 64, 0.4)', // soft dark navy tint overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  ticketContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    overflow: 'hidden',
  },
  ticketTop: {
    backgroundColor: '#FAF8F5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E1D8',
  },
  ticketBrand: {
    color: '#0A2540',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  closeButton: {
    padding: 4,
  },
  ticketBody: {
    padding: 20,
    alignItems: 'center',
  },
  ticketVanTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ticketVanAddress: {
    color: '#8F8C87',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  ticketDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#FAF8F5',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  ticketDetail: {
    alignItems: 'center',
    width: '33%',
  },
  ticketLabel: {
    color: '#2C5234',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  ticketVal: {
    color: '#0A2540',
    fontSize: 13,
    fontWeight: 'bold',
  },
  customSpecsContainer: {
    backgroundColor: '#FAF8F5',
    padding: 12,
    borderRadius: 14,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  specsTitle: {
    color: '#0A2540',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
  },
  specsText: {
    color: '#8F8C87',
    fontSize: 12,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrCode: {
    width: 150,
    height: 150,
  },
  bookingCodeText: {
    color: '#0A2540',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: 1,
  },
  ticketInstructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  ticketInstruction: {
    color: '#2C5234',
    fontSize: 11,
    marginLeft: 6,
    textAlign: 'center',
    flex: 1,
  },
  reviewModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reviewModalTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewModalVan: {
    color: '#2C5234',
    fontSize: 14,
    marginBottom: 20,
  },
  starSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  reviewCommentsInput: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#0A2540',
    fontSize: 14,
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 20,
  },
  submitReviewBtn: {
    backgroundColor: '#2C5234', // Forest Green submit
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

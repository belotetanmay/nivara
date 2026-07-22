import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Clock, Star, AlertCircle, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/feedback/Toast';
import { EmptyState } from '../../../components/layout/EmptyState';
import { customerService } from '../../../services/customer/customerService';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function BookingsScreen() {
  const { show } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation State
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Review State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    const data = await customerService.getBookings();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const isUpcoming = b.status === 'PENDING' || b.status === 'CONFIRMED';
    return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
  });

  const handleOpenCancelModal = (booking: any) => {
    setSelectedBookingForCancel(booking);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancelling(true);
    const result = await customerService.cancelBooking(selectedBookingForCancel.id);
    setCancelling(false);

    if (result.success) {
      show('Booking cancelled successfully', 'info');
      setCancelModalVisible(false);
      setSelectedBookingForCancel(null);
      loadBookings();
    } else {
      show(result.error || 'Failed to cancel booking', 'error');
    }
  };

  const handleOpenReviewModal = (booking: any) => {
    setSelectedBookingForReview(booking);
    setRating(5);
    setComment('');
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedBookingForReview || !comment.trim()) {
      show('Please write a short comment for your review', 'error');
      return;
    }

    setSubmittingReview(true);
    const result = await customerService.createReview({
      bookingId: selectedBookingForReview.id,
      rating,
      comment: comment.trim(),
    });
    setSubmittingReview(false);

    if (result.success) {
      show('Review submitted successfully!', 'success');
      setReviewModalVisible(false);
      setSelectedBookingForReview(null);
      loadBookings();
    } else {
      show(result.error || 'Failed to submit review', 'error');
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('upcoming')}
          style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabLabel, activeTab === 'upcoming' && styles.tabLabelActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('past')}
          style={[styles.tabButton, activeTab === 'past' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabLabel, activeTab === 'past' && styles.tabLabelActive]}>
            Completed / History
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {[1, 2, 3].map((k) => (
            <Card key={k} style={styles.bookingCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Skeleton width="50%" height={18} />
                <Skeleton width="25%" height={22} borderRadius={12} />
              </View>
              <Skeleton width="40%" height={14} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={36} borderRadius={8} />
            </Card>
          ))}
        </ScrollView>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent}
        >
          {filteredBookings.length === 0 ? (
            <EmptyState
              title="No bookings found"
              description="You don't have any bookings in this section yet."
              actionLabel="Discover Wellness Vans"
              onActionPress={() => router.navigate('/(app)/(customer)/explore')}
            />
          ) : (
            filteredBookings.map((b) => {
              const isUpcoming = b.status === 'PENDING' || b.status === 'CONFIRMED';
              const isCompleted = b.status === 'COMPLETED';
              const hasReviewed = !!b.review;

              return (
                <Card key={b.id} style={styles.bookingCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleSection}>
                      <View style={styles.iconWrapper}>
                        {isUpcoming ? (
                          <Clock size={16} color="#0F2D52" />
                        ) : (
                          <CheckCircle2 size={16} color="#16A34A" />
                        )}
                      </View>
                      <Text style={styles.vanTitle} numberOfLines={1}>
                        {b.van?.title || 'Wellness Van'}
                      </Text>
                    </View>
                    <Badge
                      label={b.status}
                      variant={b.status === 'CONFIRMED' ? 'success' : b.status === 'COMPLETED' ? 'primary' : 'warning'}
                    />
                  </View>

                  <Text style={styles.dateTimeText}>
                    {formatDateTime(b.availability?.startTime)} ({b.sessionLength} Min Session)
                  </Text>

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.codeLabel}>Booking Code</Text>
                      <Text style={styles.codeText}>{b.bookingCode}</Text>
                    </View>
                    
                    {isUpcoming ? (
                      <View style={styles.actionButtons}>
                        <Button
                          title="Cancel"
                          size="sm"
                          variant="outline"
                          onPress={() => handleOpenCancelModal(b)}
                          style={styles.cancelBtn}
                        />
                        <Button
                          title="Details"
                          size="sm"
                          onPress={() => router.push(`/(app)/(customer)/vans/${b.vanId}`)}
                        />
                      </View>
                    ) : (
                      <View style={styles.actionButtons}>
                        {isCompleted && !hasReviewed && (
                          <Button
                            title="Rate & Review"
                            size="sm"
                            onPress={() => handleOpenReviewModal(b)}
                            style={styles.reviewBtn}
                          />
                        )}
                        <Button
                          title="Book Again"
                          size="sm"
                          variant="secondary"
                          onPress={() => router.push(`/(app)/(customer)/vans/${b.vanId}`)}
                        />
                      </View>
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}

      {/* CANCEL BOOKING MODAL */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalAlertCard}>
            <AlertCircle size={48} color="#EF4444" style={styles.alertIcon} />
            <Text style={styles.alertTitle}>Cancel Booking?</Text>
            <Text style={styles.alertSubtitle}>
              Are you sure you want to cancel booking {selectedBookingForCancel?.bookingCode}? This slot will be released.
            </Text>
            
            <View style={styles.modalActionsRow}>
              <Button
                title="No, Keep It"
                variant="outline"
                onPress={() => setCancelModalVisible(false)}
                style={styles.halfBtn}
              />
              <Button
                title="Yes, Cancel"
                onPress={handleConfirmCancel}
                isLoading={cancelling}
                style={styles.dangerBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* LEAVE REVIEW MODAL */}
      <Modal
        visible={reviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Experience</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <X size={20} color="#0F2D52" />
              </TouchableOpacity>
            </View>

            <Text style={styles.reviewSubtitle}>
              {selectedBookingForReview?.van?.title}
            </Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starTouch}
                >
                  <Star
                    size={32}
                    color={star <= rating ? '#F97316' : '#E5E1D8'}
                    fill={star <= rating ? '#F97316' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Your Feedback</Text>
            <TextInput
              style={styles.commentInput}
              multiline={true}
              numberOfLines={4}
              placeholder="Tell us about the sanctuary comfort, aromatherapy, soundproofing..."
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
            />

            <Button
              title="Submit Review"
              onPress={handleSubmitReview}
              isLoading={submittingReview}
              style={styles.fullBtn}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#0F2D52',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#16A34A',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabLabelActive: {
    color: '#16A34A',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  bookingCard: {
    padding: 16,
    marginBottom: 16,
    borderColor: '#E5E1D8',
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconWrapper: {
    padding: 8,
    backgroundColor: '#F7F9F8',
    borderRadius: 8,
    marginRight: 10,
  },
  vanTitle: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  dateTimeText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E1D8',
    paddingTop: 14,
  },
  codeLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeText: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  cancelBtn: {
    marginRight: 8,
    borderColor: '#EF4444',
  },
  reviewBtn: {
    marginRight: 8,
    backgroundColor: '#16A34A',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* MODALS */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 45, 82, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalAlertCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  alertIcon: {
    marginBottom: 16,
  },
  alertTitle: {
    color: '#0F2D52',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfBtn: {
    flex: 1,
    marginRight: 8,
  },
  dangerBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
    marginLeft: 8,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    color: '#0F2D52',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starTouch: {
    padding: 6,
  },
  inputLabel: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F2D52',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  fullBtn: {
    width: '100%',
    backgroundColor: '#0F2D52',
  },
}) as any;

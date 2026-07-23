import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Share, Modal, StyleSheet, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star, Heart, Share2, MapPin, Compass, ShieldCheck, Clock, Award, Calendar as CalendarIcon, CheckCircle2, X, Navigation, ExternalLink } from 'lucide-react-native';
import { customerService, Van, Review } from '../../../../services/customer/customerService';
import { useToast } from '../../../../components/feedback/Toast';
import { Card } from '../../../../components/ui/Card';
import { Tag } from '../../../../components/ui/Tag';
import { Button } from '../../../../components/ui/Button';
import { Skeleton } from '../../../../components/ui/Skeleton';

const baseUri = (process.env.EXPO_PUBLIC_API_URL || 'https://nivara-ten.vercel.app/api').replace('/api', '');

export default function VanDetailsScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [van, setVan] = useState<Van | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  // Booking Flow State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // 30, 45, 60 min
  const [includeParking, setIncludeParking] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [confirmedBookingCode, setConfirmedBookingCode] = useState<string | null>(null);

  // Generate next 7 days for date picker
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  useEffect(() => {
    if (!id) return;
    
    const fetchDetails = async () => {
      setLoading(true);
      const data = await customerService.getVanDetails(id);
      if (data && data.success && data.van) {
        setVan(data.van);
        setReviews(data.van.reviews || []);

        if (data.van.vendorId) {
          await customerService.addRecentlyViewed(data.van.vendorId);
        }

        const favs = await customerService.getFavorites();
        setFavorites(favs);
        setIsFav(favs.some((fav) => fav.id === data.van.vendorId));
      } else {
        show('Failed to load van details', 'error');
        router.back();
      }
      setLoading(false);
    };

    fetchDetails();
  }, [id]);

  // Load slots whenever selected date changes inside booking modal
  const fetchSlotsForDate = async (dateStr: string) => {
    if (!id) return;
    setLoadingSlots(true);
    setSelectedSlotId(null);
    const slots = await customerService.getSlots(id, dateStr);
    setAvailableSlots(slots);
    if (slots.length > 0) {
      setSelectedSlotId(slots[0].id);
    }
    setLoadingSlots(false);
  };

  const handleOpenBookingModal = () => {
    setBookingModalVisible(true);
    fetchSlotsForDate(selectedDateStr);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    fetchSlotsForDate(dateStr);
  };

  const handleToggleFavorite = async () => {
    if (!van) return;
    const vendorId = van.vendorId;
    if (isFav) {
      const res = await customerService.removeFavorite(vendorId);
      if (res.success) {
        setIsFav(false);
        show('Removed from favorites', 'info');
      } else {
        show(res.error || 'Failed to update favorite', 'error');
      }
    } else {
      const res = await customerService.addFavorite(vendorId);
      if (res.success) {
        setIsFav(true);
        show('Added to favorites!', 'success');
      } else {
        show(res.error || 'Failed to update favorite', 'error');
      }
    }
  };

  const handleShare = async () => {
    if (!van) return;
    try {
      await Share.share({
        message: `Check out ${van.title} on Nivara! Premium mobile wellness sanctuary on wheels.`,
        title: van.title,
      });
    } catch (error: any) {
      show('Failed to share listing', 'error');
    }
  };

  // Price Calculation Logic
  const getDurationPrice = () => {
    if (!van) return 0;
    if (selectedDuration === 30) return Number(van.price15);
    if (selectedDuration === 45) return Number(van.price30);
    if (selectedDuration === 60) return Number(van.price45);
    return Number(van.price15);
  };

  const getTotalPrice = () => {
    const base = getDurationPrice();
    const parking = includeParking ? 150 : 0;
    return base + parking;
  };

  const handleConfirmBooking = async () => {
    if (!van || !selectedSlotId) {
      show('Please select a valid time slot', 'error');
      return;
    }

    setSubmittingBooking(true);
    const result = await customerService.createBooking({
      vanId: van.id,
      slotId: selectedSlotId,
      sessionLength: selectedDuration,
      includeParkingFee: includeParking,
    });
    setSubmittingBooking(false);

    if (result.success) {
      setConfirmedBookingCode(result.bookingId ? 'NV-' + result.bookingId.substring(0, 8).toUpperCase() : 'NV-SUCCESS');
      show('Reservation Confirmed!', 'success');
    } else {
      show(result.error || 'Failed to confirm booking slot', 'error');
    }
  };

  const getVanPhoto = (photos: string[]) => {
    if (photos && photos[0]) {
      const path = photos[0].startsWith('/images/') ? '/van_demo.jpg' : photos[0];
      return { uri: baseUri + path };
    }
    return { uri: baseUri + '/van_demo.jpg' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.circleButton} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#0F2D52" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Van Details</Text>
          <View style={styles.rightHeader} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Skeleton height={240} borderRadius={16} style={{ marginBottom: 20 }} />
          <Skeleton width="70%" height={24} style={{ marginBottom: 10 }} />
          <Skeleton width="40%" height={16} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={100} borderRadius={12} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={160} borderRadius={12} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!van) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.circleButton} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#0F2D52" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Van Details</Text>
          <View style={styles.rightHeader} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.headerTitle}>Van listing not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedSlotObj = availableSlots.find((s) => s.id === selectedSlotId);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Controls */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.circleButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F2D52" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Van Details
        </Text>
        <View style={styles.rightHeader}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={styles.circleButton}
            activeOpacity={0.7}
          >
            <Heart size={20} color={isFav ? '#EF4444' : '#0F2D52'} fill={isFav ? '#EF4444' : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.circleButton, styles.marginLeft]}
            activeOpacity={0.7}
          >
            <Share2 size={20} color="#0F2D52" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={getVanPhoto(van.photos)}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          {van.vendor.verificationStatus === 'APPROVED' && (
            <View style={styles.verifiedBadge}>
              <Award size={14} color="#FFFFFF" />
              <Text style={styles.verifiedText}>Approved Partner</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          {/* Partner & Title */}
          <Text style={styles.businessName}>{van.vendor.businessName}</Text>
          <Text style={styles.title}>{van.title}</Text>

          {/* Metadata Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Star size={14} color="#F97316" fill="#F97316" style={styles.starIcon} />
              <Text style={styles.metaBadgeText}>
                {van.vendor.ratingAvg > 0 ? van.vendor.ratingAvg.toFixed(1) : '5.0'}
              </Text>
            </View>
            <View style={[styles.metaBadge, styles.marginLeft]}>
              <Compass size={14} color="#16A34A" style={styles.starIcon} />
              <Text style={styles.metaBadgeText}>
                Active Location
              </Text>
            </View>
          </View>

          {/* About section */}
          <Text style={styles.sectionTitle}>About this Wellness Van</Text>
          <Text style={styles.aboutText}>{van.description}</Text>
          <Text style={styles.bioText}>{van.vendor.bio}</Text>

          {/* Pricing tiers */}
          <Text style={styles.sectionTitle}>Session Pricing Tiers</Text>
          <View style={styles.servicesList}>
            {[
              { length: '30 Min', price: van.price15, desc: 'Popular tier. Private sanctuary rest & focus reset.' },
              { length: '45 Min', price: van.price30, desc: 'Immersive relaxation session & sensory rest.' },
              { length: '60 Min', price: van.price45, desc: 'Deep recovery session. Maximum luxury comfort.' }
            ].map((srv) => (
              <Card key={srv.length} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceTitleRow}>
                    <Clock size={16} color="#16A34A" style={styles.srvIcon} />
                    <Text style={styles.serviceTitle}>{srv.length} Private Session</Text>
                  </View>
                  <Text style={styles.servicePrice}>₹{parseFloat(String(srv.price)).toFixed(0)}</Text>
                </View>
                <Text style={styles.serviceDesc}>{srv.desc}</Text>
              </Card>
            ))}
          </View>

          {/* Amenities tags */}
          <Text style={styles.sectionTitle}>Van Amenities & Equipment</Text>
          <View style={styles.tagsContainer}>
            {van.amenities.map((item) => (
              <Tag key={item} label={item.toUpperCase()} />
            ))}
          </View>

          {/* Map Preview Box */}
          <Text style={styles.sectionTitle}>Sanctuary Base Location</Text>
          <Text style={styles.addressText}>{van.address}</Text>
          <TouchableOpacity
            style={styles.mapPreviewCard}
            activeOpacity={0.85}
            onPress={() => {
              const url = `https://www.google.com/maps/search/?api=1&query=${van.latitude},${van.longitude}`;
              Linking.openURL(url).catch(() => show('Could not launch Google Maps', 'error'));
            }}
          >
            <View style={styles.mapBadgeHeader}>
              <MapPin size={24} color="#16A34A" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.mapPreviewTitle}>{van.vendor.businessName}</Text>
                <Text style={styles.mapPreviewSubtitle}>Coordinates: {van.latitude.toFixed(4)}, {van.longitude.toFixed(4)}</Text>
              </View>
            </View>

            <View style={styles.openMapBtn}>
              <Navigation size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.openMapBtnText}>Open in Google Maps</Text>
              <ExternalLink size={12} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>

          {/* Partner Policies */}
          <Text style={styles.sectionTitle}>Partner Policies</Text>
          <Card style={styles.policyCard}>
            <View style={styles.policyRow}>
              <ShieldCheck size={16} color="#16A34A" style={styles.srvIcon} />
              <Text style={styles.policyText}>Attendant Present: <Text style={styles.bold}>{van.hasAttendant ? van.attendantName || 'Yes' : 'Self-Service Pod'}</Text></Text>
            </View>
            <View style={[styles.policyRow, styles.marginTop]}>
              <ShieldCheck size={16} color="#16A34A" style={styles.srvIcon} />
              <Text style={styles.policyText}>Cancel for free up to 2 hours before the session.</Text>
            </View>
          </Card>

          {/* Reviews list */}
          <Text style={styles.sectionTitle}>Guest Reviews ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>No guest reviews posted yet. Be the first to book and share your feedback!</Text>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((rev) => (
                <Card key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{rev.customer.name}</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          color={star <= rev.rating ? '#F97316' : '#E5E1D8'}
                          fill={star <= rev.rating ? '#F97316' : 'transparent'}
                          style={styles.reviewStar}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>"{rev.comment}"</Text>
                  <Text style={styles.reviewTime}>
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Now Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Starting session at</Text>
          <Text style={styles.footerPrice}>₹{parseFloat(String(van.price15)).toFixed(0)}</Text>
        </View>
        <Button
          title="Book Session"
          onPress={handleOpenBookingModal}
          style={styles.bookButton}
        />
      </View>

      {/* INTERACTIVE BOOKING CHECKOUT MODAL */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reserve Wellness Van</Text>
              <TouchableOpacity
                onPress={() => {
                  setBookingModalVisible(false);
                  setConfirmedBookingCode(null);
                }}
                style={styles.closeBtn}
              >
                <X size={20} color="#0F2D52" />
              </TouchableOpacity>
            </View>

            {confirmedBookingCode ? (
              /* CONFIRMATION STATE */
              <View style={styles.confirmedContainer}>
                <CheckCircle2 size={56} color="#16A34A" style={styles.confirmedIcon} />
                <Text style={styles.confirmedTitle}>Reservation Confirmed!</Text>
                <Text style={styles.confirmedSubtitle}>Your private session slot has been reserved.</Text>
                
                <Card style={styles.codeCard}>
                  <Text style={styles.codeLabel}>BOOKING CODE</Text>
                  <Text style={styles.codeValue}>{confirmedBookingCode}</Text>
                </Card>

                <Button
                  title="View My Bookings"
                  onPress={() => {
                    setBookingModalVisible(false);
                    setConfirmedBookingCode(null);
                    router.navigate('/(app)/(customer)/bookings');
                  }}
                  style={styles.fullButton}
                />
              </View>
            ) : (
              /* SLOT PICKER & CHECKOUT STATE */
              <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* 1. Date Selector */}
                <Text style={styles.pickerSectionTitle}>1. Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePickerRow}>
                  {dateOptions.map((opt) => {
                    const isSelected = opt.dateStr === selectedDateStr;
                    return (
                      <TouchableOpacity
                        key={opt.dateStr}
                        onPress={() => handleDateSelect(opt.dateStr)}
                        style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.dayName, isSelected && styles.textWhite]}>{opt.dayName}</Text>
                        <Text style={[styles.dayNumber, isSelected && styles.textWhite]}>{opt.dayNumber}</Text>
                        <Text style={[styles.monthName, isSelected && styles.textWhite]}>{opt.monthName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* 2. Duration Selector */}
                <Text style={styles.pickerSectionTitle}>2. Choose Duration</Text>
                <View style={styles.durationsRow}>
                  {[
                    { length: 30, price: van.price15 },
                    { length: 45, price: van.price30 },
                    { length: 60, price: van.price45 },
                  ].map((dur) => {
                    const isSelected = selectedDuration === dur.length;
                    return (
                      <TouchableOpacity
                        key={dur.length}
                        onPress={() => setSelectedDuration(dur.length)}
                        style={[styles.durationChip, isSelected && styles.durationChipSelected]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.durationTitle, isSelected && styles.textWhite]}>{dur.length} Mins</Text>
                        <Text style={[styles.durationPrice, isSelected && styles.textWhite]}>₹{parseFloat(String(dur.price)).toFixed(0)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. Time Slots Grid */}
                <Text style={styles.pickerSectionTitle}>3. Select Available Time Slot</Text>
                {loadingSlots ? (
                  <ActivityIndicator size="small" color="#0F2D52" style={styles.slotsLoader} />
                ) : availableSlots.length === 0 ? (
                  <Text style={styles.noSlotsText}>No unbooked slots available for this date.</Text>
                ) : (
                  <View style={styles.slotsGrid}>
                    {availableSlots.map((slot) => {
                      const isSelected = slot.id === selectedSlotId;
                      const timeString = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <TouchableOpacity
                          key={slot.id}
                          onPress={() => setSelectedSlotId(slot.id)}
                          style={[styles.slotItem, isSelected && styles.slotItemSelected]}
                          activeOpacity={0.8}
                        >
                          <Clock size={14} color={isSelected ? '#FFFFFF' : '#0F2D52'} style={styles.slotIcon} />
                          <Text style={[styles.slotTimeText, isSelected && styles.textWhite]}>{timeString}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 4. Parking Fee Option */}
                <TouchableOpacity
                  onPress={() => setIncludeParking(!includeParking)}
                  style={styles.parkingRow}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, includeParking && styles.checkboxActive]}>
                    {includeParking && <CheckCircle2 size={14} color="#FFFFFF" />}
                  </View>
                  <View style={styles.parkingTextCol}>
                    <Text style={styles.parkingTitle}>Add Reserved Parking Fee (+₹150)</Text>
                    <Text style={styles.parkingSub}>Guarantees dedicated parking spot at location</Text>
                  </View>
                </TouchableOpacity>

                {/* Summary Card */}
                <Card style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Base Session Fee ({selectedDuration} Min)</Text>
                    <Text style={styles.summaryVal}>₹{getDurationPrice()}</Text>
                  </View>
                  {includeParking && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Reserved Parking Fee</Text>
                      <Text style={styles.summaryVal}>₹150</Text>
                    </View>
                  )}
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Payable</Text>
                    <Text style={styles.totalVal}>₹{getTotalPrice()}</Text>
                  </View>
                </Card>

                <Button
                  title="Confirm Reservation"
                  onPress={handleConfirmBooking}
                  isLoading={submittingBooking}
                  disabled={!selectedSlotId || submittingBooking}
                  style={styles.fullButton}
                />
              </ScrollView>
            )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#0F2D52',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  circleButton: {
    padding: 8,
    backgroundColor: '#F7F9F8',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E5E1D8',
  },
  rightHeader: {
    flexDirection: 'row',
  },
  marginLeft: {
    marginLeft: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bannerContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#E5E1D8',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  detailsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  businessName: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#0F2D52',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  starIcon: {
    marginRight: 4,
  },
  metaBadgeText: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#0F2D52',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 10,
  },
  aboutText: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 22,
  },
  bioText: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
  servicesList: {
    marginBottom: 10,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E1D8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  srvIcon: {
    marginRight: 8,
  },
  serviceTitle: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: 'bold',
  },
  servicePrice: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceDesc: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  addressText: {
    color: '#4B5563',
    fontSize: 13,
    marginBottom: 10,
  },
  mapPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  mapBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapPreviewTitle: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mapPreviewSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  openMapBtn: {
    backgroundColor: '#0F2D52',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  openMapBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E1D8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  policyText: {
    color: '#4B5563',
    fontSize: 12,
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0F2D52',
  },
  marginTop: {
    marginTop: 10,
  },
  noReviewsText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  reviewsList: {
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E1D8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    color: '#0F2D52',
    fontSize: 13,
    fontWeight: 'bold',
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewStar: {
    marginLeft: 2,
  },
  reviewComment: {
    color: '#4B5563',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reviewTime: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  footerLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  footerPrice: {
    color: '#0F2D52',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bookButton: {
    width: 150,
    backgroundColor: '#0F2D52',
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 45, 82, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
  },
  modalTitle: {
    color: '#0F2D52',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  pickerSectionTitle: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 10,
  },
  datePickerRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateChip: {
    width: 64,
    height: 70,
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dateChipSelected: {
    backgroundColor: '#0F2D52',
    borderColor: '#0F2D52',
  },
  dayName: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dayNumber: {
    color: '#0F2D52',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  monthName: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  durationsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  durationChipSelected: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  durationTitle: {
    color: '#0F2D52',
    fontSize: 13,
    fontWeight: 'bold',
  },
  durationPrice: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  slotItemSelected: {
    backgroundColor: '#0F2D52',
    borderColor: '#0F2D52',
  },
  slotIcon: {
    marginRight: 6,
  },
  slotTimeText: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
  },
  slotsLoader: {
    marginVertical: 20,
  },
  noSlotsText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  parkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  parkingTextCol: {
    flex: 1,
  },
  parkingTitle: {
    color: '#0F2D52',
    fontSize: 13,
    fontWeight: 'bold',
  },
  parkingSub: {
    color: '#6B7280',
    fontSize: 11,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E1D8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 13,
  },
  summaryVal: {
    color: '#0F2D52',
    fontSize: 13,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E1D8',
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    color: '#0F2D52',
    fontSize: 15,
    fontWeight: 'bold',
  },
  totalVal: {
    color: '#16A34A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullButton: {
    width: '100%',
    backgroundColor: '#0F2D52',
    borderRadius: 12,
    paddingVertical: 14,
  },
  confirmedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  confirmedIcon: {
    marginBottom: 16,
  },
  confirmedTitle: {
    color: '#0F2D52',
    fontSize: 22,
    fontWeight: 'bold',
  },
  confirmedSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  codeCard: {
    backgroundColor: '#F7F9F8',
    borderColor: '#E5E1D8',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  codeLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  codeValue: {
    color: '#0F2D52',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
}) as any;

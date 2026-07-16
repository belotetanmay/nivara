import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import apiClient from '../../services/api';
import { ArrowLeft, Calendar, Clock, Smile, Sparkles, MapPin } from 'lucide-react-native';

export default function VanDetailsScreen({ route, navigation }: any) {
  const { vanId } = route.params;

  const [van, setVan] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Form parameters
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [sessionLength, setSessionLength] = useState<number>(30); // 30 | 45 | 60 (New Specifications)
  const [scent, setScent] = useState<string>('Lavender');
  const [lighting, setLighting] = useState<string>('Sunset Copper');
  const [audio, setAudio] = useState<string>('Binaural Beats');
  const [serviceModel, setServiceModel] = useState<string>('STEADY'); // STEADY | PICK_AND_DROP
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [includeParkingFee, setIncludeParkingFee] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Generate next 7 days list for date picker
  const [datesList, setDatesList] = useState<any[]>([]);

  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      dates.push({ formattedDate, dayName, dayNumber });
    }
    setDatesList(dates);
    setSelectedDate(dates[0].formattedDate);

    fetchVanDetails();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchVanDetails = async () => {
    try {
      const response = await apiClient.get(`/customer/vans/${vanId}`);
      if (response.data.success) {
        setVan(response.data.van);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to retrieve van details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await apiClient.get(`/customer/vans/${vanId}/slots?date=${selectedDate}`);
      if (response.data.success) {
        setSlots(response.data.slots);
        setSelectedSlotId('');
      }
    } catch (e) {
      console.warn('Failed to load slots', e);
    } finally {
      setSlotsLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!van) return 0;
    // Map durations: 30 min (price15), 45 min (price30), 60 min (price45)
    let base = van.price15;
    if (sessionLength === 45) base = van.price30;
    if (sessionLength === 60) base = van.price45;

    const parkingFee = includeParkingFee ? 150 : 0;
    return base + parkingFee;
  };

  const handleBooking = async () => {
    if (!selectedSlotId) {
      Alert.alert('Selection Required', 'Please select a booking time slot.');
      return;
    }

    if (serviceModel === 'PICK_AND_DROP' && (!pickupAddress.trim() || !dropoffAddress.trim())) {
      Alert.alert('Addresses Required', 'Please enter both pickup and drop-off addresses.');
      return;
    }

    setBookingLoading(true);

    try {
      const response = await apiClient.post('/customer/bookings', {
        vanId,
        slotId: selectedSlotId,
        sessionLength,
        scent,
        lighting,
        audio,
        serviceModel,
        pickupAddress: serviceModel === 'PICK_AND_DROP' ? pickupAddress : null,
        dropoffAddress: serviceModel === 'PICK_AND_DROP' ? dropoffAddress : null,
        includeParkingFee,
      });

      if (response.data.success) {
        Alert.alert(
          'Booking Confirmed!',
          'Your wellness pod has been reserved. You can view your QR ticket under Bookings.',
          [{ text: 'OK', onPress: () => navigation.navigate('Bookings') }]
        );
      }
    } catch (error: any) {
      const errMessage = error.response?.data?.message || error.response?.data?.error || 'Booking failed';
      if (errMessage === 'BUFFER_CONFLICT') {
        Alert.alert(
          'Schedule Buffer Conflict',
          'This slot violates the mandatory 15-minute cleaning buffer of an adjacent session. Please select another slot.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errMessage);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || !van) {
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0A2540" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{van.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Van Info Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.vanTitle}>{van.title}</Text>
          <Text style={styles.vanAddress}>
            <MapPin size={14} color="#2C5234" /> {van.address}
          </Text>
          <Text style={styles.vanDescription}>{van.description}</Text>

          <View style={styles.amenitiesContainer}>
            {van.amenities.map((amenity: string, idx: number) => (
              <View key={idx} style={styles.amenityBadge}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            <Calendar size={18} color="#2C5234" style={{ marginRight: 6 }} /> Select Date
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesStrip}>
            {datesList.map((item) => {
              const isSelected = selectedDate === item.formattedDate;
              return (
                <TouchableOpacity
                  key={item.formattedDate}
                  style={[styles.dateButton, isSelected && styles.dateButtonSelected]}
                  onPress={() => setSelectedDate(item.formattedDate)}
                >
                  <Text style={[styles.dayName, isSelected && styles.dateTextSelected]}>{item.dayName}</Text>
                  <Text style={[styles.dayNumber, isSelected && styles.dateTextSelected]}>{item.dayNumber}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Slots Grid */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            <Clock size={18} color="#2C5234" style={{ marginRight: 6 }} /> Available Slots
          </Text>
          {slotsLoading ? (
            <ActivityIndicator size="small" color="#0A2540" style={{ marginVertical: 16 }} />
          ) : slots.length === 0 ? (
            <Text style={styles.noSlotsText}>No slots available for this date.</Text>
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map((item) => {
                const isSelected = selectedSlotId === item.id;
                const formattedTime = new Date(item.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.slotButton, isSelected && styles.slotButtonSelected]}
                    onPress={() => setSelectedSlotId(item.id)}
                  >
                    <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>{formattedTime}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Duration Select (30 | 45 | 60 mins) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Session Duration</Text>
          <View style={styles.optionsRow}>
            {[30, 45, 60].map((mins) => {
              const isSelected = sessionLength === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  onPress={() => setSessionLength(mins)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {mins} mins
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pod Environmental Customizer */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            <Smile size={18} color="#2C5234" style={{ marginRight: 6 }} /> Pod Customization
          </Text>

          {/* Scent */}
          <Text style={styles.customLabel}>Aromatherapy Scent</Text>
          <View style={styles.optionsRow}>
            {['Lavender', 'Eucalyptus', 'Sandalwood'].map((item) => {
              const isSelected = scent === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  onPress={() => setScent(item)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Lighting */}
          <Text style={styles.customLabel}>Ambient Lighting Atmosphere</Text>
          <View style={styles.optionsRow}>
            {['Sunset Copper', 'Northern Lights', 'Neo-Mint'].map((item) => {
              const isSelected = lighting === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  onPress={() => setLighting(item)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Audio */}
          <Text style={styles.customLabel}>Acoustics & Sound</Text>
          <View style={styles.optionsRow}>
            {['Binaural Beats', 'Forest Rain', 'Cosmic Noise'].map((item) => {
              const isSelected = audio === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  onPress={() => setAudio(item)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Service Model */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Model</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.optionButton, serviceModel === 'STEADY' && styles.optionButtonSelected]}
              onPress={() => setServiceModel('STEADY')}
            >
              <Text style={[styles.optionText, serviceModel === 'STEADY' && styles.optionTextSelected]}>
                Steady (At Address)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, serviceModel === 'PICK_AND_DROP' && styles.optionButtonSelected]}
              onPress={() => setServiceModel('PICK_AND_DROP')}
            >
              <Text style={[styles.optionText, serviceModel === 'PICK_AND_DROP' && styles.optionTextSelected]}>
                Pick & Drop (Mobility)
              </Text>
            </TouchableOpacity>
          </View>

          {serviceModel === 'PICK_AND_DROP' && (
            <View style={styles.addressInputs}>
              <Text style={styles.customLabel}>Pickup Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter pickup address"
                placeholderTextColor="#8F8C87"
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
              <Text style={styles.customLabel}>Dropoff Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter drop-off address"
                placeholderTextColor="#8F8C87"
                value={dropoffAddress}
                onChangeText={setDropoffAddress}
              />

              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setIncludeParkingFee(!includeParkingFee)}
              >
                <View style={[styles.checkbox, includeParkingFee && styles.checkboxChecked]} />
                <Text style={styles.checkboxLabel}>Include standard parking fee (₹150)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Booking Checkout Panel */}
      <View style={styles.checkoutPanel}>
        <View style={styles.priceColumn}>
          <Text style={styles.totalPriceLabel}>Total Amount</Text>
          <Text style={styles.totalPriceValue}>₹{calculatePrice()}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookNowButton}
          onPress={handleBooking}
          disabled={bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Sparkles size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.bookNowText}>Confirm & Reserve</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0A2540',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  vanTitle: {
    color: '#0A2540',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vanAddress: {
    color: '#2C5234',
    fontSize: 13,
    marginBottom: 12,
  },
  vanDescription: {
    color: '#8F8C87',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityBadge: {
    backgroundColor: '#FAF8F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E1D8',
  },
  amenityText: {
    color: '#0A2540',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#0A2540',
    fontSize: 15,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  datesStrip: {
    paddingVertical: 4,
  },
  dateButton: {
    width: 60,
    height: 74,
    backgroundColor: '#FAF8F5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateButtonSelected: {
    backgroundColor: '#0A2540',
    borderColor: '#0A2540',
  },
  dayName: {
    color: '#8F8C87',
    fontSize: 12,
    marginBottom: 4,
  },
  dayNumber: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateTextSelected: {
    color: '#FFF',
  },
  noSlotsText: {
    color: '#8F8C87',
    textAlign: 'center',
    paddingVertical: 12,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  slotButton: {
    width: '30%',
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: '1.6%',
    marginBottom: 8,
  },
  slotButtonSelected: {
    backgroundColor: '#0A2540',
    borderColor: '#0A2540',
  },
  slotText: {
    color: '#0A2540',
    fontSize: 13,
  },
  slotTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#0A2540',
    borderColor: '#0A2540',
  },
  optionText: {
    color: '#8F8C87',
    fontSize: 13,
  },
  optionTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  customLabel: {
    color: '#0A2540',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  addressInputs: {
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    paddingHorizontal: 16,
    height: 48,
    color: '#0A2540',
    marginBottom: 12,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E1D8',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#2C5234',
    borderColor: '#2C5234',
  },
  checkboxLabel: {
    color: '#8F8C87',
    fontSize: 13,
  },
  checkoutPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#E5E1D8',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceColumn: {
    justifyContent: 'center',
  },
  totalPriceLabel: {
    color: '#8F8C87',
    fontSize: 11,
  },
  totalPriceValue: {
    color: '#0A2540',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bookNowButton: {
    backgroundColor: '#2C5234', // Forest Green reserve button
    paddingHorizontal: 24,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookNowText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

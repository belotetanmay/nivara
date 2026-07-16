import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import apiClient from '../../services/api';
import { ArrowLeft, Check, CheckCircle2, Scan, AlertTriangle, ShieldCheck } from 'lucide-react-native';

export default function ScanQRScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Manual lookup state
  const [manualCode, setManualCode] = useState('');
  const [matchedBooking, setMatchedBooking] = useState<any | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const lookupBooking = async (code: string) => {
    setLoading(true);
    setMatchedBooking(null);
    try {
      const response = await apiClient.get('/vendor/dashboard');
      if (response.data.success) {
        const bookingsList = response.data.bookings || [];
        const found = bookingsList.find(
          (b: any) => b.bookingCode.toUpperCase() === code.trim().toUpperCase()
        );

        if (found) {
          setMatchedBooking(found);
        } else {
          Alert.alert(
            'Not Found',
            `No reservation found with code ${code.toUpperCase()} under your wellness pods.`
          );
        }
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to retrieve booking list from dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    lookupBooking(data);
  };

  const handleConfirmCheckIn = async () => {
    if (!matchedBooking) return;
    setLoading(true);
    try {
      const response = await apiClient.patch(`/vendor/bookings/${matchedBooking.id}/confirm`);
      if (response.data.success) {
        Alert.alert('Checked In!', 'Booking status updated to CONFIRMED. The customer may board.');
        lookupBooking(matchedBooking.bookingCode);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to check-in booking');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!matchedBooking) return;
    setLoading(true);
    try {
      const response = await apiClient.patch(`/vendor/bookings/${matchedBooking.id}/complete`, {
        actualDuration: matchedBooking.sessionLength,
      });
      if (response.data.success) {
        Alert.alert('Session Completed', 'The wellness session has been successfully marked as completed.');
        setMatchedBooking(null);
        setScanned(false);
        setManualCode('');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to complete session');
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A2540" />
        <Text style={{ color: '#8F8C87', marginTop: 12 }}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <AlertTriangle size={48} color="#D4A373" style={{ marginBottom: 16 }} />
        <Text style={styles.title}>No Camera Access</Text>
        <Text style={styles.subtitle}>Camera permission is required to scan QR tickets.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0A2540" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Scanner</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {!matchedBooking ? (
          <View style={styles.scannerWrapper}>
            <View style={styles.cameraContainer}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
              />
              <View style={styles.overlayFrame}>
                <Scan size={200} color="#2C5234" strokeWidth={1.5} />
              </View>
            </View>

            {scanned && (
              <TouchableOpacity style={styles.btnOutline} onPress={() => setScanned(false)}>
                <Text style={styles.btnOutlineText}>Scan Again</Text>
              </TouchableOpacity>
            )}

            <View style={styles.manualSearchCard}>
              <Text style={styles.cardHeading}>Manual Booking Search</Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="e.g. NV-ABCD-EFGH"
                  placeholderTextColor="#8F8C87"
                  autoCapitalize="characters"
                  value={manualCode}
                  onChangeText={setManualCode}
                />
                <TouchableOpacity
                  style={styles.searchBtn}
                  onPress={() => lookupBooking(manualCode)}
                  disabled={loading || !manualCode.trim()}
                >
                  <Text style={styles.searchBtnText}>Search</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.bookingResultCard}>
            <View style={styles.cardTop}>
              <ShieldCheck size={28} color="#2C5234" />
              <Text style={styles.ticketCodeTitle}>Ticket Validated</Text>
              <Text style={styles.ticketCodeSubtitle}>{matchedBooking.bookingCode}</Text>
            </View>

            <View style={styles.resultDetailsSection}>
              <Text style={styles.resultLabel}>Customer Details</Text>
              <Text style={styles.resultVal}>{matchedBooking.customer?.name}</Text>
              <Text style={styles.resultSubVal}>{matchedBooking.customer?.email}</Text>

              <View style={styles.cardDivider} />

              <Text style={styles.resultLabel}>Pod & Session</Text>
              <Text style={styles.resultVal}>{matchedBooking.van?.title}</Text>
              <Text style={styles.resultSubVal}>
                Slot:{' '}
                {new Date(matchedBooking.availability?.startTime).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                at{' '}
                {new Date(matchedBooking.availability?.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.resultSubVal}>Length: {matchedBooking.sessionLength} Minutes</Text>

              <View style={styles.cardDivider} />

              <Text style={styles.resultLabel}>Pre-Configured Environments</Text>
              <View style={styles.specBadgeRow}>
                <View style={styles.specBadge}>
                  <Text style={styles.specBadgeText}>🌸 Scent: {matchedBooking.scent}</Text>
                </View>
                <View style={styles.specBadge}>
                  <Text style={styles.specBadgeText}>💡 Light: {matchedBooking.lighting}</Text>
                </View>
                <View style={styles.specBadge}>
                  <Text style={styles.specBadgeText}>🎵 Sound: {matchedBooking.audio}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <Text style={styles.resultLabel}>Current Status</Text>
              <Text style={styles.statusResultText}>{matchedBooking.status}</Text>
            </View>

            <View style={styles.actionsContainer}>
              {matchedBooking.status === 'PENDING' && (
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmCheckIn}
                  disabled={loading}
                >
                  <Check size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>Confirm Check-In</Text>
                </TouchableOpacity>
              )}

              {matchedBooking.status === 'CONFIRMED' && (
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={handleMarkComplete}
                  disabled={loading}
                >
                  <CheckCircle2 size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>Mark Session Complete</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setMatchedBooking(null);
                  setScanned(false);
                  setManualCode('');
                }}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Back to Scanner</Text>
              </TouchableOpacity>
            </View>
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
    padding: 24,
  },
  title: {
    color: '#0A2540',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#8F8C87',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
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
  backBtn: {
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
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
  },
  scannerWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  cameraContainer: {
    width: 250,
    height: 250,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2C5234',
    backgroundColor: '#FAF8F5',
    position: 'relative',
    marginBottom: 20,
  },
  overlayFrame: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#0A2540',
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  backLink: {
    marginTop: 16,
  },
  backLinkText: {
    color: '#8F8C87',
  },
  btnOutline: {
    borderColor: '#2C5234',
    borderWidth: 1.5,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  btnOutlineText: {
    color: '#2C5234',
    fontWeight: 'bold',
  },
  manualSearchCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  cardHeading: {
    color: '#0A2540',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    paddingHorizontal: 12,
    height: 44,
    color: '#0A2540',
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: '#0A2540',
    borderRadius: 12,
    marginLeft: 8,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  bookingResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  cardTop: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketCodeTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  ticketCodeSubtitle: {
    color: '#2C5234',
    fontSize: 14,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  resultDetailsSection: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    marginBottom: 20,
  },
  resultLabel: {
    color: '#2C5234',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  resultVal: {
    color: '#0A2540',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resultSubVal: {
    color: '#8F8C87',
    fontSize: 13,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E5E1D8',
    marginVertical: 12,
  },
  specBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginHorizontal: -4,
  },
  specBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E1D8',
  },
  specBadgeText: {
    color: '#0A2540',
    fontSize: 11,
  },
  statusResultText: {
    color: '#D4A373',
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionsContainer: {
    width: '100%',
  },
  confirmBtn: {
    backgroundColor: '#2C5234', // Forest Green check-in
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  completeBtn: {
    backgroundColor: '#0A2540', // Navy session complete
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#8F8C87',
    fontSize: 14,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/feedback/Toast';
import { vendorService } from '../../../services/vendor/vendorService';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useRouter } from 'expo-router';
import { Plus, Edit2, Trash2, X, Check, Power, ArrowLeft } from 'lucide-react-native';

const PRESET_AMENITIES = [
  'Zero Gravity Chair',
  'Soundproof Cabin',
  'Aromatherapy Diffuser',
  'Ambient LED Lighting',
  'Climate Control',
  'Air Purifier',
  'Bluetooth Speaker',
  'Meditation Audio System',
  'Complimentary Water',
];

export default function FleetScreen() {
  const router = useRouter();
  const { show } = useToast();
  const [vans, setVans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVanId, setEditingVanId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [price30, setPrice30] = useState('399');
  const [price45, setPrice45] = useState('599');
  const [price60, setPrice60] = useState('799');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Zero Gravity Chair',
    'Soundproof Cabin',
    'Aromatherapy Diffuser',
  ]);
  const [hasAttendant, setHasAttendant] = useState(false);

  const loadVans = async () => {
    setLoading(true);
    const list = await vendorService.getVendorVans();
    setVans(list);
    setLoading(false);
  };

  useEffect(() => {
    loadVans();
  }, []);

  const handleOpenAddModal = () => {
    setEditingVanId(null);
    setTitle('');
    setDescription('');
    setAddress('');
    setPrice30('399');
    setPrice45('599');
    setPrice60('799');
    setSelectedAmenities(['Zero Gravity Chair', 'Soundproof Cabin', 'Aromatherapy Diffuser']);
    setHasAttendant(false);
    setModalVisible(true);
  };

  const handleOpenEditModal = (van: any) => {
    setEditingVanId(van.id);
    setTitle(van.title);
    setDescription(van.description);
    setAddress(van.address);
    setPrice30(String(van.price15 || 399));
    setPrice45(String(van.price30 || 599));
    setPrice60(String(van.price45 || 799));
    setSelectedAmenities(van.amenities || []);
    setHasAttendant(!!van.hasAttendant);
    setModalVisible(true);
  };

  const handleToggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(prev => prev.filter(a => a !== item));
    } else {
      setSelectedAmenities(prev => [...prev, item]);
    }
  };

  const handleSaveVan = async () => {
    if (!title.trim() || !description.trim() || !address.trim()) {
      show('Please fill in van name, description, and address', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      amenities: selectedAmenities,
      photos: ['/van_demo.jpg'],
      price15: parseFloat(price30) || 399,
      price30: parseFloat(price45) || 599,
      price45: parseFloat(price60) || 799,
      serviceRadius: 5.0,
      hasAttendant,
    };

    let result;
    if (editingVanId) {
      result = await vendorService.updateVan(editingVanId, payload);
    } else {
      result = await vendorService.createVan(payload);
    }
    setSubmitting(false);

    if (result.success) {
      show(editingVanId ? 'Van details updated!' : 'New van listing registered!', 'success');
      setModalVisible(false);
      loadVans();
    } else {
      show(result.error || 'Failed to save van details', 'error');
    }
  };

  const handleToggleStatus = async (van: any) => {
    const nextStatus = van.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await vendorService.toggleVanStatus(van.id, nextStatus);
    if (res.success) {
      show(`Van status updated to ${nextStatus}`, 'info');
      loadVans();
    } else {
      show(res.error || 'Failed to update status', 'error');
    }
  };

  const handleDeleteVan = async (vanId: string) => {
    const res = await vendorService.deleteVan(vanId);
    if (res.success) {
      show('Van listing deleted', 'info');
      loadVans();
    } else {
      show(res.error || 'Failed to delete van', 'error');
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
            <Text style={styles.headerSubtitle}>Fleet Management</Text>
            <Text style={styles.headerTitle}>My Wellness Vans</Text>
          </View>
        </View>
        <Button
          title="Add Van"
          leftIcon={<Plus size={16} color="#FFFFFF" />}
          size="sm"
          onPress={handleOpenAddModal}
          style={styles.addButton}
        />
      </View>

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {[1, 2].map((k) => (
            <Card key={k} style={styles.fleetCard}>
              <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
              <Skeleton width="40%" height={14} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={40} borderRadius={8} style={{ marginBottom: 14 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Skeleton width="45%" height={36} borderRadius={8} />
                <Skeleton width="45%" height={36} borderRadius={8} />
              </View>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {vans.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No vans registered yet</Text>
              <Text style={styles.emptySub}>Click 'Add Van' above to list your first mobile sanctuary on Nivara.</Text>
            </Card>
          ) : (
            <View style={styles.fleetList}>
              {vans.map((van) => {
                const isActive = van.status === 'ACTIVE';
                return (
                  <Card key={van.id} style={styles.fleetCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.vanTitleCol}>
                        <Text style={styles.vanName}>{van.title}</Text>
                        <Text style={styles.vanAddress} numberOfLines={1}>{van.address}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleToggleStatus(van)} activeOpacity={0.8}>
                        <Badge
                          label={van.status}
                          variant={isActive ? 'success' : 'secondary'}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Price Tiers Info */}
                    <View style={styles.pricesRow}>
                      <View style={styles.priceBox}>
                        <Text style={styles.priceLabel}>30 MIN</Text>
                        <Text style={styles.priceVal}>₹{parseFloat(String(van.price15)).toFixed(0)}</Text>
                      </View>
                      <View style={styles.priceBox}>
                        <Text style={styles.priceLabel}>45 MIN</Text>
                        <Text style={styles.priceVal}>₹{parseFloat(String(van.price30)).toFixed(0)}</Text>
                      </View>
                      <View style={styles.priceBox}>
                        <Text style={styles.priceLabel}>60 MIN</Text>
                        <Text style={styles.priceVal}>₹{parseFloat(String(van.price45)).toFixed(0)}</Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <Button
                        title="Edit Details"
                        leftIcon={<Edit2 size={14} color="#0F2D52" />}
                        variant="outline"
                        size="sm"
                        onPress={() => handleOpenEditModal(van)}
                        style={styles.actionBtn}
                      />
                      <Button
                        title={isActive ? 'Deactivate' : 'Activate'}
                        leftIcon={<Power size={14} color="#FFFFFF" />}
                        size="sm"
                        variant={isActive ? 'secondary' : 'primary'}
                        onPress={() => handleToggleStatus(van)}
                        style={styles.actionBtnSecondary}
                      />
                      <TouchableOpacity
                        onPress={() => handleDeleteVan(van.id)}
                        style={styles.deleteIconBtn}
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* ADD / EDIT VAN MODAL */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingVanId ? 'Edit Van Details' : 'Add New Wellness Van'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={20} color="#0F2D52" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Van Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Nivara Sanctuary Pod - Bandra"
                  placeholderTextColor="#9CA3AF"
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  multiline={true}
                  numberOfLines={3}
                  placeholder="Describe sanctuary comfort, soundproofing, recliners..."
                  placeholderTextColor="#9CA3AF"
                  value={description}
                  onChangeText={setDescription}
                />

                <Text style={styles.inputLabel}>Operating Address / Station</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Carter Road, Bandra West, Mumbai"
                  placeholderTextColor="#9CA3AF"
                  value={address}
                  onChangeText={setAddress}
                />

                <Text style={styles.inputLabel}>Session Pricing Tiers (₹)</Text>
                <View style={styles.inputsRow}>
                  <View style={styles.thirdInputCol}>
                    <Text style={styles.subLabel}>30 Min</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={price30}
                      onChangeText={setPrice30}
                    />
                  </View>
                  <View style={styles.thirdInputCol}>
                    <Text style={styles.subLabel}>45 Min</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={price45}
                      onChangeText={setPrice45}
                    />
                  </View>
                  <View style={styles.thirdInputCol}>
                    <Text style={styles.subLabel}>60 Min</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={price60}
                      onChangeText={setPrice60}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Unique Amenities Available</Text>
                <View style={styles.amenitiesGrid}>
                  {PRESET_AMENITIES.map((am) => {
                    const isChecked = selectedAmenities.includes(am);
                    return (
                      <TouchableOpacity
                        key={am}
                        onPress={() => handleToggleAmenity(am)}
                        style={[styles.amenityChip, isChecked && styles.amenityChipChecked]}
                        activeOpacity={0.8}
                      >
                        {isChecked && <Check size={12} color="#FFFFFF" style={styles.checkIcon} />}
                        <Text style={[styles.amenityText, isChecked && styles.textWhite]}>{am}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() => setHasAttendant(!hasAttendant)}
                  style={styles.attendantRow}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, hasAttendant && styles.checkboxActive]}>
                    {hasAttendant && <Check size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.attendantText}>On-site Attendant / Host Present</Text>
                </TouchableOpacity>

                <Button
                  title={editingVanId ? 'Save Changes' : 'Register Listing'}
                  onPress={handleSaveVan}
                  isLoading={submitting}
                  style={styles.fullBtn}
                />
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
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
  addButton: {
    backgroundColor: '#0F2D52',
    borderRadius: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E1D8',
    borderRadius: 16,
  },
  emptyTitle: {
    color: '#0F2D52',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySub: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  fleetList: {
    marginTop: 4,
  },
  fleetCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vanTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  vanName: {
    color: '#0F2D52',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vanAddress: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  pricesRow: {
    flexDirection: 'row',
    backgroundColor: '#F7F9F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  priceBox: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  priceVal: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E1D8',
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    marginRight: 8,
    borderColor: '#E5E1D8',
    borderRadius: 8,
  },
  actionBtnSecondary: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
  },
  deleteIconBtn: {
    padding: 8,
  },

  /* MODALS */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    height: '80%',
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
  inputLabel: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 6,
  },
  subLabel: {
    color: '#6B7280',
    fontSize: 11,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F2D52',
    marginBottom: 6,
  },
  multilineInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thirdInputCol: {
    width: '31%',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  amenityChipChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkIcon: {
    marginRight: 4,
  },
  amenityText: {
    color: '#0F2D52',
    fontSize: 11,
    fontWeight: '600',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  attendantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  attendantText: {
    color: '#0F2D52',
    fontSize: 13,
    fontWeight: '600',
  },
  fullBtn: {
    width: '100%',
    backgroundColor: '#0F2D52',
    marginTop: 16,
    marginBottom: 20,
  },
}) as any;

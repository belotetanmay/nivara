import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Award, ShieldCheck, CreditCard, ArrowLeft, X, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/feedback/Toast';

export default function VendorProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { show } = useToast();

  // Payout Modal state
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('50100492818910');
  const [ifscCode, setIfscCode] = useState('HDFC0000240');
  const [upiId, setUpiId] = useState('vendor@hdfcbank');
  const [savingPayout, setSavingPayout] = useState(false);

  const handleLogout = async () => {
    await logout();
    show('Successfully logged out', 'info');
  };

  const handleSavePayout = () => {
    if (!accountNumber.trim() || !ifscCode.trim()) {
      show('Please enter account number and IFSC code', 'error');
      return;
    }
    setSavingPayout(true);
    setTimeout(() => {
      setSavingPayout(false);
      setPayoutModalVisible(false);
      show('Payout account details updated successfully!', 'success');
    }, 600);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {router.canGoBack() && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#0F2D52" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Partner Profile</Text>
        </View>
        <Avatar name={user?.name || 'John Partner'} size="md" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar name={user?.name || 'Sanctuary Partner'} size="lg" className="mb-3.5" />
          <Text style={styles.profileName}>{user?.name || 'Sanctuary Partner'}</Text>
          {(() => {
            const status: string = (user?.vendorProfile?.verificationStatus as string) || (user?.kycStatus === 'VERIFIED' ? 'APPROVED' : user?.kycStatus === 'PENDING' ? 'PENDING' : 'NOT_SUBMITTED');
            if (status === 'APPROVED' || status === 'VERIFIED') {
              return <Text style={styles.verifiedTag}>VERIFIED PARTNER</Text>;
            } else if (status === 'PENDING' || status === 'UNDER_REVIEW') {
              return <Text style={[styles.verifiedTag, { backgroundColor: '#FEF3C7', color: '#D97706' }]}>PENDING ADMIN APPROVAL</Text>;
            } else if (status === 'REJECTED') {
              return <Text style={[styles.verifiedTag, { backgroundColor: '#FEE2E2', color: '#DC2626' }]}>VERIFICATION REJECTED</Text>;
            }
            return <Text style={[styles.verifiedTag, { backgroundColor: '#E5E7EB', color: '#4B5563' }]}>KYC NOT COMPLETED</Text>;
          })()}
          <Text style={styles.profileEmail}>{user?.email || 'vendor@example.com'}</Text>
        </View>

        {/* Business Credentials Status */}
        <Text style={styles.sectionTitle}>Business Validation</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <ShieldCheck size={18} color={user?.vendorProfile?.verificationStatus === 'APPROVED' ? '#16A34A' : '#D97706'} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Business KYC Verification</Text>
            </View>
            <Text style={user?.vendorProfile?.verificationStatus === 'APPROVED' ? styles.successStatus : { color: '#D97706', fontWeight: 'bold', fontSize: 13 }}>
              {user?.vendorProfile?.verificationStatus === 'APPROVED' ? 'Verified' : (user?.vendorProfile?.verificationStatus === 'PENDING' || user?.kycStatus === 'PENDING' ? 'Under Review' : 'Pending')}
            </Text>
          </View>

          <View style={[styles.infoRow, styles.marginTop]}>
            <View style={styles.infoLeft}>
              <Award size={18} color={user?.vendorProfile?.verificationStatus === 'APPROVED' ? '#16A34A' : '#D97706'} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Commercial Insurance</Text>
            </View>
            <Text style={user?.vendorProfile?.verificationStatus === 'APPROVED' ? styles.successStatus : { color: '#D97706', fontWeight: 'bold', fontSize: 13 }}>
              {user?.vendorProfile?.verificationStatus === 'APPROVED' ? 'Active' : 'Pending Verification'}
            </Text>
          </View>

          {(!user?.vendorProfile || user?.vendorProfile?.verificationStatus !== 'APPROVED') && (
            <TouchableOpacity
              style={{ marginTop: 14, backgroundColor: '#0F2D52', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
              activeOpacity={0.85}
              onPress={() => router.push('/(app)/(vendor)/onboarding' as any)}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }}>
                {user?.vendorProfile?.verificationStatus === 'PENDING' ? 'View 4-Phase KYC Application' : 'Complete 4-Phase Business Onboarding'}
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Financial info */}
        <Text style={styles.sectionTitle}>Payout Configuration</Text>
        <Card style={styles.payoutCard}>
          <View style={styles.payoutLeft}>
            <View style={styles.bankIconWrapper}>
              <CreditCard size={20} color="#16A34A" />
            </View>
            <View style={styles.bankTextCol}>
              <Text style={styles.bankTitle}>{bankName}</Text>
              <Text style={styles.bankDetails}>•••• {accountNumber.slice(-4) || '8910'} (Direct Deposit)</Text>
            </View>
          </View>
          <Button
            title="Manage"
            size="sm"
            variant="outline"
            onPress={() => setPayoutModalVisible(true)}
            style={styles.editBtn}
          />
        </Card>

        {/* Support & Terms */}
        <Text style={styles.sectionTitle}>Partner Support & Legal</Text>
        <Card style={styles.infoCard}>
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => router.push('/(app)/(customer)/settings/help-support' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.infoLeft}>
              <ShieldCheck size={18} color="#0F2D52" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Partner Support & FAQs</Text>
            </View>
            <Text style={styles.linkText}>View</Text>
          </TouchableOpacity>

          <View style={[styles.infoRow, styles.marginTop]}>
            <TouchableOpacity
              style={styles.infoLeft}
              onPress={() => router.push('/(app)/(customer)/settings/legal-viewer?doc=vendor' as any)}
              activeOpacity={0.7}
            >
              <Award size={18} color="#0F2D52" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Wellness Partner (Vendor) Terms</Text>
            </TouchableOpacity>
            <Text style={styles.linkText}>Read</Text>
          </View>
        </Card>

        {/* Logout action */}
        <Button
          title="Sign Out Partner Dashboard"
          leftIcon={<LogOut size={16} color="#FFFFFF" />}
          onPress={handleLogout}
          style={styles.signOutButton}
        />

      </ScrollView>

      {/* PAYOUT MANAGEMENT MODAL */}
      <Modal
        visible={payoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPayoutModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setPayoutModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Payout & Bank Account</Text>
                <TouchableOpacity onPress={() => setPayoutModalVisible(false)}>
                  <X size={20} color="#0F2D52" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.activeStatusBanner}>
                  <Check size={16} color="#16A34A" style={{ marginRight: 6 }} />
                  <Text style={styles.activeStatusText}>Auto Direct Deposit Active (Weekly Settlement)</Text>
                </View>

                <Text style={styles.inputLabel}>Bank Name</Text>
                <TextInput
                  style={styles.input}
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="e.g. HDFC Bank, ICICI Bank"
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.inputLabel}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                  placeholder="Enter full account number"
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.inputLabel}>IFSC Code</Text>
                <TextInput
                  style={styles.input}
                  value={ifscCode}
                  onChangeText={setIfscCode}
                  autoCapitalize="characters"
                  placeholder="e.g. HDFC0000240"
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.inputLabel}>UPI ID (Optional Instant Payout)</Text>
                <TextInput
                  style={styles.input}
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="e.g. name@upi"
                  placeholderTextColor="#9CA3AF"
                />

                <Button
                  title="Save Payout Account"
                  onPress={handleSavePayout}
                  isLoading={savingPayout}
                  style={styles.savePayoutBtn}
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
  backButton: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  headerTitle: {
    color: '#0F2D52',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    padding: 24,
    borderRadius: 24,
  },
  profileName: {
    color: '#0F2D52',
    fontSize: 20,
    fontWeight: 'bold',
  },
  verifiedTag: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  profileEmail: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
    borderRadius: 16,
    borderColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marginTop: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: '600',
  },
  successStatus: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 28,
    borderRadius: 16,
    borderColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
  },
  payoutLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  bankTextCol: {
    flex: 1,
  },
  bankIconWrapper: {
    padding: 12,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 12,
    marginRight: 12,
  },
  bankTitle: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bankDetails: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    borderColor: '#E5E1D8',
    borderRadius: 8,
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
    borderRadius: 12,
    marginBottom: 24,
  },

  /* MODAL STYLES */
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
    height: '75%',
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
  activeStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  activeStatusText: {
    color: '#16A34A',
    fontSize: 12,
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
  savePayoutBtn: {
    backgroundColor: '#0F2D52',
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  linkText: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
  },
}) as any;

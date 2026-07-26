import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck, ArrowLeft, CheckCircle2, ChevronRight, FileText, Truck, Sparkles, Building, Landmark } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/feedback/Toast';
import { apiClient } from '../../../services/api/apiClient';

export default function VendorOnboardingScreen() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const { show } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Personal KYC
  const [kycDocType, setKycDocType] = useState('ID_CARD');
  const [kycDocNumber, setKycDocNumber] = useState('');
  const [kycDocUrl, setKycDocUrl] = useState('https://nivara-ten.vercel.app/docs/kyc_demo.pdf');

  // Step 2: Business Validation
  const [businessName, setBusinessName] = useState(user?.name ? `${user.name} Wellness` : '');
  const [bio, setBio] = useState('Certified wellness host providing luxury mobile sanctuary sessions.');
  const [businessLicenseNo, setBusinessLicenseNo] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [driverName, setDriverName] = useState(user?.name || '');
  const [driverLicenseNo, setDriverLicenseNo] = useState('');

  // Step 3: Vehicle Credentials
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [rcUrl, setRcUrl] = useState('https://nivara-ten.vercel.app/docs/rc_demo.pdf');
  const [insuranceUrl, setInsuranceUrl] = useState('https://nivara-ten.vercel.app/docs/insurance_demo.pdf');
  const [pucUrl, setPucUrl] = useState('https://nivara-ten.vercel.app/docs/puc_demo.pdf');

  // Step 4: Sanctuary Van Profile & Inspection
  const [vanTitle, setVanTitle] = useState(businessName ? `${businessName} Sanctuary Pod` : 'Nivara Mobile Sanctuary');
  const [vanDescription, setVanDescription] = useState('Climate-controlled, sensory-optimized mobile recovery van featuring zero-gravity seating and acoustic soundproofing.');
  const [vanPrice15, setVanPrice15] = useState('999');
  const [vanPrice30, setVanPrice30] = useState('1499');
  const [vanPrice45, setVanPrice45] = useState('1999');
  const [vanPhotosUrl, setVanPhotosUrl] = useState('/van_demo.jpg');
  const [onSiteInspectionCertUrl, setOnSiteInspectionCertUrl] = useState('https://nivara-ten.vercel.app/docs/inspection_demo.pdf');
  const [fakePhotoDeclaration, setFakePhotoDeclaration] = useState(true);

  const handleSubmitOnboarding = async () => {
    if (!kycDocNumber.trim() || !businessLicenseNo.trim() || !vehicleNumber.trim() || !chassisNumber.trim() || !bankAccountNumber.trim()) {
      show('Please fill in all mandatory business, license, vehicle, and bank details.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        kycDocType,
        kycDocNumber,
        kycDocUrl: kycDocUrl || 'https://nivara-ten.vercel.app/docs/kyc_demo.pdf',
        businessName,
        bio,
        businessRegistrationNo: businessLicenseNo,
        businessLicenseNo,
        gstNumber,
        panNumber,
        bankName,
        bankAccountNumber,
        bankIfsc,
        driverName,
        driverLicenseNo,
        driverKycUrl: kycDocUrl || 'https://nivara-ten.vercel.app/docs/driver_demo.pdf',
        vehicleNumber,
        chassisNumber,
        insuranceUrl: insuranceUrl || 'https://nivara-ten.vercel.app/docs/insurance_demo.pdf',
        pucUrl: pucUrl || 'https://nivara-ten.vercel.app/docs/puc_demo.pdf',
        rcUrl: rcUrl || 'https://nivara-ten.vercel.app/docs/rc_demo.pdf',
        isCommercial: true,
        vanTitle,
        vanDescription,
        vanAmenities: ['Aromatherapy', 'Zero Gravity Chair', 'Soundproofing', 'Ambient Lighting', 'Air Conditioning'],
        vanPrice15: parseFloat(vanPrice15) || 999,
        vanPrice30: parseFloat(vanPrice30) || 1499,
        vanPrice45: parseFloat(vanPrice45) || 1999,
        vanPhotos: [vanPhotosUrl || '/van_demo.jpg'],
        onSiteInspectionCertUrl: onSiteInspectionCertUrl || 'https://nivara-ten.vercel.app/docs/inspection_demo.pdf',
        fakePhotoDeclaration: true,
        vanAddress: 'Carter Road, Bandra West, Mumbai',
      };

      const res = await apiClient.post('/vendor/onboarding', payload);

      if (res.data && (res.data.success || res.status === 200)) {
        show('Verification submitted! Your application is now Pending Admin Approval.', 'success');
        await checkAuth(); // Refresh user state
        router.replace('/(app)/(vendor)/dashboard');
      } else {
        show(res.data?.error || 'Failed to submit onboarding application', 'error');
      }
    } catch (err: any) {
      console.error('[Onboarding Error]:', err);
      show(err.response?.data?.error || 'Submission failed. Please check parameters.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#0F2D52" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Verification Onboarding</Text>
      </View>

      {/* Steps Indicator */}
      <View style={styles.stepProgressContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.stepIndicatorWrapper}>
            <View
              style={[
                styles.stepCircle,
                currentStep === step && styles.stepCircleActive,
                currentStep > step && styles.stepCircleCompleted,
              ]}
            >
              {currentStep > step ? (
                <CheckCircle2 size={16} color="#FFFFFF" />
              ) : (
                <Text style={[styles.stepText, currentStep === step && styles.stepTextActive]}>{step}</Text>
              )}
            </View>
            <Text style={styles.stepLabel}>Phase {step}</Text>
          </View>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Phase 1: Personal KYC */}
          {currentStep === 1 && (
            <View style={styles.card}>
              <View style={styles.phaseHeader}>
                <ShieldCheck size={20} color="#16A34A" />
                <Text style={styles.phaseTitle}>Phase 1: Personal KYC Verification</Text>
              </View>

              <Text style={styles.inputLabel}>Government Document Type</Text>
              <View style={styles.radioRow}>
                {['ID_CARD', 'PASSPORT', 'DRIVING_LICENSE', 'PAN_CARD'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.radioItem, kycDocType === type && styles.radioItemActive]}
                    onPress={() => setKycDocType(type)}
                  >
                    <Text style={[styles.radioText, kycDocType === type && styles.radioTextActive]}>
                      {type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Document Identification Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Aadhaar / Passport / ID Number"
                value={kycDocNumber}
                onChangeText={setKycDocNumber}
              />

              <Text style={styles.inputLabel}>Document Photo / PDF URL</Text>
              <TextInput
                style={styles.input}
                placeholder="Document link or URL"
                value={kycDocUrl}
                onChangeText={setKycDocUrl}
              />

              <TouchableOpacity style={styles.nextBtn} onPress={() => setCurrentStep(2)}>
                <Text style={styles.nextBtnText}>Continue to Phase 2</Text>
                <ChevronRight size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Phase 2: Business & Financial Credentials */}
          {currentStep === 2 && (
            <View style={styles.card}>
              <View style={styles.phaseHeader}>
                <Building size={20} color="#16A34A" />
                <Text style={styles.phaseTitle}>Phase 2: Business & Financial Validation</Text>
              </View>

              <Text style={styles.inputLabel}>Registered Business Name *</Text>
              <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} />

              <Text style={styles.inputLabel}>Business License / Registration No. *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter License or Reg No."
                value={businessLicenseNo}
                onChangeText={setBusinessLicenseNo}
              />

              <Text style={styles.inputLabel}>GSTIN / PAN Tax ID</Text>
              <TextInput
                style={styles.input}
                placeholder="GSTIN (Optional)"
                value={gstNumber}
                onChangeText={setGstNumber}
              />

              <Text style={styles.inputLabel}>Driver / Attendant Full Name</Text>
              <TextInput style={styles.input} value={driverName} onChangeText={setDriverName} />

              <Text style={styles.inputLabel}>Bank Account Number (For 80% Payouts) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Bank Account Number"
                keyboardType="number-pad"
                value={bankAccountNumber}
                onChangeText={setBankAccountNumber}
              />

              <Text style={styles.inputLabel}>Bank IFSC Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="HDFC0000240"
                autoCapitalize="characters"
                value={bankIfsc}
                onChangeText={setBankIfsc}
              />

              <View style={styles.stepBtnRow}>
                <TouchableOpacity style={styles.prevBtn} onPress={() => setCurrentStep(1)}>
                  <Text style={styles.prevBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextBtnFlex} onPress={() => setCurrentStep(3)}>
                  <Text style={styles.nextBtnText}>Continue to Phase 3</Text>
                  <ChevronRight size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Phase 3: Vehicle Credentials */}
          {currentStep === 3 && (
            <View style={styles.card}>
              <View style={styles.phaseHeader}>
                <Truck size={20} color="#16A34A" />
                <Text style={styles.phaseTitle}>Phase 3: Commercial Vehicle Credentials</Text>
              </View>

              <Text style={styles.inputLabel}>Commercial Vehicle Reg. Number (MH02...) *</Text>
              <TextInput
                style={styles.input}
                placeholder="MH02AB1234"
                autoCapitalize="characters"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
              />

              <Text style={styles.inputLabel}>Chassis / VIN Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="17-Digit VIN / Chassis No."
                autoCapitalize="characters"
                value={chassisNumber}
                onChangeText={setChassisNumber}
              />

              <Text style={styles.inputLabel}>Registration Certificate (RC) Document URL</Text>
              <TextInput style={styles.input} value={rcUrl} onChangeText={setRcUrl} />

              <Text style={styles.inputLabel}>Commercial Insurance Certificate URL</Text>
              <TextInput style={styles.input} value={insuranceUrl} onChangeText={setInsuranceUrl} />

              <Text style={styles.inputLabel}>PUC Fitness Certificate URL</Text>
              <TextInput style={styles.input} value={pucUrl} onChangeText={setPucUrl} />

              <View style={styles.stepBtnRow}>
                <TouchableOpacity style={styles.prevBtn} onPress={() => setCurrentStep(2)}>
                  <Text style={styles.prevBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextBtnFlex} onPress={() => setCurrentStep(4)}>
                  <Text style={styles.nextBtnText}>Continue to Phase 4</Text>
                  <ChevronRight size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Phase 4: Sanctuary Van Profile & Inspection */}
          {currentStep === 4 && (
            <View style={styles.card}>
              <View style={styles.phaseHeader}>
                <Sparkles size={20} color="#16A34A" />
                <Text style={styles.phaseTitle}>Phase 4: Van Profile & On-Site Inspection</Text>
              </View>

              <Text style={styles.inputLabel}>Sanctuary Van Title *</Text>
              <TextInput style={styles.input} value={vanTitle} onChangeText={setVanTitle} />

              <Text style={styles.inputLabel}>Detailed Description *</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                multiline
                value={vanDescription}
                onChangeText={setVanDescription}
              />

              <Text style={styles.inputLabel}>Tier Pricing (15, 30, 45 Min Sessions in ₹)</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subLabel}>30 Min</Text>
                  <TextInput style={styles.input} keyboardType="number-pad" value={vanPrice15} onChangeText={setVanPrice15} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subLabel}>45 Min</Text>
                  <TextInput style={styles.input} keyboardType="number-pad" value={vanPrice30} onChangeText={setVanPrice30} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subLabel}>60 Min</Text>
                  <TextInput style={styles.input} keyboardType="number-pad" value={vanPrice45} onChangeText={setVanPrice45} />
                </View>
              </View>

              <Text style={styles.inputLabel}>On-Site Inspection Certificate URL *</Text>
              <TextInput style={styles.input} value={onSiteInspectionCertUrl} onChangeText={setOnSiteInspectionCertUrl} />

              <TouchableOpacity
                style={styles.declarationRow}
                onPress={() => setFakePhotoDeclaration(!fakePhotoDeclaration)}
              >
                <View style={[styles.checkbox, fakePhotoDeclaration && styles.checkboxActive]}>
                  {fakePhotoDeclaration && <CheckCircle2 size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.declarationText}>
                  I declare that all photos, RC, Insurance, and Inspection certificates are genuine.
                </Text>
              </TouchableOpacity>

              <View style={styles.stepBtnRow}>
                <TouchableOpacity style={styles.prevBtn} onPress={() => setCurrentStep(3)}>
                  <Text style={styles.prevBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  disabled={submitting}
                  onPress={handleSubmitOnboarding}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit 4-Phase Verification</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2D52',
  },
  stepProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
  },
  stepIndicatorWrapper: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E1D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#0F2D52',
  },
  stepCircleCompleted: {
    backgroundColor: '#16A34A',
  },
  stepText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E1D8',
    padding: 16,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
    paddingBottom: 10,
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 10,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F2D52',
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  radioItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E1D8',
    backgroundColor: '#FAF8F5',
  },
  radioItemActive: {
    backgroundColor: '#0F2D52',
    borderColor: '#0F2D52',
  },
  radioText: {
    fontSize: 11,
    color: '#4B5563',
  },
  radioTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  nextBtn: {
    backgroundColor: '#0F2D52',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 6,
  },
  stepBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  prevBtn: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
  },
  nextBtnFlex: {
    flex: 1,
    backgroundColor: '#0F2D52',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  declarationText: {
    fontSize: 11,
    color: '#4B5563',
    flex: 1,
  },
});

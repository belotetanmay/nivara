import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShieldCheck, FileText, Lock, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { LEGAL_CONTENT, LegalSection } from '../../../../constants/legalContent';
import { FormContainer } from '../../../../components/layout/FormContainer';
import { Card } from '../../../../components/ui/Card';

export default function LegalViewerScreen() {
  const router = useRouter();
  const { doc = 'terms' } = useLocalSearchParams<{ doc?: string }>();
  const [activeTab, setActiveTab] = useState<string>(doc);

  const renderContent = () => {
    switch (activeTab) {
      case 'refund':
        return (
          <View>
            <Text style={styles.title}>{LEGAL_CONTENT.cancellationAndRefundPolicy.title}</Text>
            {LEGAL_CONTENT.cancellationAndRefundPolicy.sections.map((sec: LegalSection, idx: number) => (
              <View key={idx} style={styles.section}>
                <Text style={styles.heading}>{sec.heading}</Text>
                <Text style={styles.paragraph}>{sec.content}</Text>
              </View>
            ))}
          </View>
        );
      case 'privacy':
        return (
          <View>
            <Text style={styles.title}>{LEGAL_CONTENT.privacyPolicy.title}</Text>
            {LEGAL_CONTENT.privacyPolicy.sections.map((sec: LegalSection, idx: number) => (
              <View key={idx} style={styles.section}>
                <Text style={styles.heading}>{sec.heading}</Text>
                <Text style={styles.paragraph}>{sec.content}</Text>
              </View>
            ))}
          </View>
        );
      case 'grievance':
        return (
          <View>
            <Text style={styles.title}>{LEGAL_CONTENT.grievanceRedressal.title}</Text>
            <Text style={styles.paragraph}>{LEGAL_CONTENT.grievanceRedressal.content}</Text>
          </View>
        );
      case 'vendor':
        return (
          <View>
            <Text style={styles.title}>{LEGAL_CONTENT.vendorTerms.title}</Text>
            {LEGAL_CONTENT.vendorTerms.sections.map((sec: LegalSection, idx: number) => (
              <View key={idx} style={styles.section}>
                <Text style={styles.heading}>{sec.heading}</Text>
                <Text style={styles.paragraph}>{sec.content}</Text>
              </View>
            ))}
          </View>
        );
      case 'terms':
      default:
        return (
          <View>
            <Text style={styles.title}>{LEGAL_CONTENT.termsAndConditions.title}</Text>
            {LEGAL_CONTENT.termsAndConditions.sections.map((sec: LegalSection, idx: number) => (
              <View key={idx} style={styles.section}>
                <Text style={styles.heading}>{sec.heading}</Text>
                <Text style={styles.paragraph}>{sec.content}</Text>
              </View>
            ))}
          </View>
        );
    }
  };

  return (
    <FormContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#0F2D52" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal & Policy Center</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'terms' && styles.tabActive]} onPress={() => setActiveTab('terms')}>
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>Terms & Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'refund' && styles.tabActive]} onPress={() => setActiveTab('refund')}>
          <Text style={[styles.tabText, activeTab === 'refund' && styles.tabTextActive]}>Refund Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'privacy' && styles.tabActive]} onPress={() => setActiveTab('privacy')}>
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'grievance' && styles.tabActive]} onPress={() => setActiveTab('grievance')}>
          <Text style={[styles.tabText, activeTab === 'grievance' && styles.tabTextActive]}>Grievance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'vendor' && styles.tabActive]} onPress={() => setActiveTab('vendor')}>
          <Text style={[styles.tabText, activeTab === 'vendor' && styles.tabTextActive]}>Vendor Terms</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.versionText}>Effective Date: {LEGAL_CONTENT.effectiveDate} • Version {LEGAL_CONTENT.version}</Text>
          {renderContent()}
        </Card>
      </View>
    </FormContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2D52',
  },
  tabScroll: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5E1D8',
  },
  tabActive: {
    backgroundColor: '#0F2D52',
    borderColor: '#0F2D52',
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
  },
  versionText: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
});

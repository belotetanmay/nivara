import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageSquare, Mail, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react-native';
import { COMPANY_INFO, FAQItem } from '../../../../constants/companyInfo';
import { useToast } from '../../../../components/feedback/Toast';
import { FormContainer } from '../../../../components/layout/FormContainer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { show } = useToast();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [problemDescription, setProblemDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitProblem = async () => {
    if (!problemDescription.trim()) {
      show('Please describe the issue before submitting', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setProblemDescription('');
      show('Problem report submitted! Support will contact you shortly.', 'success');
    }, 600);
  };

  return (
    <FormContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#0F2D52" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Contact Info Card */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Card style={styles.card}>
          <View style={styles.contactItem}>
            <Mail size={16} color="#0F2D52" />
            <Text style={styles.contactText}>{COMPANY_INFO.supportEmail}</Text>
          </View>
          <View style={styles.contactItem}>
            <Phone size={16} color="#0F2D52" />
            <Text style={styles.contactText}>{COMPANY_INFO.supportPhone}</Text>
          </View>
          <View style={styles.contactItem}>
            <MapPin size={16} color="#0F2D52" />
            <Text style={styles.contactText}>{COMPANY_INFO.registeredAddress}</Text>
          </View>
        </Card>

        {/* FAQs Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Card style={styles.card}>
          {COMPANY_INFO.faqs.map((faq: FAQItem, index: number) => {
            const isExpanded = expandedFaq === index;
            return (
              <View key={index}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => setExpandedFaq(isExpanded ? null : index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {isExpanded ? <ChevronUp size={16} color="#0F2D52" /> : <ChevronDown size={16} color="#9CA3AF" />}
                </TouchableOpacity>
                {isExpanded && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
                {index < COMPANY_INFO.faqs.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </Card>

        {/* Report a Problem Form */}
        <Text style={styles.sectionTitle}>Report a Problem</Text>
        <Card style={styles.card}>
          <Text style={styles.inputLabel}>Describe the issue you experienced</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Provide details about any bug, booking issue, or service concern..."
            placeholderTextColor="#9CA3AF"
            value={problemDescription}
            onChangeText={setProblemDescription}
          />
          <Button
            title="Submit Report"
            onPress={handleSubmitProblem}
            isLoading={submitting}
            style={styles.submitBtn}
          />
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
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2D52',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 13,
    color: '#0F2D52',
    fontWeight: '500',
    marginLeft: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2D52',
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E1D8',
    marginVertical: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F2D52',
    textAlignVertical: 'top',
    minHeight: 90,
  },
  submitBtn: {
    backgroundColor: '#0F2D52',
    marginTop: 12,
    borderRadius: 10,
  },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useToast } from '../../../../components/feedback/Toast';
import { FormContainer } from '../../../../components/layout/FormContainer';
import { Card } from '../../../../components/ui/Card';

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const { show } = useToast();

  const [bookingPush, setBookingPush] = useState(true);
  const [remindersPush, setRemindersPush] = useState(true);
  const [promoEmail, setPromoEmail] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  return (
    <FormContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#0F2D52" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.textGroup}>
              <Text style={styles.rowTitle}>Booking Confirmations</Text>
              <Text style={styles.rowSub}>Instant updates on your van reservations</Text>
            </View>
            <Switch
              value={bookingPush}
              onValueChange={(val) => {
                setBookingPush(val);
                show('Notification settings updated', 'info');
              }}
              trackColor={{ false: '#D1D5DB', true: '#16A34A' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.textGroup}>
              <Text style={styles.rowTitle}>Session Reminders</Text>
              <Text style={styles.rowSub}>Receive reminders 30 mins before start</Text>
            </View>
            <Switch
              value={remindersPush}
              onValueChange={(val) => {
                setRemindersPush(val);
                show('Notification settings updated', 'info');
              }}
              trackColor={{ false: '#D1D5DB', true: '#16A34A' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.textGroup}>
              <Text style={styles.rowTitle}>Promotional Offers</Text>
              <Text style={styles.rowSub}>Discounts and wellness news</Text>
            </View>
            <Switch
              value={promoEmail}
              onValueChange={(val) => {
                setPromoEmail(val);
                show('Notification settings updated', 'info');
              }}
              trackColor={{ false: '#D1D5DB', true: '#16A34A' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.textGroup}>
              <Text style={styles.rowTitle}>Security & Account Alerts</Text>
              <Text style={styles.rowSub}>Critical account activity notifications</Text>
            </View>
            <Switch
              value={securityAlerts}
              onValueChange={(val) => {
                setSecurityAlerts(val);
                show('Security alerts remain active', 'info');
              }}
              trackColor={{ false: '#D1D5DB', true: '#16A34A' }}
            />
          </View>
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
  card: {
    padding: 16,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  textGroup: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2D52',
  },
  rowSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E1D8',
    marginVertical: 12,
  },
});

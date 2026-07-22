import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Shield, Users, CreditCard, LogOut } from 'lucide-react-native';
import { Button } from '../../../components/ui/Button';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Shield size={24} color="#0A2540" style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>Admin Center</Text>
        </View>
        <Text style={styles.welcomeText}>Welcome back, {user?.name || 'Administrator'}</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Overview Metrics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={28} color="#2C5234" />
            <Text style={styles.statValue}>1,482</Text>
            <Text style={styles.statLabel}>Active Customers</Text>
          </View>

          <View style={styles.statCard}>
            <Shield size={28} color="#D4A373" />
            <Text style={styles.statValue}>48</Text>
            <Text style={styles.statLabel}>Verified Vendors</Text>
          </View>
        </View>

        <View style={[styles.statCard, { width: '100%', marginTop: 16 }]}>
          <CreditCard size={28} color="#0A2540" />
          <Text style={styles.statValue}>₹4,82,500.00</Text>
          <Text style={styles.statLabel}>Total Platform Volume</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Platform Controls</Text>
          <Text style={styles.infoText}>
            You have administrator credentials. Admin tools (user management, vendor KYC reviews, and platform configurations) are accessible via the main web administration dashboard.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          className="w-full"
          style={styles.signOutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A2540',
    fontFamily: 'serif',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2540',
    marginTop: 8,
  },
  emailText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0A2540',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A2540',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E1D8',
  },
  signOutButton: {
    borderColor: '#E5E1D8',
  },
}) as any;

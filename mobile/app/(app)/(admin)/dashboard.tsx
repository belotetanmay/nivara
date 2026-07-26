import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Shield, Users, CreditCard, LogOut, CheckCircle2, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react-native';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/feedback/Toast';
import { apiClient } from '../../../services/api/apiClient';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { show } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [statsRes, vendorsRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/vendors'),
      ]);

      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (vendorsRes.data && vendorsRes.data.success) {
        const pending = (vendorsRes.data.vendors || []).filter(
          (v: any) => v.verificationStatus === 'PENDING' || v.verificationStatus === 'UNDER_REVIEW'
        );
        setPendingVendors(pending);
      }
    } catch (err: any) {
      console.error('[Admin Dashboard Error]:', err);
      show(err.response?.data?.error || 'Failed to load live admin data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  const handleApproveVendor = async (vendorId: string, name: string) => {
    setProcessingId(vendorId);
    try {
      const res = await apiClient.post(`/admin/vendors/${vendorId}/approve`);
      if (res.data && (res.data.success || res.status === 200)) {
        show(`Approved ${name}'s vendor application successfully!`, 'success');
        fetchAdminData();
      } else {
        show(res.data?.error || 'Failed to approve vendor', 'error');
      }
    } catch (err: any) {
      show(err.response?.data?.error || 'Approval request failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectVendor = async (vendorId: string, name: string) => {
    setProcessingId(vendorId);
    try {
      const res = await apiClient.post(`/admin/vendors/${vendorId}/reject`, {
        reason: 'Documents did not meet compliance standard',
      });
      if (res.data && (res.data.success || res.status === 200)) {
        show(`Rejected ${name}'s application`, 'info');
        fetchAdminData();
      } else {
        show(res.data?.error || 'Failed to reject vendor', 'error');
      }
    } catch (err: any) {
      show(err.response?.data?.error || 'Rejection request failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Shield size={24} color="#0F2D52" style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>NIVARA Admin Control Center</Text>
        </View>
        <Text style={styles.welcomeText}>Welcome back, {user?.name || 'Administrator'}</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#16A34A']} />}
      >
        <Text style={styles.sectionTitle}>Live Platform Metrics</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0F2D52" style={{ marginVertical: 30 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Users size={28} color="#16A34A" />
                <Text style={styles.statValue}>{(stats?.totalUsers || 0).toLocaleString()}</Text>
                <Text style={styles.statLabel}>Active Customers</Text>
              </View>

              <View style={styles.statCard}>
                <Shield size={28} color="#0F2D52" />
                <Text style={styles.statValue}>{(stats?.totalVendors || 0).toLocaleString()}</Text>
                <Text style={styles.statLabel}>Verified Partners</Text>
              </View>
            </View>

            <View style={[styles.statCard, { width: '100%', marginTop: 12 }]}>
              <CreditCard size={28} color="#D97706" />
              <Text style={styles.statValue}>
                ₹{(stats?.totalGrossRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.statLabel}>Total Platform Revenue (Gross Volume)</Text>
            </View>

            {/* Pending Vendor Onboarding Applications Approval Queue */}
            <View style={styles.queueHeaderRow}>
              <Clock size={18} color="#D97706" />
              <Text style={styles.queueTitle}>Pending Partner Approvals ({pendingVendors.length})</Text>
            </View>

            {pendingVendors.length === 0 ? (
              <View style={styles.emptyQueueCard}>
                <CheckCircle2 size={24} color="#16A34A" />
                <Text style={styles.emptyQueueText}>All partner verification applications are up to date!</Text>
              </View>
            ) : (
              pendingVendors.map((vendor) => (
                <View key={vendor.id} style={styles.vendorAppCard}>
                  <View style={styles.vendorHeader}>
                    <Text style={styles.vendorBusinessName}>{vendor.businessName || vendor.user?.name}</Text>
                    <Text style={styles.pendingBadge}>UNDER REVIEW</Text>
                  </View>

                  <Text style={styles.vendorDetailText}>👤 Applicant: {vendor.user?.name} ({vendor.user?.email})</Text>
                  <Text style={styles.vendorDetailText}>📞 Phone: {vendor.user?.phone || 'Not provided'}</Text>
                  <Text style={styles.vendorDetailText}>📄 License No: {vendor.businessLicenseNo || 'Pending Submission'}</Text>
                  <Text style={styles.vendorDetailText}>🏦 Bank Payout: {vendor.bankName || 'HDFC Bank'} (A/C: {vendor.bankAccountNumber || 'Provided'})</Text>

                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={[styles.approveBtn, processingId === vendor.id && { opacity: 0.6 }]}
                      disabled={processingId === vendor.id}
                      onPress={() => handleApproveVendor(vendor.id, vendor.businessName || vendor.user?.name)}
                    >
                      {processingId === vendor.id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.approveBtnText}>Approve Partner</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rejectBtn, processingId === vendor.id && { opacity: 0.6 }]}
                      disabled={processingId === vendor.id}
                      onPress={() => handleRejectVendor(vendor.id, vendor.businessName || vendor.user?.name)}
                    >
                      <XCircle size={16} color="#DC2626" style={{ marginRight: 6 }} />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <Button
          title="Sign Out Admin Session"
          variant="outline"
          onPress={handleSignOut}
          className="w-full"
          style={styles.signOutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2D52',
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2D52',
    marginTop: 4,
  },
  emailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  queueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginLeft: 8,
  },
  emptyQueueCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyQueueText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 8,
  },
  vendorAppCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
    paddingBottom: 8,
  },
  vendorBusinessName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F2D52',
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vendorDetailText: {
    fontSize: 12,
    color: '#4B5563',
    marginVertical: 2,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  approveBtn: {
    flex: 2,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  rejectBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
  signOutButton: {
    marginTop: 20,
    borderColor: '#E5E1D8',
  },
});

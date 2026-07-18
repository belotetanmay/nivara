import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import apiClient from '../../services/api';
import { ArrowLeft, Check, X, ShieldAlert, AlertCircle, FileText, User } from 'lucide-react-native';

export default function AdminApprovalsScreen({ route, navigation }: any) {
  const { type } = route.params || { type: 'KYC' }; // KYC is default
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await apiClient.get('/admin/kyc');
      if (response.data.success) {
        // Filter for PENDING status
        const pendingDocs = (response.data.documents || []).filter(
          (doc: any) => doc.status === 'PENDING'
        );
        setDocuments(pendingDocs);
      }
    } catch (e) {
      console.warn('Failed to load KYC approvals queue', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingApprovals();
  };

  const handleApprove = async (docId: string) => {
    Alert.alert(
      'Approve Document?',
      'Are you sure you want to verify this customer identity card? They will be granted instant pod booking access.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Verify',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await apiClient.post(`/admin/kyc/${docId}/approve`);
              if (res.data.success) {
                Alert.alert('Approved!', 'Customer KYC status updated to VERIFIED.');
                fetchPendingApprovals();
              }
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to approve document');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (docId: string) => {
    // Prompt founder for rejection reason
    Alert.prompt(
      'Reject Document',
      'Please enter the reason for rejection (e.g., blurry image, invalid ID number):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Rejection',
          onPress: async (reason) => {
            if (!reason || !reason.trim()) {
              Alert.alert('Error', 'Rejection reason is required.');
              return;
            }
            setLoading(true);
            try {
              const res = await apiClient.post(`/admin/kyc/${docId}/reject`, {
                reason: reason.trim(),
              });
              if (res.data.success) {
                Alert.alert('Rejected', 'Customer KYC status updated to REJECTED.');
                fetchPendingApprovals();
              }
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to reject document');
              setLoading(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const renderDocCard = ({ item }: { item: any }) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <User size={18} color="#0A2540" style={{ marginRight: 6 }} />
            <Text style={styles.userName}>{item.user?.name}</Text>
          </View>
          <Text style={styles.timestamp}>{dateStr}</Text>
        </View>

        <Text style={styles.userEmail}>{item.user?.email}</Text>

        <View style={styles.divider} />

        <View style={styles.docRow}>
          <FileText size={18} color="#2C5234" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.docLabel}>Document Type: {item.docType}</Text>
            <Text style={styles.docNumber}>Doc Number: {item.docNumber}</Text>
          </View>
        </View>

        {/* Dummy image representation box for mobile simplicity */}
        <View style={styles.imagePreviewBox}>
          <Text style={styles.previewText}>📄 ID Document Image Attached</Text>
          <Text style={styles.previewUrlText}>{item.fileUrl}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
            <Check size={16} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
            <X size={16} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0A2540" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Approvals Queue</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <RefreshCw size={18} color="#0A2540" />
        </TouchableOpacity>
      </View>

      {documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AlertCircle size={48} color="#2C5234" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Queue Clear!</Text>
          <Text style={styles.emptySubtitle}>There are no pending customer identity verifications.</Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={renderDocCard}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
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
    justifyContent: 'space-between',
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
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    color: '#0A2540',
    fontSize: 15,
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#8F8C87',
    fontSize: 10,
    fontWeight: '500',
  },
  userEmail: {
    color: '#8F8C87',
    fontSize: 13,
    marginTop: 2,
    marginLeft: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E1D8',
    marginVertical: 12,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  docLabel: {
    color: '#0A2540',
    fontSize: 13,
    fontWeight: 'bold',
  },
  docNumber: {
    color: '#8F8C87',
    fontSize: 12,
    marginTop: 2,
  },
  imagePreviewBox: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E1D8',
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  previewText: {
    color: '#0A2540',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewUrlText: {
    color: '#8F8C87',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveBtn: {
    backgroundColor: '#2C5234', // Forest Green approve
    borderRadius: 10,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1.1,
    marginRight: 10,
  },
  rejectBtn: {
    backgroundColor: '#EF4444', // Red reject
    borderRadius: 10,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.9,
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#8F8C87',
    fontSize: 13,
    textAlign: 'center',
  },
});

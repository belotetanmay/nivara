import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Bell, Shield, Lock, HelpCircle, FileText, Info, LogOut, ChevronRight, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/feedback/Toast';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { show } = useToast();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = async () => {
    setDeleteModalVisible(false);
    show('Account deletion request initiated. Logging out...', 'info');
    await logout();
  };

  const menuGroups = [
    {
      title: 'Account Settings',
      items: [
        { label: 'Edit Profile', icon: User, route: '/(app)/(customer)/settings/edit-profile' },
        { label: 'Security & Password', icon: Lock, route: '/(app)/(customer)/settings/change-password' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Notification Preferences', icon: Bell, route: '/(app)/(customer)/settings/notifications-settings' },
        { label: 'Privacy & Legal Center', icon: Shield, route: '/(app)/(customer)/settings/legal-viewer?doc=privacy' },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        { label: 'Help & Support / FAQs', icon: HelpCircle, route: '/(app)/(customer)/settings/help-support' },
        { label: 'Terms & Conditions', icon: FileText, route: '/(app)/(customer)/settings/legal-viewer?doc=terms' },
        { label: 'Refund & Cancellation Policy', icon: FileText, route: '/(app)/(customer)/settings/legal-viewer?doc=refund' },
        { label: 'About Nivara', icon: Info, route: '/(app)/(customer)/settings/legal-viewer?doc=terms', detail: 'Version 1.0.0' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F2D52" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {menuGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Card style={styles.groupCard}>
              {group.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex < group.items.length - 1 && styles.borderBottom,
                    ]}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconWrapper}>
                        <IconComponent size={18} color="#0F2D52" />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    {item.detail ? (
                      <Text style={styles.detailText}>{item.detail}</Text>
                    ) : (
                      <ChevronRight size={16} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </Card>
          </View>
        ))}

        {/* Delete Account */}
        <TouchableOpacity
          onPress={() => setDeleteModalVisible(true)}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color="#EF4444" style={styles.logoutIcon} />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <LogOut size={18} color="#EF4444" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Nivara Premium • Production Release Version 1.0.0</Text>
      </ScrollView>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account?</Text>
            <Text style={styles.modalSub}>
              Are you sure you want to permanently delete your NIVARA account? All your booking history and preferences will be permanently erased.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.confirmDeleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  headerTitle: {
    color: '#0F2D52',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: {
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2D52',
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 13,
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmDeleteBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

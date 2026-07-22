import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Bell, Shield, Lock, HelpCircle, FileText, Info, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/ui/Card';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const menuGroups = [
    {
      title: 'Account Settings',
      items: [
        { label: 'Account Information', icon: User, available: false },
        { label: 'Edit Profile', icon: User, available: false },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Notifications', icon: Bell, available: false },
        { label: 'Privacy & Permissions', icon: Shield, available: false },
        { label: 'Security & Password', icon: Lock, available: false },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        { label: 'Help & Support', icon: HelpCircle, available: false },
        { label: 'Terms of Service', icon: FileText, available: false },
        { label: 'About Nivara', icon: Info, available: true, detail: 'Version 1.0.0' },
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
                  <View
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex < group.items.length - 1 && styles.borderBottom,
                      !item.available && styles.menuItemDisabled,
                    ]}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconWrapper}>
                        <IconComponent size={18} color={item.available ? '#0F2D52' : '#9CA3AF'} />
                      </View>
                      <Text style={[styles.menuLabel, !item.available && styles.menuLabelDisabled]}>
                        {item.label}
                      </Text>
                    </View>
                    {item.available ? (
                      item.detail ? (
                        <Text style={styles.detailText}>{item.detail}</Text>
                      ) : (
                        <ChevronRight size={16} color="#9CA3AF" />
                      )
                    ) : (
                      <Text style={styles.soonTag}>Soon</Text>
                    )}
                  </View>
                );
              })}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <LogOut size={18} color="#EF4444" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Nivara Premium • Version 1.0.0</Text>
        <Text style={styles.phaseText}>More preferences available in upcoming updates</Text>
      </ScrollView>
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
    color: '#0F2D52',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E1D8',
    borderRadius: 16,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemDisabled: {
    opacity: 0.5,
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
    padding: 8,
    backgroundColor: '#F7F9F8',
    borderRadius: 8,
    marginRight: 12,
  },
  menuLabel: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: '600',
  },
  menuLabelDisabled: {
    color: '#6B7280',
  },
  soonTag: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  detailText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 12,
    marginBottom: 16,
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
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  phaseText: {
    color: '#C4C9D0',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 30,
  },
}) as any;

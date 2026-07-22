import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCircle, BellRing, Info, ShieldAlert } from 'lucide-react-native';
import { customerService, Notification } from '../../../services/customer/customerService';
import { useToast } from '../../../components/feedback/Toast';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  const loadNotifications = async () => {
    setLoading(true);
    const data = await customerService.getNotifications();
    setNotifications(data.notifications || []);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const res = await customerService.markNotificationRead(id);
    if (res.success) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      show('Notification marked as read', 'success');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.every(n => n.isRead)) {
      show('All notifications are already read', 'info');
      return;
    }
    const res = await customerService.markAllNotificationsRead();
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      show('All notifications marked as read', 'success');
    }
  };

  const getIcon = (title: string, isRead: boolean) => {
    const color = isRead ? '#9CA3AF' : '#16A34A';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('wallet') || lowerTitle.includes('refuel') || lowerTitle.includes('balance')) {
      return <Info size={20} color={color} />;
    }
    if (lowerTitle.includes('verify') || lowerTitle.includes('kyc') || lowerTitle.includes('lockout')) {
      return <ShieldAlert size={20} color={color} />;
    }
    return <BellRing size={20} color={color} />;
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => !item.isRead && handleMarkAsRead(item.id)}
      style={[
        styles.card,
        !item.isRead ? styles.unreadCard : styles.readCard,
      ]}
    >
      <View style={styles.iconContainer}>
        {getIcon(item.title, item.isRead)}
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !item.isRead ? styles.unreadText : styles.readText]}>
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadBadge} />}
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {notifications.filter(n => !n.isRead).length} unread updates
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleMarkAllAsRead}
          style={styles.markAllButton}
          activeOpacity={0.7}
        >
          <CheckCircle size={16} color="#16A34A" />
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3, 4].map((k) => (
            <View key={k} style={[styles.card, styles.readCard]}>
              <Skeleton width={36} height={36} borderRadius={18} style={{ marginRight: 14 }} />
              <View style={{ flex: 1 }}>
                <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
                <Skeleton width="90%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="30%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadNotifications}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Bell size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>
                No notifications found. You will receive updates about bookings, profile verifications, and wallets here.
              </Text>
            </View>
          }
        />
      )}
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
  headerTitle: {
    color: '#0F2D52',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markAllText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 24,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  unreadCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#16A34A',
  },
  readCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E1D8',
    opacity: 0.7,
  },
  iconContainer: {
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadText: {
    color: '#0F2D52',
  },
  readText: {
    color: '#6B7280',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginLeft: 8,
  },
  message: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  time: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#0F2D52',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
}) as any;

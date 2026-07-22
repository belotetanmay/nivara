import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, LogOut, Settings, Heart, Phone, Mail, HelpCircle, ShieldAlert, FileText, Bell, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/feedback/Toast';
import { customerService } from '../../../services/customer/customerService';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout, checkAuth, isAuthenticated } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavs, setLoadingFavs] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<number>(2500);

  const loadFavorites = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingFavs(true);
      const list = await customerService.getFavorites();
      setFavorites(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFavs(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        checkAuth(),
        loadFavorites()
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    show('Successfully logged out', 'info');
  };

  const handleRemoveFavorite = async (vendorId: string) => {
    const res = await customerService.removeFavorite(vendorId);
    if (res.success) {
      setFavorites(prev => prev.filter(fav => fav.id !== vendorId));
      show('Removed from favorites', 'info');
    } else {
      show(res.error || 'Failed to remove favorite', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#0F2D52" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(customer)/settings')} style={styles.headerSettings}>
          <Settings size={20} color="#0F2D52" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#16A34A']} />
        }
      >
        <View style={styles.innerContainer}>
          
          {/* User profile header info */}
          <View style={styles.profileCard}>
            <Avatar name={user?.name || 'Seeker'} size="lg" className="mb-3.5" />
            <Text style={styles.profileName}>{user?.name || 'Sanctuary User'}</Text>
            <Text style={styles.profileTag}>Verified Seeker</Text>
            
            <View style={styles.contactInfoRow}>
              <Mail size={14} color="#6B7280" style={styles.contactIcon} />
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>

          {/* Wallet Balance Card */}
          <Text style={styles.sectionTitle}>My Wallet</Text>
          <Card style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <CreditCard size={20} color="#FFFFFF" />
              <Text style={styles.walletTitle}>Nivara Credits</Text>
            </View>
            <Text style={styles.walletBalance}>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            <Text style={styles.walletFooter}>Seed balance active for complimentary sessions</Text>
          </Card>

          {/* Navigation Links */}
          <Text style={styles.sectionTitle}>Settings & Support</Text>
          <Card style={styles.menuCard}>
            <TouchableOpacity 
              onPress={() => router.navigate('/(app)/(customer)/bookings')}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <FileText size={18} color="#0F2D52" style={styles.menuIcon} />
                <Text style={styles.menuText}>My Bookings</Text>
              </View>
              <Text style={styles.arrowText}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.navigate('/(app)/(customer)/notifications')}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Bell size={18} color="#0F2D52" style={styles.menuIcon} />
                <Text style={styles.menuText}>Notifications</Text>
              </View>
              <Text style={styles.arrowText}>→</Text>
            </TouchableOpacity>

            <View 
              style={[styles.menuItem, { opacity: 0.45 }]}
            >
              <View style={styles.menuItemLeft}>
                <HelpCircle size={18} color="#0F2D52" style={styles.menuIcon} />
                <Text style={styles.menuText}>Help & Support</Text>
              </View>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>

            <View 
              style={[styles.menuItem, { opacity: 0.45, borderBottomWidth: 0 }]}
            >
              <View style={styles.menuItemLeft}>
                <ShieldAlert size={18} color="#0F2D52" style={styles.menuIcon} />
                <Text style={styles.menuText}>Privacy Policy</Text>
              </View>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          </Card>

          {/* Favorites List section */}
          <Text style={styles.sectionTitle}>Favorite Sanctuary Partners</Text>
          {loadingFavs ? (
            <ActivityIndicator size="small" color="#0F2D52" style={styles.loader} />
          ) : favorites.length === 0 ? (
            <Card style={styles.emptyFavsCard}>
              <Heart size={24} color="#9CA3AF" />
              <Text style={styles.emptyFavsText}>No favorites yet.</Text>
            </Card>
          ) : (
            <View style={styles.favList}>
              {favorites.map((partner) => (
                <Card key={partner.id} style={styles.favCard}>
                  <View style={styles.favCardLeft}>
                    <Text style={styles.favBusinessName}>{partner.businessName}</Text>
                    <Text numberOfLines={1} style={styles.favBio}>{partner.bio}</Text>
                    {partner.vans?.[0] && (
                      <TouchableOpacity
                        onPress={() => router.push(`/(app)/(customer)/vans/${partner.vans[0].id}`)}
                        style={styles.favLink}
                      >
                        <Text style={styles.favLinkText}>View Available Vans →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveFavorite(partner.id)}
                    style={styles.favRemoveButton}
                    activeOpacity={0.7}
                  >
                    <Heart size={20} color="#EF4444" fill="#EF4444" />
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          )}

          {/* Log out action */}
          <Button
            title="Sign Out"
            leftIcon={<LogOut size={16} color="#FFFFFF" />}
            onPress={handleLogout}
            style={styles.signOutButton}
          />

        </View>
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
    paddingRight: 12,
    paddingVertical: 4,
  },
  headerTitle: {
    color: '#0F2D52',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSettings: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    padding: 24,
    borderRadius: 24,
  },
  avatar: {
    marginBottom: 14,
  },
  profileName: {
    color: '#0F2D52',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileTag: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  contactIcon: {
    marginRight: 6,
  },
  profileEmail: {
    color: '#4B5563',
    fontSize: 13,
  },
  sectionTitle: {
    color: '#0F2D52',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 12,
  },
  walletCard: {
    backgroundColor: '#0F2D52',
    borderColor: '#0F2D52',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  walletTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  walletBalance: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  walletFooter: {
    color: '#E5E1D8',
    fontSize: 10,
    fontStyle: 'italic',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E1D8',
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: '600',
  },
  arrowText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  comingSoonText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loader: {
    marginVertical: 16,
  },
  emptyFavsCard: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
  },
  emptyFavsText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },
  favList: {
    marginBottom: 24,
  },
  favCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderColor: '#E5E1D8',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  favCardLeft: {
    flex: 1,
    marginRight: 16,
  },
  favBusinessName: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: 'bold',
  },
  favBio: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  favLink: {
    marginTop: 8,
  },
  favLinkText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  favRemoveButton: {
    padding: 8,
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 24,
  },
}) as any;

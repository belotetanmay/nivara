import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff, RefreshCw } from 'lucide-react-native';

export const OfflineBanner: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const handleRetry = async () => {
    setChecking(true);
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
    setTimeout(() => setChecking(false), 500);
  };

  if (isConnected !== false) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <WifiOff size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.text}>No Internet Connection</Text>
      </View>

      <TouchableOpacity
        style={styles.retryBtn}
        onPress={handleRetry}
        disabled={checking}
        activeOpacity={0.8}
      >
        <RefreshCw size={12} color="#0F2D52" style={checking ? styles.spin : undefined} />
        <Text style={styles.retryText}>{checking ? 'Checking...' : 'Retry'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  retryBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryText: {
    color: '#0F2D52',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  spin: {
    opacity: 0.7,
  },
});

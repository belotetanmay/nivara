import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextType {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  details: NetInfoState | null;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkContextType>({
    isConnected: true,
    isInternetReachable: true,
    details: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        details: state,
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={networkState}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

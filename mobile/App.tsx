import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import Screens
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import MapScreen from './screens/Customer/MapScreen';
import VanDetailsScreen from './screens/Customer/VanDetailsScreen';
import BookingsScreen from './screens/Customer/BookingsScreen';
import ScanQRScreen from './screens/Vendor/ScanQRScreen';
import VendorDashboardScreen from './screens/Vendor/VendorDashboardScreen';
import AdminDashboardScreen from './screens/Admin/AdminDashboardScreen';
import AdminApprovalsScreen from './screens/Admin/AdminApprovalsScreen';

const Stack = createStackNavigator();

function NavigationRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A2540" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user === null ? (
        // Unauthenticated Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Authenticated Stack (Isolated by role to ensure proper landing screens)
        <>
          {user.role === 'ADMIN' && (
            <>
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              <Stack.Screen name="AdminApprovals" component={AdminApprovalsScreen} />
            </>
          )}

          {user.role === 'VENDOR' && (
            <>
              <Stack.Screen name="VendorDashboard" component={VendorDashboardScreen} />
              <Stack.Screen name="ScanQR" component={ScanQRScreen} />
            </>
          )}

          {user.role === 'CUSTOMER' && (
            <>
              <Stack.Screen name="Map" component={MapScreen} />
              <Stack.Screen name="VanDetails" component={VanDetailsScreen} />
              <Stack.Screen name="Bookings" component={BookingsScreen} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <NavigationRouter />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

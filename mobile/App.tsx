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

const Stack = createStackNavigator();

function NavigationRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
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
        // Authenticated Stack
        <>
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="VanDetails" component={VanDetailsScreen} />
          <Stack.Screen name="Bookings" component={BookingsScreen} />
          <Stack.Screen name="ScanQR" component={ScanQRScreen} />
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
    backgroundColor: '#0F0C1B',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

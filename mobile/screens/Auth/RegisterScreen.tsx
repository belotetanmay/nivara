import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, Mail, User, AlertCircle, Sparkles, Building2 } from 'lucide-react-native';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // New Role Selector States
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [businessName, setBusinessName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (role === 'VENDOR' && !businessName.trim()) {
      setError('Please enter your business name');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await register(
        name.trim(),
        email.trim(),
        password,
        role,
        role === 'VENDOR' ? businessName.trim() : undefined
      );

      if (!result.success) {
        setError(result.error || 'Registration failed');
      }
    } catch (e) {
      setError('Something went wrong. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Prominent Logo Visibility */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: 'http://192.168.1.93:3000/nivara_logo_transparent.png' }}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.taglineText}>Reclaim your peaceful state.</Text>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.titleText}>Join Nivara</Text>
          <Text style={styles.subtitleText}>Create an account to escape the chaos.</Text>

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#D4A373" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Account Type Selector (Customer vs Vendor Cards) */}
          <Text style={styles.fieldLabel}>I want to sign up as:</Text>
          <View style={styles.roleSelectorRow}>
            <TouchableOpacity
              style={[styles.roleCard, role === 'CUSTOMER' && styles.roleCardSelected]}
              onPress={() => {
                setRole('CUSTOMER');
                setError(null);
              }}
            >
              <Sparkles size={20} color={role === 'CUSTOMER' ? '#FFF' : '#0A2540'} style={{ marginBottom: 4 }} />
              <Text style={[styles.roleCardText, role === 'CUSTOMER' && styles.roleCardTextSelected]}>
                Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, role === 'VENDOR' && styles.roleCardSelected]}
              onPress={() => {
                setRole('VENDOR');
                setError(null);
              }}
            >
              <Building2 size={20} color={role === 'VENDOR' ? '#FFF' : '#0A2540'} style={{ marginBottom: 4 }} />
              <Text style={[styles.roleCardText, role === 'VENDOR' && styles.roleCardTextSelected]}>
                Wellness Partner
              </Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <Text style={styles.fieldLabel}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <User size={18} color="#0A2540" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#8F8C87"
              autoCapitalize="words"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(null);
              }}
            />
          </View>

          {/* Vendor specific Business Name Input */}
          {role === 'VENDOR' && (
            <>
              <Text style={styles.fieldLabel}>Business / Company Name</Text>
              <View style={styles.inputWrapper}>
                <Building2 size={18} color="#0A2540" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Vikas Wellness Vans"
                  placeholderTextColor="#8F8C87"
                  autoCapitalize="words"
                  value={businessName}
                  onChangeText={(text) => {
                    setBusinessName(text);
                    setError(null);
                  }}
                />
              </View>
            </>
          )}

          {/* Email Input */}
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color="#0A2540" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@email.com"
              placeholderTextColor="#8F8C87"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
            />
          </View>

          {/* Password Input */}
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <KeyRound size={18} color="#0A2540" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min 6 characters"
              placeholderTextColor="#8F8C87"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
            />
          </View>

          {/* Confirm Password Input */}
          <Text style={styles.fieldLabel}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <KeyRound size={18} color="#0A2540" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#8F8C87"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError(null);
              }}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Toggle Screen */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 180,
    height: 60,
    marginBottom: 8,
  },
  taglineText: {
    fontSize: 13,
    color: '#2C5234',
    marginTop: 6,
    letterSpacing: 1,
    fontWeight: '500',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E1D8',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#8F8C87',
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#D4A373',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#D4A373',
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  roleSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  roleCard: {
    width: '48%',
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardSelected: {
    backgroundColor: '#0A2540',
    borderColor: '#0A2540',
  },
  roleCardText: {
    color: '#0A2540',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  roleCardTextSelected: {
    color: '#FFF',
  },
  fieldLabel: {
    color: '#0A2540',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E1D8',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#0A2540',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#0A2540',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#8F8C87',
    fontSize: 14,
  },
  footerLink: {
    color: '#2C5234',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

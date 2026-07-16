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
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, Mail, User, AlertCircle, Sparkles } from 'lucide-react-native';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
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
      const result = await register(name.trim(), email.trim(), password);
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
          <View style={styles.logoBadge}>
            <Sparkles size={24} color="#2C5234" />
          </View>
          <Text style={styles.logoText}>N I V A R A</Text>
          <Text style={styles.taglineText}>Reclaim your peaceful state.</Text>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.titleText}>Join Nivara</Text>
          <Text style={styles.subtitleText}>Create an account to book your wellness pods.</Text>

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#D4A373" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

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
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#2C5234',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A2540',
    letterSpacing: 6,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
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

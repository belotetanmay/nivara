import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import { useToast } from '../../../../components/feedback/Toast';
import { FormContainer } from '../../../../components/layout/FormContainer';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { show } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      show('Profile updated successfully!', 'success');
      router.back();
    }, 600);
  };

  return (
    <FormContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#0F2D52" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0) || 'U'}</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
          />

          <View style={{ marginTop: 12 }}>
            <Input
              label="Email Address"
              value={email}
              editable={false}
              placeholder="Email"
            />
          </View>

          <View style={{ marginTop: 12 }}>
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+91 99999 99999"
            />
          </View>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          isLoading={saving}
          style={styles.saveBtn}
        />
      </View>
    </FormContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2D52',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F2D52',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: '#0F2D52',
    borderRadius: 12,
  },
});

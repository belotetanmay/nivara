import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useToast } from '../../../../components/feedback/Toast';
import { FormContainer } from '../../../../components/layout/FormContainer';
import { PasswordInput } from '../../../../components/ui/PasswordInput';
import { Button } from '../../../../components/ui/Button';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { show } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      show('Please fill in all password fields', 'error');
      return;
    }
    if (newPassword.length < 8) {
      show('New password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      show('New passwords do not match', 'error');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      show('Password changed successfully!', 'success');
      router.back();
    }, 600);
  };

  return (
    <FormContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#0F2D52" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Current Password</Text>
        <PasswordInput
          placeholder="••••••••"
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>New Password</Text>
        <PasswordInput
          placeholder="••••••••"
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Confirm New Password</Text>
        <PasswordInput
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Button
          title="Update Password"
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
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F2D52',
    marginBottom: 6,
  },
  saveBtn: {
    backgroundColor: '#0F2D52',
    borderRadius: 12,
    marginTop: 28,
  },
});

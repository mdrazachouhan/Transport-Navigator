import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/query-client';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const topInset = insets.top + webTop;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL('/api/users/profile', baseUrl).toString(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (data.user) {
        updateUser({ name: data.user.name });
        Alert.alert('Success', 'Profile updated');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not update profile');
    }
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.navyDark, Colors.navyMid]} style={[styles.header, { paddingTop: topInset + 16 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.avatarSection}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={40} color={Colors.surface} />
          </View>
          <Text style={styles.avatarName}>{user?.name || 'User'}</Text>
          <Text style={styles.avatarRole}>Customer</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor={Colors.textTertiary} />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.readOnly}>
              <Text style={styles.readOnlyText}>{user?.phone || ''}</Text>
              <Ionicons name="lock-closed-outline" size={16} color={Colors.textTertiary} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Account Type</Text>
            <View style={styles.readOnly}>
              <Text style={styles.readOnlyText}>Customer</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Member Since</Text>
            <View style={styles.readOnly}>
              <Text style={styles.readOnlyText}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.surface },
  avatarSection: { alignItems: 'center' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 10 },
  avatarName: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.surface },
  avatarRole: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  content: { flex: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.cardBorder },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.cardBorder },
  readOnly: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.cardBorder },
  readOnlyText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.surface },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone: string; role: string }>();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState('auto');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const isDriver = params.role === 'driver';

  async function handleRegister() {
    if (!name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    if (isDriver && !vehicleNumber.trim()) { Alert.alert('Error', 'Vehicle number is required'); return; }
    setLoading(true);
    const result = await register({
      phone: params.phone || '',
      name: name.trim(),
      role: params.role || 'customer',
      ...(isDriver && { vehicleType, vehicleNumber: vehicleNumber.trim(), licenseNumber: licenseNumber.trim() }),
    });
    setLoading(false);
    if (result.success) {
      if (isDriver) router.replace('/driver/dashboard' as any);
      else router.replace('/customer/home' as any);
    } else {
      Alert.alert('Error', result.error || 'Registration failed');
    }
  }

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const vehicles = [
    { type: 'auto', label: 'Auto', icon: 'rickshaw' as const },
    { type: 'tempo', label: 'Tempo', icon: 'van-utility' as const },
    { type: 'truck', label: 'Truck', icon: 'truck' as const },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + webTop + 20, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Profile</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor={Colors.textTertiary} value={name} onChangeText={setName} testID="name-input" />

        {isDriver && (
          <>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.vehicleRow}>
              {vehicles.map(v => (
                <TouchableOpacity key={v.type} style={[styles.vehicleBtn, vehicleType === v.type && styles.vehicleBtnActive]} onPress={() => setVehicleType(v.type)}>
                  <MaterialCommunityIcons name={v.icon} size={24} color={vehicleType === v.type ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.vehicleLabel, vehicleType === v.type && styles.vehicleLabelActive]}>{v.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Vehicle Number</Text>
            <TextInput style={styles.input} placeholder="e.g. MP09AB1234" placeholderTextColor={Colors.textTertiary} value={vehicleNumber} onChangeText={setVehicleNumber} autoCapitalize="characters" testID="vehicle-input" />

            <Text style={styles.label}>License Number (Optional)</Text>
            <TextInput style={styles.input} placeholder="e.g. MH0120190001234" placeholderTextColor={Colors.textTertiary} value={licenseNumber} onChangeText={setLicenseNumber} autoCapitalize="characters" />
          </>
        )}

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading} testID="register-btn">
          {loading ? <ActivityIndicator color={Colors.surface} /> : <Text style={styles.registerBtnText}>Complete Registration</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navyDark },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, marginBottom: 24 },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.surface },
  formCard: { marginHorizontal: 24, backgroundColor: Colors.surface, borderRadius: 20, padding: 24 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 8, marginTop: 16 },
  input: { height: 52, borderRadius: 12, backgroundColor: Colors.background, paddingHorizontal: 16, fontSize: 16, fontFamily: 'Inter_500Medium', color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  vehicleRow: { flexDirection: 'row', gap: 10 },
  vehicleBtn: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  vehicleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  vehicleLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  vehicleLabelActive: { color: Colors.primary },
  registerBtn: { height: 52, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  registerBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.surface },
});

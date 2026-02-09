import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Platform, Alert, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, loading: authLoading, sendOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'driver'>('customer');
  const [loading, setLoading] = useState(false);
  const [sentOtpValue, setSentOtpValue] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'customer') router.replace('/customer/home' as any);
      else if (user.role === 'driver') router.replace('/driver/dashboard' as any);
    }
  }, [authLoading, isAuthenticated, user]);

  async function handleSendOtp() {
    if (phone.length < 10) {
      Alert.alert('Error', 'Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);
    if (result.success) {
      setOtpSent(true);
      setSentOtpValue(result.otp || '');
    } else {
      Alert.alert('Error', result.error || 'Failed to send OTP');
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 4) {
      Alert.alert('Error', 'Enter the 4-digit OTP');
      return;
    }
    setLoading(true);
    const result = await verifyOtp(phone, otp, selectedRole);
    setLoading(false);
    if (result.success) {
      if (result.isNew) {
        router.replace({ pathname: '/register' as any, params: { phone, role: selectedRole } });
      } else if (selectedRole === 'customer') {
        router.replace('/customer/home' as any);
      } else {
        router.replace('/driver/dashboard' as any);
      }
    } else {
      Alert.alert('Error', result.error || 'Invalid OTP');
    }
  }

  if (authLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + webTop + 40, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }]} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="truck-fast" size={40} color={Colors.surface} />
            </View>
            <Text style={styles.title}>TransportGo</Text>
            <Text style={styles.subtitle}>Fast & reliable goods delivery</Text>
          </View>

          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleBtn, selectedRole === 'customer' && styles.roleBtnActive]}
              onPress={() => setSelectedRole('customer')}
            >
              <Ionicons name="cube-outline" size={20} color={selectedRole === 'customer' ? Colors.surface : Colors.textSecondary} />
              <Text style={[styles.roleText, selectedRole === 'customer' && styles.roleTextActive]}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, selectedRole === 'driver' && styles.roleBtnActive]}
              onPress={() => setSelectedRole('driver')}
            >
              <MaterialCommunityIcons name="steering" size={20} color={selectedRole === 'driver' ? Colors.surface : Colors.textSecondary} />
              <Text style={[styles.roleText, selectedRole === 'driver' && styles.roleTextActive]}>Driver</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            {!otpSent ? (
              <>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter phone number"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                    testID="phone-input"
                  />
                </View>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOtp} disabled={loading} testID="send-otp-btn">
                  {loading ? <ActivityIndicator color={Colors.surface} /> : <Text style={styles.primaryBtnText}>Get OTP</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.otpHeader}>
                  <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.otpTitle}>Verify OTP</Text>
                </View>
                <Text style={styles.otpSentText}>OTP sent to +91 {phone}</Text>
                {sentOtpValue ? <Text style={styles.devOtp}>Dev OTP: {sentOtpValue}</Text> : null}
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter 4-digit OTP"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                  textAlign="center"
                  testID="otp-input"
                />
                <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp} disabled={loading} testID="verify-otp-btn">
                  {loading ? <ActivityIndicator color={Colors.surface} /> : <Text style={styles.primaryBtnText}>Verify & Login</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.resendBtn} onPress={handleSendOtp}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navyDark },
  scroll: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 32, fontFamily: 'Inter_700Bold', color: Colors.surface, letterSpacing: 1 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textTertiary, marginTop: 6 },
  roleSelector: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
  roleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.textTertiary },
  roleTextActive: { color: Colors.surface },
  formCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 10 },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  countryCode: { width: 60, height: 52, borderRadius: 12, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  countryText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  phoneInput: { flex: 1, height: 52, borderRadius: 12, backgroundColor: Colors.background, paddingHorizontal: 16, fontSize: 17, fontFamily: 'Inter_500Medium', color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  primaryBtn: { height: 52, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.surface },
  otpHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  otpTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.text },
  otpSentText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginBottom: 8 },
  devOtp: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.accent, backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 16, textAlign: 'center', overflow: 'hidden' },
  otpInput: { height: 56, borderRadius: 12, backgroundColor: Colors.background, paddingHorizontal: 16, fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.text, borderWidth: 1.5, borderColor: Colors.border, marginBottom: 20, letterSpacing: 12 },
  resendBtn: { alignItems: 'center', marginTop: 16 },
  resendText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
});

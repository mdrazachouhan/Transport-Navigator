import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

const SAFETY_FEATURES = [
  { icon: 'shield-checkmark', title: 'Verified Trips', desc: 'All bookings are verified with OTP before starting the trip.' },
  { icon: 'location', title: 'Live Tracking', desc: 'Your location is shared with customers for transparency and safety.' },
  { icon: 'key', title: 'OTP Pickup', desc: 'Verify the customer at pickup with a 4-digit OTP to prevent fraud.' },
  { icon: 'call', title: 'Emergency SOS', desc: 'Quick emergency access available during active rides.' },
  { icon: 'cash', title: 'Secure Payments', desc: 'All payments are tracked and recorded for your safety.' },
  { icon: 'document-text', title: 'Trip Records', desc: 'Complete history of all your rides with full details.' },
];

const EMERGENCY_NUMBERS = [
  { label: 'Police', number: '100', icon: 'shield' },
  { label: 'Ambulance', number: '108', icon: 'medkit' },
  { label: 'Roadside Help', number: '1800-180-1234', icon: 'car' },
];

export default function DriverSafetyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const topInset = insets.top + webTop;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.navyDark, Colors.navyMid]} style={[styles.header, { paddingTop: topInset + 16 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>Emergency Numbers</Text>
          <Text style={styles.emergencyDesc}>Tap to call in case of emergency</Text>
          <View style={styles.emergencyList}>
            {EMERGENCY_NUMBERS.map(item => (
              <TouchableOpacity key={item.number} style={styles.emergencyItem} onPress={() => Linking.openURL(`tel:${item.number}`)} activeOpacity={0.7}>
                <View style={styles.emergencyIcon}>
                  <Ionicons name={item.icon as any} size={18} color={Colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.emergencyLabel}>{item.label}</Text>
                  <Text style={styles.emergencyNumber}>{item.number}</Text>
                </View>
                <Ionicons name="call" size={18} color={Colors.danger} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Safety Features</Text>
        {SAFETY_FEATURES.map((item, i) => (
          <View key={i} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.surface },
  emergencyCard: { backgroundColor: Colors.dangerLight, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  emergencyTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.danger, marginBottom: 4 },
  emergencyDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginBottom: 16 },
  emergencyList: { gap: 10 },
  emergencyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 14, gap: 12 },
  emergencyIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  emergencyLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.text },
  emergencyNumber: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.danger },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 12 },
  featureCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.cardBorder, gap: 14, alignItems: 'flex-start' },
  featureIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 4 },
  featureDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 18 },
});

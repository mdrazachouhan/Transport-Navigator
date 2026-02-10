import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

const SUPPORT_OPTIONS = [
  { icon: 'mail-outline', label: 'Email Us', desc: 'driver-support@transportgo.in', action: 'mailto:driver-support@transportgo.in' },
  { icon: 'call-outline', label: 'Call Us', desc: '+91 731-XXXX-XXX', action: 'tel:+917310000000' },
  { icon: 'logo-whatsapp', label: 'WhatsApp', desc: 'Chat with us on WhatsApp', action: 'https://wa.me/917310000000' },
];

const TOPICS = [
  { icon: 'car-outline', title: 'Ride Issues', desc: 'Problems with ride requests, navigation, or completion' },
  { icon: 'cash-outline', title: 'Earnings & Payments', desc: 'Earnings queries, payment delays, or payout issues' },
  { icon: 'person-outline', title: 'Account & Documents', desc: 'Profile updates, vehicle details, or document verification' },
  { icon: 'alert-circle-outline', title: 'Report an Incident', desc: 'Report safety concerns or customer misconduct' },
  { icon: 'construct-outline', title: 'Vehicle Issues', desc: 'Vehicle breakdown, change of vehicle, or maintenance' },
];

export default function DriverSupportScreen() {
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
          <Text style={styles.headerTitle}>Support</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <View style={styles.contactList}>
            {SUPPORT_OPTIONS.map((item, i) => (
              <TouchableOpacity key={i} style={styles.contactItem} onPress={() => Linking.openURL(item.action)} activeOpacity={0.7}>
                <View style={styles.contactIcon}>
                  <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactLabel}>{item.label}</Text>
                  <Text style={styles.contactDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Help Topics</Text>
        {TOPICS.map((item, i) => (
          <View key={i} style={styles.topicCard}>
            <View style={styles.topicIcon}>
              <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.topicTitle}>{item.title}</Text>
              <Text style={styles.topicDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.hoursCard}>
          <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.hoursTitle}>Driver Support Hours</Text>
            <Text style={styles.hoursText}>24/7 for active ride issues</Text>
            <Text style={styles.hoursText}>Mon-Sat 9AM-8PM for general queries</Text>
          </View>
        </View>
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
  contactCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 24 },
  contactTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 14 },
  contactList: { gap: 10 },
  contactItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, padding: 14, gap: 14 },
  contactIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  contactDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 12 },
  topicCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.cardBorder, gap: 14 },
  topicIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  topicTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 2 },
  topicDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  hoursCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 20, padding: 16, backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder },
  hoursTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 4 },
  hoursText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 20 },
});

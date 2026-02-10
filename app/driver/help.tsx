import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, LayoutAnimation } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

const FAQ_ITEMS = [
  { q: 'How do I go online?', a: 'Toggle the Online/Offline switch on your dashboard header. You must be online to receive ride requests.' },
  { q: 'How do I accept a ride?', a: 'When online, go to "New Ride Requests" on the dashboard. Tap on a request to view details, then tap "Accept" to take the ride.' },
  { q: 'How does OTP verification work?', a: 'After accepting a ride, meet the customer at the pickup location. Ask for their 4-digit OTP and enter it to confirm the pickup and start the trip.' },
  { q: 'How do I complete a delivery?', a: 'Once you reach the delivery location and hand over the goods, tap "Complete Delivery" on the active ride screen.' },
  { q: 'How are my earnings calculated?', a: 'You earn the full fare for each completed trip. The fare includes a base charge plus a per-kilometer charge based on the vehicle type.' },
  { q: 'What if a customer cancels?', a: 'If a customer cancels after you have accepted, the booking will be updated. You can then go back online to accept new requests.' },
  { q: 'How do I update my vehicle details?', a: 'Vehicle details are set during registration. Contact support if you need to change your vehicle type or number.' },
  { q: 'What if I face an issue during a ride?', a: 'Use the SOS button on the active ride screen to contact emergency services, or reach out to our support team.' },
];

function FAQItem({ item }: { item: typeof FAQ_ITEMS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity style={styles.faqCard} onPress={toggle} activeOpacity={0.7}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.q}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textTertiary} />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{item.a}</Text>}
    </TouchableOpacity>
  );
}

export default function DriverHelpScreen() {
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
          <Text style={styles.headerTitle}>Help</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((item, i) => (
          <FAQItem key={i} item={item} />
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
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 16 },
  faqCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.cardBorder },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQuestion: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text, flex: 1, marginRight: 8 },
  faqAnswer: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.divider },
});

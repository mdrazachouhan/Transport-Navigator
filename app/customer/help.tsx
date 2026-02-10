import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, LayoutAnimation } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

const FAQ_ITEMS = [
  { q: 'How do I book a ride?', a: 'Tap the search bar on the home screen, select your pickup and delivery locations, choose a vehicle type, and confirm your booking.' },
  { q: 'What vehicle types are available?', a: 'We offer three vehicle types: Auto (up to 200kg), Tempo (up to 1000kg), and Truck (1000kg+). Pricing varies by vehicle type.' },
  { q: 'How does OTP verification work?', a: 'When your booking is accepted, you receive a 4-digit OTP. Share this with your driver at pickup to confirm the correct driver has arrived.' },
  { q: 'Can I cancel a booking?', a: 'Yes, you can cancel a pending or accepted booking from the track ride screen. Note that cancellation after pickup may not be available.' },
  { q: 'How is pricing calculated?', a: 'Pricing consists of a base fare plus a per-kilometer charge. The total is calculated based on the distance between pickup and delivery locations.' },
  { q: 'How do I rate my driver?', a: 'After your delivery is completed, you will be prompted to rate your driver on a 1-5 scale and optionally leave a comment.' },
  { q: 'Is my data safe?', a: 'Yes, we use secure authentication with JWT tokens. Your personal data is encrypted and protected according to industry standards.' },
  { q: 'What payment methods are accepted?', a: 'Currently we support Cash and UPI payments. You can select your preferred payment method during booking.' },
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

export default function HelpScreen() {
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

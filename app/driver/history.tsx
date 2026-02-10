import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useBookings, type BookingData } from '@/contexts/BookingContext';

const statusColors: Record<string, string> = {
  pending: Colors.warning,
  accepted: Colors.primary,
  in_progress: Colors.accent,
  completed: Colors.success,
  cancelled: Colors.danger,
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Transit',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const vehicleIcons: Record<string, any> = {
  auto: 'rickshaw',
  tempo: 'van-utility',
  truck: 'truck',
};

function AnimatedBookingCard({ booking, index }: { booking: BookingData; index: number }) {
  const color = statusColors[booking.status] || Colors.textSecondary;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleBadge}>
          <MaterialCommunityIcons name={vehicleIcons[booking.vehicleType] || 'truck'} size={18} color={Colors.primary} />
        </View>
        <View style={[styles.statusBadge, { backgroundColor: color + '18' }]}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>{statusLabels[booking.status] || booking.status}</Text>
        </View>
      </View>

      <View style={styles.locationSection}>
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <Text style={styles.locationText} numberOfLines={1}>{booking.pickup?.name}</Text>
        </View>
        <View style={styles.connector} />
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.locationText} numberOfLines={1}>{booking.delivery?.name}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
        <Text style={styles.priceText}>{'\u20B9'}{booking.totalPrice}</Text>
      </View>
    </Animated.View>
  );
}

export default function DriverHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings, fetchBookings, loading } = useBookings();

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;
  const topInset = insets.top + webTop;
  const bottomInset = insets.bottom + webBottom;

  useEffect(() => { fetchBookings(); }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.navyDark, Colors.navyMid]} style={[styles.header, { paddingTop: topInset + 16 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ride History</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {loading && bookings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomInset + 20 }}
          renderItem={({ item, index }) => <AnimatedBookingCard booking={item} index={index} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No ride history yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.surface },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  vehicleBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  locationSection: { marginBottom: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  connector: { width: 1, height: 16, backgroundColor: Colors.border, marginLeft: 3.5 },
  locationText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.text, flex: 1 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.divider },
  dateText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textTertiary },
  priceText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.text },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.textTertiary, marginTop: 12 },
});

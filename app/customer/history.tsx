import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

function BookingCard({ booking, onPress }: { booking: BookingData; onPress: () => void }) {
  const color = statusColors[booking.status] || Colors.textSecondary;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleWrap}>
          <MaterialCommunityIcons name={vehicleIcons[booking.vehicleType] || 'truck'} size={22} color={Colors.primary} />
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardDate}>{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          <View style={[styles.statusBadge, { backgroundColor: color + '18' }]}>
            <Text style={[styles.statusText, { color }]}>{statusLabels[booking.status]}</Text>
          </View>
        </View>
        <Text style={styles.priceText}>₹{booking.totalPrice}</Text>
      </View>
      <View style={styles.routeInfo}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.routeText} numberOfLines={1}>{booking.pickup.name}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.routeText} numberOfLines={1}>{booking.delivery.name}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.distText}>{booking.distance} km</Text>
        {booking.rating ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={Colors.warning} />
            <Text style={styles.ratingText}>{booking.rating}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings, fetchBookings, loading } = useBookings();

  useEffect(() => { fetchBookings(); }, []);

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;

  function handleBookingPress(booking: BookingData) {
    if (['pending', 'accepted', 'in_progress'].includes(booking.status)) {
      router.push({ pathname: '/customer/track-ride' as any, params: { bookingId: booking.id } });
    } else if (booking.status === 'completed' && !booking.rating) {
      router.push({ pathname: '/customer/rate-ride' as any, params: { bookingId: booking.id } });
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking History</Text>
        <View style={{ width: 24 }} />
      </View>
      {loading && bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No bookings yet</Text>
          <Text style={styles.emptySubtext}>Your booking history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <BookingCard booking={item} onPress={() => handleBookingPress(item)} />}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + webBottom + 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.text },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  vehicleWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  cardHeaderInfo: { flex: 1, marginLeft: 12 },
  cardDate: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  priceText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.text },
  routeInfo: { marginLeft: 8 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: { width: 1, height: 16, backgroundColor: Colors.border, marginLeft: 3 },
  routeText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text, flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.divider },
  distText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  emptySubtext: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
});

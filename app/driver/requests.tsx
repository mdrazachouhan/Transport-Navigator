import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings, BookingData } from '@/contexts/BookingContext';
import Colors from '@/constants/colors';

export default function DriverRequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { fetchPendingBookings, acceptBooking } = useBookings();
  const [pendingBookings, setPendingBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;
  const topInset = insets.top + webTop;
  const bottomInset = insets.bottom + webBottom;

  const loadPendingBookings = useCallback(async () => {
    try {
      const result = await fetchPendingBookings();
      setPendingBookings(result);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [fetchPendingBookings]);

  useEffect(() => {
    loadPendingBookings();
    const interval = setInterval(() => {
      loadPendingBookings();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadPendingBookings]);

  const handleAccept = async (bookingId: string) => {
    setAcceptingId(bookingId);
    try {
      const result = await acceptBooking(bookingId);
      if (result.success) {
        router.push({
          pathname: '/driver/active-ride' as any,
          params: { bookingId },
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to accept booking');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to accept booking');
    } finally {
      setAcceptingId(null);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'auto':
        return 'rickshaw';
      case 'tempo':
        return 'van-utility';
      case 'truck':
        return 'truck';
      default:
        return 'truck';
    }
  };

  const renderBookingCard = ({ item }: { item: BookingData }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleBadge}>
          <MaterialCommunityIcons
            name={getVehicleIcon(item.vehicleType) as any}
            size={18}
            color={Colors.primary}
          />
          <Text style={styles.vehicleText}>
            {item.vehicleType.charAt(0).toUpperCase() + item.vehicleType.slice(1)}
          </Text>
        </View>
        <Text style={styles.cardPrice}>{'\u20B9'}{item.totalPrice}</Text>
      </View>

      <View style={styles.cardLocations}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot}>
            <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationName} numberOfLines={1}>{item.pickup.name}</Text>
            <Text style={styles.locationArea} numberOfLines={1}>{item.pickup.area}</Text>
          </View>
        </View>
        <View style={styles.locationConnector} />
        <View style={styles.locationRow}>
          <View style={styles.locationDot}>
            <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Delivery</Text>
            <Text style={styles.locationName} numberOfLines={1}>{item.delivery.name}</Text>
            <Text style={styles.locationArea} numberOfLines={1}>{item.delivery.area}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Feather name="navigation" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.distance} km</Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="clock" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.estimatedTime} min</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.acceptButton, acceptingId === item.id && styles.acceptButtonDisabled]}
        onPress={() => handleAccept(item.id)}
        disabled={acceptingId === item.id}
      >
        {acceptingId === item.id ? (
          <ActivityIndicator size="small" color={Colors.surface} />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color={Colors.surface} />
            <Text style={styles.acceptButtonText}>Accept Ride</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="car-off" size={48} color={Colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No pending requests</Text>
      <Text style={styles.emptySubtitle}>New ride requests will appear here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Requests</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={pendingBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomInset + 20 },
            pendingBookings.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          scrollEnabled={pendingBookings.length > 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.navyDark,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.surface,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
  },
  listContentEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  vehicleText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  cardPrice: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  cardLocations: {
    marginBottom: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  locationDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationConnector: {
    width: 2,
    height: 14,
    backgroundColor: Colors.border,
    marginLeft: 11,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textTertiary,
  },
  locationName: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
    marginTop: 1,
  },
  locationArea: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  acceptButton: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acceptButtonDisabled: {
    opacity: 0.7,
  },
  acceptButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.surface,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

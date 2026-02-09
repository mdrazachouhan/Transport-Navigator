import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/contexts/BookingContext';
import Colors from '@/constants/colors';
import { getApiUrl } from '@/lib/query-client';

export default function DriverDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, token, refreshUser } = useAuth();
  const { bookings, fetchBookings, getActiveBooking } = useBookings();
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;
  const topInset = insets.top + webTop;
  const bottomInset = insets.bottom + webBottom;

  const activeBooking = getActiveBooking();
  const completedBookings = bookings
    .filter((b) => b.status === 'completed')
    .slice(0, 5);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => {
      fetchBookings();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOnline = async () => {
    setIsTogglingOnline(true);
    try {
      const baseUrl = getApiUrl();
      const url = new URL('/api/users/toggle-online', baseUrl);
      const res = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        await refreshUser();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to toggle online status');
    } finally {
      setIsTogglingOnline(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
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

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={20} color={Colors.surface} />
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>
                {user?.isOnline ? 'Online' : 'Offline'}
              </Text>
              {isTogglingOnline ? (
                <ActivityIndicator size="small" color={Colors.surface} />
              ) : (
                <Switch
                  value={user?.isOnline ?? false}
                  onValueChange={handleToggleOnline}
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: Colors.accent }}
                  thumbColor={Colors.surface}
                />
              )}
            </View>
            <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={Colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomInset + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="car" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{user?.totalTrips ?? 0}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: Colors.successLight }]}>
              <MaterialCommunityIcons name="currency-inr" size={20} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{user?.totalEarnings ?? 0}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: Colors.warningLight }]}>
              <Ionicons name="star" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>
              {user?.rating ? user.rating.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.requestsButton}
          onPress={() => router.push('/driver/requests' as any)}
        >
          <View style={styles.requestsButtonLeft}>
            <View style={styles.requestsIconContainer}>
              <MaterialCommunityIcons name="bell-ring-outline" size={22} color={Colors.surface} />
            </View>
            <View>
              <Text style={styles.requestsButtonTitle}>New Ride Requests</Text>
              <Text style={styles.requestsButtonSub}>Tap to view pending requests</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.surface} />
        </TouchableOpacity>

        {activeBooking && (
          <TouchableOpacity
            style={styles.activeCard}
            onPress={() =>
              router.push({
                pathname: '/driver/active-ride' as any,
                params: { bookingId: activeBooking.id },
              })
            }
          >
            <View style={styles.activeCardHeader}>
              <View style={styles.activeIndicator}>
                <View style={styles.activeIndicatorDot} />
              </View>
              <Text style={styles.activeCardTitle}>Active Ride</Text>
              <View style={styles.activeStatusBadge}>
                <Text style={styles.activeStatusText}>
                  {activeBooking.status === 'accepted'
                    ? 'Accepted'
                    : activeBooking.status === 'in_progress'
                    ? 'In Transit'
                    : 'Pending'}
                </Text>
              </View>
            </View>
            <View style={styles.activeCardBody}>
              <View style={styles.locationRow}>
                <View style={styles.locationDot}>
                  <View style={[styles.dot, { backgroundColor: Colors.success }]} />
                </View>
                <Text style={styles.locationText} numberOfLines={1}>
                  {activeBooking.pickup.name}
                </Text>
              </View>
              <View style={styles.locationConnector} />
              <View style={styles.locationRow}>
                <View style={styles.locationDot}>
                  <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
                </View>
                <Text style={styles.locationText} numberOfLines={1}>
                  {activeBooking.delivery.name}
                </Text>
              </View>
            </View>
            <View style={styles.activeCardFooter}>
              <Text style={styles.activeCardPrice}>
                {'\u20B9'}{activeBooking.totalPrice}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        )}

        {completedBookings.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Completed</Text>
            {completedBookings.map((booking) => (
              <View key={booking.id} style={styles.completedCard}>
                <View style={styles.completedLeft}>
                  <View style={styles.completedIconContainer}>
                    <MaterialCommunityIcons
                      name={getVehicleIcon(booking.vehicleType) as any}
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.completedInfo}>
                    <Text style={styles.completedPickup} numberOfLines={1}>
                      {booking.pickup.name}
                    </Text>
                    <Text style={styles.completedDelivery} numberOfLines={1}>
                      {booking.delivery.name}
                    </Text>
                    <Text style={styles.completedDate}>
                      {new Date(booking.completedAt || booking.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.completedPrice}>
                  {'\u20B9'}{booking.totalPrice}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingContainer: {
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.surface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  requestsButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  requestsButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestsButtonTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.surface,
  },
  requestsButtonSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  activeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  activeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  activeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activeIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  activeCardTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  activeStatusBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeStatusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  activeCardBody: {
    marginBottom: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationConnector: {
    width: 2,
    height: 16,
    backgroundColor: Colors.border,
    marginLeft: 11,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  activeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 12,
  },
  activeCardPrice: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
  },
  recentSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  completedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  completedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedInfo: {
    flex: 1,
  },
  completedPickup: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  completedDelivery: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completedDate: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  completedPrice: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginLeft: 8,
  },
});

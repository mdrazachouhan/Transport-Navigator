import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ScrollView, Dimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { MapView, Marker } from '@/components/MapWrapper';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/contexts/BookingContext';
import { MOCK_LOCATIONS } from '@/lib/locations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INDORE_REGION = {
  latitude: 22.7196,
  longitude: 75.8577,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

const SAVED_LOCATIONS = [
  { id: 'home', label: 'Home', icon: 'home-outline' as const, area: 'Vijay Nagar' },
  { id: 'work', label: 'Work', icon: 'briefcase-outline' as const, area: 'Palasia Square' },
];

const PROMO_OFFERS = [
  { id: '1', title: '20% OFF', subtitle: 'On your first ride', gradient: [Colors.primary, '#4F46E5'] as [string, string] },
  { id: '2', title: 'Refer & Earn', subtitle: 'Get Rs.100 per referral', gradient: [Colors.accent, Colors.accentDark] as [string, string] },
  { id: '3', title: 'Safe Delivery', subtitle: 'OTP verified trips', gradient: [Colors.warning, '#EA580C'] as [string, string] },
];

const VEHICLE_OPTIONS = [
  { id: 'auto', label: 'Auto', icon: 'rickshaw' as const, color: Colors.accent },
  { id: 'tempo', label: 'Tempo', icon: 'truck-outline' as const, color: Colors.primary },
  { id: 'truck', label: 'Truck', icon: 'truck' as const, color: Colors.warning },
];

function PulsingDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.activeDot, animStyle]} />;
}

function FloatingElement({ children, delay, style }: { children: React.ReactNode; delay: number; style?: any }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 120 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
}

function PromoCard({ item, index }: { item: typeof PROMO_OFFERS[0]; index: number }) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(400 + index * 150, withTiming(1, { duration: 400 }));
    scale.value = withDelay(400 + index * 150, withSpring(1, { damping: 14, stiffness: 100 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.promoCard}
      >
        <Text style={styles.promoTitle}>{item.title}</Text>
        <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function VehicleOption({ item, index, onPress }: { item: typeof VEHICLE_OPTIONS[0]; index: number; onPress: () => void }) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(500 + index * 100, withTiming(1, { duration: 350 }));
    scale.value = withDelay(500 + index * 100, withSpring(1, { damping: 14, stiffness: 110 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animStyle]}>
      <Pressable
        style={styles.vehicleOption}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        <View style={[styles.vehicleIconWrap, { backgroundColor: item.color + '18' }]}>
          <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
        </View>
        <Text style={styles.vehicleLabel}>{item.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { getActiveCustomerBooking, refreshBookings } = useBookings();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');

  useFocusEffect(
    useCallback(() => {
      refreshBookings();
    }, []),
  );

  const activeBooking = user ? getActiveCustomerBooking(user.id) : null;
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topSafe = insets.top + webTopInset;
  const bottomSafe = insets.bottom + webBottomInset;

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' ? (
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={INDORE_REGION}
          scrollEnabled={true}
          zoomEnabled={true}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {MOCK_LOCATIONS.map((loc) => (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.lat, longitude: loc.lng }}
              title={loc.name}
              description={loc.area}
            />
          ))}
        </MapView>
      ) : (
        <LinearGradient
          colors={['#E8F0FE', '#C5D8F8', '#A8C4F2', '#8BB0EC']}
          style={[StyleSheet.absoluteFillObject, styles.webMapPlaceholder]}
        >
          <View style={styles.webMapGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={styles.webMapGridLine} />
            ))}
          </View>
          <MaterialCommunityIcons name="map-marker-radius-outline" size={64} color="rgba(27,110,243,0.15)" />
          <Text style={styles.webMapLabel}>Indore, India</Text>
          {MOCK_LOCATIONS.slice(0, 5).map((loc, i) => (
            <View
              key={loc.id}
              style={[
                styles.webMapDot,
                {
                  top: `${20 + i * 15}%` as any,
                  left: `${15 + i * 16}%` as any,
                },
              ]}
            >
              <Ionicons name="location" size={18} color={Colors.primary} />
            </View>
          ))}
        </LinearGradient>
      )}

      <View style={[styles.topOverlay, { paddingTop: topSafe + 12 }]}>
        {activeBooking && (
          <FloatingElement delay={0} style={styles.activeBookingBanner}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/customer/track-ride');
              }}
            >
              <LinearGradient
                colors={[Colors.accent, Colors.accentDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeBannerGradient}
              >
                <View style={styles.activeBannerContent}>
                  <View style={styles.activeBannerLeft}>
                    <PulsingDot />
                    <View>
                      <Text style={styles.activeBannerTitle}>Active Booking</Text>
                      <Text style={styles.activeBannerStatus}>
                        {activeBooking.status === 'pending' ? 'Looking for driver...' :
                          activeBooking.status === 'accepted' ? 'Driver on the way' : 'Trip in progress'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFF" />
                </View>
              </LinearGradient>
            </Pressable>
          </FloatingElement>
        )}

        <FloatingElement delay={100} style={styles.topBar}>
          <Pressable style={styles.menuButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.text} />
          </Pressable>

          <Pressable
            style={styles.searchBar}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/customer/new-booking');
            }}
          >
            <Ionicons name="search" size={18} color={Colors.textSecondary} />
            <Text style={styles.searchText}>Where to?</Text>
          </Pressable>
        </FloatingElement>

        <FloatingElement delay={200} style={styles.savedRow}>
          {SAVED_LOCATIONS.map((loc) => (
            <Pressable
              key={loc.id}
              style={styles.savedChip}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/customer/new-booking');
              }}
            >
              <Ionicons name={loc.icon} size={16} color={Colors.primary} />
              <View>
                <Text style={styles.savedLabel}>{loc.label}</Text>
                <Text style={styles.savedArea}>{loc.area}</Text>
              </View>
            </Pressable>
          ))}
        </FloatingElement>
      </View>

      <View style={[styles.bottomOverlay, { paddingBottom: bottomSafe + 8 }]}>
        <FloatingElement delay={300}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoRow}
          >
            {PROMO_OFFERS.map((offer, i) => (
              <PromoCard key={offer.id} item={offer} index={i} />
            ))}
          </ScrollView>
        </FloatingElement>

        <FloatingElement delay={350} style={styles.paymentRow}>
          <Pressable
            style={[styles.paymentPill, paymentMethod === 'cash' && styles.paymentPillActive]}
            onPress={() => {
              setPaymentMethod('cash');
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons name="cash-outline" size={14} color={paymentMethod === 'cash' ? '#FFF' : Colors.text} />
            <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.paymentTextActive]}>Cash</Text>
          </Pressable>
          <Pressable
            style={[styles.paymentPill, paymentMethod === 'upi' && styles.paymentPillActive]}
            onPress={() => {
              setPaymentMethod('upi');
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <MaterialCommunityIcons name="cellphone" size={14} color={paymentMethod === 'upi' ? '#FFF' : Colors.text} />
            <Text style={[styles.paymentText, paymentMethod === 'upi' && styles.paymentTextActive]}>UPI</Text>
          </Pressable>
        </FloatingElement>

        <FloatingElement delay={450} style={styles.bottomCard}>
          <View style={styles.bottomCardHandle} />
          <Text style={styles.bottomCardTitle}>Choose your ride</Text>
          <View style={styles.vehicleRow}>
            {VEHICLE_OPTIONS.map((v, i) => (
              <VehicleOption
                key={v.id}
                item={v}
                index={i}
                onPress={() => router.push('/customer/new-booking')}
              />
            ))}
          </View>
          <Pressable
            style={styles.historyLink}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/customer/history');
            }}
          >
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.historyText}>View ride history</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
          </Pressable>
        </FloatingElement>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webMapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMapGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  webMapGridLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(27,110,243,0.06)',
  },
  webMapLabel: {
    fontSize: 14,
    color: 'rgba(27,110,243,0.25)',
    marginTop: 8,
  },
  webMapDot: {
    position: 'absolute',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  activeBookingBanner: {
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  activeBannerGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  activeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  activeBannerTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  activeBannerStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  savedRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  savedChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  savedLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  savedArea: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  promoRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  promoCard: {
    width: SCREEN_WIDTH * 0.42,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  promoSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  paymentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  paymentTextActive: {
    color: '#FFF',
  },
  bottomCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomCardHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  bottomCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  vehicleOption: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  vehicleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  vehicleLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  historyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
});

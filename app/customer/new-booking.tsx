import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/contexts/BookingContext';
import Colors from '@/constants/colors';
import { MOCK_LOCATIONS, type Location } from '@/lib/locations';

const VEHICLE_OPTIONS = [
  { type: 'auto', label: 'Auto', icon: 'rickshaw' as const, baseFare: 50, perKm: 12 },
  { type: 'tempo', label: 'Tempo', icon: 'truck-outline' as const, baseFare: 150, perKm: 18 },
  { type: 'truck', label: 'Truck', icon: 'truck' as const, baseFare: 300, perKm: 25 },
];

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return (
    Math.round(
      Math.sqrt(
        Math.pow((lat2 - lat1) * 111, 2) +
          Math.pow((lng2 - lng1) * 111 * Math.cos((lat1 * Math.PI) / 180), 2)
      ) * 10
    ) / 10
  );
}

export default function NewBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createBooking } = useBookings();

  const [pickup, setPickup] = useState<Location | null>(null);
  const [delivery, setDelivery] = useState<Location | null>(null);
  const [vehicleType, setVehicleType] = useState('auto');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [loading, setLoading] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const distance =
    pickup && delivery
      ? calculateDistance(pickup.lat, pickup.lng, delivery.lat, delivery.lng)
      : 0;

  const selectedVehicle = VEHICLE_OPTIONS.find((v) => v.type === vehicleType)!;
  const basePrice = selectedVehicle.baseFare;
  const distanceCharge = Math.round(distance * selectedVehicle.perKm * 10) / 10;
  const totalPrice = Math.round((basePrice + distanceCharge) * 10) / 10;
  const eta = Math.round(distance * 3 + 5);

  const handleConfirm = async () => {
    if (!pickup || !delivery) return;
    setLoading(true);
    try {
      const result = await createBooking({
        pickup: { name: pickup.name, area: pickup.area, lat: pickup.lat, lng: pickup.lng },
        delivery: { name: delivery.name, area: delivery.area, lat: delivery.lat, lng: delivery.lng },
        vehicleType,
        paymentMethod,
      });
      if (result.success && result.booking) {
        router.replace({
          pathname: '/customer/track-ride',
          params: { bookingId: result.booking.id },
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to create booking');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = !pickup ? 'pickup' : !delivery ? 'delivery' : 'summary';

  const renderLocationList = (type: 'pickup' | 'delivery') => {
    const selected = type === 'pickup' ? pickup : delivery;
    const otherSelected = type === 'pickup' ? delivery : pickup;

    return (
      <View style={styles.locationListContainer}>
        <Text style={styles.sectionTitle}>
          {type === 'pickup' ? 'Select Pickup Location' : 'Select Delivery Location'}
        </Text>
        <ScrollView style={styles.locationScroll} showsVerticalScrollIndicator={false}>
          {MOCK_LOCATIONS.filter((loc) => loc.id !== otherSelected?.id).map((loc) => {
            const isSelected = selected?.id === loc.id;
            return (
              <TouchableOpacity
                key={loc.id}
                style={[styles.locationItem, isSelected && styles.locationItemSelected]}
                onPress={() => {
                  if (type === 'pickup') {
                    setPickup(loc);
                  } else {
                    setDelivery(loc);
                  }
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.locationIconWrap,
                    isSelected && styles.locationIconWrapSelected,
                  ]}
                >
                  <Ionicons
                    name={type === 'pickup' ? 'location' : 'flag'}
                    size={20}
                    color={isSelected ? '#FFFFFF' : Colors.primary}
                  />
                </View>
                <View style={styles.locationTextWrap}>
                  <Text
                    style={[styles.locationName, isSelected && styles.locationNameSelected]}
                  >
                    {loc.name}
                  </Text>
                  <Text style={styles.locationArea}>{loc.area}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderSummary = () => (
    <ScrollView style={styles.summaryScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.routeCard}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
          <View style={styles.routeTextWrap}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeValue}>{pickup!.name}</Text>
            <Text style={styles.routeArea}>{pickup!.area}</Text>
          </View>
          <TouchableOpacity onPress={() => setPickup(null)} hitSlop={8}>
            <Feather name="edit-2" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.routeDivider}>
          <View style={styles.routeDividerLine} />
        </View>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
          <View style={styles.routeTextWrap}>
            <Text style={styles.routeLabel}>Delivery</Text>
            <Text style={styles.routeValue}>{delivery!.name}</Text>
            <Text style={styles.routeArea}>{delivery!.area}</Text>
          </View>
          <TouchableOpacity onPress={() => setDelivery(null)} hitSlop={8}>
            <Feather name="edit-2" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.distanceBadge}>
        <Ionicons name="navigate-outline" size={16} color={Colors.primary} />
        <Text style={styles.distanceText}>{distance} km</Text>
        <View style={styles.distanceSep} />
        <Ionicons name="time-outline" size={16} color={Colors.primary} />
        <Text style={styles.distanceText}>{eta} min</Text>
      </View>

      <Text style={styles.sectionTitle}>Select Vehicle</Text>
      <View style={styles.vehicleRow}>
        {VEHICLE_OPTIONS.map((v) => {
          const isActive = vehicleType === v.type;
          return (
            <TouchableOpacity
              key={v.type}
              style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
              onPress={() => setVehicleType(v.type)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={v.icon}
                size={28}
                color={isActive ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.vehicleLabel, isActive && styles.vehicleLabelActive]}>
                {v.label}
              </Text>
              <Text style={[styles.vehiclePrice, isActive && styles.vehiclePriceActive]}>
                {'\u20B9'}{v.baseFare}+
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.priceCardTitle}>Fare Breakdown</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Base Fare</Text>
          <Text style={styles.priceValue}>{'\u20B9'}{basePrice}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            Distance ({distance} km x {'\u20B9'}{selectedVehicle.perKm}/km)
          </Text>
          <Text style={styles.priceValue}>{'\u20B9'}{distanceCharge}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceRow}>
          <Text style={styles.priceTotalLabel}>Total</Text>
          <Text style={styles.priceTotalValue}>{'\u20B9'}{totalPrice}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.paymentRow}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'cash' && styles.paymentOptionActive,
          ]}
          onPress={() => setPaymentMethod('cash')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="cash-outline"
            size={22}
            color={paymentMethod === 'cash' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.paymentLabel,
              paymentMethod === 'cash' && styles.paymentLabelActive,
            ]}
          >
            Cash
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'upi' && styles.paymentOptionActive,
          ]}
          onPress={() => setPaymentMethod('upi')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="cellphone"
            size={22}
            color={paymentMethod === 'upi' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.paymentLabel,
              paymentMethod === 'upi' && styles.paymentLabelActive,
            ]}
          >
            UPI
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
        onPress={handleConfirm}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            <Text style={styles.confirmButtonPrice}>{'\u20B9'}{totalPrice}</Text>
          </>
        )}
      </TouchableOpacity>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentStep === 'pickup'
            ? 'Pickup Location'
            : currentStep === 'delivery'
            ? 'Delivery Location'
            : 'Booking Summary'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {pickup && currentStep !== 'pickup' && (
        <View style={styles.selectedBanner}>
          <Ionicons name="location" size={16} color={Colors.success} />
          <Text style={styles.selectedBannerText} numberOfLines={1}>
            {pickup.name}
          </Text>
          {delivery && (
            <>
              <Feather name="arrow-right" size={14} color={Colors.textTertiary} />
              <Ionicons name="flag" size={16} color={Colors.danger} />
              <Text style={styles.selectedBannerText} numberOfLines={1}>
                {delivery.name}
              </Text>
            </>
          )}
        </View>
      )}

      {currentStep === 'pickup' && renderLocationList('pickup')}
      {currentStep === 'delivery' && renderLocationList('delivery')}
      {currentStep === 'summary' && renderSummary()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  headerRight: {
    width: 40,
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primaryLight,
  },
  selectedBannerText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  locationListContainer: {
    flex: 1,
  },
  locationScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  locationItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  locationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationIconWrapSelected: {
    backgroundColor: Colors.primary,
  },
  locationTextWrap: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  locationNameSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primaryDark,
  },
  locationArea: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  summaryScroll: {
    flex: 1,
  },
  routeCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  routeTextWrap: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeValue: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginTop: 2,
  },
  routeArea: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  routeDivider: {
    paddingLeft: 5,
    paddingVertical: 4,
  },
  routeDividerLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    borderRadius: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  distanceSep: {
    width: 1,
    height: 14,
    backgroundColor: Colors.primary,
    opacity: 0.3,
    marginHorizontal: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  vehicleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  vehicleLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  vehicleLabelActive: {
    color: Colors.primary,
  },
  vehiclePrice: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textTertiary,
  },
  vehiclePriceActive: {
    color: Colors.primaryDark,
  },
  priceCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  priceCardTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 8,
  },
  priceTotalLabel: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  priceTotalValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  paymentOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  paymentLabelActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  confirmButtonPrice: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

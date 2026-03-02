import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { io } from 'socket.io-client';
import { useBookings } from '@/contexts/BookingContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getApiUrl } from '@/lib/query-client';
import Colors from '@/constants/colors';

const CANCEL_REASONS = [
  'Changed mind',
  'Found another service',
  'Driver taking too long',
  'Other',
];

const STEPS = [
  { label: 'Confirmed', icon: 'checkmark-circle' },
  { label: 'Driver Assigned', icon: 'person' },
  { label: 'On the Way', icon: 'location' },
  { label: 'Delivered', icon: 'flag' },
];

const getVehicleIcon = (type: string) => {
  if (!type) return 'truck';
  switch (type.toLowerCase()) {
    case 'auto': return 'rickshaw';
    case 'tempo': return 'van-utility';
    case 'truck': return 'truck';
    default: return 'truck';
  }
};

function getStepIndex(status: string): number {
  switch (status) {
    case 'pending': return 0;
    case 'accepted': return 1;
    case 'in_progress': return 2;
    case 'completed': return 3;
    default: return -1;
  }
}

function AnimatedCard({ delay, children, className }: { delay: number; children: React.ReactNode; className?: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <Animated.View
      className={className}
      style={{
        opacity: anim,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function StepIndicator({ label, index, currentStep }: { label: string; index: number; currentStep: number }) {
  const isActive = index === currentStep;
  const isDone = index < currentStep;

  return (
    <View className="flex-row items-center mb-6 last:mb-0">
      <View className="items-center mr-4">
        <View
          className={`w-9 h-9 rounded-2xl items-center justify-center border-2 ${isDone
            ? 'bg-success border-success shadow-lg shadow-success/20'
            : isActive
              ? 'bg-primary border-primary shadow-xl shadow-primary/30'
              : 'bg-white border-gray-100'
            }`}
        >
          {isDone ? (
            <Ionicons name="checkmark-done" size={18} color="#FFF" />
          ) : (
            <Text className={`text-[13px] font-inter-bold ${isActive ? 'text-white' : 'text-text-tertiary'}`}>{index + 1}</Text>
          )}
        </View>
        {index < STEPS.length - 1 && (
          <View className={`w-[2px] h-7 my-1 ${isDone ? 'bg-success' : 'bg-gray-100'}`} />
        )}
      </View>
      <View className="flex-1 pb-1">
        <Text className={`text-[14px] font-inter-bold ${isActive ? 'text-text' : isDone ? 'text-text-secondary opacity-60' : 'text-text-tertiary'}`}>
          {label}
        </Text>
        {isActive && (
          <View className="bg-primary/10 self-start px-2 py-0.5 rounded-md mt-1">
            <Text className="text-[8px] font-inter-bold text-primary uppercase tracking-[1px]">Live Radar</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function TrackRideScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const insets = useSafeAreaInsets();
  const { fetchBookings, cancelBooking, getBookingById } = useBookings();
  const { addNotification } = useNotifications();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const hasNavigated = useRef(false);

  const topInset = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomInset = insets.bottom + (Platform.OS === 'web' ? 34 : 20);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => { fetchBookings(); }, 5000);

    let socket: any;
    try {
      const apiUrl = getApiUrl();
      socket = io(apiUrl, { transports: ['websocket', 'polling'], path: '/socket.io' });
      socket.on('booking:updated', (data: any) => {
        if (data.booking?.id === bookingId) {
          fetchBookings();
        }
      });
    } catch (e) { }

    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, [bookingId]);

  const booking = getBookingById(bookingId as string);
  const prevStatusRef = useRef<string | undefined>(undefined);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!booking || !isMounted.current) return;

    // Track status transitions
    if (booking.status !== prevStatusRef.current) {
      if (booking.status === 'in_progress' && prevStatusRef.current === 'accepted') {
        addNotification('Trip Started', 'Your transportation partner is now on the move.', 'booking');
      } else if (booking.status === 'completed' && prevStatusRef.current && prevStatusRef.current !== 'completed') {
        addNotification('Job Finalized', `The delivery job has been successfully closed.`, 'booking');

        if (!hasNavigated.current) {
          hasNavigated.current = true;
          // Defer navigation to ensure state stability
          const timeoutId = setTimeout(() => {
            if (isMounted.current) {
              router.replace(`/customer/rate-ride?bookingId=${booking.id}` as any);
            }
          }, 400);
          return () => clearTimeout(timeoutId);
        }
      }
      prevStatusRef.current = booking.status;
    }
  }, [booking?.status, booking?.id]);

  const handleCancel = useCallback(async (reason: string) => {
    if (!bookingId) return;
    setCancelling(true);
    await cancelBooking(bookingId as string, reason);
    setCancelling(false);
    setCancelModalVisible(false);
    router.replace('/customer/home' as any);
  }, [bookingId]);

  if (!booking) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const currentStep = getStepIndex(booking.status);
  const isCancelled = booking.status === 'cancelled';

  return (
    <View className="flex-1 bg-[#FDFDFD]">
      <LinearGradient
        colors={[Colors.navyDark, Colors.navyMid]}
        className="pb-10 rounded-b-[32px] shadow-2xl"
        style={{ paddingTop: topInset + 12 }}
      >
        <View className="flex-row items-center px-6">
          <TouchableOpacity
            onPress={() => router.replace('/customer/home' as any)}
            className="w-10 h-10 rounded-xl bg-white/10 items-center justify-center border border-white/5"
          >
            <Ionicons name="chevron-back" size={20} color={Colors.surface} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-inter-bold text-surface mr-10">Trip Radar</Text>
        </View>

        <View className="mt-6 px-8 flex-row items-center justify-between">
          <View>
            <Text className="text-[9px] font-inter-bold text-white/40 uppercase tracking-[2px] mb-1.5">Reference ID</Text>
            <Text className="text-xl font-inter-bold text-surface">#{String(bookingId || '').slice(-6).toUpperCase()}</Text>
          </View>
          <View className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center border border-white/10">
            <MaterialCommunityIcons name="radar" size={24} color={Colors.accent} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 -mt-4"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: bottomInset + 30 }}
        showsVerticalScrollIndicator={false}
      >
        {isCancelled ? (
          <AnimatedCard delay={0} className="bg-red-50 rounded-3xl p-8 items-center border border-red-100 shadow-xl shadow-red-500/5">
            <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-5 shadow-sm">
              <Ionicons name="close-circle" size={40} color={Colors.danger} />
            </View>
            <Text className="text-xl font-inter-bold text-danger mb-1.5">Job Cancelled</Text>
            <Text className="text-[13px] font-inter-medium text-danger/60 text-center leading-5 px-4">This journey was aborted. Check your notification logs for details.</Text>
          </AnimatedCard>
        ) : (
          <>
            <AnimatedCard delay={0} className="bg-white rounded-2xl p-6 mb-4 shadow-2xl shadow-black/5 border border-gray-50">
              <Text className="text-[10px] font-inter-bold text-text-tertiary uppercase tracking-[2px] mb-6">Journey Status</Text>
              <View>
                {STEPS.map((step, index) => (
                  <StepIndicator key={step.label} label={step.label} index={index} currentStep={currentStep} />
                ))}
              </View>
            </AnimatedCard>

            {booking.driverName && (
              <AnimatedCard delay={100} className="bg-white rounded-2xl p-6 mb-4 shadow-2xl shadow-black/5 border border-gray-50">
                <Text className="text-[10px] font-inter-bold text-text-tertiary uppercase tracking-[2px] mb-5">Partner Details</Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-xl bg-primary/5 items-center justify-center mr-3.5 border border-primary/10">
                      <FontAwesome5 name="user-tie" size={20} color={Colors.primary} />
                    </View>
                    <View>
                      <View className="flex-row items-center">
                        <Text className="text-base font-inter-bold text-text mr-2">{booking.driverName}</Text>
                        <View className="bg-success/10 px-1.5 py-0.5 rounded-md">
                          <Text className="text-[7px] font-inter-black text-success uppercase">Verified</Text>
                        </View>
                      </View>
                      <Text className="text-[11px] font-inter-bold text-text-tertiary uppercase tracking-widest mt-0.5">{booking.driverVehicleNumber || 'Truck Alpha'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${booking.driverPhone}`)}
                    className="w-10 h-10 rounded-xl bg-success items-center justify-center shadow-lg shadow-success/20"
                  >
                    <Ionicons name="call" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </AnimatedCard>
            )}

            {booking.status === 'accepted' && booking.otp && (
              <AnimatedCard delay={200} className="bg-primary/5 rounded-3xl p-8 items-center border border-primary/10 mb-5">
                <Text className="text-[9px] font-inter-bold text-primary uppercase tracking-[3px] mb-5">Security Token</Text>
                <View className="flex-row items-center justify-center space-x-3">
                  {booking.otp.split('').map((digit, i) => (
                    <View key={i} className="w-10 h-14 bg-white rounded-xl items-center justify-center border border-primary/10 shadow-sm">
                      <Text className="text-2xl font-inter-bold text-primary">{digit}</Text>
                    </View>
                  ))}
                </View>
                <Text className="text-[11px] font-inter-medium text-text-tertiary text-center mt-6 leading-5 px-6">
                  Please provide this 4-digit token to your transport partner to authorize the job.
                </Text>
              </AnimatedCard>
            )}

            <AnimatedCard delay={300} className="bg-white rounded-2xl p-6 mb-4 shadow-2xl shadow-black/5 border border-gray-50">
              <Text className="text-[10px] font-inter-bold text-text-tertiary uppercase tracking-[2px] mb-5">Transit Log</Text>
              <View className="flex-row items-start mb-5">
                <View className="w-9 h-9 rounded-lg bg-gray-50 items-center justify-center mr-3.5">
                  <MaterialCommunityIcons name="map-marker-distance" size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text className="text-[9px] font-inter-bold text-text-tertiary uppercase tracking-widest mb-0.5">Total Distance</Text>
                  <Text className="text-xl font-inter-bold text-text">{booking.distance} km trip</Text>
                </View>
              </View>

              <View className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex-row items-center">
                <View className={`w-9 h-9 rounded-lg items-center justify-center mr-3.5 ${booking.paymentMethod === 'cash' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                  <Ionicons
                    name={booking.paymentMethod === 'cash' ? 'cash' : 'card'}
                    size={18}
                    color={booking.paymentMethod === 'cash' ? Colors.warning : Colors.primary}
                  />
                </View>
                <View>
                  <Text className="text-[9px] font-inter-bold text-text-tertiary uppercase tracking-widest">Payment Strategy</Text>
                  <Text className="text-[13px] font-inter-bold text-text mt-0.5">{booking.paymentMethod === 'cash' ? 'Physical Cash' : 'UPI Verified'}</Text>
                </View>
              </View>
            </AnimatedCard>

            {(booking.status === 'pending' || booking.status === 'accepted') && (
              <TouchableOpacity
                onPress={() => setCancelModalVisible(true)}
                className="mt-2 h-14 rounded-2xl bg-red-50 items-center justify-center border border-red-100"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  <Text className="ml-2.5 text-sm font-inter-bold text-danger">Cancel Journey</Text>
                </View>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={cancelModalVisible} transparent animationType="fade" onRequestClose={() => setCancelModalVisible(false)}>
        <View className="flex-1 bg-black/60 justify-end">
          <TouchableOpacity className="flex-1" onPress={() => setCancelModalVisible(false)} />
          <View className="bg-white rounded-t-3xl p-6 shadow-2xl" style={{ paddingBottom: bottomInset + 10 }}>
            <Text className="text-xl font-inter-bold text-text mb-1.5">Abort Service?</Text>
            <Text className="text-[13px] font-inter-medium text-text-tertiary mb-6">Are you sure you want to end this transportation job?</Text>

            {CANCEL_REASONS.map(reason => (
              <TouchableOpacity
                key={reason}
                className="flex-row items-center p-4 bg-gray-50 rounded-2xl mb-2.5 border border-gray-100"
                onPress={() => handleCancel(reason)}
                disabled={cancelling}
              >
                <Ionicons name="close-circle-outline" size={18} color={Colors.danger} />
                <Text className="ml-3.5 text-sm font-inter-bold text-text">{reason}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="mt-4 h-14 rounded-2xl bg-gray-100 items-center justify-center"
              onPress={() => setCancelModalVisible(false)}
            >
              <Text className="text-sm font-inter-bold text-text-secondary">Keep Tracking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({});

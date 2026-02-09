import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, withSequence } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useBookings } from '@/contexts/BookingContext';
import { VEHICLE_PRICING } from '@/lib/pricing';

const FEEDBACK_TAGS = ['Polite Driver', 'Safe Drive', 'On Time', 'Clean Vehicle', 'Good Service'];

function AnimatedStar({ index, isSelected, onPress }: { index: number; isSelected: boolean; onPress: (index: number) => void }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withSpring(1.4, { damping: 4, stiffness: 200 }),
        withSpring(1, { damping: 8, stiffness: 150 })
      );
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={() => onPress(index)} testID={`star-${index}`}>
      <Animated.View style={[styles.starContainer, animatedStyle]}>
        <Ionicons
          name={isSelected ? 'star' : 'star-outline'}
          size={40}
          color={isSelected ? Colors.warning : Colors.textTertiary}
        />
      </Animated.View>
    </Pressable>
  );
}

function AnimatedCheckmark() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 100 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.checkmarkCircle, animatedStyle]}>
      <Ionicons name="checkmark" size={48} color="#FFFFFF" />
    </Animated.View>
  );
}

export default function RateRideScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const insets = useSafeAreaInsets();
  const { bookings, rateBooking } = useBookings();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const booking = bookings.find((b) => b.id === bookingId);
  const vehicleInfo = booking ? VEHICLE_PRICING[booking.vehicleType] : null;

  const headerOpacity = useSharedValue(0);
  const contentSlide = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentSlide.value = withDelay(300, withSpring(0, { damping: 15 }));
  }, []);

  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentSlide.value }],
  }));

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleStarPress = (index: number) => {
    setRating(index + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const fullComment = [
        ...selectedTags,
        comment.trim(),
      ].filter(Boolean).join('. ');
      await rateBooking(bookingId!, rating, fullComment || undefined);
    } catch (e) {
      console.error('Rating error:', e);
    }
    setSubmitting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/customer/home');
  };

  const handleSkip = () => {
    router.replace('/customer/home');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.success, '#0EA572', Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: topInset + 16 }]}
      >
        <Animated.View style={[styles.headerContent, headerAnimStyle]}>
          <AnimatedCheckmark />
          <Text style={styles.headerTitle}>Trip Completed!</Text>
          <Text style={styles.headerSubtitle}>You have arrived at your destination</Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={contentAnimStyle}>
            {booking && vehicleInfo && (
              <View style={styles.fareCard}>
                <Text style={styles.fareSectionTitle}>Fare Summary</Text>
                <View style={styles.fareRow}>
                  <View style={styles.fareIconRow}>
                    <MaterialCommunityIcons name={vehicleInfo.icon as any} size={20} color={Colors.primary} />
                    <Text style={styles.fareLabel}>{vehicleInfo.name}</Text>
                  </View>
                  <Text style={styles.fareValue}>{vehicleInfo.capacity}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.routeContainer}>
                  <View style={styles.routeDots}>
                    <View style={[styles.dot, { backgroundColor: Colors.success }]} />
                    <View style={styles.routeLine} />
                    <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
                  </View>
                  <View style={styles.routeTexts}>
                    <Text style={styles.routeText} numberOfLines={1}>{booking.pickup.name}</Text>
                    <Text style={styles.routeText} numberOfLines={1}>{booking.delivery.name}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Distance</Text>
                  <Text style={styles.fareValue}>{booking.distance} km</Text>
                </View>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Base Fare</Text>
                  <Text style={styles.fareValue}>₹{booking.basePrice}</Text>
                </View>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Distance Charge</Text>
                  <Text style={styles.fareValue}>₹{booking.totalPrice - booking.basePrice}</Text>
                </View>
                <View style={[styles.divider, { marginVertical: 8 }]} />
                <View style={styles.fareRow}>
                  <Text style={styles.totalLabel}>Total Fare</Text>
                  <Text style={styles.totalValue}>₹{booking.totalPrice}</Text>
                </View>
                {booking.paymentMethod && (
                  <View style={styles.paymentBadge}>
                    <Ionicons
                      name={booking.paymentMethod === 'cash' ? 'cash-outline' : 'phone-portrait-outline'}
                      size={14}
                      color={Colors.success}
                    />
                    <Text style={styles.paymentText}>
                      Paid via {booking.paymentMethod === 'cash' ? 'Cash' : 'UPI'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.ratingSection}>
              <Text style={styles.ratingSectionTitle}>Rate your experience</Text>
              <Text style={styles.ratingSubtitle}>
                {rating === 0 ? 'Tap a star to rate' : rating <= 2 ? 'We\'ll do better next time' : rating <= 3 ? 'Thanks for the feedback' : rating <= 4 ? 'Glad you enjoyed it!' : 'Awesome! Thank you!'}
              </Text>
              <View style={styles.starsRow}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <AnimatedStar
                    key={i}
                    index={i}
                    isSelected={i < rating}
                    onPress={handleStarPress}
                  />
                ))}
              </View>
            </View>

            {rating > 0 && (
              <>
                <View style={styles.tagsSection}>
                  <Text style={styles.tagsSectionTitle}>What went well?</Text>
                  <View style={styles.tagsWrap}>
                    {FEEDBACK_TAGS.map((tag) => {
                      const selected = selectedTags.includes(tag);
                      return (
                        <Pressable
                          key={tag}
                          onPress={() => toggleTag(tag)}
                          style={[styles.tagChip, selected && styles.tagChipSelected]}
                        >
                          {selected && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} style={{ marginRight: 4 }} />}
                          <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{tag}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.commentSection}>
                  <Text style={styles.commentLabel}>Additional comments (optional)</Text>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Share more about your experience..."
                    placeholderTextColor={Colors.textTertiary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={comment}
                    onChangeText={setComment}
                    maxLength={300}
                  />
                  <Text style={styles.charCount}>{comment.length}/300</Text>
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
          style={[styles.submitButton, (rating === 0 || submitting) && styles.submitButtonDisabled]}
        >
          <LinearGradient
            colors={rating > 0 && !submitting ? [Colors.primary, Colors.primaryDark] : [Colors.border, Colors.border]}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
            <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
  },
  fareCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  fareSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fareIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fareLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  fareValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    paddingVertical: 4,
  },
  routeDots: {
    alignItems: 'center',
    width: 14,
    paddingVertical: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  routeTexts: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 12,
  },
  routeText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  paymentText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  ratingSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starContainer: {
    padding: 6,
  },
  tagsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tagsSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  tagChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  commentSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  commentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  commentInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 12,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  skipText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

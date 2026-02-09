import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useBookings } from '@/contexts/BookingContext';

const feedbackTags = ['Polite Driver', 'Safe Drive', 'On Time', 'Good Handling', 'Clean Vehicle', 'Careful with Goods'];

function StarButton({ index, rating, onPress }: { index: number; rating: number; onPress: (n: number) => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  function handlePress() {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress(index);
  }
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress}>
        <Ionicons name={index <= rating ? 'star' : 'star-outline'} size={44} color={index <= rating ? Colors.warning : Colors.border} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RateRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ bookingId: string }>();
  const { getBookingById, rateBooking } = useBookings();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const booking = getBookingById(params.bookingId || '');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleSubmit() {
    if (rating === 0) { Alert.alert('Rating', 'Please select a rating'); return; }
    if (!params.bookingId) return;
    setLoading(true);
    const fullComment = [...selectedTags, comment.trim()].filter(Boolean).join('. ');
    const result = await rateBooking(params.bookingId, rating, fullComment || undefined);
    setLoading(false);
    if (result.success) {
      Alert.alert('Thank you', 'Your rating has been submitted');
      router.replace('/customer/home' as any);
    } else {
      Alert.alert('Error', result.error || 'Failed to submit rating');
    }
  }

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + webTop }]} contentContainerStyle={{ paddingBottom: insets.bottom + webBottom + 20 }} keyboardShouldPersistTaps="handled">
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={40} color={Colors.surface} />
          </View>
          <Text style={styles.successTitle}>Trip Completed</Text>
          {booking && <Text style={styles.successAmount}>₹{booking.totalPrice}</Text>}
        </View>

        {booking && (
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <Text style={styles.routeText}>{booking.pickup.name}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
              <Text style={styles.routeText}>{booking.delivery.name}</Text>
            </View>
            <View style={styles.tripMeta}>
              <Text style={styles.metaText}>{booking.distance} km</Text>
              <Text style={styles.metaText}>{booking.estimatedTime} min</Text>
              <Text style={styles.metaText}>{booking.vehicleType}</Text>
            </View>
          </View>
        )}

        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate your experience</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <StarButton key={i} index={i} rating={rating} onPress={setRating} />
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Tap to rate' : rating <= 2 ? 'Could be better' : rating <= 4 ? 'Good experience' : 'Excellent'}
          </Text>
        </View>

        <View style={styles.tagsSection}>
          <Text style={styles.tagsTitle}>Quick Feedback</Text>
          <View style={styles.tagsWrap}>
            {feedbackTags.map(tag => (
              <TouchableOpacity key={tag} style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]} onPress={() => toggleTag(tag)}>
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.commentSection}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment (optional)"
            placeholderTextColor={Colors.textTertiary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.btnSection}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.surface} /> : <Text style={styles.submitText}>Submit Rating</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/customer/home' as any)}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  successHeader: { alignItems: 'center', paddingVertical: 32, backgroundColor: Colors.success },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  successTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.surface },
  successAmount: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.surface, marginTop: 4 },
  routeCard: { marginHorizontal: 16, marginTop: -20, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: { width: 1, height: 16, backgroundColor: Colors.border, marginLeft: 3 },
  routeText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text },
  tripMeta: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.divider },
  metaText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary, textTransform: 'capitalize' },
  ratingSection: { alignItems: 'center', paddingVertical: 28 },
  ratingTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.text, marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  ratingLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  tagsSection: { paddingHorizontal: 16, marginBottom: 20 },
  tagsTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 10 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
  tagActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  tagText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  tagTextActive: { color: Colors.primary },
  commentSection: { paddingHorizontal: 16, marginBottom: 24 },
  commentInput: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.border, minHeight: 80, textAlignVertical: 'top' },
  btnSection: { paddingHorizontal: 16 },
  submitBtn: { height: 52, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  submitText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.surface },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useNotifications, type NotificationItem } from '@/contexts/NotificationContext';

const typeIcons: Record<string, { name: string; color: string; bg: string }> = {
  booking: { name: 'car-outline', color: Colors.primary, bg: Colors.primaryLight },
  system: { name: 'information-circle-outline', color: Colors.accent, bg: 'rgba(0,201,167,0.12)' },
  promo: { name: 'gift-outline', color: Colors.warning, bg: Colors.warningLight },
  safety: { name: 'shield-checkmark-outline', color: Colors.success, bg: Colors.successLight },
};

function NotificationCard({ item, onPress }: { item: NotificationItem; onPress: () => void }) {
  const config = typeIcons[item.type] || typeIcons.system;
  const timeAgo = getTimeAgo(item.createdAt);

  return (
    <TouchableOpacity style={[styles.card, !item.read && styles.cardUnread]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
        <Ionicons name={config.name as any} size={22} color={config.color} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.cardTime}>{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
}

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;
  const topInset = insets.top + webTop;
  const bottomInset = insets.bottom + webBottom;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.navyDark, Colors.navyMid]} style={[styles.header, { paddingTop: topInset + 16 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <Ionicons name="checkmark-done" size={20} color={Colors.surface} />
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
        </View>
      </LinearGradient>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: bottomInset + 20 }}
        renderItem={({ item }) => (
          <NotificationCard item={item} onPress={() => markAsRead(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.surface },
  markAllBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 4, padding: 16, backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder, gap: 14 },
  cardUnread: { backgroundColor: '#F0F5FF', borderColor: 'rgba(27,110,243,0.15)' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text, flex: 1 },
  cardTitleUnread: { fontFamily: 'Inter_600SemiBold' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginLeft: 8 },
  cardMessage: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 18 },
  cardTime: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textTertiary, marginTop: 6 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.textTertiary, marginTop: 12 },
});

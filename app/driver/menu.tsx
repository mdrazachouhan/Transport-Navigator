import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const MENU_ITEMS = [
  { id: 'profile', label: 'Profile', icon: 'person-outline' as const, route: '/driver/profile' },
  { id: 'history', label: 'History', icon: 'time-outline' as const, route: '/driver/history' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' as const, route: '/driver/notifications' },
  { id: 'safety', label: 'Safety', icon: 'shield-checkmark-outline' as const, route: '/driver/safety' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline' as const, route: '/driver/settings' },
  { id: 'help', label: 'Help', icon: 'help-circle-outline' as const, route: '/driver/help' },
  { id: 'support', label: 'Support', icon: 'headset-outline' as const, route: '/driver/support' },
];

function AnimatedMenuItem({ item, index, onPress }: { item: typeof MENU_ITEMS[0]; index: number; onPress: () => void }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 60, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ translateX: slideAnim }] }}>
      <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.menuIconWrap}>
          <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{item.label}</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DriverMenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;
  const topInset = insets.top + webTop;
  const bottomInset = insets.bottom + webBottom;

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const vehicleLabel = user?.vehicleType ? user.vehicleType.charAt(0).toUpperCase() + user.vehicleType.slice(1) : '';

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.navyDark, Colors.navyMid]} style={[styles.headerGradient, { paddingTop: topInset + 16 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menu</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={32} color={Colors.surface} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Driver'}</Text>
            <Text style={styles.profilePhone}>{user?.phone || ''}</Text>
            {vehicleLabel ? <Text style={styles.profileVehicle}>{vehicleLabel} {user?.vehicleNumber ? `- ${user.vehicleNumber}` : ''}</Text> : null}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.menuList} contentContainerStyle={{ paddingBottom: bottomInset + 20 }}>
        <View style={styles.menuGroup}>
          {MENU_ITEMS.map((item, index) => (
            <AnimatedMenuItem
              key={item.id}
              item={item}
              index={index}
              onPress={() => router.push(item.route as any)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Feather name="log-out" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>My Load 24 v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGradient: { paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.surface },
  profileSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 16 },
  avatarLarge: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.surface, marginBottom: 2 },
  profilePhone: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.6)' },
  profileVehicle: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.accent, marginTop: 4 },
  menuList: { flex: 1, paddingTop: 12 },
  menuGroup: { marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 24, paddingVertical: 16, backgroundColor: Colors.dangerLight, borderRadius: 14, gap: 10 },
  logoutText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.danger },
  version: { textAlign: 'center', marginTop: 16, fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textTertiary },
});

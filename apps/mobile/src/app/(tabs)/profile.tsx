import { View, TouchableOpacity, ScrollView, Image, Text } from 'react-native';
import { Camera, User, Bell, Heart, Info, ChevronRight, KeyRound, History } from 'lucide-react-native';
import { useAuthStore } from '~/stores/auth-store';
import { useRouter } from 'expo-router';
import { SafeScreen } from '~/components/safe-screen';
import { getImageUrl } from '~/lib/api-client';
import { cn } from '@feed-plan/shared';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarHeight } from '~/constants/layout';

const menuItems = [
  { Icon: User, label: '编辑资料', path: '/profile/edit' },
  { Icon: KeyRound, label: '账号安全', path: '/profile/password' },
  { Icon: History, label: '历史回顾', path: '/meals/history' },
  { Icon: Bell, label: '通知设置', disabled: true },
  { Icon: Heart, label: '我的收藏', disabled: true },
  { Icon: Info, label: '关于', disabled: true },
];

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = user?.roles[0]
    ? {
        label: user.roles[0].name,
        shortLabel: user.roles[0].name.slice(0, 1),
        color: '#c45a32',
        backgroundColor: '#fae8df',
      }
    : null;

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleAvatarPress = () => router.push('/profile/edit');

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        contentContainerStyle={{ paddingBottom: getTabBarHeight(insets.bottom) + 20 }}
        scrollIndicatorInsets={{ bottom: getTabBarHeight(insets.bottom) }}
      >
      {/* User Header */}
      <View className="items-center border-b border-border bg-surface px-6 py-9">
        {/* Avatar */}
        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
          <View
            className="mb-4 size-[88px] items-center justify-center overflow-hidden rounded-full border-[3px] border-surface"
            style={{
              backgroundColor: role?.backgroundColor ?? '#fae8df',
              shadowColor: role?.color ?? '#c45a32',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: getImageUrl(user.avatar) ?? user.avatar }}
                className="size-[88px] rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text
                className="font-display text-4xl font-extrabold"
                style={{ color: role?.color ?? '#c45a32' }}
              >
                {user?.username?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            )}
          </View>
          <View className="absolute bottom-2 right-0 size-6 items-center justify-center rounded-xl bg-accent">
            <Camera size={14} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {/* Name */}
        <Text className="font-display text-[22px] font-extrabold text-fg">
          {user?.username ?? '未登录'}
        </Text>

        {/* Role Badge */}
        {role && (
          <View className="mt-2.5 flex-row items-center gap-[7px] rounded-full px-3 py-[5px]" style={{ backgroundColor: role.backgroundColor }}>
            <View className="size-[22px] items-center justify-center rounded-full" style={{ backgroundColor: role.color }}>
              <Text className="text-[11px] font-bold text-white">
                {role.shortLabel}
              </Text>
            </View>
            <Text className="text-[13px] font-bold" style={{ color: role.color }}>
              {role.label}
            </Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View className="mx-[18px] mt-4 overflow-hidden rounded-lg border border-border bg-surface">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            className={cn(
              'flex-row items-center px-4 py-4',
              index < menuItems.length - 1 && 'border-b border-border',
              item.disabled && 'opacity-50',
            )}
            disabled={item.disabled}
            onPress={() => {
              if (item.path) {
                router.push(item.path as never);
              }
            }}
          >
            <item.Icon size={22} color="#8a7565" />
            <Text className="ml-3 flex-1 text-[15px] font-semibold text-fg">
              {item.label}
            </Text>
            <ChevronRight size={18} color="#b8a898" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View className="mx-[18px] mt-4">
        <TouchableOpacity
          onPress={handleLogout}
          className="items-center rounded border border-border bg-surface py-4"
          activeOpacity={0.7}
        >
          <Text className="font-display text-[15px] font-bold text-accent">
            退出登录
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeScreen>
  );
}

import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '~/stores/auth-store';
import { useRouter } from 'expo-router';
import { SafeScreen } from '~/components/safe-screen';

const menuItems = [
  { icon: 'account-edit-outline', label: '编辑资料', disabled: true },
  { icon: 'bell-outline', label: '通知设置', disabled: true },
  { icon: 'heart-outline', label: '我的收藏', disabled: true },
  { icon: 'information-outline', label: '关于', disabled: true },
];

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
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

  return (
    <SafeScreen>
      <ScrollView style={{ flex: 1 }}>
      {/* User Header */}
      <View
        style={{
          backgroundColor: '#fffcf8',
          paddingHorizontal: 24,
          paddingVertical: 36,
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#e8ddd0',
        }}
      >
        {/* Avatar */}
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: role?.backgroundColor ?? '#fae8df',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            borderWidth: 3,
            borderColor: '#fffcf8',
            shadowColor: role?.color ?? '#c45a32',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: '800',
              color: role?.color ?? '#c45a32',
              fontFamily: '"Baloo 2"',
            }}
          >
            {user?.username?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>

        {/* Name */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: '#2d1f14',
            fontFamily: '"Baloo 2"',
          }}
        >
          {user?.username ?? '未登录'}
        </Text>

        {/* Role Badge */}
        {role && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: role.backgroundColor,
              marginTop: 10,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: role.color,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                {role.shortLabel}
              </Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: role.color }}>
              {role.label}
            </Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View
        style={{
          backgroundColor: '#fffcf8',
          marginHorizontal: 18,
          marginTop: 16,
          borderRadius: 22,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#e8ddd0',
        }}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
              borderBottomColor: '#e8ddd0',
              opacity: item.disabled ? 0.5 : 1,
            }}
            disabled={item.disabled}
          >
            <MaterialCommunityIcons name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={22} color="#8a7565" />
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: '600',
                color: '#2d1f14',
                marginLeft: 12,
              }}
            >
              {item.label}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#b8a898" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={{ marginHorizontal: 18, marginTop: 16 }}>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#fffcf8',
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#e8ddd0',
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: '#c45a32',
              fontSize: 15,
              fontWeight: '700',
              fontFamily: '"Baloo 2"',
            }}
          >
            退出登录
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
      </ScrollView>
    </SafeScreen>
  );
}

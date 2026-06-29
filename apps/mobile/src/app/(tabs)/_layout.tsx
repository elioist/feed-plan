import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Home, BookOpen, Plus, ClipboardList, User } from '@tamagui/lucide-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabbar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => (
            <Home size={size + 4} color={color as any} strokeWidth={1.8} />
          ),
          tabBarActiveTintColor: '#c45a32',
          tabBarInactiveTintColor: '#b8a898',
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: '菜单',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size + 4} color={color as any} strokeWidth={1.8} />
          ),
          tabBarActiveTintColor: '#c45a32',
          tabBarInactiveTintColor: '#b8a898',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: '开单',
          tabBarIcon: () => (
            <View style={styles.fab}>
              <Plus size={30} color="#ffffff" strokeWidth={2.5} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: '当前单',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size + 4} color={color as any} strokeWidth={1.8} />
          ),
          tabBarActiveTintColor: '#c45a32',
          tabBarInactiveTintColor: '#b8a898',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <User size={size + 4} color={color as any} strokeWidth={1.8} />
          ),
          tabBarActiveTintColor: '#c45a32',
          tabBarInactiveTintColor: '#b8a898',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: 'rgba(255, 252, 248, 0.92)',
    borderTopWidth: 1,
    borderTopColor: '#e8ddd0',
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    fontFamily: '"Baloo 2"',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#c45a32',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 3,
    borderColor: '#fffcf8',
    shadowColor: '#c45a32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
});

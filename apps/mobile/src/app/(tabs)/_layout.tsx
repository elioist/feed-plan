import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, ClipboardList, User } from 'lucide-react-native';
import { getBottomSafeArea, getTabBarHeight } from '~/constants/layout';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = getBottomSafeArea(insets.bottom);
  const tabBarStyle = useMemo(
    () => [
      styles.tabbar,
      {
        height: getTabBarHeight(insets.bottom),
        paddingBottom: tabBarBottomPadding,
      },
    ],
    [insets.bottom, tabBarBottomPadding],
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarLabel: '首页',
          tabBarIcon: ({ color, size }) => (
            <Home size={size + 4} color={String(color)} strokeWidth={1.8} />
          ),
          tabBarActiveTintColor: '#c45a32',
          tabBarInactiveTintColor: '#b8a898',
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: '菜单',
          tabBarLabel: '菜单',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size + 4} color={String(color)} strokeWidth={1.8} />
          ),
          tabBarActiveTintColor: '#c45a32',
          tabBarInactiveTintColor: '#b8a898',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: '当前单',
          tabBarLabel: '当前单',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size + 4} color={String(color)} strokeWidth={1.8} />
          ),
          tabBarActiveTintColor: '#c45a32',
          tabBarInactiveTintColor: '#b8a898',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarLabel: '我的',
          tabBarIcon: ({ color, size }) => (
            <User size={size + 4} color={String(color)} strokeWidth={1.8} />
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
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: 'rgba(255, 252, 248, 0.92)',
    borderTopWidth: 1,
    borderTopColor: '#e8ddd0',
  },
  tabItem: {
    paddingTop: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'SNPro',
  },
});

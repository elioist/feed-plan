import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Text, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '~/stores/auth-store';
import { cn } from '@feed-plan/shared';
import logoSource from '../../assets/logo.png';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
    } catch {
      setError('用户名或密码错误');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="flex-1 justify-center px-7">
        {/* Logo */}
        <View className="mb-12 items-center">
          <View
            className="mb-5 size-[96px] items-center justify-center overflow-hidden rounded-[22px] bg-surface"
            style={{
              shadowColor: '#c45a32',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Image source={logoSource} className="size-[96px]" resizeMode="cover" />
          </View>
          <Text className="font-display text-[32px] font-extrabold tracking-[-0.5px] text-fg">
            Feed Plan
          </Text>
          <Text className="mt-1.5 text-[15px] text-muted">
            先点菜，快乐会准时开饭
          </Text>
        </View>

        {/* Role Cards */}
        <View className="mb-8 flex-row gap-2.5">
          <View className="flex-1 flex-row items-center gap-2.5 rounded border border-border bg-surface p-3">
            <View className="size-9 items-center justify-center rounded-full bg-accent">
              <Text className="text-sm font-bold text-white">厨</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-fg">主厨</Text>
              <Text className="text-[11px] text-muted">掌勺、出餐</Text>
            </View>
          </View>
          <View className="flex-1 flex-row items-center gap-2.5 rounded border border-border bg-surface p-3">
            <View className="size-9 items-center justify-center rounded-full bg-diner">
              <Text className="text-sm font-bold text-white">客</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-fg">食客</Text>
              <Text className="text-[11px] text-muted">点餐、加菜</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View className="gap-3.5">
          <View>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              className="h-12 rounded-[14px] border border-border bg-surface px-4 text-[15px] text-fg"
              placeholder="用户名"
              placeholderTextColor="#b8a898"
            />
          </View>

          <View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureEntry}
              className="h-12 rounded-[14px] border border-border bg-surface px-4 pr-11 text-[15px] text-fg"
              placeholder="密码"
              placeholderTextColor="#b8a898"
            />
            <TouchableOpacity
              onPress={() => setSecureEntry(!secureEntry)}
              className="absolute right-3 top-3"
            >
              {secureEntry ? <EyeOff size={20} color="#8a7565" /> : <Eye size={20} color="#8a7565" />}
            </TouchableOpacity>
          </View>

          {error ? (
            <Text className="text-sm text-accent">{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting}
            className={cn('mt-2 items-center rounded-[14px] py-4', isSubmitting ? 'bg-[#d4845a]' : 'bg-accent')}
            style={{
              shadowColor: '#c45a32',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.32,
              shadowRadius: 16,
              elevation: 6,
            }}
            activeOpacity={0.85}
          >
            <Text className="font-display text-base font-bold text-white">
              {isSubmitting ? '登录中...' : '开始点餐'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

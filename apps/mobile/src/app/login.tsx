import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '~/stores/auth-store';

export default function LoginScreen() {
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
      style={{ flex: 1, backgroundColor: '#fdf6ee' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 28,
              backgroundColor: '#c45a32',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              shadowColor: '#c45a32',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <MaterialCommunityIcons name="food-fork-drink" size={44} color="#ffffff" />
          </View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '800',
              color: '#2d1f14',
              fontFamily: '"Baloo 2"',
              letterSpacing: -0.5,
            }}
          >
            两人食堂
          </Text>
          <Text style={{ fontSize: 15, color: '#8a7565', marginTop: 6 }}>
            书宁 & 阿圆 · 家庭点菜服务
          </Text>
        </View>

        {/* Role Cards */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32 }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#e8ddd0',
              backgroundColor: '#fffcf8',
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#c45a32',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>厨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#2d1f14' }}>主厨</Text>
              <Text style={{ fontSize: 11, color: '#8a7565' }}>掌勺、出餐</Text>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#e8ddd0',
              backgroundColor: '#fffcf8',
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#8b5fa8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>客</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#2d1f14' }}>食客</Text>
              <Text style={{ fontSize: 11, color: '#8a7565' }}>点餐、加菜</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={{ gap: 14 }}>
          <View>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              outlineStyle={{ borderRadius: 14, borderColor: '#e8ddd0' }}
              style={{ backgroundColor: '#fffcf8' }}
              placeholder="用户名"
              placeholderTextColor="#b8a898"
            />
          </View>

          <View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureEntry}
              mode="outlined"
              outlineStyle={{ borderRadius: 14, borderColor: '#e8ddd0' }}
              style={{ backgroundColor: '#fffcf8' }}
              placeholder="密码"
              placeholderTextColor="#b8a898"
              right={
                <TextInput.Icon
                  icon={secureEntry ? 'eye-off' : 'eye'}
                  onPress={() => setSecureEntry(!secureEntry)}
                  color="#8a7565"
                />
              }
            />
          </View>

          {error ? (
            <Text style={{ fontSize: 14, color: '#c45a32' }}>{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#d4845a' : '#c45a32',
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: 'center',
              marginTop: 8,
              shadowColor: '#c45a32',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.32,
              shadowRadius: 16,
              elevation: 6,
            }}
            activeOpacity={0.85}
          >
            <Text
              style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: '700',
                fontFamily: '"Baloo 2"',
              }}
            >
              {isSubmitting ? '登录中...' : '开始点餐'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

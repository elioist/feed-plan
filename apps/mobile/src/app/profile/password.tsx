import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@feed-plan/shared';
import { SafeScreen } from '~/components/safe-screen';
import { useToast } from '~/components/ui/toast';
import { getBottomSafeArea } from '~/constants/layout';
import { api, getApiErrorMessage } from '~/lib/api-client';
import { useAuthStore } from '~/stores/auth-store';

export default function PasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const logout = useAuthStore((state) => state.logout);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureCurrentPassword, setSecureCurrentPassword] = useState(true);
  const [secureNewPassword, setSecureNewPassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const passwordMutation = useMutation({
    mutationFn: () => api.auth.changePassword({
      currentPassword,
      newPassword,
    }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('密码已修改', '为了账号安全，需要重新登录一次。', [
        {
          text: '去登录',
          onPress: () => {
            void logout().then(() => router.replace('/login'));
          },
        },
      ]);
    },
    onError: (error) => {
      toast('error', getApiErrorMessage(error));
    },
  });

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast('error', '请输入当前密码');
      return;
    }
    if (newPassword.length < 6) {
      toast('error', '新密码至少 6 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('error', '两次输入的新密码不一致');
      return;
    }

    passwordMutation.mutate();
  };

  const renderPasswordInput = (
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    secureTextEntry: boolean,
    onToggleSecure: () => void,
  ) => (
    <View className="relative">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor="#b8a898"
        className="h-12 rounded-[14px] border border-border bg-surface px-4 pr-11 text-[15px] text-fg"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={onToggleSecure}
        className="absolute right-3 top-3 size-6 items-center justify-center"
      >
        {secureTextEntry ? <EyeOff size={19} color="#8a7565" /> : <Eye size={19} color="#8a7565" />}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-row items-center bg-bg px-4 pb-3 pt-2">
          <TouchableOpacity
            className="size-[38px] items-center justify-center rounded-full border border-border bg-surface"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#2d1f14" />
          </TouchableOpacity>
          <View className="ml-3 flex-1">
            <Text className="font-display text-xl font-extrabold text-fg">账号安全</Text>
            <Text className="mt-0.5 text-xs text-muted">修改密码后会重新登录</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustContentInsets={false}
          automaticallyAdjustsScrollIndicatorInsets={false}
          contentContainerClassName="px-[18px] pt-2"
          contentContainerStyle={{ paddingBottom: getBottomSafeArea(insets.bottom) + 28 }}
          scrollIndicatorInsets={{ bottom: getBottomSafeArea(insets.bottom) }}
        >
          <View className="rounded-lg border border-border bg-surface p-4">
            <View className="flex-row items-center gap-2.5">
              <View className="size-9 items-center justify-center rounded-full bg-herb-soft">
                <ShieldCheck size={19} color="#5a9a6a" />
              </View>
              <View className="flex-1">
                <Text className="font-display text-base font-extrabold text-fg">修改密码</Text>
                <Text className="mt-px text-xs text-muted">确认是你本人，再换一把新钥匙</Text>
              </View>
            </View>

            <View className="mt-5 gap-3">
              {renderPasswordInput(
                currentPassword,
                setCurrentPassword,
                '当前密码',
                secureCurrentPassword,
                () => setSecureCurrentPassword((value) => !value),
              )}
              {renderPasswordInput(
                newPassword,
                setNewPassword,
                '新密码，至少 6 位',
                secureNewPassword,
                () => setSecureNewPassword((value) => !value),
              )}
              {renderPasswordInput(
                confirmPassword,
                setConfirmPassword,
                '再输一次新密码',
                secureConfirmPassword,
                () => setSecureConfirmPassword((value) => !value),
              )}
            </View>

            <TouchableOpacity
              className={cn(
                'mt-4 flex-row items-center justify-center gap-2 rounded-[14px] py-3.5',
                passwordMutation.isPending ? 'bg-[#d4845a]' : 'bg-fg',
              )}
              disabled={passwordMutation.isPending}
              onPress={handleChangePassword}
              activeOpacity={0.85}
            >
              {passwordMutation.isPending ? <Loader size={18} color="#ffffff" /> : <KeyRound size={18} color="#ffffff" />}
              <Text className="font-display text-[15px] font-bold text-white">
                {passwordMutation.isPending ? '修改中...' : '修改密码'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

import { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Check, Loader, Trash2, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@feed-plan/shared';
import { SafeScreen } from '~/components/safe-screen';
import { useToast } from '~/components/ui/toast';
import { getBottomSafeArea } from '~/constants/layout';
import { api, getApiErrorMessage, getImageUrl } from '~/lib/api-client';
import { useAuthStore } from '~/stores/auth-store';

type NativeAvatarFile = {
  uri: string;
  name: string;
  type: string;
};

const normalizeAvatarAsset = async (asset: ImagePicker.ImagePickerAsset): Promise<NativeAvatarFile> => {
  const maxSide = Math.max(asset.width ?? 0, asset.height ?? 0);
  const actions: ImageManipulator.Action[] =
    maxSide > 512 ? [{ resize: asset.width && asset.width >= (asset.height ?? 0) ? { width: 512 } : { height: 512 } }] : [];
  const image = await ImageManipulator.manipulateAsync(asset.uri, actions, {
    compress: 0.82,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return {
    uri: image.uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  };
};

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [username, setUsername] = useState(user?.username ?? '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);

  const avatarUrl = useMemo(() => getImageUrl(avatar), [avatar]);

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: NativeAvatarFile) => api.auth.uploadAvatar(file),
    onSuccess: (result) => {
      setAvatar(result.path);
      toast('success', '头像已上传，记得保存资料');
    },
    onError: (error) => {
      toast('error', getApiErrorMessage(error));
    },
  });

  const profileMutation = useMutation({
    mutationFn: () => api.auth.updateProfile({ username: username.trim(), avatar }),
    onSuccess: (nextUser) => {
      setUser(nextUser);
      setUsername(nextUser.username);
      setAvatar(nextUser.avatar ?? null);
      toast('success', '个人资料已保存');
      router.back();
    },
    onError: (error) => {
      toast('error', getApiErrorMessage(error));
    },
  });

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('需要相册权限', '允许访问相册后，才能换一张更顺眼的头像。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;

    uploadAvatarMutation.mutate(await normalizeAvatarAsset(asset));
  };

  const handleSaveProfile = () => {
    if (!username.trim()) {
      toast('error', '用户名不能为空');
      return;
    }

    profileMutation.mutate();
  };

  return (
    <SafeScreen>
      <View className="flex-1">
        <View className="flex-row items-center bg-bg px-4 pb-3 pt-2">
          <TouchableOpacity
            className="size-[38px] items-center justify-center rounded-full border border-border bg-surface"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#2d1f14" />
          </TouchableOpacity>
          <View className="ml-3 flex-1">
            <Text className="font-display text-xl font-extrabold text-fg">编辑资料</Text>
            <Text className="mt-0.5 text-xs text-muted">换头像、改名字，餐桌上更好认</Text>
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
              <View className="size-9 items-center justify-center rounded-full bg-chef-soft">
                <User size={19} color="#c45a32" />
              </View>
              <View className="flex-1">
                <Text className="font-display text-base font-extrabold text-fg">基础资料</Text>
                <Text className="mt-px text-xs text-muted">头像和用户名会同步到点餐记录</Text>
              </View>
            </View>

            <View className="mt-5 items-center">
              <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8}>
                <View className="size-[96px] items-center justify-center overflow-hidden rounded-full border-[3px] border-bg bg-chef-soft">
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      className="size-[96px]"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="font-display text-4xl font-extrabold text-accent">
                      {username.trim().charAt(0).toUpperCase() || '?'}
                    </Text>
                  )}
                </View>
                <View className="absolute bottom-0 right-0 size-8 items-center justify-center rounded-full bg-accent">
                  {uploadAvatarMutation.isPending ? (
                    <Loader size={16} color="#ffffff" />
                  ) : (
                    <Camera size={16} color="#ffffff" />
                  )}
                </View>
              </TouchableOpacity>

              {avatar ? (
                <TouchableOpacity
                  className="mt-3 flex-row items-center gap-1.5 rounded-full bg-[#f5f0ea] px-3 py-1.5"
                  onPress={() => setAvatar(null)}
                >
                  <Trash2 size={14} color="#8a7565" />
                  <Text className="text-xs font-semibold text-muted">移除头像</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View className="mt-5">
              <Text className="mb-2 text-xs font-bold text-muted">用户名</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={64}
                placeholder="给自己起个好认的名字"
                placeholderTextColor="#b8a898"
                className="h-12 rounded-[14px] border border-border bg-bg px-4 text-[15px] text-fg"
              />
            </View>

            <TouchableOpacity
              className={cn(
                'mt-4 flex-row items-center justify-center gap-2 rounded-[14px] py-3.5',
                profileMutation.isPending || uploadAvatarMutation.isPending ? 'bg-[#d4845a]' : 'bg-accent',
              )}
              disabled={profileMutation.isPending || uploadAvatarMutation.isPending}
              onPress={handleSaveProfile}
              activeOpacity={0.85}
            >
              {profileMutation.isPending ? <Loader size={18} color="#ffffff" /> : <Check size={18} color="#ffffff" />}
              <Text className="font-display text-[15px] font-bold text-white">
                {profileMutation.isPending ? '保存中...' : '保存资料'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeScreen>
  );
}

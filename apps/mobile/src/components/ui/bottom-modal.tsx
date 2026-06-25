import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, Platform } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@feed-plan/shared';

export interface BottomModalProps {
  visible: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  openDuration?: number;
  closeDuration?: number;
  closeOnBackdropPress?: boolean;
  backdropOpacity?: number;
}

export function BottomModal({
  visible,
  onClose,
  children,
  className = 'max-h-[40%]',
  openDuration = 300,
  closeDuration = 250,
  closeOnBackdropPress = true,
  backdropOpacity = 0.3,
}: BottomModalProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const backdropAnim = useSharedValue(0);
  const contentTranslateY = useSharedValue(300);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropAnim.value,
  }));

  const modalContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const showModal = useCallback(() => {
    setInternalVisible(true);
    backdropAnim.value = withTiming(backdropOpacity, {
      duration: openDuration,
      easing: Easing.out(Easing.cubic),
    });
    contentTranslateY.value = withTiming(0, {
      duration: openDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [backdropAnim, contentTranslateY, backdropOpacity, openDuration]);

  const hideModal = useCallback(() => {
    backdropAnim.value = withTiming(0, {
      duration: closeDuration,
      easing: Easing.in(Easing.cubic),
    });
    contentTranslateY.value = withTiming(
      300,
      { duration: closeDuration, easing: Easing.in(Easing.cubic) },
      () => {
        runOnJS(setInternalVisible)(false);
        if (onClose) {
          runOnJS(onClose)();
        }
      },
    );
  }, [backdropAnim, contentTranslateY, closeDuration, onClose]);

  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdropPress) {
      hideModal();
    }
  }, [closeOnBackdropPress, hideModal]);

  useEffect(() => {
    if (visible === internalVisible) return;
    if (visible) {
      showModal();
    } else {
      hideModal();
    }
  }, [visible, showModal, hideModal, internalVisible]);

  if (!internalVisible) return null;

  return (
    <Modal
      visible={internalVisible}
      transparent
      animationType="none"
      onRequestClose={hideModal}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View className="absolute inset-0 bg-black" style={backdropStyle}>
          <Pressable className="flex-1" onPress={handleBackdropPress} />
        </Animated.View>

        <Animated.View
          className={cn(
            'mt-auto flex-1 overflow-hidden rounded-t-2xl',
            className,
          )}
          style={[modalContentStyle, { backgroundColor: '#fffcf8' }]}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

import React, { createContext, useContext, useState, useCallback, type ComponentType, type ReactNode } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { CheckCircle, XCircle, Info } from 'lucide-react-native';

interface ToastData {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastData['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

type ToastIcon = ComponentType<{ size?: number; color?: string }>;

const TOAST_ICONS: Record<ToastData['type'], ToastIcon> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const TOAST_COLORS: Record<ToastData['type'], string> = {
  success: '#5a9a6a',
  error: '#c45a32',
  info: '#6b7890',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  let nextId = 0;

  const toast = useCallback((type: ToastData['type'], message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <View className="absolute left-0 right-0 top-[100px] z-[9999] items-center" pointerEvents="none">
        {toasts.map((t) => (
          <Animated.View
            key={t.id}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            className="mb-2 flex-row items-center gap-2 rounded-xl bg-[#2c1f14]/90 px-4 py-3"
            style={styles.toast}
          >
            {React.createElement(TOAST_ICONS[t.type], {
              size: 20,
              color: TOAST_COLORS[t.type],
            })}
            <Text className="text-sm font-semibold text-white">{t.message}</Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});

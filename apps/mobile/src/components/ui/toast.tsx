import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { CheckCircle, XCircle, Info } from '@tamagui/lucide-icons';

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

const TOAST_ICONS: Record<ToastData['type'], any> = {
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
      <View style={styles.container} pointerEvents="none">
        {toasts.map((t) => (
          <Animated.View
            key={t.id}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.toast}
          >
            {React.createElement(TOAST_ICONS[t.type], {
              size: 20,
              color: TOAST_COLORS[t.type],
            })}
            <Text style={styles.message}>{t.message}</Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(44, 31, 20, 0.9)',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  message: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

import { API_BASE, getApiErrorInfo } from '~/lib/api-client';

interface OrderErrorFeedback {
  message: string;
  shouldLogin: boolean;
  title: string;
}

function isNetworkError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('network request failed') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('fetch failed')
  );
}

function withDevApiBase(message: string) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return `${message}\n\n当前 API：${API_BASE}`;
  }
  return message;
}

export function getOrderErrorFeedback(error: unknown): OrderErrorFeedback {
  const info = getApiErrorInfo(error);
  const message = info.message || '请求失败';

  if (info.status === 401) {
    return {
      title: '登录已过期',
      message: '请重新登录后再点单。',
      shouldLogin: true,
    };
  }

  if (info.status === 409) {
    return {
      title: '点单失败',
      message: message || '本次点餐已完成，不能继续加菜。',
      shouldLogin: false,
    };
  }

  if (info.status === 400 || info.status === 404) {
    return {
      title: '点单失败',
      message,
      shouldLogin: false,
    };
  }

  if (!info.status && isNetworkError(message)) {
    return {
      title: '连接不到后端',
      message: withDevApiBase('请检查后端服务是否启动，以及 EXPO_PUBLIC_API_BASE 是否指向电脑的局域网地址。'),
      shouldLogin: false,
    };
  }

  return {
    title: '点单失败',
    message: withDevApiBase(message),
    shouldLogin: false,
  };
}

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-bg p-6">
          <AlertCircle size={48} color="#c45a32" />
          <Text className="mt-3 text-lg font-bold text-fg">出错了</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-muted">
            {this.state.error?.message ?? '未知错误'}
          </Text>
          <TouchableOpacity className="mt-5 rounded-xl bg-accent px-6 py-2.5" onPress={this.handleRetry}>
            <Text className="text-sm font-semibold text-white">重试</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

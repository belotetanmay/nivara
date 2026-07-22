import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering crash:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView className="flex-1 bg-[#FAF8F5] justify-center px-6">
          <View className="items-center p-8 bg-white border border-[#E5E1D8] rounded-2xl shadow-sm">
            <Text className="text-[#0A2540] text-2xl font-bold mb-2 text-center">
              Application Error
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-6">
              A fatal rendering crash occurred. You can restart the view below.
            </Text>
            {this.state.error && (
              <View className="bg-red-50 p-4 rounded-lg mb-6 w-full border border-red-100">
                <Text className="text-red-700 text-xs font-mono" numberOfLines={4}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}
            <Button
              title="Reload App Interface"
              onPress={this.handleReset}
              className="w-full"
            />
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;

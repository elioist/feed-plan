import { Linking, Platform } from 'react-native';

export function openUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url);
  }
}

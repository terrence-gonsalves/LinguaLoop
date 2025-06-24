import { Alert, Platform, ToastAndroid } from 'react-native';

export const showToast = (message: string, duration: 'SHORT' | 'LONG' = 'SHORT') => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, duration === 'SHORT' ? ToastAndroid.SHORT : ToastAndroid.LONG);
  } else {

    // on iOS, use Alert since ToastAndroid is not available
    Alert.alert('', message);
  }
};

export const showSuccessToast = (message: string) => {
  showToast(message, 'SHORT');
};

export const showErrorToast = (message: string) => {
  showToast(message, 'SHORT');
}; 
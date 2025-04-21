import Toast from 'react-native-toast-message';

export const showErrorToast = (message, ) => {
  Toast.show({
    type: 'error',
    position: 'top',
    text1: 'Error',
    text2: message,
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 60,
    bottomOffset: 40,
    onPress: () => Toast.hide(),
  });
};

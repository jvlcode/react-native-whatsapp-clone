// app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import Toast from 'react-native-toast-message';

const RootLayout = () => {
  return (
    <>
      <Slot />
      <Toast />
    </>
  );
};

export default RootLayout;

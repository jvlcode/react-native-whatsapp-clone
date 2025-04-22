// app/_layout.tsx
import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useUserStore } from '@/stores/userStore';

const RootLayout = () => {
  const loadUser = useUserStore((state) => state.loadUser);
 
  useEffect(() => {
    loadUser();
  }, []);
  return (
    <>
      <Slot />
      <Toast />
    </>
  );
};

export default RootLayout;

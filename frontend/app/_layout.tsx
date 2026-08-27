import { Stack } from 'expo-router';
import React from 'react';
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Test' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}

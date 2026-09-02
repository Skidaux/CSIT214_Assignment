import { Stack } from "expo-router";
import React from "react";
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "600" },
        // headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Test", headerLeft: () => null }}
      />
      <Stack.Screen
        name="about"
        options={{ title: "About", headerLeft: () => null }}
      />
      <Stack.Screen
        name="auth"
        options={{ title: "About", headerLeft: () => null }}
      />
    </Stack>
  );
}

// Random helper functions to reuse repeated functions
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

async function setToken(key: string, value: string) {
  if (Platform.OS === "web") {
    // fallback for web
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getToken(key: string) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

export { setToken, getToken };

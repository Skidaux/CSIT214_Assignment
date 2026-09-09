import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Button } from "expo-router/build/react-navigation";
import React from "react";

// Buttom component with sign out logic embedded

// some required prop used to sync state of the app after cleanup (unsure how this works)
type SignOutProps = {
  onSignedOut?: () => void;
};

export default function SignOut({ onSignedOut }: SignOutProps) {
  const router = useRouter();

  async function out() {
    //delete the id, username from the localstorage
    await AsyncStorage.multiRemove(["id", "username"]);
    //void sync function
    onSignedOut?.();
    //Redirect back to home upon signout
    router.replace("/");
  }

  return (
    <>
      <Button onPress={out}>Sign Out</Button>
    </>
  );
}

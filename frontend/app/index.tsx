import { Link } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Head>
        <title>Template</title>
      </Head>
      <Text style={styles.title}>
        Open up app/index.tsx to start working on your app!
      </Text>
      <Link href="/about" style={styles.link}>
        <Text style={styles.linkText}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit
          beatae quia, ipsam aliquid, eos commodi libero quaerat animi
          aspernatur corrupti sit voluptatibus. Pariatur debitis rerum qui nemo
          ratione eligendi doloremque!
        </Text>
      </Link>
      <Link href="/auth" style={styles.link}>
        Authenticate here
      </Link>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    textAlign: "center",
    fontSize: 16,
  },
  link: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  linkText: {
    color: "#2e78b7",
    fontSize: 16,
    fontWeight: "500",
  },
});

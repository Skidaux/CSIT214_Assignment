import { Link } from "expo-router";
import { Button } from "expo-router/build/react-navigation";
import Head from "expo-router/head";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, TextInput } from "react-native";
import { getToken, setToken } from "../lib/helper";

export default function Auth() {
  const [sawp, setSwap] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  async function submitLogin() {
    console.log(`user set name as ${user} and password as ${pass}`);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const json = await response.json();
      console.log(`${json.code}`);
    } catch (error) {
      console.error(`Encoutered issue: ${error}`);
    }
  }

  async function submitRegister() {
    console.log(`user set name as ${user} and password as ${pass}`);
    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const json = await response.json();
      console.log(`${json.code}`);
    } catch (error) {
      console.error(`Encoutered issue: ${error}`);
    }
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Head>
        <title>Authenticate</title>
      </Head>
      <View style={styles.section}>
        <Text style={styles.heading}>Authentication</Text>
        <Text style={styles.paragraph}>Authenticate here</Text>
      </View>
      <Button onPress={() => setSwap(!sawp)}>Toggle</Button>
      <View style={styles.section}></View>
      {sawp ? (
        <>
          <Text>Login form</Text>
          <TextInput
            value={user}
            onChangeText={setUser}
            style={styles.input}
            placeholder="john_doe"
          ></TextInput>
          <TextInput
            value={pass}
            onChangeText={setPass}
            style={styles.input}
            placeholder="secret code"
          ></TextInput>
          <Button onPress={submitLogin}>Login</Button>
        </>
      ) : (
        <>
          <Text>Register form</Text>
          <TextInput
            value={user}
            onChangeText={setUser}
            style={styles.input}
            placeholder="john_doe"
          ></TextInput>
          <TextInput
            value={pass}
            onChangeText={setPass}
            style={styles.input}
            placeholder="secret code"
          ></TextInput>
          <Button onPress={submitRegister}>Register</Button>
        </>
      )}
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>← Back home</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 24,
    gap: 24,
  },
  section: {
    maxWidth: 700,
    gap: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
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
  input: {
    height: 48, // Comfortable tap target
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2937", // Tailwind gray-800
    backgroundColor: "#ffffff",
  },
});

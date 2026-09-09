import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { Button } from "expo-router/build/react-navigation";
import Head from "expo-router/head";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Switch,
} from "react-native";
import { useAuth } from "../lib/auth";

export default function Auth() {
  const { refresh } = useAuth();

  // change content state between Login/Register from
  const [sawp, setSwap] = useState(false);

  // holder username/password data in the page
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  // rest of the form registration values

  //business
  const [bus, setbus] = useState(false);
  // employee
  const [emp, isEmp] = useState(false);

  // Register and Login perform the same thing, send over credentials from the user input to backend
  // recieve back response, if status 200 save the response data as the credentials in local storage and update state of app
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
      if (json.code == 200) {
        await AsyncStorage.setItem("id", String(json.id));
        await AsyncStorage.setItem("username", json.username);
        await refresh();
      }
    } catch (error) {
      console.error(`Encoutered issue: ${error}`);
    }
  }

  async function submitRegister() {
    console.log(`user set name as ${user} and password as ${pass}`);
    try {
      const type = bus ? "business" : "individual";
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: user,
          password: pass,
          type: type,
          is_employee: emp,
        }),
      });
      const json = await response.json();
      if (json.code == 200) {
        await AsyncStorage.setItem("id", String(json.id));
        await AsyncStorage.setItem("username", json.username);
        await refresh();
      }
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
          <Text>Registring for a business {bus ? "Yes" : "No"}</Text>
          <Switch
            value={bus}
            onValueChange={setbus}
            trackColor={{ false: "#d1d5db", true: "#2e78b7" }}
            thumbColor="#ffffff"
            ios_backgroundColor="#d1d5db"
          />
          <Text>Are you Employee: {emp ? "Yes" : "No"}</Text>
          <Switch
            value={emp}
            onValueChange={isEmp}
            trackColor={{ false: "#d1d5db", true: "#2e78b7" }}
            thumbColor="#ffffff"
            ios_backgroundColor="#d1d5db"
          />
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
    height: 48,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
});

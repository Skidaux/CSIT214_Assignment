import { Link } from 'expo-router';
import Head from 'expo-router/head';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function About() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Head>
        <title>About · combo-front</title>
      </Head>
      <View style={styles.section}>
        <Text style={styles.heading}>About combo-front</Text>
        <Text style={styles.paragraph}>
          Replace this text in app/about.tsx with a description of what this app does and who
          it's for.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheading}>Contact</Text>
        <Text style={styles.paragraph}>your-email@example.com</Text>
      </View>

      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>← Back home</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    gap: 24,
  },
  section: {
    maxWidth: 480,
    gap: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  link: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  linkText: {
    color: '#2e78b7',
    fontSize: 16,
    fontWeight: '500',
  },
});

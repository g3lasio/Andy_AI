
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import AIChat from './components/AIChat';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AIChat />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

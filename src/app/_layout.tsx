import { isRunningInExpoGo } from 'expo';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Modal, Platform, StyleSheet, useColorScheme, View } from 'react-native';

import AppSplashScreen from './splash';

if (Platform.OS !== 'web' && !isRunningInExpoGo()) {
  void SplashScreen.preventAutoHideAsync().catch(console.warn);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        {/* Mount navigation immediately so the splash fades into a rendered screen. */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="splash" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="login" />
        </Stack>
        <Modal
          visible={showStartupSplash}
          transparent
          animationType="none"
          statusBarTranslucent
          navigationBarTranslucent
          onRequestClose={() => {}}>
          <View style={styles.container}>
            {showStartupSplash && <AppSplashScreen onFinish={() => setShowStartupSplash(false)} />}
          </View>
        </Modal>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

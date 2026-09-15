import { Redirect } from 'expo-router';
import { Image } from 'expo-image';
import * as NativeSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, Text } from 'react-native';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current; // start transparent
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  const reveal = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') await NativeSplashScreen.hideAsync();
    } catch (error) {
      console.warn('Could not dismiss the native splash screen:', error);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) onFinish?.();
  }, [onFinish, visible]);

  // Fade IN as soon as we're ready (right after native splash hides)
  useEffect(() => {
    if (!ready) return;

    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [opacity, ready]);

  // Fade OUT after the hold duration
  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    const animation = Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    });
    const timer = setTimeout(async () => {
      const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);
      if (cancelled) return;
      if (reduceMotion) {
        setVisible(false);
      } else {
        animation.start(({ finished }) => {
          if (finished) setVisible(false);
        });
      }
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      animation.stop();
    };
  }, [opacity, ready]);

  if (!visible) return onFinish ? null : <Redirect href="/" />;

  return (
    <Animated.View
      onLayout={reveal}
      accessibilityLabel="Rentanything is loading"
      accessibilityRole="progressbar"
      style={[styles.container, { opacity }]}>
      <StatusBar style="light" />
      <Image
        source={require('@/assets/images/splash-icon.png')}
        contentFit="contain"
        style={styles.logo}
      />
      <Text style={styles.name}>Rentanything</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 76, height: 76 },
  name: {
    position: 'absolute',
    top: '50%',
    marginTop: 64,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
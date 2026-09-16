import { Redirect } from 'expo-router';
import { Image } from 'expo-image';
import * as NativeSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
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
    if (!ready) return;
    let cancelled = false;
    const animation = Animated.timing(opacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: Platform.OS !== 'web',
    });
    const timer = setTimeout(async () => {
      const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);
      if (cancelled) return;
      if (reduceMotion) setVisible(false);
      else animation.start(({ finished }) => {
        if (finished) setVisible(false);
      });
    }, 3000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      animation.stop();
    };
  }, [opacity, ready]);

  useEffect(() => {
    if (!visible) onFinish?.();
  }, [onFinish, visible]);

  if (!visible) return onFinish ? null : <Redirect href="/welcome" />;

  return (
    <Animated.View
      accessibilityLabel="Rent It is loading"
      accessibilityRole="progressbar"
      style={[styles.container, { opacity }]}>
      <StatusBar style="dark" />
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.backgroundArt}>
        <Image
          source={require('@/assets/images/splash-scenery.png')}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
          onLoad={reveal}
          onError={reveal}
        />
        <View style={styles.backgroundTint} />
      </View>
      <Image
        source={require('@/assets/images/rent-it-logo.png')}
        contentFit="contain"
        accessibilityLabel="Rent It"
        style={styles.logo}
      />
      <Text style={styles.tagline}>Access more. Own less.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FAF7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundArt: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  backgroundTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(250, 247, 240, 0.22)',
  },
  logo: { width: '100%', maxWidth: 280, aspectRatio: 1320 / 690 },
  tagline: { marginTop: 16, color: '#686B6C', fontSize: 16 },
});

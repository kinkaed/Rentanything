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
      onLayout={reveal}
      accessibilityLabel="Rent It is loading"
      accessibilityRole="progressbar"
      style={[styles.container, { opacity }]}>
      <StatusBar style="dark" />
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.backgroundArt}>
        <View style={styles.peachCircle} />
        <View style={styles.topRing} />
        <View style={styles.creamCircle} />
        <View style={styles.bottomRing} />
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
  peachCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -140,
    right: -130,
    backgroundColor: '#FBE4D5',
  },
  topRing: {
    position: 'absolute',
    width: 330,
    height: 330,
    borderRadius: 165,
    top: -135,
    right: -125,
    borderWidth: 1,
    borderColor: '#EEDACA',
  },
  creamCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: -145,
    left: -110,
    backgroundColor: '#EFE8D8',
  },
  bottomRing: {
    position: 'absolute',
    width: 310,
    height: 310,
    borderRadius: 155,
    bottom: -135,
    left: -120,
    borderWidth: 1,
    borderColor: '#E4DCCB',
  },
  logo: { width: '100%', maxWidth: 280, aspectRatio: 1320 / 690 },
  tagline: { marginTop: 16, color: '#686B6C', fontSize: 16 },
});

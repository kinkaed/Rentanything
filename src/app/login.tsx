import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/welcome');
    }
  }

  function signIn() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setMessage('Enter a valid email address.');
    }
    if (!password) {
      return setMessage('Enter your password.');
    }
    setMessage('Sign-in is not available yet. Please check back soon.');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.backgroundArt}>
        <View style={styles.peachCircle} />
        <View style={styles.bottomCircle} />
      </View>
      <View style={styles.toolbar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.back}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color="#141A22" />
          </Pressable>
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account.</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            accessibilityLabel="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="alex.carter@email.com"
            placeholderTextColor="#909090"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              accessibilityLabel="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
              placeholder="Your password"
              placeholderTextColor="#909090"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              style={styles.eye}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#686B6C"
              />
            </Pressable>
          </View>

          {message ? (
            <Text accessibilityRole="alert" style={styles.message}>
              {message}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={signIn}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Sign in</Text>
          </Pressable>

          <Pressable
            accessibilityRole="link"
            onPress={() => router.replace('/signup')}
            style={styles.signup}
          >
            <Text style={styles.footerText}>
              New here? <Text style={styles.link}>Create an account</Text>
            </Text>
          </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  flex: {
    flex: 1,
  },
content: {
  width: '100%',
  maxWidth: 440,
  alignSelf: 'center',
  paddingHorizontal: 20,
  paddingTop: 130,   
  paddingBottom: 24,
  },
  toolbar: {
    // Keeps the back button separate from the centered form.
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  formCard: {
    // Change padding here to adjust the space INSIDE the form.
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEE6DC',
  },
  backgroundArt: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  peachCircle: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    top: -120, right: -120, backgroundColor: '#FBE4D5',
  },
  bottomCircle: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    bottom: -90, left: -130, backgroundColor: '#EFE8D8',
  },
back: {
  position: 'absolute',
  top: 60,       // <- distance from top of screen
  left: 20,      // <- distance from left edge
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
},
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#141A22',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#686B6C',
    textAlign: 'center',
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#393E43',
    marginBottom: 6,
  },
  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E1DB',
    paddingHorizontal: 14,
    color: '#1A1A1A',
    fontSize: 15,
    marginBottom: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E1DB',
    borderRadius: 12,
    paddingLeft: 14,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    minHeight: 50,
    fontSize: 15,
    color: '#1A1A1A',
  },
  eye: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: '#9C351C',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#FC5B2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: '#E94A1C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signup: {
    paddingTop: 20,
    paddingBottom: 4,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#686B6C',
    textAlign: 'center',
  },
  link: {
    color: '#FC5B2C',
    fontWeight: '700',
  },
});

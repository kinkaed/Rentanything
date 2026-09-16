import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CreateAccountScreen = () => {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState('');

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    agreedToTerms;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/welcome');
  };

  const handleSignUp = () => {
    // Temporary preview navigation; no account is created.
    router.replace('/home');
  };

  const handleSignIn = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.backgroundArt}>
        <View style={styles.peachCircle} />
        <View style={styles.bottomCircle} />
        <View style={styles.accentRing} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton} onPress={handleBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </Pressable>

          <View style={styles.formCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Join Rent It and unlock a world of possibilities.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Full name"
              textContentType="name"
              autoComplete="name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Alex Carter"
              placeholderTextColor="#A6A6A6"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Email"
              textContentType="emailAddress"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              placeholder="alex.carter@email.com"
              placeholderTextColor="#A6A6A6"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                accessibilityLabel="Password"
                textContentType="newPassword"
                autoComplete="new-password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#A6A6A6"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                onPress={() => setShowPassword(prev => !prev)}
                hitSlop={12}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#686B6C"
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.termsRow}
            accessibilityRole="checkbox"
            accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
            accessibilityState={{ checked: agreedToTerms }}
            onPress={() => setAgreedToTerms(prev => !prev)}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </Pressable>

          {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.signUpButton,
              pressed && styles.signUpButtonPressed,
            ]}
            onPress={handleSignUp}
          >
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </Pressable>

          <View style={styles.signInRow}>
            <Text style={styles.signInPrompt}>Already have an account? </Text>
            <Pressable accessibilityRole="link" onPress={handleSignIn} hitSlop={8}>
              <Text style={styles.signInLink}>Sign in</Text>
            </Pressable>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateAccountScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },

  backgroundArt: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  peachCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -120,
    right: -120,
    backgroundColor: '#FBE4D5',
  },
  bottomCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    bottom: -90,
    left: -130,
    backgroundColor: '#EFE8D8',
  },
  accentRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#EDD4C4',
    bottom: 40,
    right: -100,
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEE6DC',

  },

  flex: {
    flex: 1,
  },

  scrollContent: {
  flexGrow: 1,
  justifyContent: 'center',
  width: '100%',
  maxWidth: 440,
  alignSelf: 'center',
  paddingTop: 0,
  paddingHorizontal: 16,
  paddingBottom: 140,
},
  backButton: {
    width: 40,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  header: {
    alignItems: 'center',
    paddingHorizontal: 0,
    marginBottom: 20,
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
  },

  fieldGroup: {
    marginBottom: 16,
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
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1A1A1A',
  },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E1DB',
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 14,
  },

  passwordInput: {
    flex: 1,
    minHeight: 50,
    fontSize: 15,
    color: '#1A1A1A',
  },

  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 8,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
    paddingRight: 8,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#C9C7C0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  checkboxChecked: {
    backgroundColor: '#FC5B2C',
    borderColor: '#FC5B2C',
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#393E43',
  },

  signUpButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#FC5B2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },


  signUpButtonPressed: {
    backgroundColor: '#E94A1C',
  },

  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  signInRow: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  signInPrompt: {
    fontSize: 14,
    color: '#686B6C',
  },

  signInLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FC5B2C',
  },
  message: {
    color: '#9C351C',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
});




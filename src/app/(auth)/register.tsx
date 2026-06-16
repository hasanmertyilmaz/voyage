import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearAuthError,
  selectAuthError,
  selectAuthStatus,
  selectPendingConfirmation,
  signUp,
} from '@/store/slices/authSlice';
import { isValidEmail, validatePassword } from '@/utils/validation';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const status = useAppSelector(selectAuthStatus);
  const serverError = useAppSelector(selectAuthError);
  const pendingConfirmation = useAppSelector(selectPendingConfirmation);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const onSubmit = () => {
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setEmailError(undefined);
      setPasswordError(passwordCheck.message);
      return;
    }
    if (password !== confirm) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setEmailError(undefined);
    setPasswordError(undefined);
    dispatch(signUp({ email, password }));
  };

  return (
    <AuthShell title="Voyage" subtitle="Start your travel journal.">
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="you@example.com"
        leftIcon={<Ionicons name="mail-outline" size={18} color={theme.textMuted} />}
        error={emailError}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="At least 6 characters"
        leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} />}
        error={passwordError}
      />
      <TextField
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="Repeat password"
        leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color={theme.textMuted} />}
      />

      {serverError ? (
        <Text variant="caption" color="danger">
          {serverError}
        </Text>
      ) : null}
      {pendingConfirmation ? (
        <Text variant="caption" color="success">
          Account created! Check your email to confirm, then sign in.
        </Text>
      ) : null}

      <Button title="Create account" onPress={onSubmit} loading={status === 'loading'} />

      <View style={styles.footer}>
        <Text variant="bodyMuted">Already have an account? </Text>
        <Link href="/(auth)/login" onPress={() => dispatch(clearAuthError())}>
          <Text color="primary">Sign in</Text>
        </Link>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xs },
});

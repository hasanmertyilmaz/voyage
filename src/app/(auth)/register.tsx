import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
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
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="display">Create account</Text>
        <Text variant="bodyMuted">Start your travel journal.</Text>
      </View>

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="you@example.com"
        error={emailError}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="At least 6 characters"
        error={passwordError}
      />
      <TextField
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="Repeat password"
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: Spacing.xs, marginVertical: Spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.sm },
});

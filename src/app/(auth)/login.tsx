import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { isSupabaseConfigured } from '@/constants/config';
import { Spacing } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearAuthError,
  selectAuthError,
  selectAuthStatus,
  signIn,
} from '@/store/slices/authSlice';
import { isValidEmail } from '@/utils/validation';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const serverError = useAppSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();

  const onSubmit = () => {
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError(undefined);
    dispatch(signIn({ email, password }));
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.logo}>🧭</Text>
        <Text variant="display">Voyage</Text>
        <Text variant="bodyMuted">Your trips, captured.</Text>
      </View>

      {!isSupabaseConfigured ? (
        <Text variant="caption" color="danger">
          Supabase isn&apos;t configured yet. Add EXPO_PUBLIC_SUPABASE_URL and
          EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.
        </Text>
      ) : null}

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
        placeholder="••••••"
      />

      {serverError ? (
        <Text variant="caption" color="danger">
          {serverError}
        </Text>
      ) : null}

      <Button title="Sign in" onPress={onSubmit} loading={status === 'loading'} />

      <View style={styles.footer}>
        <Text variant="bodyMuted">No account yet? </Text>
        <Link href="/(auth)/register" onPress={() => dispatch(clearAuthError())}>
          <Text color="primary">Create one</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: Spacing.xs, marginVertical: Spacing.xl },
  logo: { fontSize: 56 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.sm },
});

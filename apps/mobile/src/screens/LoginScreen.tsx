import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '@/services/apiClient';
import { useAuth } from '@/store/auth-context';

const C = {
  bgBase: '#F0F2F4',
  bgSurface: '#FFFFFF',
  primary: '#2E6E7E',
  textPrimary: '#1A2328',
  textSecondary: '#5C6B73',
  border: '#CDD3D8',
  error: '#A03030',
  white: '#FFFFFF',
};

export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const submit = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorText('Usuario y contraseña son obligatorios.');
      return;
    }
    try {
      setLoading(true);
      setErrorText(null);
      await login(username.trim(), password);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErrorText('Credenciales inválidas.');
      } else {
        setErrorText('No se pudo iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.card}>
        <Text style={s.title}>Neur Eye Fisio</Text>
        <Text style={s.subtitle}>Acceso clínico</Text>

        <View style={s.field}>
          <Text style={s.label}>Usuario</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={s.input}
            placeholder="usuario"
            placeholderTextColor={C.textSecondary}
          />
        </View>

        <View style={s.field}>
          <Text style={s.label}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={s.input}
            placeholder="********"
            placeholderTextColor={C.textSecondary}
          />
        </View>

        {errorText ? <Text style={s.error}>{errorText}</Text> : null}

        <Pressable style={[s.button, loading && s.buttonDisabled]} onPress={submit} disabled={loading}>
          <Text style={s.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: C.bgSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: C.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: C.textSecondary, textAlign: 'center', marginBottom: 8 },
  field: { gap: 6 },
  label: { fontSize: 12, color: C.textSecondary, fontWeight: '600' },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    color: C.textPrimary,
    fontSize: 15,
  },
  error: { color: C.error, fontSize: 13, fontWeight: '600' },
  button: {
    marginTop: 4,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: C.white, fontSize: 15, fontWeight: '700' },
});

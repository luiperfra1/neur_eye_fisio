import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '@/services/apiClient';
import { useAuth } from '@/store/auth-context';

const C = {
  bgBase: '#EDF0F2',
  bgSurface: '#FFFFFF',
  bgInput: '#F5F7F8',
  bgIconBadge: '#EAF6F6',
  primary: '#2E6E7E',
  primaryDark: '#235968',
  textPrimary: '#1A2328',
  textSecondary: '#5C6B73',
  textHint: '#9AAAB3',
  border: '#D5DCDF',
  borderInput: '#C8D2D6',
  borderBadge: '#B0DCDC',
  error: '#A03030',
  errorBg: '#FDF2F2',
  white: '#FFFFFF',
};

function UserIcon() {
  return (
    <View style={s.iconBadge}>
      {/* Sustituir por una librería de iconos real, ej. lucide-react-native */}
      <Text style={{ fontSize: 22 }}>👁</Text>
    </View>
  );
}

export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

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
        setErrorText('Credenciales inválidas. Inténtalo de nuevo.');
      } else {
        setErrorText('No se pudo conectar. Comprueba tu red.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <View style={s.card}>

        {/* Cabecera */}
        <View style={s.header}>
          <UserIcon />
          <Text style={s.title}>Neur Eye Fisio</Text>
          <Text style={s.subtitle}>ACCESO CLÍNICO</Text>
        </View>

        {/* Campos */}
        <View style={s.fields}>
          <View style={s.field}>
            <Text style={s.label}>Usuario</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              style={[s.input, userFocused && s.inputFocused]}
              placeholder="nombre de usuario"
              placeholderTextColor={C.textHint}
              onFocus={() => setUserFocused(true)}
              onBlur={() => setUserFocused(false)}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Contraseña</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[s.input, passFocused && s.inputFocused]}
              placeholder="••••••••"
              placeholderTextColor={C.textHint}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
            />
          </View>
        </View>

        {/* Error */}
        {errorText ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{errorText}</Text>
          </View>
        ) : null}

        {/* Botón */}
        <Pressable
          style={({ pressed }) => [
            s.button,
            loading && s.buttonDisabled,
            pressed && s.buttonPressed,
          ]}
          onPress={submit}
          disabled={loading}
        >
          <Text style={s.buttonText}>{loading ? 'Conectando…' : 'Entrar'}</Text>
        </Pressable>

        {/* Pie */}
        <Text style={s.footer}>¿Problemas de acceso? Contacta con soporte</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bgBase,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: C.bgSurface,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 24,
    gap: 0,
  },

  // Cabecera
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: C.bgIconBadge,
    borderWidth: 0.5,
    borderColor: C.borderBadge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: C.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: C.textSecondary,
    fontWeight: '500',
  },

  // Campos
  fields: {
    gap: 14,
    marginBottom: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textSecondary,
    letterSpacing: 0.3,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: C.borderInput,
    paddingHorizontal: 14,
    backgroundColor: C.bgInput,
    color: C.textPrimary,
    fontSize: 15,
  },
  inputFocused: {
    borderColor: C.primary,
    borderWidth: 1.5,
    backgroundColor: C.bgSurface,
  },

  // Error
  errorBox: {
    backgroundColor: C.errorBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    color: C.error,
    fontSize: 13,
    fontWeight: '500',
  },

  // Botón
  button: {
    backgroundColor: C.primary,
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  buttonPressed: {
    backgroundColor: C.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Pie
  footer: {
    fontSize: 12,
    color: C.textHint,
    textAlign: 'center',
  },
}); 
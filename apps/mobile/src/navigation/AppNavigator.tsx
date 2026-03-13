import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreateSessionScreen } from '@/screens/CreateSessionScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { SessionPauseScreen } from '@/screens/SessionPauseScreen';
import { SessionsListScreen } from '@/screens/SessionsListScreen';
import { SessionSummaryScreen } from '@/screens/SessionSummaryScreen';
import { TestExecutionScreen } from '@/screens/TestExecutionScreen';
import { TranscriptionScreen } from '@/screens/TranscriptionScreen';
import { useAuth } from '@/store/auth-context';
import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'SessionsList' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="SessionsList" component={SessionsListScreen} />
          <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
          <Stack.Screen name="TestExecution" component={TestExecutionScreen} />
          <Stack.Screen
            name="SessionPause"
            component={SessionPauseScreen}
            options={{ presentation: 'containedModal' }}
          />
          <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
          <Stack.Screen
            name="Transcription"
            component={TranscriptionScreen}
            options={{ presentation: 'containedModal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

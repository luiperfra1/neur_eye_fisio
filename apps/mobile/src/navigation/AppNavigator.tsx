import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreateSessionScreen } from '@/screens/CreateSessionScreen';
import { SessionPauseScreen } from '@/screens/SessionPauseScreen';
import { SessionsListScreen } from '@/screens/SessionsListScreen';
import { SessionSummaryScreen } from '@/screens/SessionSummaryScreen';
import { TestExecutionScreen } from '@/screens/TestExecutionScreen';
import { TranscriptionScreen } from '@/screens/TranscriptionScreen';
import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SessionsList"
      screenOptions={{
        headerShown: false,
      }}
    >
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
    </Stack.Navigator>
  );
}

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {useEffect, useRef} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/navigation/AppNavigator';
import {useAuth} from './src/hooks/useAuth';
import {useNetworkSync} from './src/hooks/useNetworkSync';
import {stopBackgroundLocation} from './src/background/backgroundLocationService';
import {setDutyState} from './src/storage/locationStorage';

function App() {
  const {user, initializing, configurationError} = useAuth();
  const previousUid = useRef<string | null>(null);
  useNetworkSync(user?.uid);

  useEffect(() => {
    const oldUid = previousUid.current;
    if (oldUid && oldUid !== user?.uid) {
      void setDutyState(oldUid, false)
        .then(stopBackgroundLocation)
        .catch(error => console.warn('Auth cleanup failed', error));
    }
    previousUid.current = user?.uid ?? null;
  }, [user?.uid]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFA" />
      <AppNavigator
        user={user}
        initializing={initializing}
        configurationError={configurationError}
      />
    </SafeAreaProvider>
  );
}

export default App;

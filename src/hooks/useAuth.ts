import {useEffect, useState} from 'react';
import auth, {type FirebaseAuthTypes} from '@react-native-firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [configurationError, setConfigurationError] = useState(false);

  useEffect(() => {
    try {
      return auth().onAuthStateChanged(nextUser => {
        setUser(nextUser);
        setInitializing(false);
      });
    } catch (error) {
      console.warn('Firebase is not configured', error);
      setConfigurationError(true);
      setInitializing(false);
      return undefined;
    }
  }, []);

  return {user, initializing, configurationError};
}

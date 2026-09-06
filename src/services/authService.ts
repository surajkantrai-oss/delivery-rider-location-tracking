import auth from '@react-native-firebase/auth';
import type {AuthCredentials} from '../types/auth';

export const login = ({email, password}: AuthCredentials) =>
  auth().signInWithEmailAndPassword(email.trim(), password);

export const register = ({email, password}: AuthCredentials) =>
  auth().createUserWithEmailAndPassword(email.trim(), password);

export const logout = () => auth().signOut();

export function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String(error.code)
      : '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account already exists for that email.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/network-request-failed': 'Network unavailable. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
  };
  return messages[code] ?? 'Something went wrong. Please try again.';
}

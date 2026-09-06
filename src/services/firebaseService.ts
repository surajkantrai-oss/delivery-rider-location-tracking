import firestore from '@react-native-firebase/firestore';

export const locationLogsCollection = (uid: string) =>
  firestore().collection('users').doc(uid).collection('locationLogs');

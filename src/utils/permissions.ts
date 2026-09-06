import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const settingsAlert = (message: string) =>
  Alert.alert('Location permission required', message, [
    {text: 'Cancel', style: 'cancel'},
    {text: 'Open Settings', onPress: () => void Linking.openSettings()},
  ]);

async function requestAndroidPermissions(): Promise<boolean> {
  const androidVersion = Number(Platform.Version);
  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  if (fine !== PermissionsAndroid.RESULTS.GRANTED) {
    if (fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      settingsAlert('Enable precise location in Settings to go On Duty.');
    }
    return false;
  }

  if (androidVersion >= 29) {
    const background = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    );
    if (background !== PermissionsAndroid.RESULTS.GRANTED) {
      settingsAlert(
        'Choose “Allow all the time” for location so tracking can continue in the background.',
      );
      return false;
    }
  }

  if (androidVersion >= 33) {
    const notifications = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (notifications !== PermissionsAndroid.RESULTS.GRANTED) {
      settingsAlert(
        'Enable notifications so Android can show the required active-tracking notification.',
      );
      return false;
    }
  }
  return true;
}

export async function requestLocationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return requestAndroidPermissions();
  }
  const result = await Geolocation.requestAuthorization('always');
  if (result === 'granted') {
    return true;
  }
  if (result === 'denied' || result === 'restricted' || result === 'disabled') {
    settingsAlert(
      'Enable “Always” location access in Settings to track deliveries in the background.',
    );
  }
  return false;
}

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/HomeScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {RegisterScreen} from '../screens/RegisterScreen';
import {LoadingView} from '../components/LoadingView';
import type {AuthStackParamList} from '../types/navigation';
import type {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {Platform, StyleSheet, Text, View} from 'react-native';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AppNavigator({
  user,
  initializing,
  configurationError,
}: {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean;
  configurationError: boolean;
}) {
  if (initializing) {
    return <LoadingView />;
  }
  if (configurationError) {
    return (
      <View style={styles.configurationContainer}>
        <Text style={styles.configurationTitle}>Firebase setup required</Text>
        <Text style={styles.configurationBody}>
          {Platform.OS === 'android'
            ? 'Add google-services.json to android/app, then rebuild the application.'
            : 'Add GoogleService-Info.plist to the DeliveryRiderApp iOS target, then rebuild the application.'}
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <HomeScreen user={user} />
      ) : (
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  configurationContainer: {
    flex: 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFBFA',
  },
  configurationTitle: {
    color: '#183B34',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  configurationBody: {
    marginTop: 10,
    color: '#64706D',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});

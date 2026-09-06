# Delivery Rider App

## Overview

A React Native CLI application for delivery riders. Riders register or sign in with Firebase Email/Password Authentication, go On Duty, and record qualifying route movement to Cloud Firestore. Authentication, duty state, the last accepted position, and unsynced records survive application restarts.

## Features

- Firebase email/password registration, login, native session persistence, and logout
- Persisted On Duty / Off Duty state
- Android foreground-service and native GPS tracking; native iOS location updates with background location mode
- 10-second requested location cadence (subject to OS scheduling)
- Haversine calculation and an inclusive 30-metre acceptance threshold
- Rider-scoped, real-time Firestore history with pull-to-refresh and UI states
- AsyncStorage offline queue with automatic startup, foreground, reconnection, and On Duty synchronization
- Stable client IDs and idempotent Firestore `doc(id).set()` writes
- Android/iOS staged permission flows and Jest distance tests

## Architecture

- `src/screens`: authentication and Home presentation/orchestration
- `src/components`: reusable status and location-history UI
- `src/navigation`: auth-aware navigation tree
- `src/background`: background task and native location watcher
- `src/services`: Firebase, authentication, location acceptance, persistence, and sync
- `src/storage`: rider-specific state and persistent offline queue
- `src/hooks`: authentication, real-time logs, and network synchronization
- `src/utils`: Haversine calculation, validation, and permissions

`processLocationReading` serializes callbacks through a promise chain. Inside that critical section it reads the rider-specific last accepted point, validates and calculates distance, creates the complete log, writes or queues it, and only then updates the accepted point. An Off Duty state is checked again before persistence so an in-flight callback exits.

## Setup

Requirements: Node 20+, Android Studio/JDK 17 for Android, and macOS/Xcode/CocoaPods for iOS.

On macOS, add the Android SDK tools to your shell (adjust the SDK path if Android Studio uses a different location):

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
```

Put those exports in `~/.zshrc` to keep them across terminal sessions. The local Gradle fallback is `android/local.properties` containing `sdk.dir=/absolute/path/to/Android/sdk`; that machine-specific file is gitignored.

```bash
git clone <repository-url>
cd DeliveryRiderApp
npm install
```

Add Firebase configuration (these files are intentionally gitignored):

- Android: `android/app/google-services.json`
- iOS: `ios/DeliveryRiderApp/GoogleService-Info.plist`

For iOS, drag `GoogleService-Info.plist` into the `DeliveryRiderApp` target in Xcode with “Copy items if needed” and target membership enabled. Then:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

Run:

```bash
npm run android
# or
npm run ios
```

Before `npm run android`, start an Android Virtual Device in Android Studio's Device Manager (or connect a USB-debugging-enabled device) and verify `adb devices` lists it. A Gradle build without installing to a device can be checked with `cd android && ./gradlew assembleDebug`.

## Firebase Setup

1. Create a Firebase project.
2. Register Android app ID `com.deliveryriderapp` and the iOS bundle identifier shown in Xcode.
3. Download and place both configuration files.
4. Enable Email/Password in Firebase Authentication.
5. Create Cloud Firestore.
6. Deploy `firestore.rules` using `firebase deploy --only firestore:rules` or the Firebase console.

The rules restrict each `users/{uid}` tree to that authenticated UID and validate log rider/document IDs.

## Background Location Approach

The project uses open-source `react-native-background-actions` with `react-native-geolocation-service`; neither requires a paid SDK or hosted service.

On Android, Background Actions runs a foreground service with the visible notification “Delivery Rider — Location tracking active.” The task owns a native geolocation watcher, so tracking does not depend on Home being mounted or a React component timer. The manifest declares background/foreground location, notification, wake-lock, and modern location foreground-service permissions/type.

On iOS, the native Core Location watcher uses Always authorization and the `location` background mode. `react-native-background-actions` cannot create unlimited arbitrary iOS execution time; location delivery is controlled by Core Location and iOS. The project requests a 10-second cadence, but neither platform guarantees exact 10-second background callbacks. iOS can coalesce updates and normally will not relaunch after force-quit. Android can stop work after force-stop, battery optimization, or aggressive OEM management. Opening the app restores duty state and restarts tracking where permitted.

## Permissions

Android requests precise foreground location first, background location on Android 10+, then notification access on Android 13+. Newer versions may require selecting “Allow all the time” in Settings. The app explains the need first and offers a Settings link when access is denied.

iOS requests Always authorization. When-in-use and Always descriptions and the location background mode are in `Info.plist`. For release, verify Signing & Capabilities → Background Modes → Location updates in Xcode.

## Distance Threshold

Distance uses the Haversine formula with Earth radius 6,371,000 m. The first valid fix is saved with `distanceMoved = 0`. Later readings always compare with the last **accepted** fix: below 30 m is ignored without moving the reference; at or above 30 m is accepted as the new reference.

Coordinates outside legal ranges, non-finite data, non-positive accuracy, and fixes with reported accuracy worse than 100 m are rejected. The threshold also reduces GPS jitter.

## Offline Queue and Duplicate Safety

Each accepted reading gets a client ID before I/O. Online writes use `users/{uid}/locationLogs/{id}` and `.set(log)`. Offline readings—and online writes that fail despite NetInfo—go to AsyncStorage. Sync removes an item only after success. Queue insertion is ID-deduplicated, writes are idempotent, and concurrent sync attempts share one promise, so retries/reconnects cannot create new records.

The queue retains records for all riders. Logout stops tracking and clears only that rider's duty flag; it deliberately preserves unsynced data.

## Testing

```bash
npm run typecheck
npm run lint
npm test
```

Jest covers equal coordinates, about 29 m, exact `29.999 / 30 / 30.001` boundaries, about 31 m, London–Paris distance, GPS input validation, offline queue persistence/de-duplication, rider isolation, and failed-sync retention.

## Testing Background Location

1. Sign in and go On Duty.
2. Grant precise, Always/background, and notification permissions.
3. Background the app.
4. Move more than 30 m, or feed emulator/simulator GPS points over 30 m apart at least 10 seconds apart.
5. Reopen and confirm the real-time history/Firestore record.
6. Go Off Duty and verify no new records appear.

Test background behavior with a **release build on a physical device** before production; debug sessions and simulators alter lifecycle behavior.

## Offline Test

1. Go On Duty and obtain the first accepted fix.
2. Disable network connectivity.
3. Move/feed another fix over 30 m away.
4. Restore connectivity.
5. Confirm the record appears and Firestore contains one document with that client ID.

## Known Platform Limitations

- Requested intervals are hints; exact background timing is not guaranteed.
- iOS controls delivery frequency and normally stops after user force-quit.
- Android force-stop, Doze/battery optimization, and OEM process managers can halt tracking.
- Saved On Duty state restarts when the UI process launches; there is no Android boot receiver.
- Continuous high accuracy consumes substantial battery.

For production, add appropriate privacy disclosures and consent, retention controls, release signing, monitoring, and Firebase App Check.

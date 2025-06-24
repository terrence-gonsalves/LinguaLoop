# Firebase Setup Guide for Push Notifications

## Error Explanation
The error you're seeing:
```
Error getting push token: Error: Make sure to complete the guide at https://docs.expo.dev/push-notifications/fcm-credentials/ : Default FirebaseApp is not initialized in this process com.terrence.gonsalves.LinguaLoop. Make sure to call FirebaseApp.initializeApp(Context) first.
```

This means you need to set up Firebase Cloud Messaging (FCM) credentials for Android push notifications.

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Add an Android app to your Firebase project:
   - Package name: `com.terrence.gonsalves.LinguaLoop`
   - App nickname: `LinguaLoop`
   - Debug signing certificate SHA-1: (optional for now)

### 2. Download Firebase Configuration

1. Download the `google-services.json` file
2. Place it in your project at: `android/app/google-services.json`

### 3. Configure Android Build

1. Update `android/build.gradle`:
```gradle
buildscript {
  dependencies {
    // Add this line
    classpath 'com.google.gms:google-services:4.3.15'
  }
}
```

2. Update `android/app/build.gradle`:
```gradle
// Add at the bottom of the file
apply plugin: 'com.google.gms.google-services'
```

### 4. Configure EAS Build

1. Install EAS CLI if not already installed:
```bash
npm install -g @expo/eas-cli
```

2. Configure your project:
```bash
eas build:configure
```

3. Update `eas.json` to include Android credentials:
```json
{
  "build": {
    "development": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 5. Set Up EAS Credentials

1. Run the credentials command:
```bash
eas credentials
```

2. Follow the prompts to:
   - Set up Android FCM credentials
   - Upload your `google-services.json` file
   - Configure push notification settings

### 6. Build with EAS

1. Create a development build:
```bash
eas build --platform android --profile development
```

2. Install the build on your device

### 7. Test Push Notifications

1. Start your development server:
```bash
npx expo start --dev-client
```

2. Open the app on your device
3. Go to Settings > Notifications
4. Enable notifications and grant permissions
5. Check console logs for push token generation

## Alternative: Use Expo's Push Service (Recommended)

Instead of setting up Firebase directly, you can use Expo's push notification service which handles FCM and APNs for you:

### 1. Update app.json

Add the expo-notifications plugin configuration:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/logo.png",
          "color": "#F0F3F4"
        }
      ]
    ]
  }
}
```

### 2. Use EAS Build

1. Build with EAS (this automatically handles credentials):
```bash
eas build --platform android --profile development
```

2. EAS will prompt you to set up push notifications during the build process

### 3. Test with Expo Push Tool

1. Get your push token from the app
2. Use [Expo's Push Notification Tool](https://expo.dev/notifications) to send test notifications

## Troubleshooting

### Common Issues

1. **Build fails**: Make sure you're using EAS Build, not local builds
2. **Token not generated**: Ensure you're testing on a physical device, not emulator
3. **Permissions denied**: Guide user to device settings to enable notifications

### Debug Steps

1. Check console logs for detailed error messages
2. Verify `google-services.json` is in the correct location
3. Ensure you're using the latest EAS CLI
4. Test on a physical device, not emulator

## Next Steps

Once Firebase is set up:

1. Your push tokens will be generated successfully
2. You can send push notifications using Expo's push service
3. Consider setting up a server (like Supabase Edge Functions) to send notifications

## Resources

- [Expo Push Notifications Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Supabase Push Notifications Guide](https://supabase.com/docs/guides/functions/examples/push-notifications)
- [Firebase Console](https://console.firebase.google.com/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/) 
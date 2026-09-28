# Expo Push Token Explanation

## What is the Expo Push Token?

The `expo_push_token` is a unique identifier that Expo generates for each device. It's like a "phone number" that allows your server to send push notifications directly to a specific user's device.

## When is it Generated?

The push token is generated when:
1. User enables notifications for the first time
2. User grants notification permissions
3. The app requests the token from Expo's servers

## When is it Used?

### Currently (Local Notifications)
- **Test Notification Button**: Works without push token (local notification)
- **Study Reminders**: Can work with local notifications (scheduled on device)

### Future (Push Notifications)
- **User Messages**: When someone sends you a message
- **Follow Notifications**: When someone follows you
- **Goal Reminders**: Server-scheduled reminders
- **News & Updates**: Promotional content from your server

## How to Test Push Token Generation

1. Open the app and go to Settings > Notifications
2. Enable the main "Notifications" toggle
3. Grant permissions when prompted
4. Check the console logs - you should see:
   ```
   🔔 Getting Expo push token...
   ✅ Push token generated: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
   💾 Saving push token to settings: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
   ```
5. Save the settings
6. Check the console logs - you should see:
   ```
   💾 Saving notification settings: { expo_push_token: "ExponentPushToken[...]", ... }
   ✅ Notification settings saved successfully
   ```

## Database Field

The `expo_push_token` field in your database will contain something like:
```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

This token is unique to each device and user combination.

## Troubleshooting

### Token Not Generated
- Check if notifications are enabled
- Check if permissions were granted
- Check console logs for errors
- Verify Expo project ID in app.json

### Token Not Saved
- Check if user is logged in (profile.id exists)
- Check database connection
- Check console logs for save errors
- Verify database schema has the field

### Token Changes
- Tokens can change when app is reinstalled
- Tokens can change when device is reset
- Always update the token when the app starts
- Handle token refresh in your server logic 
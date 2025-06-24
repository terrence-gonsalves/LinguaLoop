# Notification System Setup

## Overview
This document outlines the notification system implementation for LinguaLoop, including the new notification toggles and Expo push token functionality.

## New Features Added

### 1. User Notifications Toggle
- **Purpose**: Controls notifications from other users (messages, follows, etc.)
- **Database Field**: `user_notifications` (boolean)
- **Default**: `false`

### 2. Goal Notifications Toggle
- **Purpose**: Controls goal-related notifications (reminders, progress, etc.)
- **Database Field**: `goal_notifications` (boolean)
- **Default**: `false`
- **Status**: Coming soon (disabled in UI)

### 3. Expo Push Token Storage
- **Purpose**: Stores the user's Expo push token for sending push notifications
- **Database Field**: `expo_push_token` (text, nullable)
- **Auto-generated**: When user enables notifications

### 4. Test Notification Button
- **Purpose**: Allows users to test if notifications are working
- **Functionality**: Sends an immediate local notification

## Database Schema Changes

### Required Supabase Table Updates

The `notification_settings` table needs the following new columns:

```sql
-- Add new columns to notification_settings table
ALTER TABLE notification_settings 
ADD COLUMN user_notifications BOOLEAN DEFAULT FALSE,
ADD COLUMN goal_notifications BOOLEAN DEFAULT FALSE,
ADD COLUMN expo_push_token TEXT,
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add index for user_id for better performance
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);

-- Add unique constraint to ensure one settings record per user
ALTER TABLE notification_settings 
ADD CONSTRAINT unique_user_notification_settings UNIQUE (user_id);
```

### Current Table Structure
```sql
CREATE TABLE notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  notifications_enabled BOOLEAN DEFAULT FALSE,
  study_reminder BOOLEAN DEFAULT FALSE,
  study_reminder_time TIME,
  news_promotions BOOLEAN DEFAULT FALSE,
  product_updates BOOLEAN DEFAULT FALSE,
  user_notifications BOOLEAN DEFAULT FALSE,
  goal_notifications BOOLEAN DEFAULT FALSE,
  expo_push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Details

### 1. Notification Permissions
- Users must grant notification permissions when enabling notifications
- Permissions are requested using `expo-notifications`
- If permissions are denied, notifications remain disabled

### 2. Push Token Management
- Push tokens are automatically generated when notifications are enabled
- Tokens are stored in the database and associated with the user
- Tokens are updated when the app starts or when notifications are re-enabled

### 3. Notification Categories
- **Study Reminders**: Daily study reminders with customizable time
- **User Notifications**: Messages, follows, and other user interactions
- **Goal Notifications**: Goal-related reminders and progress updates (coming soon)
- **Other Notifications**: News, promotions, and product updates

### 4. UI Features
- Main notifications toggle (master switch)
- Individual category toggles
- Time picker for study reminders
- Test notification button
- Save button with loading state
- Toast feedback for actions

## Files Modified

### Core Files
- `app/(stack)/notifications.tsx` - Main notification settings screen
- `lib/notifications.ts` - Notification utility functions
- `app.json` - Expo configuration for notifications

### New Features
- User notifications toggle
- Goal notifications toggle (disabled/coming soon)
- Expo push token storage
- Test notification functionality
- Improved error handling and loading states

## Testing

### Manual Testing Steps
1. Navigate to Settings > Notifications
2. Enable the main notifications toggle
3. Grant notification permissions when prompted
4. Test individual toggles (Study Reminder, User Notifications, etc.)
5. Use the "Test Notification" button to verify functionality
6. Save settings and verify they persist

### Expected Behavior
- Main toggle controls all notifications
- Individual toggles work independently
- Goal notifications toggle is disabled with "Coming soon" label
- Test notification sends immediately
- Settings are saved to database
- Push token is generated and stored

## Future Enhancements

### Goal Notifications Implementation
When ready to implement goal notifications:
1. Remove the `disabled={true}` prop from the goal notifications switch
2. Implement goal-related notification logic
3. Add specific goal notification types (reminders, progress, achievements)
4. Update the notification utility functions

### Push Notification Server
For sending push notifications to users:
1. Set up a notification server (Node.js/Express recommended)
2. Use Expo's push notification service
3. Implement notification scheduling and delivery
4. Add notification history and management

### Advanced Features
- Notification history
- Custom notification sounds
- Notification grouping
- Silent notifications for background updates
- Notification analytics and tracking

## Troubleshooting

### Common Issues
1. **Push token not generated**: Check Expo project ID in app.json
2. **Permissions denied**: Guide user to device settings
3. **Notifications not showing**: Verify notification handler configuration
4. **Database errors**: Check table schema and constraints

### Debug Steps
1. Check console logs for error messages
2. Verify Expo project configuration
3. Test on both iOS and Android devices
4. Check device notification settings
5. Verify database connection and permissions 
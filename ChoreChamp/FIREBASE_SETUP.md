# Firebase Integration Guide

## Overview
This app now connects to Firebase Firestore for real-time user data synchronization instead of using dummy data.

## How It Works

### 1. **User Authentication**
- The app uses Firebase Authentication to manage user sessions
- When a user signs in, their UID is used to fetch their data from Firestore

### 2. **UserContext with Firebase**
The `UserContext` has been updated to:
- Fetch user data from Firestore when the user logs in
- Sync local state with the Firebase database
- Update Firestore when user data changes
- Provide a `loading` state while data is being fetched
- Provide a `refreshUserData()` function to manually reload data

### 3. **User Data Structure in Firestore**

Your Firestore database should have a `users` collection with documents structured like this:

```javascript
// Collection: users
// Document ID: <user-uid>
{
  firstName: "Emil",
  lastName: "Berglund",
  email: "emilbe@hiof.no",
  imageUri: "",
  phone: "+47 123 45 678", // optional
  household: <DocumentReference to households/NMogPiBLWF4nmwsHBTlP>,
  points: 33,
  language: "nb", // or "en", "es", "de"
  notificationsEnabled: true,
  locationEnabled: false,
  darkModeEnabled: true,
  role: {
    admin: true
  }
}
```

## Usage Examples

### Fetching User Data
```typescript
import { useUser } from '@/contexts/UserContext';

function MyComponent() {
  const { userData, loading } = useUser();
  
  if (loading) {
    return <Text>Loading...</Text>;
  }
  
  if (!userData) {
    return <Text>Please log in</Text>;
  }
  
  return <Text>Hello {userData.firstName}!</Text>;
}
```

### Updating User Data
```typescript
import { useUser } from '@/contexts/UserContext';

function SettingsComponent() {
  const { userData, updateUserData } = useUser();
  
  const toggleNotifications = async () => {
    await updateUserData({
      notificationsEnabled: !userData?.notificationsEnabled
    });
  };
  
  return (
    <Switch
      value={userData?.notificationsEnabled}
      onValueChange={toggleNotifications}
    />
  );
}
```

### Manual Refresh
```typescript
import { useUser } from '@/contexts/UserContext';

function ProfileComponent() {
  const { refreshUserData } = useUser();
  
  const handleRefresh = async () => {
    await refreshUserData();
  };
  
  return (
    <Button onPress={handleRefresh}>Refresh Profile</Button>
  );
}
```

## Firebase Services

### userService.ts
Located in `/services/userService.ts`, this file provides:

- `getUserData(userId)` - Fetch user data from Firestore
- `updateUserData(userId, data)` - Update user data in Firestore
- `createUser(userId, userData)` - Create a new user document
- `getHouseholdId(household)` - Extract household ID from DocumentReference

## Components Updated

The following components have been updated to handle nullable `userData`:

1. **app/(tabs)/index.tsx** - Dashboard with loading state
2. **contexts/ThemeContext.tsx** - Optional chaining for userData
3. **contexts/UserContext.tsx** - Complete Firebase integration

## Next Steps

To make this work in your app:

1. ✅ Firebase config is already set up in `lib/firebase.ts`
2. ✅ User service created in `services/userService.ts`
3. ✅ UserContext updated to use Firebase
4. ✅ Components updated to handle loading states

### You still need to:
1. **Implement authentication** - Add login/signup screens that use Firebase Auth
2. **Update other components** - Check other files that use `userData` and add null checks
3. **Test with real data** - Make sure your Firestore database has the correct structure
4. **Add error handling** - Consider adding error states and retry logic

## Security Rules

Don't forget to set up Firestore security rules! Example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read household data if they're a member
    match /households/{householdId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.household.id == householdId;
    }
  }
}
```

## Troubleshooting

### "userData is null"
- Make sure the user is logged in with Firebase Auth
- Check that the user document exists in Firestore
- Verify the document structure matches the expected format

### "Loading never finishes"
- Check Firebase console for errors
- Verify network connectivity
- Check Firestore security rules allow reading the user document

### "Updates don't persist"
- Check Firestore security rules allow writing
- Verify the user is authenticated
- Check the browser/app console for errors

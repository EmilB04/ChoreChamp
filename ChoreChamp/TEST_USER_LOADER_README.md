# 🧪 Test User Loader - Development Utility

This utility allows you to force-load any user's data from Firestore for testing purposes, bypassing authentication.

## ⚠️ WARNING
**Remove all test utilities before production deployment!**

Files to remove:
- `/utils/testUserLoader.ts`
- `/components/TestUserLoader.tsx`
- This README file

Also remove the test button from `/app/(tabs)/ProfileTab.tsx` (search for "🧪 TEST BUTTON").

---

## 📋 Quick Start

### Method 1: Using the Profile Tab Button

1. Navigate to the Profile tab in your app
2. Look for the "🧪 Load Test User" button below "Rediger profil"
3. Edit `/app/(tabs)/ProfileTab.tsx` and replace `'PASTE_USER_ID_HERE'` with an actual user ID
4. Tap the button to load that user

### Method 2: Using the Test Component

Add the test component to any screen:

```tsx
import TestUserLoader from '@/components/TestUserLoader';

// In your component JSX:
<TestUserLoader />
```

This gives you a UI with a text input to enter any user ID.

### Method 3: Using the Utility Function

```tsx
import { useUser } from '@/contexts/UserContext';

function MyComponent() {
    const { loadSpecificUser } = useUser();
    
    const testFunction = async () => {
        await loadSpecificUser('your-user-id-here');
    };
    
    // Call testFunction() when needed
}
```

### Method 4: Standalone Utility (without context)

```tsx
import { testLoadUser } from '@/utils/testUserLoader';

// Use anywhere, even outside components
const userData = await testLoadUser('your-user-id-here');
console.log(userData);
```

---

## 🔍 Finding User IDs

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database**
4. Click on the **`users`** collection
5. Copy any document ID (e.g., `abc123def456`)
6. Use that ID with any of the methods above

---

## 💡 Use Cases

- **Testing profile screens** with different user data
- **Testing edge cases** (users without images, long names, etc.)
- **QA testing** without creating multiple accounts
- **Development** when you don't want to log in/out repeatedly
- **Debugging** specific user issues

---

## 🎯 Example: Testing Different User States

```tsx
// Test user without profile image
await loadSpecificUser('user-without-image-id');

// Test user with long name
await loadSpecificUser('user-with-long-name-id');

// Test admin user
await loadSpecificUser('admin-user-id');
```

---

## 🗑️ Cleanup Checklist Before Production

- [ ] Remove `/utils/testUserLoader.ts`
- [ ] Remove `/components/TestUserLoader.tsx`
- [ ] Remove test button from `/app/(tabs)/ProfileTab.tsx`
- [ ] Remove `loadSpecificUser` from `UserContext.tsx`
- [ ] Remove this README file
- [ ] Search codebase for "🧪" emoji to find any remaining test code

---

## 📝 Notes

- This utility **does not** authenticate you - it only loads user data
- The loaded user data is temporary and stored in React context
- Refreshing the app will revert to the actual authenticated user (if any)
- Firebase security rules still apply for any write operations

---

Happy Testing! 🚀

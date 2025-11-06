# 🔒 Firebase Security Rules Fix

## Problem
You're getting: **"Missing or insufficient permissions"** error.

This happens because Firebase security rules are blocking unauthenticated access to the database.

---

## Solution: Update Firestore Security Rules

### Option 1: Allow Read for Testing (TEMPORARY - NOT FOR PRODUCTION)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **chorechamp-a000a**
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab at the top
5. Replace the rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read users (for testing)
    match /users/{userId} {
      allow read: if true;  // ⚠️ TEMPORARY - allows unauthenticated reads
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Other collections require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. Click **Publish**

---

### Option 2: Allow Read for Authenticated Users Only (RECOMMENDED)

If you want to require authentication:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read any user
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /households/{householdId} {
      allow read, write: if request.auth != null;
    }
    
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

With this option, you'll need to **log in first** before the test user loader will work.

---

## ✅ After Updating Rules:

1. Wait ~10 seconds for rules to propagate
2. Refresh your web app
3. Try the **"🧪 Load Test User"** button again
4. It should now work! ✨

---

## 🔐 Security Best Practices

### For Development:
- Use Option 1 (allow read: if true) for quick testing
- Remember to change it before production!

### For Production:
- Use Option 2 (require authentication)
- Add specific rules for each collection
- Validate user permissions based on household membership
- Example:
  ```javascript
  // Users can only read/write their own data
  match /users/{userId} {
    allow read: if request.auth.uid == userId;
    allow write: if request.auth.uid == userId;
  }
  
  // Tasks can be read/written by household members
  match /tasks/{taskId} {
    allow read: if request.auth != null && 
                   request.auth.uid in get(/databases/$(database)/documents/households/$(resource.data.householdId)).data.members;
    allow write: if request.auth != null && 
                    request.auth.uid in get(/databases/$(database)/documents/households/$(resource.data.householdId)).data.members;
  }
  ```

---

## 🧪 Testing Without Authentication

If you need to test without logging in (development only):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // ⚠️ DEVELOPMENT ONLY - Remove before production!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING**: This allows ANYONE to read/write ALL data. Only use for development!

---

## 📝 Current Rules (What You Probably Have)

Your current rules likely look like this:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;  // Requires authentication
    }
  }
}
```

This blocks all unauthenticated access, which is why the test user loader doesn't work.

---

## Next Steps

1. Choose Option 1 or Option 2 above
2. Update your Firebase rules
3. Test the app
4. When deploying to production, use Option 2 with proper permission checks!

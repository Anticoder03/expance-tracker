# Firebase Security Rules Configuration

## Issue
You're experiencing a Firestore permission-denied error:
```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

## Solution

You need to update your Firestore security rules in the Firebase Console. Follow these steps:

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Security Rules

Replace your current rules with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get list of member emails from members array
    function getMemberEmails(members) {
      return members.map(member, member.email);
    }
    
    // Helper function to check if user is a member of the group
    function isGroupMember(groupData) {
      return request.auth.token.email in getMemberEmails(groupData.members);
    }
    
    // Groups collection
    match /groups/{groupId} {
      // Anyone authenticated can create a group
      allow create: if isAuthenticated();
      
      // Only members can read the group
      allow read: if isAuthenticated() && 
                     isGroupMember(resource.data);
      
      // Only members can update the group
      allow update: if isAuthenticated() && 
                       isGroupMember(resource.data);
      
      // Only the creator can delete the group
      allow delete: if isAuthenticated() && 
                       resource.data.createdBy == request.auth.uid;
    }
    
    // Expenses collection
    match /expenses/{expenseId} {
      allow create: if isAuthenticated();
      allow read: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Activities collection
    match /activities/{activityId} {
      allow create: if isAuthenticated();
      allow read: if isAuthenticated();
      // No one can update or delete activities (they're immutable logs)
      allow update, delete: if false;
    }
    
    // Test collection (for connection testing)
    match /test/{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

### Step 3: Publish Rules
1. Click the **Publish** button in the Firebase Console
2. Wait for the rules to deploy (usually takes a few seconds)

### Alternative: Development Mode (NOT RECOMMENDED FOR PRODUCTION)

If you're just testing and want to allow all access temporarily:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 2, 15);
    }
  }
}
```

⚠️ **WARNING**: This allows anyone to read/write your database until February 15, 2026. Only use this for development and testing!

### Step 4: Verify Rules

After updating the rules:
1. Refresh your application
2. Try creating a group or adding an expense
3. Check the browser console for any remaining errors

## Additional Notes

- The security rules use `request.auth.token.email` to check membership
- Make sure your members array in groups contains email addresses
- Users must be authenticated (logged in) to access any data
- The rules check if the user's email exists in the group's members array

## Troubleshooting

If you still see permission errors after updating the rules:

### 1. Verify You're Logged In
Open your browser console and check:
```javascript
// In browser console
console.log('User:', firebase.auth().currentUser);
```
If this returns `null`, you're not authenticated. Try logging out and back in.

### 2. Check Your Data Structure in Firestore
1. Go to Firebase Console → Firestore Database → Data tab
2. Open a group document
3. Verify the `members` array looks like this:
```javascript
members: [
  {
    id: "some-id",
    name: "John Doe", 
    email: "john@example.com",
    addedAt: Timestamp
  },
  // ... more members
]
```

### 3. Verify Your Email Matches
Make sure the email you're logged in with **exactly** matches an email in the members array (case-sensitive).

### 4. Test Rules in Firebase Console
1. Go to Firebase Console → Firestore Database → Rules tab
2. Click on "Rules Playground" (simulator)
3. Test a read operation:
   - Location: `/databases/(default)/documents/groups/{your-group-id}`
   - Auth: Select "Authenticated" and enter your email
   - Click "Run"
4. If it fails, check the error message for details

### 5. Clear Browser Cache and Reload
Sometimes Firebase auth tokens get cached:
1. Open DevTools (F12)
2. Go to Application → Storage → Clear site data
3. Refresh the page and log in again

### 6. Check Browser Console for Exact Error
Look for the full error message in the console. It should tell you:
- Which collection is being accessed
- What operation failed (read/write)
- The exact rule that rejected it

### 7. Temporary Debug Rules
If nothing works, temporarily use these ultra-permissive rules to test:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
⚠️ **WARNING**: These rules allow ANY authenticated user to access ALL data. Only use for debugging, then switch back to the proper rules above!

### 8. Common Issues

**Issue**: "Missing or insufficient permissions" on groups collection
- **Cause**: Your email doesn't match any member email in the group
- **Fix**: Check that you added yourself to the group when creating it

**Issue**: Error persists after updating rules
- **Cause**: Rules take a few seconds to deploy
- **Fix**: Wait 10-30 seconds, then refresh your app

**Issue**: Error only on `subscribeToUserGroups`
- **Cause**: Real-time listeners are more strict about permissions
- **Fix**: Make sure you're authenticated before the listener starts

### 9. Enable Firestore Debug Logging
Add this to your app to see detailed Firestore logs:
```typescript
// In lib/firebase.ts, add after imports:
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable debug logging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
```

Then check the console for detailed error messages.

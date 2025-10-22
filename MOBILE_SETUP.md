# NeuroLens Mobile App Setup Guide

Your NeuroLens web app has been converted to a native mobile app using Capacitor! 🎉

## What's Been Done

✅ Installed Capacitor dependencies
✅ Created native camera integration
✅ Added offline network detection
✅ Configured mobile-optimized viewport
✅ Added safe area insets for notched devices
✅ Created high-quality retinal image capture

## Current Status

The app works in the Lovable preview as a web app. To test on real mobile devices, follow the steps below.

## Next Steps (On Your Local Machine)

### 1. Export to GitHub
- Click the "Export to GitHub" button in Lovable (top right)
- Clone your repository locally:
```bash
git clone [your-repo-url]
cd neuro-lens-flow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Capacitor (First Time Only)
```bash
npx cap init
```
When prompted:
- App ID: `app.lovable.d70152f16ad34b78823a1c2c5836ce74`
- App Name: `NeuroLens`

Note: The `capacitor.config.ts` file is already created, so this step updates native configs.

### 4. Add Mobile Platforms

**For iOS (requires macOS with Xcode):**
```bash
npx cap add ios
npx cap update ios
```

**For Android (requires Android Studio):**
```bash
npx cap add android
npx cap update android
```

### 5. Build the Web App
```bash
npm run build
```

### 6. Sync with Native Platforms
```bash
npx cap sync
```

**Important:** Run `npx cap sync` every time you:
- Pull changes from GitHub
- Modify web code
- Update Capacitor plugins

### 7. Configure Native Permissions

#### iOS Permissions
Open `ios/App/App/Info.plist` and ensure these keys exist:

```xml
<key>NSCameraUsageDescription</key>
<string>NeuroLens needs camera access to capture retinal images for stroke risk assessment</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Save retinal images to your photo library</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Access retinal images from your photo library</string>
```

#### Android Permissions
Open `android/app/src/main/AndroidManifest.xml` and ensure these permissions exist:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 8. Run on Device/Emulator

**For iOS:**
```bash
npx cap run ios
```
This opens Xcode. Select your target device and click Run.

**For Android:**
```bash
npx cap run android
```
This opens Android Studio. Select your target device and click Run.

## Development Workflow

### Live Reload During Development

The app is configured to load from the Lovable preview URL during development:
```
https://d70152f1-6ad3-4b78-823a-1c2c5836ce74.lovableproject.com
```

This means you can:
1. Make changes in Lovable
2. Changes automatically appear on your mobile device
3. No need to rebuild constantly!

### For Production Builds

When ready to deploy, update `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.d70152f16ad34b78823a1c2c5836ce74',
  appName: 'NeuroLens',
  webDir: 'dist',
  // Remove or comment out the server section for production:
  // server: {
  //   url: 'https://...',
  //   cleartext: true
  // },
};
```

Then rebuild and sync:
```bash
npm run build
npx cap sync
```

## Testing Camera Functionality

### On Web (Browser)
- Camera will simulate capture with placeholder images
- Quality checks still work for UI testing

### On Mobile Device
- Native camera launches when you click "Capture"
- High-resolution images (1920x1920) for medical quality
- Images saved to app's private storage
- Offline support included

## Troubleshooting

### Camera Not Working
1. Check permissions are granted in device settings
2. Verify `Info.plist` (iOS) or `AndroidManifest.xml` (Android) has camera permissions
3. Check console logs with Safari Web Inspector (iOS) or Chrome DevTools (Android)

### Build Errors
```bash
# Clean and rebuild
rm -rf node_modules
npm install
npm run build
npx cap sync
```

### iOS Specific
- Requires macOS with Xcode 14+
- Need Apple Developer account for physical device testing
- Simulator works without developer account

### Android Specific
- Requires Android Studio with SDK 33+
- Enable USB debugging on your device
- Accept USB debugging prompt on device

## App Store Submission

### iOS App Store
1. Create App Store Connect account ($99/year)
2. Create app listing
3. Configure signing certificates in Xcode
4. Archive and upload via Xcode
5. Submit for review

### Google Play Store
1. Create Google Play Console account ($25 one-time)
2. Create app listing
3. Generate signed APK/AAB
4. Upload and submit for review

### Healthcare App Requirements
Both Apple and Google have specific requirements for healthcare apps:
- Privacy policy required
- HIPAA compliance documentation
- Data handling transparency
- May need regulatory approval (FDA, etc.)

## Useful Commands

```bash
# Install new package
npm install [package-name]

# Sync after changes
npx cap sync

# Open native IDE
npx cap open ios
npx cap open android

# Update Capacitor
npm install @capacitor/core @capacitor/cli
npx cap sync

# Build for production
npm run build
npx cap sync
```

## Key Features Implemented

### 📸 Native Camera Integration
- High-quality retinal image capture
- Permission handling
- Image storage in app directory
- Quality assessment simulation

### 🌐 Network Detection
- Automatic online/offline detection
- Visual indicator when offline
- Works on both web and native

### 📱 Mobile Optimization
- Safe area insets for notched devices
- Touch-friendly tap targets (44px minimum)
- Prevents zoom on input focus
- Responsive design for all screen sizes

### 🔐 Supabase Integration
- Authentication works seamlessly
- Database queries unchanged
- Secure session management

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [iOS Development Guide](https://developer.apple.com/ios/)
- [Android Development Guide](https://developer.android.com/studio)
- [Lovable Documentation](https://docs.lovable.dev)

## Need Help?

If you run into issues:
1. Check the console logs in the native IDE
2. Review Capacitor documentation
3. Ask in Lovable Discord or support channels
4. Check GitHub issues for similar problems

---

**Happy Mobile Development! 📱✨**

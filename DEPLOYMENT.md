# 🚀 Monic Laundry POS - Deployment Guide

## 📋 Prerequisites

### For Web & Desktop:
- Node.js 18+ 
- npm atau yarn
- Electron dependencies

### For Android:
- Android Studio
- Java JDK 11+
- Android SDK 24+

## 🔧 Setup Environment

### 1. Clone Repository
\`\`\`bash
git clone <your-repo-url>
cd monic-laundry-pos
npm install
\`\`\`

### 2. Setup Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Run SQL scripts:
   - \`scripts/01-create-database.sql\`
   - \`scripts/02-seed-data.sql\`
3. Get API keys from Settings > API

### 3. Environment Variables
Create \`.env.local\`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

## 🌐 Web Application Deployment

### Vercel (Recommended)
\`\`\`bash
npm install -g vercel
vercel login
vercel --prod
\`\`\`

### Manual Deployment
\`\`\`bash
npm run build
npm start
\`\`\`

## 🖥️ Desktop Application (Electron)

### Development
\`\`\`bash
npm run electron-dev
\`\`\`

### Build for Production
\`\`\`bash
# Build for current platform
npm run electron-build

# Build for all platforms (requires additional setup)
npm run electron-build -- --win --mac --linux
\`\`\`

### Distribution
Built files will be in \`dist-electron/\`:
- Windows: \`.exe\` installer
- macOS: \`.dmg\` installer  
- Linux: \`.AppImage\` executable

## 📱 Android Application

### Setup Android Development
1. Install Android Studio
2. Setup Android SDK
3. Create virtual device or connect physical device

### Configure App
Edit \`android/app/build.gradle\`:
\`\`\`gradle
buildConfigField "String", "WEB_APP_URL", "\\"https://your-deployed-web-app.vercel.app\\""
\`\`\`

### Build APK
\`\`\`bash
cd android
./gradlew assembleDebug    # Debug build
./gradlew assembleRelease  # Production build
\`\`\`

### Install APK
\`\`\`bash
adb install app/build/outputs/apk/release/app-release.apk
\`\`\`

## 🔄 Integration Setup

### 1. Database Schema
Ensure all tables are created:
- users, customers, services
- orders, order_items, deliveries
- payments, inventory, settings
- notifications, audit_logs

### 2. API Endpoints
Web app provides these APIs for mobile:
- \`/api/sync\` - Data synchronization
- \`/api/print/receipt\` - Receipt generation
- \`/api/auth/*\` - Authentication

### 3. Real-time Sync
Both apps use Supabase Realtime for:
- Order status updates
- Location tracking
- Notifications

## 🔐 Security Configuration

### Supabase RLS Policies
\`\`\`sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)

-- Create policies for each role
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
\`\`\`

### Android Permissions
Required permissions in \`AndroidManifest.xml\`:
- INTERNET
- ACCESS_FINE_LOCATION
- CAMERA
- CALL_PHONE

## 📊 Monitoring & Analytics

### Error Tracking
- Web: Vercel Analytics
- Mobile: Crashlytics (optional)

### Performance Monitoring
- Database: Supabase Dashboard
- API: Vercel Functions logs

## 🔧 Troubleshooting

### Common Issues

**Web App Won't Load:**
- Check environment variables
- Verify Supabase connection
- Check browser console

**Android App Crashes:**
- Check WebView compatibility
- Verify permissions granted
- Check network connectivity

**Desktop App Won't Start:**
- Check Node.js version
- Rebuild node_modules
- Check Electron version compatibility

### Debug Mode

**Web:**
\`\`\`bash
npm run dev
\`\`\`

**Electron:**
\`\`\`bash
npm run electron-dev
\`\`\`

**Android:**
\`\`\`bash
cd android
./gradlew assembleDebug
adb logcat
\`\`\`

## 📞 Support

For technical support:
1. Check logs in respective platforms
2. Verify database connectivity
3. Test API endpoints manually
4. Check network connectivity

## 🔄 Updates

### Web App
- Auto-deployed via Vercel
- No user action required

### Desktop App
- Manual download and install
- Auto-updater can be implemented

### Android App
- Manual APK installation
- Play Store distribution possible

---

**🎉 Your Monic Laundry POS is now ready for production use!**
\`\`\`

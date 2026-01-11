# RAG CV System - Mobile App

React Native mobile application for the RAG CV System, built with Expo and TypeScript.

## 🚀 Features

- **Authentication**: Login and signup with JWT tokens
- **CV Management**: Upload, view, and delete CV files (PDF)
- **AI Chat**: Ask questions about your CV using RAG technology
- **Application Generation**: Create personalized cover letters and emails
- **History Tracking**: View past chats and generated applications
- **Cross-Platform**: Works on iOS, Android, and Web

## 📱 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack, Bottom Tabs, Top Tabs)
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Icons**: Expo Vector Icons
- **UI**: Custom components with native styling

## 🛠️ Installation

### Prerequisites
- Node.js 18+ installed
- Expo Go app on your phone (for testing)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

### Steps

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies** (already done)
   ```bash
   npm install
   ```

3. **Configure Backend URL**
   
   Edit `src/utils/constants.ts` and update the API_BASE_URL:
   
   - For Android emulator: `http://10.0.2.2:8000`
   - For iOS simulator: `http://localhost:8000`
   - For physical device: `http://YOUR_COMPUTER_IP:8000`

4. **Start the app**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Scan QR code with Expo Go (on your phone)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

## 📂 Project Structure

```
mobile/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts     # Axios instance with interceptors
│   │   └── index.ts      # API methods (auth, cv, chat, application)
│   ├── components/       # Reusable UI components
│   │   ├── Alert.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── navigation/       # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── index.ts
│   ├── screens/          # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── ApplicationScreen.tsx
│   │   ├── UploadCVScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── ChatHistoryScreen.tsx
│   │   ├── ApplicationHistoryScreen.tsx
│   │   └── ApplicationDetailScreen.tsx
│   ├── types/            # TypeScript interfaces
│   │   └── index.ts
│   └── utils/            # Utility functions and constants
│       └── constants.ts
├── App.tsx               # Main app entry point
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## 🔧 Configuration

### Backend Connection

Update the API URL in `src/utils/constants.ts`:

```typescript
export const API_BASE_URL = 'http://YOUR_BACKEND_URL:8000';
```

**Important Notes:**
- If backend is on `localhost:8000` on your computer:
  - Android emulator: use `http://10.0.2.2:8000`
  - iOS simulator: use `http://localhost:8000`
  - Physical device: use your computer's IP (e.g., `http://192.168.1.100:8000`)

### Backend Setup

Make sure your FastAPI backend is running:

```bash
cd ../backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📱 Screens Overview

### Authentication
- **Login**: Email and password authentication
- **Signup**: Create new account

### Main Tabs
- **Dashboard**: Overview of CV status and quick access to services
- **Chat**: Ask questions about your CV
- **Application**: Generate cover letters and emails
- **History**: View past chats and applications
- **Profile**: User info and logout

### Additional Screens
- **Upload CV**: Upload or replace your CV (PDF only)
- **Application Detail**: View full application with copy functionality

## 🎨 Design Features

- Modern, clean UI matching web interface
- Card-based layout
- Bottom tab navigation
- Material design principles
- Responsive design for all screen sizes
- Pull-to-refresh functionality
- Loading states and error handling
- Smooth animations and transitions

## 🔐 Security

- JWT token authentication
- Secure token storage using AsyncStorage
- Automatic token refresh on API errors
- Protected routes requiring authentication

## 🐛 Troubleshooting

### Cannot connect to backend

1. Check if backend is running: `curl http://localhost:8000/docs`
2. Update API_BASE_URL in `src/utils/constants.ts`
3. For physical devices, ensure phone and computer are on same network
4. Check firewall settings on your computer

### Expo Go app not loading

1. Make sure phone and computer are on same WiFi
2. Try manually entering the URL in Expo Go
3. Restart Metro bundler (press `r` in terminal)

### Build errors

1. Clear cache: `npm start -- --clear`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Update Expo: `npx expo install expo@latest`

## 📦 Building for Production

### Android APK

```bash
npx eas build -p android --profile preview
```

### iOS App

```bash
npx eas build -p ios --profile preview
```

(Requires Expo EAS account and configuration)

## 🚀 Deployment

The app can be deployed using:
- **Expo EAS**: Managed build and deployment
- **Standalone Build**: Native Android/iOS apps
- **Web**: Deploy as Progressive Web App

## 📝 Features Parity with Web

The mobile app has complete feature parity with the Next.js web frontend:

✅ User authentication (login/signup)
✅ CV upload and management
✅ AI-powered chat about CV
✅ Cover letter and email generation
✅ Chat history with delete functionality
✅ Application history with detail view
✅ Copy to clipboard functionality
✅ Pull to refresh
✅ Error handling and validation
✅ Loading states
✅ User profile and logout

## 🤝 Contributing

This mobile app is part of the RAG CV System project. Follow the same contribution guidelines as the main project.

## 📄 License

Same license as the main RAG CV System project.

## 🙋 Support

For issues specific to the mobile app, please include:
- Device type (iOS/Android/Web)
- OS version
- Expo version
- Error messages and screenshots

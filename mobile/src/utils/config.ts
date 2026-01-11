/**
 * RAG CV System Mobile App - Configuration
 * 
 * IMPORTANT: Update API_BASE_URL before running!
 */

// ============================================
// BACKEND API CONFIGURATION
// ============================================

/**
 * API Base URL - CHANGE THIS based on your setup:
 * 
 * 1. Android Emulator: 'http://10.0.2.2:8000'
 *    - 10.0.2.2 is a special IP that routes to your host machine's localhost
 * 
 * 2. iOS Simulator: 'http://localhost:8000'
 *    - iOS simulator can use localhost directly
 * 
 * 3. Physical Device: 'http://YOUR_COMPUTER_IP:8000'
 *    - Find your IP:
 *      - Windows: Run 'ipconfig' in cmd
 *      - Mac: Run 'ifconfig' in terminal
 *      - Linux: Run 'ip addr' in terminal
 *    - Example: 'http://192.168.1.100:8000'
 *    - Both devices must be on the SAME WiFi network!
 * 
 * 4. Deployed Backend: 'https://your-api.herokuapp.com'
 *    - Use full HTTPS URL of deployed backend
 */

// CHOOSE ONE - Uncomment the line you need:

// For Android Emulator (MOST COMMON FOR TESTING):
export const API_BASE_URL = 'http://10.0.2.2:8000';

// For iOS Simulator (Mac only):
// export const API_BASE_URL = 'http://localhost:8000';

// For Physical Device (replace with YOUR computer's IP):
// export const API_BASE_URL = 'http://192.168.1.100:8000';

// For Production (deployed backend):
// export const API_BASE_URL = 'https://your-backend-url.com';

// ============================================
// TROUBLESHOOTING
// ============================================

/**
 * If you get "Network Error" or "Cannot connect":
 * 
 * 1. Make sure backend is running:
 *    cd ../backend
 *    uvicorn main:app --reload --host 0.0.0.0 --port 8000
 *    
 *    IMPORTANT: Use --host 0.0.0.0 to allow external connections!
 * 
 * 2. Check if you can access backend:
 *    - Open browser: http://localhost:8000/docs
 *    - Should see API documentation
 * 
 * 3. Test connection from your device:
 *    - If using physical device, open browser on phone
 *    - Go to http://YOUR_IP:8000/docs
 *    - Should work if on same WiFi
 * 
 * 4. Check firewall:
 *    - Windows: Allow Python through Windows Firewall
 *    - Mac: System Preferences → Security → Firewall
 *    - Make sure port 8000 is not blocked
 * 
 * 5. For Android emulator:
 *    - MUST use 10.0.2.2 (not localhost or 127.0.0.1)
 *    - This is a special Android routing
 * 
 * 6. For physical device:
 *    - Get your computer's WiFi IP address
 *    - Both phone and computer on SAME network
 *    - Corporate/school networks may block inter-device communication
 */

// ============================================
// UI THEME CONFIGURATION
// ============================================

export const COLORS = {
  primary: '#1890ff',        // Main brand color (blue)
  secondary: '#52c41a',      // Success/positive actions (green)
  danger: '#ff4d4f',         // Errors/delete actions (red)
  warning: '#faad14',        // Warnings/alerts (orange)
  text: '#000000',           // Primary text color
  textSecondary: '#8c8c8c',  // Secondary text (gray)
  border: '#d9d9d9',         // Border color
  background: '#ffffff',     // Card/surface background
  backgroundSecondary: '#f5f5f5', // Page background
};

export const SPACING = {
  xs: 4,   // Extra small spacing
  sm: 8,   // Small spacing
  md: 16,  // Medium spacing (most common)
  lg: 24,  // Large spacing
  xl: 32,  // Extra large spacing
};

// ============================================
// APP CONFIGURATION
// ============================================

export const APP_CONFIG = {
  // Maximum file size for CV upload (in bytes)
  MAX_CV_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Supported file types
  SUPPORTED_CV_TYPES: ['application/pdf'],
  
  // API timeout (in milliseconds)
  API_TIMEOUT: 30000, // 30 seconds
  
  // Chat message max length
  MAX_MESSAGE_LENGTH: 500,
  
  // Job description max length
  MAX_JOB_DESCRIPTION_LENGTH: 5000,
};

// ============================================
// FEATURE FLAGS (Optional)
// ============================================

export const FEATURES = {
  // Enable/disable features during development
  ENABLE_CHAT: true,
  ENABLE_APPLICATION_GENERATION: true,
  ENABLE_HISTORY: true,
  ENABLE_CV_DELETE: true,
  
  // Debug mode (shows more logs)
  DEBUG_MODE: __DEV__, // Automatically true in development
};

// ============================================
// VALIDATION RULES
// ============================================

export const VALIDATION = {
  EMAIL_REGEX: /\S+@\S+\.\S+/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_EMAIL_LENGTH: 255,
};

// API Configuration
// Automatically detects if we're in development or production

const isDevelopment = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL;

export const config = {
  // In development: use Vite proxy (goes to localhost:3001)
  // In production: MUST use VITE_API_URL env var
  apiUrl: isDevelopment 
    ? '/api'  // Vite proxy handles this
    : apiUrl || (() => {
        console.error('⚠️ VITE_API_URL is not set! API calls will fail.');
        return 'https://workout-tracker-api-production.up.railway.app';
      })(),
  
  // For debugging
  isDevelopment,
  
  // Maximum file size for PDF uploads (in bytes)
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

// Log configuration on startup
console.log('🔧 App Configuration:', {
  apiUrl: config.apiUrl,
  isDevelopment: config.isDevelopment,
  VITE_API_URL: apiUrl,
});


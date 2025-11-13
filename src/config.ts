// API Configuration
// Automatically detects if we're in development or production

const isDevelopment = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL;

export const config = {
  // In development: use Vite proxy (goes to localhost:3001)
  // In production: use VITE_API_URL env var, or try relative path
  apiUrl: isDevelopment 
    ? '/api'  // Vite proxy handles this
    : apiUrl || '/api',  // Use env var or assume same domain
  
  // For debugging
  isDevelopment,
  
  // Maximum file size for PDF uploads (in bytes)
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

// Log configuration on startup (only in dev)
if (isDevelopment) {
  console.log('🔧 App Configuration:', config);
}


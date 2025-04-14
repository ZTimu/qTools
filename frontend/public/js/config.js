/**
 * Frontend configuration for QuickTools
 */
const CONFIG = {
  // API base URL - connects to the backend server
  API_URL: 'http://localhost:5000',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register'
    },
    TOOLS: {
      PDF_TO_WORD: '/api/tools/pdf-to-word',
      IMAGE_TO_TEXT: '/api/tools/image-to-text',
      CALCULATOR: '/api/tools/calculator/calculate',
      QR_GENERATOR: '/api/tools/generate-qr',
      CONVERT_TEMPERATURE: '/api/tools/convert-temperature',
      CONVERT_MASS: '/api/tools/convert-mass',
      DOWNLOAD: {
        PDF_TO_WORD: '/api/tools/download/word',
        IMAGE_TO_TEXT: '/api/tools/download/text'
      }
    }
  }
};

/**
 * Helper function to create a full API URL
 * @param {string} endpoint - The API endpoint to call
 * @returns {string} The full API URL
 */
function getApiUrl(endpoint) {
  return CONFIG.API_URL + endpoint;
} 
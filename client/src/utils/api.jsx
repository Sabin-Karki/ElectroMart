// Maximum number of retries for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper function to make API requests with retries and better error handling
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - API endpoint URL
 * @param {object} data - Request body data (for POST/PUT)
 * @param {number} retryCount - Current retry attempt (internal use)
 * @returns {Promise<Response>} - Fetch response promise
 */
export async function apiRequest(method, url, data = undefined, retryCount = 0) {
  try {
    // Get CSRF token from meta tag if it exists
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    const headers = {
      ...(data && { "Content-Type": "application/json" }),
      ...(csrfToken && { "X-CSRF-Token": csrfToken }),
    };

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Include cookies for authentication
    });

    // Handle rate limiting
    if (res.status === 429 && retryCount < MAX_RETRIES) {
      const retryAfter = parseInt(res.headers.get('Retry-After')) || RETRY_DELAY;
      await sleep(retryAfter);
      return apiRequest(method, url, data, retryCount + 1);
    }

    // Handle authentication errors
    if (res.status === 401) {
      // Clear any stored auth state if needed
      window.dispatchEvent(new CustomEvent('auth:expired'));
      throw new Error("Unauthorized - Please login");
    }

    if (!res.ok) {
      let errorMessage;
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || `${res.status}: ${res.statusText}`;
      } catch {
        // If response is not JSON or empty
        errorMessage = `${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return res;
  } catch (error) {
    // Network errors or other failures
    if (error.name === 'TypeError' && retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      return apiRequest(method, url, data, retryCount + 1);
    }
    
    // Enhance error message for network failures
    if (error.name === 'TypeError') {
      throw new Error('Network error - Please check your connection');
    }
    
    throw error;
  }
}

/**
 * Helper to fetch and handle JSON response with type checking
 * @param {string} url - API endpoint URL
 * @returns {Promise<any>} - JSON response data
 */
export async function fetchJson(url) {
  const response = await apiRequest("GET", url);
  try {
    return await response.json();
  } catch (error) {
    throw new Error('Invalid JSON response from server');
  }
}

/**
 * Helper to handle file uploads
 * @param {string} url - API endpoint URL
 * @param {FormData} formData - Form data with files
 * @returns {Promise<Response>} - Fetch response promise
 */
export async function uploadFile(url, formData) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  
  const headers = {
    ...(csrfToken && { "X-CSRF-Token": csrfToken }),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }

  return res;
}

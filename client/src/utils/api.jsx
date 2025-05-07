/**
 * Helper function to make API requests
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - API endpoint URL
 * @param {object} data - Request body data (for POST/PUT)
 * @returns {Promise<Response>} - Fetch response promise
 */
export async function apiRequest(method, url, data = undefined) {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Include cookies for authentication
    });

    if (!res.ok) {
      // Try to extract error message from response
      const errorText = await res.text();
      let errorMessage;
      
      try {
        // Try to parse as JSON
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || `${res.status}: ${res.statusText}`;
      } catch (e) {
        // If not JSON, use the raw text or status
        errorMessage = errorText || `${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return res;
  } catch (error) {
    // Rethrow to be handled by the caller
    throw error;
  }
}

/**
 * Helper to fetch and handle JSON response
 * @param {string} url - API endpoint URL
 * @returns {Promise<any>} - JSON response data
 */
export async function fetchJson(url) {
  const response = await apiRequest("GET", url);
  return response.json();
}

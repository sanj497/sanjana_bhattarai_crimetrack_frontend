/**
 * API Utility - Centralized fetch wrapper with authentication and error handling
 * Handles 401 errors, token validation, and automatic redirects
 */

const API_BASE = import.meta.env.VITE_BACKEND_URL;

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/report')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} - Parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  // Check if token exists
  if (!token) {
    console.warn("⚠️ No authentication token found");
    throw new Error("Authentication required. Please login.");
  }

  // Validate token format (basic check)
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    console.error("❌ Invalid token format");
    handleAuthError();
    throw new Error("Invalid authentication token");
  }

  // Check if token is expired (decode without verification)
  try {
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.warn("⚠️ Token has expired");
      handleAuthError();
      throw new Error("Session expired. Please login again.");
    }
  } catch (decodeError) {
    // If we can't decode, continue and let the server validate
    console.warn("⚠️ Could not decode token, proceeding with request");
  }

  // Prepare headers
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers
  };

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.error("🔒 Authentication failed (401)");
      handleAuthError();
      throw new Error("Session expired. Please login again.");
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      console.error("🚫 Access denied (403)");
      throw new Error("You don't have permission to access this resource.");
    }

    // Handle 500+ server errors
    if (response.status >= 500) {
      console.error("💥 Server error:", response.status);
      throw new Error("Server error. Please try again later.");
    }

    // Parse JSON response
    const data = await response.json();
    
    // Check if response indicates error
    if (!response.ok) {
      throw new Error(data.error || data.msg || data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("❌ API Request failed:", error.message);
    throw error;
  }
}

/**
 * Handle authentication errors - clear storage and redirect
 */
function handleAuthError() {
  console.log("🔄 Clearing authentication data and redirecting to login");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  // Dispatch auth change event
  window.dispatchEvent(new Event("authChange"));
  
  // Redirect to login after a brief delay
  setTimeout(() => {
    if (!window.location.pathname.includes('/login')) {
      window.location.href = "/login";
    }
  }, 1500);
}

/**
 * GET request helper
 */
export async function apiGet(endpoint, queryParams = {}) {
  const queryString = new URLSearchParams(queryParams).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiRequest(url, { method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost(endpoint, body = {}) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

/**
 * PUT request helper
 */
export async function apiPut(endpoint, body = {}) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: "DELETE" });
}

/**
 * PATCH request helper
 */
export async function apiPatch(endpoint, body = {}) {
  return apiRequest(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return !payload.exp || payload.exp > currentTime;
  } catch {
    return false;
  }
}

/**
 * Get current user from localStorage
 * @returns {object|null}
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
  isAuthenticated,
  getCurrentUser
};

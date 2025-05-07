import { createContext, useState, useContext, useEffect } from "react";
import { apiRequest } from "./api";

// Create the authentication context
const AuthContext = createContext();

// Hook to use the authentication context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Fetch the current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await apiRequest("GET", "/api/user");
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        // If not authenticated (401), just set user to null
        // Other errors should be logged but not affect the UI
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setAuthError(null);
      const response = await apiRequest("POST", "/api/login", { username, password });
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Register function
  const register = async (username, email, password, fullName, role) => {
    try {
      setAuthError(null);
      const response = await apiRequest("POST", "/api/register", {
        username,
        email,
        password,
        fullName,
        role
      });
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if there's an error, clear the user state
      setUser(null);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error: authError,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

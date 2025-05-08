import { createContext, useState, useContext, useEffect } from "react";
import { apiRequest } from "./api";

// Create the authentication context
const AuthContext = createContext();

// Hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch the current user on component mount
  useEffect(() => {
    let mounted = true;

    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", "/api/user");
        const userData = await response.json();
        if (mounted) {
          setUser(userData);
          setAuthError(null);
        }
      } catch (error) {
        if (mounted) {
          console.error("Error fetching user:", error);
          setUser(null);
          // Only set error if it's not a 401 or network error
          if (error.message !== "Unauthorized - Please login" && 
              error.message !== "Network error - Please check your connection") {
            setAuthError(error.message);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      const response = await apiRequest("POST", "/api/login", { username, password });
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password, fullName, role) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await apiRequest("POST", "/api/logout");
      setUser(null);
      setAuthError(null);
    } catch (error) {
      console.error("Error logging out:", error);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error: authError,
    isInitialized,
    login,
    register,
    logout,
  };

  // Don't render children until we've checked auth status
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

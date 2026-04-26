import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api';
axios.defaults.baseURL = API_URL;

const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL + '/api';

  // -----------------------------
  // INIT AUTH (runs on refresh)
  // -----------------------------
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      await fetchUser(token);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // FETCH CURRENT USER
  // -----------------------------
  const fetchUser = async (token: string): Promise<User> => {
    const response = await axios.get(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUser(response.data);
    return response.data;
  };

  // -----------------------------
  // LOGIN
  // -----------------------------
  const login = async (username: string, password: string): Promise<User> => {
    try {
      console.log('Sending login request to /token/');
      const response = await axios.post(`${API_URL}/token/`, {
        username,
        password,
      });
      console.log('Token response:', response.data);

      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      console.log('Fetching user with token');
      const user = await fetchUser(access);
      console.log('Fetched user:', user);

      return user;
    } catch (error) {
      console.error('Login API error:', error);
      throw new Error('Login failed');
    }
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// -----------------------------
// HOOK
// -----------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
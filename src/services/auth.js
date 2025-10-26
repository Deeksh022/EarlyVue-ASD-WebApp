import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { createUser, initializeDemoData } from './database';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        // Check if we're in demo mode
        const isDemoMode = localStorage.getItem('demo-mode') === 'true';
        const userData = localStorage.getItem('user');

        if (isDemoMode && userData) {
          setUser(JSON.parse(userData));
          setLoading(false);
          return;
        }

        // Check Supabase session if configured
        if (isSupabaseConfigured() && supabase) {
          try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
              const userData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email.split('@')[0]
              };
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (error) {
            console.error('Error getting Supabase session:', error);
          }
        } else if (userData) {
          // Fallback to localStorage if Supabase not configured
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes only if Supabase is configured
    let subscription = null;
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              const userData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email.split('@')[0]
              };
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            } else {
              setUser(null);
              localStorage.removeItem('user');
            }
            setLoading(false);
          }
        );
        subscription = data?.subscription;
      } catch (error) {
        console.error('Error setting up auth state change listener:', error);
      }
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        // Demo mode - check if user exists in localStorage
        const existingUsers = JSON.parse(localStorage.getItem('registered-users') || '[]');
        const user = existingUsers.find(u => u.email === email && u.password === password);

        if (user) {
          const userData = {
            id: user.id,
            email: user.email,
            name: user.name
          };

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('demo-mode', 'true');

          return { success: true };
        } else {
          return { success: false, error: 'Invalid email or password' };
        }
      }

      // Supabase mode - real authentication
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const userData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email.split('@')[0]
          };

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

          return { success: true };
        }

        return { success: false, error: 'Login failed' };
      } catch (error) {
        console.error('Supabase login error:', error);
        return { success: false, error: 'Login failed. Please try again.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        // Demo mode - store user credentials locally
        const existingUsers = JSON.parse(localStorage.getItem('registered-users') || '[]');

        // Check if user already exists
        if (existingUsers.find(u => u.email === userData.email)) {
          return { success: false, error: 'User already exists with this email' };
        }

        const newUserData = {
          id: `user-${Date.now()}`,
          email: userData.email,
          password: userData.password,
          name: userData.name
        };

        // Store user in registered users list
        existingUsers.push(newUserData);
        localStorage.setItem('registered-users', JSON.stringify(existingUsers));

        // Auto-login after registration
        const loginUserData = {
          id: newUserData.id,
          email: newUserData.email,
          name: newUserData.name
        };

        setUser(loginUserData);
        localStorage.setItem('user', JSON.stringify(loginUserData));
        localStorage.setItem('demo-mode', 'true');

        return { success: true };
      }

      // Create user in Supabase Auth
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Create user record in our database
          const dbResult = await createUser({
            email: userData.email,
            name: userData.name
          });

          if (dbResult.success) {
            // Initialize demo data for new users
            await initializeDemoData(data.user.id);
          }

          return { success: true };
        }

        return { success: false, error: 'Registration failed' };
      } catch (error) {
        console.error('Supabase registration error:', error);
        return { success: false, error: 'Registration failed. Please try again.' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('demo-mode');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    refreshUser,
    loading,
    isSupabaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
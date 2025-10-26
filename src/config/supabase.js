import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback for demo mode
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl &&
         supabaseAnonKey &&
         supabaseUrl !== 'https://your-project.supabase.co' &&
         supabaseAnonKey !== 'your-anon-key';
};

// Create Supabase client only if properly configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database table names
export const TABLES = {
  USERS: 'users',
  PATIENTS: 'patients',
  SCREENINGS: 'screenings',
  SCREENING_RESULTS: 'screening_results'
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  if (error?.message?.includes('JWT')) {
    // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return {
    success: false,
    error: error?.message || 'An unexpected error occurred'
  };
};
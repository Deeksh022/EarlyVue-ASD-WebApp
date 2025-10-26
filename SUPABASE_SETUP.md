# Supabase Database Setup Guide

This guide will help you set up the Supabase database for the EarlyVue application.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

## Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=https://eovhilaldwbjwmvnosgq.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvdmhpbGFsZHdiandtdm5vc2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTQzNTksImV4cCI6MjA3MTk3MDM1OX0.vZS_OJTaZj0z0egvUNH2Xi82GyTIQ_3M9gVkvsvx0jA
   ```

## Database Schema

Run the following SQL commands in your Supabase SQL Editor to create the required tables:

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Patients Table
```sql
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age_months INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own patients
CREATE POLICY "Users can manage own patients" ON patients
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Screenings Table
```sql
CREATE TABLE screenings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  screening_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE screenings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage screenings through patient relationship
CREATE POLICY "Users can manage screenings for own patients" ON screenings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = screenings.patient_id
      AND patients.user_id = auth.uid()
    )
  );
```

### 4. Screening Results Table
```sql
CREATE TABLE screening_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  screening_id UUID REFERENCES screenings(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  duration_seconds INTEGER NOT NULL,
  social_attention_percentage DECIMAL(5,2) NOT NULL,
  non_social_attention_percentage DECIMAL(5,2) NOT NULL,
  improvement_percentage DECIMAL(5,2) NOT NULL,
  recommendations TEXT[],
  strengths TEXT[],
  areas_for_attention TEXT[],
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage screening results through patient relationship
CREATE POLICY "Users can manage screening results for own patients" ON screening_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM screenings
      JOIN patients ON screenings.patient_id = patients.id
      WHERE screening_results.screening_id = screenings.id
      AND patients.user_id = auth.uid()
    )
  );
```

## Authentication Setup

1. In your Supabase dashboard, go to **Authentication > Settings**
2. Configure your site URL and redirect URLs
3. Enable email authentication if desired

## Testing the Setup

1. Start your development server:
   ```bash
   npm start
   ```

2. Try registering a new user or logging in with the demo account:
   - Email: `demo@earlyvue.com`
   - Password: `password`

3. The application will automatically create demo data for new users.

## Troubleshooting

### Common Issues:

1. **Environment variables not loading**: Make sure your `.env` file is in the root directory and restart your development server.

2. **Database connection errors**: Verify your Supabase URL and anon key are correct.

3. **Authentication errors**: Check that your Supabase project has authentication properly configured.

4. **Row Level Security errors**: Ensure all tables have the correct RLS policies applied.

### Useful Supabase Commands:

```bash
# View all tables
npx supabase db inspect

# Reset database (be careful!)
npx supabase db reset

# View logs
npx supabase logs
```

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Authentication is handled by Supabase Auth
- All database operations include proper error handling

## Next Steps

Once your database is set up:

1. Test user registration and login
2. Add patients using the "Add Child" feature
3. Create screenings and view results
4. Explore all the new pages and functionality

The application is now fully integrated with Supabase for data persistence!
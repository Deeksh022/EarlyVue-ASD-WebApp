import { supabase, TABLES, handleSupabaseError, isSupabaseConfigured } from '../config/supabase';

// Demo data storage (in localStorage for demo mode)
const DEMO_STORAGE_KEY = 'earlyvue_demo_data';

// Helper function to get demo data
const getDemoData = () => {
  try {
    const data = localStorage.getItem(DEMO_STORAGE_KEY);
    return data ? JSON.parse(data) : {
      users: [],
      patients: [],
      screenings: [],
      screeningResults: []
    };
  } catch (error) {
    console.error('Error reading demo data:', error);
    return {
      users: [],
      patients: [],
      screenings: [],
      screeningResults: []
    };
  }
};

// Helper function to save demo data
const saveDemoData = (data) => {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving demo data:', error);
  }
};

// ================================
// USER MANAGEMENT FUNCTIONS
// ================================

export const createUser = async (userData) => {
  if (!isSupabaseConfigured()) {
    // Demo mode - use localStorage
    try {
      const demoData = getDemoData();
      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      demoData.users.push(newUser);
      saveDemoData(demoData);

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: 'Failed to create user in demo mode' };
    }
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([{
        email: userData.email,
        name: userData.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, user: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getUserByEmail = async (email) => {
  if (!isSupabaseConfigured()) {
    // Demo mode - use localStorage
    try {
      const demoData = getDemoData();
      const user = demoData.users.find(user => user.email === email);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Failed to get user in demo mode' };
    }
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, user: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, user: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updateUser = async (userId, updates) => {
  if (!isSupabaseConfigured()) {
    // Demo mode - update in localStorage
    try {
      const demoData = getDemoData();
      const userIndex = demoData.users.findIndex(u => u.id === userId);
      
      // If user doesn't exist in demo data, create it
      if (userIndex === -1) {
        console.log('User not found in demo data, creating new entry');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newUser = {
          id: userId,
          email: currentUser.email || updates.email || '',
          name: currentUser.name || updates.name || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...updates
        };
        demoData.users.push(newUser);
        saveDemoData(demoData);
        
        // Update the user in localStorage for auth
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update registered users if exists
        const registeredUsers = JSON.parse(localStorage.getItem('registered-users') || '[]');
        const regUserIndex = registeredUsers.findIndex(u => u.id === userId);
        if (regUserIndex !== -1) {
          registeredUsers[regUserIndex] = {
            ...registeredUsers[regUserIndex],
            ...updates
          };
          localStorage.setItem('registered-users', JSON.stringify(registeredUsers));
        }
        
        return { success: true, user: newUser };
      }
      
      // User exists, update it
      demoData.users[userIndex] = {
        ...demoData.users[userIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveDemoData(demoData);
      
      // Also update the user in localStorage for auth
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id === userId) {
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Update registered users if exists
      const registeredUsers = JSON.parse(localStorage.getItem('registered-users') || '[]');
      const regUserIndex = registeredUsers.findIndex(u => u.id === userId);
      if (regUserIndex !== -1) {
        registeredUsers[regUserIndex] = {
          ...registeredUsers[regUserIndex],
          ...updates
        };
        localStorage.setItem('registered-users', JSON.stringify(registeredUsers));
      }
      
      return { success: true, user: demoData.users[userIndex] };
    } catch (error) {
      console.error('Demo mode update error:', error);
      return { success: false, error: `Failed to update user in demo mode: ${error.message}` };
    }
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, user: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// ================================
// PATIENT MANAGEMENT FUNCTIONS
// ================================

export const createPatient = async (patientData, userId) => {
  if (!isSupabaseConfigured()) {
    // Demo mode - use localStorage
    try {
      const demoData = getDemoData();
      const newPatient = {
        id: `patient-${Date.now()}`,
        user_id: userId,
        name: patientData.name,
        date_of_birth: patientData.dateOfBirth,
        age_months: parseInt(patientData.age),
        gender: patientData.gender,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      demoData.patients.push(newPatient);
      saveDemoData(demoData);

      return { success: true, patient: newPatient };
    } catch (error) {
      return { success: false, error: 'Failed to create patient in demo mode' };
    }
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.PATIENTS)
      .insert([{
        user_id: userId,
        name: patientData.name,
        date_of_birth: patientData.dateOfBirth,
        age_months: parseInt(patientData.age),
        gender: patientData.gender,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, patient: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getPatientsByUserId = async (userId) => {
  if (!isSupabaseConfigured()) {
    // Demo mode - use localStorage
    try {
      const demoData = getDemoData();
      const patients = demoData.patients.filter(patient => patient.user_id === userId);
      return { success: true, patients };
    } catch (error) {
      return { success: false, error: 'Failed to get patients in demo mode' };
    }
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.PATIENTS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, patients: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getPatientById = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PATIENTS)
      .select('*')
      .eq('id', patientId)
      .single();

    if (error) throw error;

    return { success: true, patient: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updatePatient = async (patientId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PATIENTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, patient: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const deletePatient = async (patientId) => {
  if (!isSupabaseConfigured()) {
    // Demo mode - delete from localStorage
    try {
      const demoData = getDemoData();
      const beforeCount = demoData.patients.length;
      
      // Remove patient from demo data
      demoData.patients = demoData.patients.filter(p => p.id !== patientId && p.id !== patientId.toString());
      
      const afterCount = demoData.patients.length;
      saveDemoData(demoData);
      
      console.log(`Demo mode: Deleted patient. Before: ${beforeCount}, After: ${afterCount}`);
      
      return { 
        success: true,
        message: `Patient deleted successfully (demo mode)`
      };
    } catch (error) {
      console.error('Demo mode delete error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  try {
    const { error } = await supabase
      .from(TABLES.PATIENTS)
      .delete()
      .eq('id', patientId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// ================================
// SCREENING MANAGEMENT FUNCTIONS
// ================================

export const createScreening = async (screeningData) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.SCREENINGS)
      .insert([{
        patient_id: screeningData.patientId,
        screening_type: screeningData.type,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, screening: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getScreeningsByPatientId = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.SCREENINGS)
      .select(`
        *,
        patients (
          id,
          name,
          age_months,
          gender
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, screenings: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getScreeningById = async (screeningId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.SCREENINGS)
      .select(`
        *,
        patients (
          id,
          name,
          age_months,
          gender,
          date_of_birth
        ),
        screening_results (*)
      `)
      .eq('id', screeningId)
      .single();

    if (error) throw error;

    return { success: true, screening: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getAllScreeningsByUserId = async (userId) => {
  if (!isSupabaseConfigured()) {
    // Demo mode - use localStorage
    try {
      const demoData = getDemoData();
      const userPatients = demoData.patients.filter(patient => patient.user_id === userId);
      const patientIds = userPatients.map(patient => patient.id);

      const screenings = demoData.screenings
        .filter(screening => patientIds.includes(screening.patient_id))
        .map(screening => {
          const patient = userPatients.find(p => p.id === screening.patient_id);
          return {
            ...screening,
            patients: patient
          };
        });

      return { success: true, screenings };
    } catch (error) {
      return { success: false, error: 'Failed to get screenings in demo mode' };
    }
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.SCREENINGS)
      .select(`
        *,
        patients!inner (
          id,
          name,
          age_months,
          gender,
          user_id
        )
      `)
      .eq('patients.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, screenings: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updateScreening = async (screeningId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.SCREENINGS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', screeningId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, screening: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const deleteScreening = async (screeningId) => {
  try {
    const { error } = await supabase
      .from(TABLES.SCREENINGS)
      .delete()
      .eq('id', screeningId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// ================================
// SCREENING RESULTS FUNCTIONS
// ================================

export const createScreeningResult = async (resultData) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.SCREENING_RESULTS)
      .insert([{
        screening_id: resultData.screeningId,
        score: resultData.score,
        risk_level: resultData.risk,
        duration_seconds: resultData.duration,
        social_attention_percentage: resultData.socialAttention,
        non_social_attention_percentage: resultData.nonSocialAttention,
        improvement_percentage: resultData.improvement,
        recommendations: resultData.recommendations,
        strengths: resultData.strengths,
        areas_for_attention: resultData.areasForAttention,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Update screening status to completed
    await updateScreening(resultData.screeningId, { status: 'completed' });

    return { success: true, result: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getScreeningResults = async (screeningId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.SCREENING_RESULTS)
      .select('*')
      .eq('screening_id', screeningId)
      .single();

    if (error) throw error;

    return { success: true, result: data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// ================================
// UTILITY FUNCTIONS
// ================================

export const initializeDemoData = async (userId) => {
  if (!isSupabaseConfigured()) {
    // Demo mode - create demo data in localStorage
    try {
      const demoData = getDemoData();

      // Create demo patient
      const patientId = `patient-${Date.now()}`;
      const demoPatient = {
        id: patientId,
        user_id: userId,
        name: 'Emma Johnson',
        date_of_birth: '2022-06-15',
        age_months: 30,
        gender: 'Female',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      demoData.patients.push(demoPatient);

      // Create demo screenings
      const screenings = [
        {
          id: `screening-${Date.now()}-1`,
          patient_id: patientId,
          screening_type: 'ASD Screening',
          status: 'completed',
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          updated_at: new Date().toISOString()
        },
        {
          id: `screening-${Date.now()}-2`,
          patient_id: patientId,
          screening_type: 'Developmental Assessment',
          status: 'completed',
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
          updated_at: new Date().toISOString()
        }
      ];

      // Create demo screening results
      const screeningResults = [
        {
          id: `result-${Date.now()}-1`,
          screening_id: screenings[0].id,
          score: 25,
          risk_level: 'low',
          duration_seconds: 252,
          social_attention_percentage: 75,
          non_social_attention_percentage: 25,
          improvement_percentage: 15,
          recommendations: [
            'Continue monitoring developmental milestones',
            'Engage in regular play-based learning activities',
            'Schedule follow-up screening in 6 months'
          ],
          strengths: [
            'Good eye contact during interactions',
            'Responds well to familiar voices',
            'Shows interest in social games'
          ],
          areas_for_attention: [
            'Limited use of gestures to communicate needs',
            'Occasional difficulty with transitions between activities'
          ],
          completed_at: new Date().toISOString()
        },
        {
          id: `result-${Date.now()}-2`,
          screening_id: screenings[1].id,
          score: 28,
          risk_level: 'low',
          duration_seconds: 228,
          social_attention_percentage: 72,
          non_social_attention_percentage: 28,
          improvement_percentage: 12,
          recommendations: [
            'Maintain current developmental support activities',
            'Continue regular pediatric check-ups',
            'Monitor language development progress'
          ],
          strengths: [
            'Age-appropriate motor skills',
            'Good social engagement',
            'Following simple instructions'
          ],
          areas_for_attention: [
            'Vocabulary development slightly behind peers'
          ],
          completed_at: new Date().toISOString()
        }
      ];

      demoData.screenings.push(...screenings);
      demoData.screeningResults.push(...screeningResults);
      saveDemoData(demoData);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to initialize demo data' };
    }
  }

  try {
    // Create demo patient
    const patientResult = await createPatient({
      name: 'Emma Johnson',
      dateOfBirth: '2022-06-15',
      age: '30',
      gender: 'Female'
    }, userId);

    if (!patientResult.success) throw new Error(patientResult.error);

    const patientId = patientResult.patient.id;

    // Create demo screenings
    const screenings = [
      {
        patientId,
        type: 'ASD Screening',
        score: 25,
        risk: 'low',
        duration: 252, // 4.2 minutes
        socialAttention: 75,
        nonSocialAttention: 25,
        improvement: 15,
        recommendations: [
          'Continue monitoring developmental milestones',
          'Engage in regular play-based learning activities',
          'Schedule follow-up screening in 6 months'
        ],
        strengths: [
          'Good eye contact during interactions',
          'Responds well to familiar voices',
          'Shows interest in social games'
        ],
        areasForAttention: [
          'Limited use of gestures to communicate needs',
          'Occasional difficulty with transitions between activities'
        ]
      },
      {
        patientId,
        type: 'Developmental Assessment',
        score: 28,
        risk: 'low',
        duration: 228, // 3.8 minutes
        socialAttention: 72,
        nonSocialAttention: 28,
        improvement: 12,
        recommendations: [
          'Maintain current developmental support activities',
          'Continue regular pediatric check-ups',
          'Monitor language development progress'
        ],
        strengths: [
          'Age-appropriate motor skills',
          'Good social engagement',
          'Following simple instructions'
        ],
        areasForAttention: [
          'Vocabulary development slightly behind peers'
        ]
      }
    ];

    for (const screeningData of screenings) {
      const screeningResult = await createScreening({
        patientId: screeningData.patientId,
        type: screeningData.type
      });

      if (screeningResult.success) {
        await createScreeningResult({
          screeningId: screeningResult.screening.id,
          ...screeningData
        });
      }
    }

    return { success: true };
  } catch (error) {
    return handleSupabaseError(error);
  }
};
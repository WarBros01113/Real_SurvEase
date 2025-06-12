
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
  formsPosted: number;
  formsFilled: number;
  totalRatings: number;
  badges: string[];
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserStats = async (userId: string) => {
    try {
      // Get forms posted count
      const { count: formsPosted } = await supabase
        .from('forms')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get forms filled count
      const { count: formsFilled } = await supabase
        .from('form_fills')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get total ratings given
      const { count: totalRatings } = await supabase
        .from('form_fills')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('rating', 'is', null);

      // Get badges
      const { data: badgeData } = await supabase
        .from('user_badges')
        .select('badge_name')
        .eq('user_id', userId);

      return {
        formsPosted: formsPosted || 0,
        formsFilled: formsFilled || 0,
        totalRatings: totalRatings || 0,
        badges: badgeData?.map(b => b.badge_name) || []
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        formsPosted: 0,
        formsFilled: 0,
        totalRatings: 0,
        badges: []
      };
    }
  };

  const fetchUserProfile = async (userId: string, userEmail: string): Promise<User | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // If profile doesn't exist, create it
      if (error && error.code === 'PGRST116') {
        console.log('Profile not found, creating new profile...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              name: userEmail.split('@')[0] // Use email prefix as default name
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }
        profile = newProfile;
      } else if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      console.log('User profile fetched:', profile);
      
      // Fetch user stats
      const stats = await fetchUserStats(userId);
      
      return {
        id: profile.id,
        email: userEmail,
        name: profile.name,
        ...stats
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      const userProfile = await fetchUserProfile(session.user.id, session.user.email || '');
      setUser(userProfile);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login process...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error from Supabase:', error);
        return { error: error.message };
      }

      console.log('Login successful');
      return {};
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          },
          emailRedirectTo: `${window.location.origin}/email-confirmed`
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  useEffect(() => {
    console.log('Setting up auth state management...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('Initial session:', initialSession);
      setSession(initialSession);
      setLoading(false);
      
      if (initialSession?.user) {
        // Fetch user profile after setting loading to false
        fetchUserProfile(initialSession.user.id, initialSession.user.email || '').then((userProfile) => {
          console.log('Initial user profile loaded:', userProfile);
          setUser(userProfile);
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession);
        setSession(currentSession);
        
        if (currentSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Use setTimeout to prevent blocking
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id, currentSession.user.email || '').then((userProfile) => {
              console.log('User profile loaded after auth change:', userProfile);
              setUser(userProfile);
            });
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    loading,
    refreshUser,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

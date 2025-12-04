import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { getUserProfile } from '../supabase/api';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  checkUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser должен использоваться внутри UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        setUser(currentUser);
        // Получаем профиль пользователя
        const profileResult = await getUserProfile(currentUser.id);
        if (profileResult.success && profileResult.profile) {
          setProfile(profileResult.profile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Ошибка проверки пользователя:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Проверяем текущую сессию
    checkUser();

    // Подписываемся на изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profileResult = await getUserProfile(session.user.id);
          if (profileResult.success && profileResult.profile) {
            setProfile(profileResult.profile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value: UserContextType = {
    user,
    profile,
    loading,
    checkUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

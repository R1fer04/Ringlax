import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';


interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  user?: User;
  profile?: any;
}

// Функция регистрации пользователя
export const registerUser = async (
  email: string, 
  password: string, 
  username: string
): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Функция входа пользователя
export const loginUser = async (
  email: string, 
  password: string
): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Проверяем, является ли ошибка связанной с неподтвержденной почтой
      if (error.message.toLowerCase().includes('email not confirmed') || 
          error.message.toLowerCase().includes('email confirmation')) {
        return { success: false, error: 'EMAIL_NOT_CONFIRMED' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Функция выхода
export const logoutUser = async (): Promise<ApiResponse> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Функция получения текущего пользователя
export const getCurrentUser = async (): Promise<ApiResponse> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: user || undefined };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Функция получения профиля пользователя
export const getUserProfile = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Функция восстановления пароля
export const resetPassword = async (email: string): Promise<ApiResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#reset-password`
    });

    if (error) {
      // Переводим ошибки на русский
      let errorMessage = error.message;
      
      if (errorMessage.toLowerCase().includes('security purposes') || 
          errorMessage.toLowerCase().includes('only request this after') ||
          errorMessage.toLowerCase().includes('seconds')) {
        errorMessage = 'В целях безопасности повторный запрос возможен через 60 секунд';
      } else if (errorMessage.toLowerCase().includes('email rate limit')) {
        errorMessage = 'Слишком много запросов. Попробуйте позже';
      } else if (errorMessage.toLowerCase().includes('user not found')) {
        errorMessage = 'Пользователь с таким email не найден';
      } else if (errorMessage.toLowerCase().includes('invalid email')) {
        errorMessage = 'Неверный формат email';
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Произошла ошибка при отправке письма' };
  }
};

// Функция обновления пароля
export const updatePassword = async (newPassword: string): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Функция обновления профиля пользователя
export const updateUserProfile = async (
  userId: string, 
  updates: Record<string, any>
): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

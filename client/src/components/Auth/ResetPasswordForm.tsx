import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';

interface ResetPasswordFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResetPasswordForm({ onClose, onSuccess }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>('');
  const newPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newPasswordRef.current) {
      newPasswordRef.current.focus();
    }
  }, []);

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setResetLoading(true);
    setResetError('');

    // Валидация
    if (newPassword.length < 6) {
      setResetError('Пароль должен содержать минимум 6 символов');
      setResetLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Пароли не совпадают');
      setResetLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        let errorMessage = error.message || 'Ошибка при смене пароля';
        
        if (errorMessage.toLowerCase().includes('same as the old password')) {
          errorMessage = 'Новый пароль не может совпадать со старым';
        }
        
        setResetError(errorMessage);
      } else {
        // Успешная смена пароля
        if (onSuccess) {
          onSuccess();
        }
        
        // Выходим из системы через секунду
        setTimeout(async () => {
          await supabase.auth.signOut();
        }, 1000);
      }
    } catch (err) {
      setResetError('Произошла ошибка при смене пароля');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="reset-backdrop">
      <div className="reset-box">
        <h2>Смена пароля</h2>
        <p>Создайте новый пароль</p>
        <form className="reset-form" onSubmit={handleResetPasswordSubmit}>
          <label>НОВЫЙ ПАРОЛЬ</label>
          <input
            type="password"
            value={newPassword}
            ref={newPasswordRef}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setResetError('');
            }}
            placeholder="Введите новый пароль"
            title=""
            required
            disabled={resetLoading}
          />
          <label>ПОДТВЕРДИТЕ ПАРОЛЬ</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setResetError('');
            }}
            placeholder="Повторите новый пароль"
            title=""
            required
            disabled={resetLoading}
          />
          {resetError && <div className="error-message">{resetError}</div>}
          <button type="submit" className="reset-btn" disabled={resetLoading}>
            {resetLoading ? 'Изменение...' : 'Восстановить пароль'}
          </button>
          <div className="reset-footer">
            <span>Вспомнили пароль?</span>
            <button 
              type="button" 
              className="reset-cancel" 
              onClick={onClose} 
              disabled={resetLoading}
            >
              Войти в аккаунт
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

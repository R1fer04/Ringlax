import React, { useState, useRef, useEffect } from 'react';
import { resetPassword } from '../../supabase/api';

interface ForgotPasswordFormProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function ForgotPasswordForm({ onClose, onSuccess }: ForgotPasswordFormProps) {
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [forgotError, setForgotError] = useState<string>('');
  const forgotEmailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (forgotEmailRef.current) {
      forgotEmailRef.current.focus();
    }
  }, []);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setForgotError('');
    
    try {
      const result = await resetPassword(forgotEmail);
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(forgotEmail);
        }
      } else {
        setForgotError(result.error || 'Ошибка отправки письма');
      }
    } catch (err) {
      setForgotError('Произошла ошибка при отправке письма');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-backdrop">
      <div className="forgot-box">
        <h2>Забыли пароль?</h2>
        <p>Не страшно, мы поможем его восстановить</p>
        <form className="forgot-form" onSubmit={handleForgotPasswordSubmit}>
          <label>ЭЛЕКТРОННАЯ ПОЧТА</label>
          <input
            type="email"
            name="email"
            value={forgotEmail}
            ref={forgotEmailRef}
            onChange={(e) => {
              setForgotEmail(e.target.value);
              setForgotError('');
            }}
            placeholder="Введите свою электронную почту"
            title=""
            required
            disabled={loading}
          />
          {forgotError && <div className="error-message">{forgotError}</div>}
          <button type="submit" className="forgot-btn" disabled={loading}>
            {loading ? 'Отправка...' : 'Восстановить пароль'}
          </button>
          <div className="forgot-footer">
            <span>Вспомнили пароль?</span>
            <button 
              type="button" 
              className="forgot-cancel" 
              onClick={onClose} 
              disabled={loading}
            >
              Войти в аккаунт
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

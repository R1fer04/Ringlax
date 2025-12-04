import React, { useState, useRef, useEffect } from 'react';
import './LoginPage.css';
import logo from '../../assets/images/logo.png';
import { loginUser } from '../../supabase/api';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../supabase/supabaseClient';
import ResetPasswordForm from './ResetPasswordForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { User } from '@supabase/supabase-js';

interface LoginPageProps {
  onLogin?: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { checkUser } = useUser();
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const logoRef = useRef<HTMLDivElement>(null);

  const particles = Array.from({ length: 20 }, (_, i) => i);

  useEffect(() => {
    const preventCopy = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const preventContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const logoElement = logoRef.current;
    if (logoElement) {
      logoElement.addEventListener('copy', preventCopy);
      logoElement.addEventListener('cut', preventCopy);
      logoElement.addEventListener('contextmenu', preventContextMenu);
      logoElement.addEventListener('selectstart', preventCopy);
    }

    return () => {
      if (logoElement) {
        logoElement.removeEventListener('copy', preventCopy);
        logoElement.removeEventListener('cut', preventCopy);
        logoElement.removeEventListener('contextmenu', preventContextMenu);
        logoElement.removeEventListener('selectstart', preventCopy);
      }
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#reset-password' || hash.includes('type=recovery')) {
      setShowResetPassword(true);
      setShowForgotPassword(false);
      setShowRegister(false);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
        setShowForgotPassword(false);
        setShowRegister(false);
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(f => ({ ...f, [name]: value }));
    setLoginError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      const result = await loginUser(loginForm.email, loginForm.password);
      
      if (result.success) {
        await checkUser();
        if (onLogin && result.data?.user) {
          onLogin(result.data.user);
        }
      } else {
        if (result.error === 'EMAIL_NOT_CONFIRMED') {
          setLoginError('Подтвердите ваши данные на почте для входа');
        } else {
          setLoginError('Введены неверные данные');
        }
      }
    } catch (err) {
      setLoginError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = (email: string) => {
    setShowRegister(false);
    setLoginForm({ email, password: '' });
    setLoginError('success:Регистрация успешна! Вам отправлено письмо на почту для подтверждения данных.');
  };

  const handleForgotPasswordSuccess = (email: string) => {
    setShowForgotPassword(false);
    setLoginError(`success:Письмо для восстановления пароля отправлено на ${email}`);
  };

  const handleResetPasswordClose = () => {
    setShowResetPassword(false);
  };

  const handleResetPasswordSuccess = () => {
    setShowResetPassword(false);
    setLoginError('success:Пароль успешно изменен! Теперь войдите с новым паролем.');
  };

  return (
    <div className="login-page">
      <div className="logo-container" ref={logoRef}>
        <img src={logo} alt="Logo" className="logo-image" />
        <span className="logo-text"></span>
      </div>

      <div className="particles">
        {particles.map(i => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          ></div>
        ))}
      </div>

      {showResetPassword && (
        <ResetPasswordForm 
          onClose={handleResetPasswordClose}
          onSuccess={handleResetPasswordSuccess}
        />
      )}

      {showForgotPassword && (
        <ForgotPasswordForm 
          onClose={() => setShowForgotPassword(false)}
          onSuccess={handleForgotPasswordSuccess}
        />
      )}

      {showRegister && (
        <RegisterForm 
          onClose={() => setShowRegister(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {!showRegister && !showForgotPassword && !showResetPassword && (
        <div className="login-box">
          <div className="login-content">
            <h2>Добро пожаловать! <span className="emoji-wink">😉</span></h2>
            <p>Ну что, пообщаемся?</p>
            <form onSubmit={handleLoginSubmit}>
              <label>Электронная почта</label>
              <input
                type="text"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="Введите свою электронную почту"
                title=""
                required
                autoFocus
                disabled={loading}
              />
              <label>Пароль</label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Введите свой пароль"
                title=""
                required
                disabled={loading}
              />
              {loginError && (
                <div className={loginError.startsWith('success:') ? 'success-message' : 'error-message'}>
                  {loginError.replace('success:', '')}
                </div>
              )}
              <div className="forgot-container">
                <button 
                  type="button" 
                  className="forgot-link" 
                  onClick={() => {
                    setShowForgotPassword(true);
                    setLoginError('');
                  }}
                  disabled={loading}
                >
                  Забыли пароль?
                </button>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Вход...' : 'Вход'}
              </button>
            </form>
            <div className="login-footer">
              Нет учётной записи?{' '}
              <button 
                type="button" 
                className="link-button" 
                onClick={() => {
                  setShowRegister(true);
                  setLoginError('');
                }}
                disabled={loading}
              >
                Создать аккаунт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { registerUser } from '../../supabase/api';

interface RegisterFormProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function RegisterForm({ onClose, onSuccess }: RegisterFormProps) {
  const [regForm, setRegForm] = useState({ email: '', username: '', password: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [regError, setRegError] = useState<string>('');
  const regEmailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (regEmailRef.current) {
      regEmailRef.current.focus();
    }
  }, []);

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegForm(f => ({ ...f, [name]: value }));
    setRegError('');
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRegError('');

    if (regForm.password.length < 6) {
      setRegError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    if (!regForm.username.trim()) {
      setRegError('Введите имя пользователя');
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser(
        regForm.email, 
        regForm.password, 
        regForm.username
      );
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(regForm.email);
        }
      } else {
        setRegError(result.error || 'Ошибка регистрации');
      }
    } catch (err) {
      setRegError('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-backdrop">
      <div className="register-box">
        <h2>Создать учётную запись</h2>
        <p>Давай сделаем</p>
        <form className="register-form" onSubmit={handleRegSubmit}>
          <label>Электронная почта</label>
          <input
            type="email"
            name="email"
            value={regForm.email}
            ref={regEmailRef}
            onChange={handleRegChange}
            placeholder="Введите свою электронную почту"
            title=""
            required
            disabled={loading}
          />
          <label>ИМЯ ПОЛЬЗОВАТЕЛЯ</label>
          <input
            type="text"
            name="username"
            value={regForm.username}
            onChange={handleRegChange}
            placeholder="Введите своё имя пользователя"
            title=""
            required
            disabled={loading}
          />
          <label>ПАРОЛЬ</label>
          <input
            type="password"
            name="password"
            value={regForm.password}
            onChange={handleRegChange}
            placeholder="Введите свой пароль (минимум 6 символов)"
            title=""
            required
            disabled={loading}
          />
          {regError && <div className="error-message">{regError}</div>}
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Создание...' : 'Создать учётную запись'}
          </button>
          <div className="register-footer">
            <span>Уже зарегистрированы?</span>
            <button 
              type="button" 
              className="register-cancel" 
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

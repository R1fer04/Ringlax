import React from 'react';
import { UserProvider } from './context/UserContext';
import LoginPage from './components/Auth/LoginPage';

function App() {
  return (
    <UserProvider>
      <LoginPage />
    </UserProvider>
  );
}

export default App;

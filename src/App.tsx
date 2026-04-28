/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

interface User {
  email: string;
  name: string;
}

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLikingAuth, setIsLikingAuth] = React.useState(false);

  // Persistence check (Mock)
  React.useEffect(() => {
    const savedUser = localStorage.getItem('jobvault_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsLikingAuth(false);
    localStorage.setItem('jobvault_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLikingAuth(false);
    localStorage.removeItem('jobvault_user');
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (isLikingAuth) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onBackToHome={() => setIsLikingAuth(false)} 
      />
    );
  }

  return <LandingPage onStart={() => setIsLikingAuth(true)} />;
}

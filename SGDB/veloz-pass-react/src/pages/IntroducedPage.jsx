import React, { useState } from 'react';
import { Login } from '../components/Auth/Login';
import { Register } from '../components/Auth/Register';
import '../styles/Auth.css';

export const IntroductionPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {isLoginView ? (
          <Login onSwitchToRegister={toggleView} />
        ) : (
          <Register onSwitchToLogin={toggleView} />
        )}
      </div>
    </div>
  );
};
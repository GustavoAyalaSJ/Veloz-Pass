import React, { useState } from 'react';

import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';

import { Login } from '../components/Auth/Login';
import { Register } from '../components/Auth/Register';

import { Hero } from '../components/Hero/Hero';

import { TermosModal } from '../components/Modals/TermosModal';
import { SuportModal } from '../components/Auth/SuportModal';

import '../styles/Auth.css';

export const IntroducedPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  const [showTerms, setShowTerms] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const toggleView = () => {
    setIsLoginView((prev) => !prev);
  };

  return (
    <div className="background-container">
      <Header
        onOpenTerms={() => setShowTerms(true)}
        onOpenSupport={() => setShowSupport(true)}
      />

      <main className="main-content">
        <Hero />

        <div className="auth-card">
          {isLoginView ? (
            <Login onSwitchToRegister={toggleView} />
          ) : (
            <Register onSwitchToLogin={toggleView} />
          )}
        </div>
      </main>

      <Footer />

      {showTerms && <TermosModal onClose={() => setShowTerms(false)} />}
      {showSupport && <SuportModal onClose={() => setShowSupport(false)} />}
    </div>
  );
};

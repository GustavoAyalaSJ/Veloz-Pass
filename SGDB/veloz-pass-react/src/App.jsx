import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CarteiraPage } from './pages/CarteiraPage';
import { RecargaPage } from './pages/RecargaPage';
import { HistoricoPage } from './pages/HistoricoPage';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/introduction" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/carteira_digital" element={<CarteiraPage />} />
              <Route path="/recarga" element={<RecargaPage />} />
              <Route path="/historico" element={<HistoricoPage />} />
            </Route>

            {/* Rota padrão */}
            <Route path="/" element={<Navigate to="/introduction" />} />
            <Route path="*" element={<Navigate to="/introduction" />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

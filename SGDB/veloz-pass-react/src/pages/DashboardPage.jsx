import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { paymentService } from '../services/paymentService';
import { formatCurrency } from '../utils/formatters';

export const DashboardPage = () => {
  const { user, token, csrfToken } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWalletData = async () => {
      if (!user?.id) return;

      try {
        const data = await paymentService.obterCarteira(user.id, token, csrfToken);
        setWalletData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, [user?.id, token, csrfToken]);

  return (
    <div className="dashboard-page">
      <h1>Bem-vindo, {user?.nome}!</h1>

      {loading && <p>Carregando...</p>}
      {error && <p className="error">{error}</p>}

      {walletData && (
        <div className="wallet-info">
          <div className="wallet-card">
            <h2>Saldo</h2>
            <p className="balance">{formatCurrency(walletData.saldo)}</p>
          </div>

          <div className="wallet-card">
            <h2>Chave PIX</h2>
            <p>{walletData.chavePix}</p>
          </div>
        </div>
      )}
    </div>
  );
};

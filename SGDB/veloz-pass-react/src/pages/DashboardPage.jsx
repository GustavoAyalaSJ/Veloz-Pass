import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import WalletCard from '../components/Dashboard/WalletCard';
import PoliticasModal from '../components/Modals/PoliticasModal';
import { formatCurrency } from '../utils/formatters';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { request, loading, error } = useApi();
  const [walletData, setWalletData] = useState(null);
  const [isPoliticasModalOpen, setIsPoliticasModalOpen] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    const loadWalletData = async () => {
      if (!userId) return;

      const { success, data } = await request(`/api/payments/wallet-data/${userId}`);
      if (success && data) {
        setWalletData(data);
      } else {
        console.error("Erro ao carregar dados da carteira:", error);
      }
    };

    loadWalletData();
  }, [userId, request, error]);

  const openPoliticasModal = () => setIsPoliticasModalOpen(true);
  const closePoliticasModal = () => setIsPoliticasModalOpen(false);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Bem-vindo, {user?.nome?.split(' ')[0]}!</h1>
        <p>Código Único: {user?.cod_identificador || '---'}</p>
        <button onClick={openPoliticasModal} className="btn-politicas-header">
          Termos de Política
        </button>
      </div>

      {loading && <p>Carregando dados da carteira...</p>}
      {error && <p className="error-message">Erro: {error}</p>}

      {walletData && (
        <WalletCard
          saldo={walletData.saldo || 0}
          chavePix={walletData.chavePix || 'Não disponível'}
        />
      )}

      <PoliticasModal isOpen={isPoliticasModalOpen} onClose={closePoliticasModal} />
    </div>
  );
};
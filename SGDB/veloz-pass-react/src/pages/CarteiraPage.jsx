import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';
import CreditForm from '../../components/Carteira/CreditForm';
import { toast } from 'react-toastify';
import '../styles/Carteira.css';

export const CarteiraPage = () => {
  const { user } = useAuth();
  const { request, loading, error } = useApi();
  const [saldo, setSaldo] = useState(0);
  const [chavePix, setChavePix] = useState('');
  const [isCreditFormOpen, setIsCreditFormOpen] = useState(false);

  const userId = user?.id;

  const fetchWalletData = useCallback(async () => {
    if (!userId) return;

    const { success, data, error: apiError } = await request(`/api/payments/wallet-data/${userId}`);

    if (success && data) {
      setSaldo(parseFloat(data.saldo) || 0);
      setChavePix(data.chavePix || 'Não disponível');
    } else {
      toast.error(apiError || 'Erro ao carregar dados da carteira.');
    }
  }, [userId, request]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleCreditAdded = () => {
    setIsCreditFormOpen(false);
    fetchWalletData();
  };

  return (
    <div className="carteira-page">
      <h1>Carteira Digital</h1>

      {loading && <p>Carregando dados da carteira...</p>}
      {error && <p className="error-message">Erro: {error}</p>}

      {!loading && !error && (
        <div className="wallet-summary">
          <div className="saldo-display">
            <h2>Saldo Atual:</h2>
            <p className="balance-value">{formatCurrency(saldo)}</p>
          </div>
          <div className="pix-display">
            <h2>Sua Chave PIX:</h2>
            <p className="pix-value">{chavePix}</p>
          </div>
          <button className="btn-add-credit" onClick={() => setIsCreditFormOpen(true)}>
            Adicionar Crédito
          </button>
        </div>
      )}

      {isCreditFormOpen && (
        <CreditForm onCreditAdded={handleCreditAdded} />
      )}
    </div>
  );
};
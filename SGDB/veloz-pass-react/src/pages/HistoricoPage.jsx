import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import TransactionTable from '../../components/Historico/TransactionTable';
import { toast } from 'react-toastify';

function normalizarBuscar(txt) {
  return (txt || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_]/g, "")
    .trim();
}

export const HistoricoPage = () => {
  const { user } = useAuth();
  const { request, loading, error } = useApi();
  const [transactions, setTransactions] = useState([]);
  const [fullHistory, setFullHistory] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  const userId = user?.id;

  const fetchHistory = useCallback(async () => {
    if (!userId) return;

    const { success, data, error: apiError } = await request(`/api/payments/historico-geral/${userId}`);

    if (success && data && data.historico) {
      const filteredData = data.historico.filter(
        (mov) => mov.situacao === 'Concluído' || mov.situacao === 'Recusada'
      );
      setFullHistory(filteredData);
      setTransactions(filteredData);
    } else {
      toast.error(apiError || 'Erro ao carregar histórico.');
      setTransactions([]);
      setFullHistory([]);
    }
  }, [userId, request]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const applyFilters = () => {
      const valTipoMov = normalizarBuscar(filterType);
      const valMetodo = normalizarBuscar(filterMethod);

      const filtered = fullHistory.filter((mov) => {
        const tipoBanco = normalizarBuscar(mov.tipo_movimentacao);
        let metodoBanco = normalizarBuscar(mov.metodo_pagamento);
        if (metodoBanco === 'carteiradigital') metodoBanco = 'carteira_digital';

        const bateTipo = !valTipoMov || tipoBanco.includes(valTipoMov);
        const bateMetodo = !valMetodo || metodoBanco.includes(valMetodo.replace(/_/g, ""));

        return bateTipo && bateMetodo;
      });
      setTransactions(filtered);
    };

    applyFilters();
  }, [filterType, filterMethod, fullHistory]);

  const handlePrint = (protocolo) => {
    toast.info(`Funcionalidade de impressão para o protocolo ${protocolo} em desenvolvimento.`);
    // Aqui você implementaria a lógica real de impressão, talvez abrindo um PDF ou uma nova janela.
  };

  return (
    <div className="historico-page">
      <h1>Histórico de Transações</h1>

      <div className="filters-container">
        <div className="form-group">
          <label htmlFor="filtro-tipo">Tipo de Movimentação:</label>
          <select
            id="filtro-tipo"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="recarga">Recarga</option>
            <option value="pagamento">Pagamento</option>
            <option value="carteira_digital">Carteira Digital</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filtro-realizado-no">Realizado Via:</label>
          <select
            id="filtro-realizado-no"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pix">PIX</option>
            <option value="credito">Crédito</option>
            <option value="debito">Débito</option>
            <option value="carteira_digital">Carteira Digital</option>
          </select>
        </div>
      </div>

      {loading && <p>Carregando histórico...</p>}
      {error && <p className="error-message">Erro: {error}</p>}

      {!loading && !error && (
        <TransactionTable transactions={transactions} onPrint={handlePrint} />
      )}
    </div>
  );
};
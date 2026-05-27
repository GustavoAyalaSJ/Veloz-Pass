import React from 'react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

function TransactionTable({ transactions, onPrint }) {
  if (!transactions || transactions.length === 0) {
    return <div className="empty-table-message">Nenhum registro encontrado.</div>;
  }

  return (
    <div className="tabela-historico">
      <div className="tabela-cabecalho">
        <span className="col-protocolo">Protocolo</span>
        <span className="col-origem">Tipo</span>
        <span className="col-metodo">Método</span>
        <span className="col-valor">Valor</span>
        <span className="col-acao">Ação</span>
      </div>
      <div className="tabela-corpoInfo">
        {transactions.map((mov) => {
          const valorFormatado = formatCurrency(mov.valor || 0);
          const tipoExibicao = mov.tipo_movimentacao || 'Carteira Digital';
          const metodoExibicao = (mov.metodo_pagamento || 'PIX').toUpperCase().replace(/_/g, ' ');
          const podeImprimir = mov.situacao === 'Concluído' || mov.situacao === 'Recusada';

          return (
            <div key={mov.n_protocolo || mov.id} className={`tabela-linha-item ${mov.situacao === 'Recusada' ? 'linha-recusada' : ''}`}>
              <span className="col-protocolo">{mov.n_protocolo || '---'}</span>
              <span className="col-origem">{tipoExibicao}</span>
              <span className="col-metodo">{metodoExibicao}</span>
              <span className={`col-valor ${mov.situacao === 'Recusada' ? 'valor-recusado' : ''}`}>{valorFormatado}</span>
              <span className="col-acao">
                {podeImprimir && (
                  <button className="btn-imprimir" onClick={() => onPrint(mov.n_protocolo)}>
                    IMPRIMIR
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TransactionTable;
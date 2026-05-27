import React from 'react';
import { formatCurrency } from '../../utils/formatters';

function WalletCard({ saldo, chavePix }) {
  return (
    <div className="wallet-info">
      <div className="wallet-card">
        <h2>Saldo</h2>
        <p className="balance">{formatCurrency(saldo)}</p>
      </div>

      <div className="wallet-card">
        <h2>Chave PIX</h2>
        <p>{chavePix || 'Não disponível'}</p>
      </div>
    </div>
  );
}

export default WalletCard;
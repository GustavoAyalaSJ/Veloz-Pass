import React from 'react';
import './ProcessModal.css';

export const ProcessModal = ({ status = 'processing', onClose, message = '' }) => {
  const statusConfig = {
    success: {
      title: 'Sucesso!',
      message: message || 'Operação concluída com sucesso.',
      icon: '✓',
      className: 'success',
    },
    rejected: {
      title: 'Erro',
      message: message || 'Ocorreu um erro ao processar sua solicitação.',
      icon: '✕',
      className: 'rejected',
    },
    'under-review': {
      title: 'Em Revisão',
      message: message || 'Sua solicitação está sendo analisada.',
      icon: '⏳',
      className: 'review',
    },
    processing: {
      title: 'Processando',
      message: message || 'Por favor, aguarde...',
      icon: '⟳',
      className: 'processing',
    },
  };

  const config = statusConfig[status] || statusConfig.processing;

  return (
    <div className="process-modal-overlay active">
      <div className="process-modal-box">
        <div className={`process-modal-content ${config.className}`}>
          <div className="modal-icon">{config.icon}</div>
          <h3>{config.title}</h3>
          <p>{config.message}</p>
          <button onClick={onClose} className="btn-close">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

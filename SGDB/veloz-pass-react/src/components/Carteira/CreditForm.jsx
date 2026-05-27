import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { formatCurrency, getSafeNumericValue, formatCardNumber, formatCardDate } from '../../utils/formatters';
import { validateCardDate, validateCardNumberLuhn } from '../../utils/validators';
import { toast } from 'react-toastify';
import ProcessModal from '../Modals/ProcessModal';

const metodosComCartaoTexto = ['debito', 'credito', 'internacional'];

function CreditForm({ onCreditAdded }) {
  const { user } = useAuth();
  const { request, loading } = useApi();

  const [valorParaInserir, setValorParaInserir] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardValid, setCardValid] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isModalValorOpen, setIsModalValorOpen] = useState(true);
  const [isModalPagamentoOpen, setIsModalPagamentoOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processModalStatus, setProcessModalStatus] = useState(null);
  const [processModalType, setProcessModalType] = useState(null);

  const userId = user?.id;

  const handleValorOptionClick = (value) => {
    setValorParaInserir(value);
  };

  const handleCustomValorChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = getSafeNumericValue(rawValue);
    setValorParaInserir(numericValue);
  };

  const handleNextStep = () => {
    if (valorParaInserir < 5) {
      toast.error('Valor mínimo requisitado: R$ 5,00.');
      return;
    }
    setIsModalValorOpen(false);
    setIsModalPagamentoOpen(true);
  };

  const handleBackToValueSelection = () => {
    setIsModalPagamentoOpen(false);
    setIsModalValorOpen(true);
  };

  const handleCancel = () => {
    setIsModalValorOpen(false);
    setIsModalPagamentoOpen(false);
    setValorParaInserir(0);
    setMetodoPagamento('');
    setCardNum('');
    setCardValid('');
    setCardCvv('');
  };

  const handleCardNumChange = (e) => {
    setCardNum(formatCardNumber(e.target.value));
  };

  const handleCardValidChange = (e) => {
    setCardValid(formatCardDate(e.target.value));
  };

  const handleFinalizarCredito = async () => {
    if (valorParaInserir <= 0) {
      toast.error('Por favor, informe um valor para inserir.');
      return;
    }
    if (valorParaInserir > 5000) {
      toast.error('Valor incabível para recarga! Tente colocar um valor menor.');
      return;
    }

    const metodoNormalizado = metodoPagamento.toLowerCase();

    if (metodosComCartaoTexto.includes(metodoNormalizado)) {
      if (!validateCardNumberLuhn(cardNum.replace(/\s/g, ''))) {
        toast.error('Número do cartão inválido.');
        return;
      }
      if (!validateCardDate(cardValid)) {
        toast.error('Data de validade do cartão inválida.');
        return;
      }
      if (cardCvv.length < 3) {
        toast.error('CVV inválido.');
        return;
      }
    }

    setIsProcessing(true);
    setProcessModalType('carteira');

    const payload = {
      valor: valorParaInserir,
      metodo: metodoPagamento.toUpperCase().replace(/-/g, '_'),
      numCartao: cardNum.replace(/\s/g, ''), // Enviar sem espaços
      idBandeira: null,
      origem: 'Carteira Digital',
    };

    const { success, data, error: apiError } = await request('/api/payments/add-credit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (success) {
      let modalStatus = 'rejected';
      const situacaoNormalizada = data.situacao?.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (situacaoNormalizada?.includes('Concluido')) {
        modalStatus = 'success';
      } else if (situacaoNormalizada?.includes('Em_Revisao')) {
        modalStatus = 'under-review';
      } else if (situacaoNormalizada?.includes('Recusada') || !data.success) {
        modalStatus = 'rejected';
      }
      setProcessModalStatus(modalStatus);
      onCreditAdded();
    } else {
      toast.error(apiError || 'Erro ao adicionar crédito.');
      setProcessModalStatus('rejected');
    }
  };

  const handleProcessModalClose = () => {
    setIsProcessing(false);
    setProcessModalStatus(null);
    handleCancel();
  };

  const renderPaymentMethodFields = () => {
    const metodoNormalizado = metodoPagamento.toLowerCase();

    if (metodoNormalizado === 'pix') {
      return (
        <div id="container-pix" className="payment-method-container">
          <div className="pix-container">
            <div className="qr-placeholder">Placeholder QR Code</div>
            <div className="pix-key-section">
              <p className="pix-key-label">Chave PIX:</p>
              <div className="pix-key-content">
                <span className="pix-key-value">placeholder@test01</span>
                <button className="pix-copy-btn" aria-label="Copiar chave PIX" title="Copiar">
                  <i className="bi bi-copy"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (metodosComCartaoTexto.includes(metodoNormalizado)) {
      return (
        <div id="container-cartao" className="payment-method-container">
          <div className="card-inputs-row">
            <label className="num-card" htmlFor="card-num">Número do Cartão</label>
            <input
              type="text"
              id="card-num"
              placeholder="0000 0000 0000 0000"
              value={cardNum}
              onChange={handleCardNumChange}
              maxLength="19"
            />

            <div className="row-cartao">
              <label className="date-card" htmlFor="card-valid">Data de Validade</label>
              <input
                type="text"
                id="card-valid"
                placeholder="MM/AA"
                value={cardValid}
                onChange={handleCardValidChange}
                maxLength="5"
              />

              <label className="cvv-card" htmlFor="card-cvv">CVV</label>
              <input
                type="text"
                id="card-cvv"
                placeholder="000"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                maxLength="3"
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {isModalValorOpen && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <h2>Adicionar Crédito</h2>
            <p>Selecione ou digite o valor:</p>
            <div className="opt-valores-container">
              {[10, 20, 50, 100].map(val => (
                <div
                  key={val}
                  className={`opt-valor ${valorParaInserir === val ? 'active' : ''}`}
                  onClick={() => handleValorOptionClick(val)}
                >
                  R$ {val},00
                </div>
              ))}
            </div>
            <input
              type="text"
              id="valor-personalizado"
              placeholder="Outro valor"
              value={valorParaInserir > 0 && ![10, 20, 50, 100].includes(valorParaInserir) ? formatCurrency(valorParaInserir) : ''}
              onChange={handleCustomValorChange}
              inputMode="numeric"
            />
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={handleCancel}>Cancelar</button>
              <button className="btn-proximo" onClick={handleNextStep}>Próximo</button>
            </div>
          </div>
        </div>
      )}

      {isModalPagamentoOpen && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <h2>Confirmar Valor: <span id="valor-confirmado">{formatCurrency(valorParaInserir)}</span></h2>
            <p>Selecione o método de pagamento:</p>
            <div className="select-wrapper-modal">
              <select
                id="select-pagamento"
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="pix">PIX</option>
                <option value="credito">Cartão de Crédito</option>
                <option value="debito">Cartão de Débito</option>
                <option value="internacional">Cartão Internacional</option>
              </select>
            </div>

            {renderPaymentMethodFields()}

            <div className="modal-actions">
              <button className="btn-retornar" onClick={handleBackToValueSelection}>Retornar</button>
              <button className="btn-finalizar" onClick={handleFinalizarCredito} disabled={loading || !metodoPagamento}>
                {loading ? 'Processando...' : 'Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && processModalStatus && (
        <ProcessModal
          status={processModalStatus}
          type={processModalType}
          onClose={handleProcessModalClose}
        />
      )}
    </>
  );
}

export default CreditForm;
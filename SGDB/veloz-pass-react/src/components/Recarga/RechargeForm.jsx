import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { formatCurrency, getSafeNumericValue, formatCardNumber, formatCardDate } from '../../utils/formatters';
import { validateCardDate, validateCardNumberLuhn } from '../../utils/validators';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ProcessModal } from '../Modals/ProcessModal';

const mapaBandeiras = {
    1: "Visa.webp",
    2: "Mastercard.webp",
    3: "Hipercard.webp",
    4: "Elo.webp",
    5: "Amex.webp"
};
const imgDefault = "/Assets/Cartão-ideal.webp";
const pastaBandeiras = "/Assets/Bandeira/";

function RechargeForm() {
    const { user, token, csrfToken } = useAuth();
    const { request, loading, error } = useApi();
    const navigate = useNavigate();

    const [valorRecarga, setValorRecarga] = useState('');
    const [metodoPagamento, setMetodoPagamento] = useState('carteira_digital');
    const [numCartaoTransporte, setNumCartaoTransporte] = useState('');
    const [confirmNumCartaoTransporte, setConfirmNumCartaoTransporte] = useState('');
    const [cardNum, setCardNum] = useState('');
    const [cardValid, setCardValid] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [saldoCarteira, setSaldoCarteira] = useState(0);
    const [idBandeiraSelecionada, setIdBandeiraSelecionada] = useState(null);
    const [displayCardImage, setDisplayCardImage] = useState(imgDefault);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processModalStatus, setProcessModalStatus] = useState(null);
    const [processModalType, setProcessModalType] = useState(null);

    const userId = user?.id;

    useEffect(() => {
        const loadWalletData = async () => {
            if (!userId) return;
            const { success, data } = await request(`/api/payments/wallet-data/${userId}`);
            if (success && data && data.saldo !== undefined) {
                setSaldoCarteira(parseFloat(data.saldo) || 0);
            }
        };
        loadWalletData();
    }, [userId, request]);

    const getPaymentOptions = useCallback(() => {
        const options = [
            { value: 'pix', label: 'PIX' },
            { value: 'credito', label: 'Cartão de Crédito' },
            { value: 'debito', label: 'Cartão de Débito' },
            { value: 'internacional', label: 'Cartão Internacional' },
            { value: 'carteira_digital', label: `Carteira Digital (Saldo: ${formatCurrency(saldoCarteira)})` }
        ];
        return options;
    }, [saldoCarteira]);

    useEffect(() => {
        const valorNumerico = getSafeNumericValue(valorRecarga);
        if (metodoPagamento === 'carteira_digital' && valorNumerico > saldoCarteira) {
            toast.warn('Saldo insuficiente na carteira digital.');
        }
    }, [valorRecarga, metodoPagamento, saldoCarteira]);

    useEffect(() => {
        const cleanCardNum = cardNum.replace(/\D/g, '');
        if (cleanCardNum.length > 0) {
            const primeiroDigito = parseInt(cleanCardNum[0]);
            const bandeira = mapaBandeiras[primeiroDigito];
            if (bandeira) {
                setDisplayCardImage(`${pastaBandeiras}${bandeira}`);
                setIdBandeiraSelecionada(primeiroDigito);
            } else {
                setDisplayCardImage(imgDefault);
                setIdBandeiraSelecionada(null);
            }
        } else {
            setDisplayCardImage(imgDefault);
            setIdBandeiraSelecionada(null);
        }
    }, [cardNum]);

    const handleValorRecargaChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            setValorRecarga('');
            return;
        }
        value = (parseFloat(value) / 100).toFixed(2);
        setValorRecarga(value);
    };

    const handleCardNumChange = (e) => {
        setCardNum(formatCardNumber(e.target.value));
    };

    const handleCardValidChange = (e) => {
        setCardValid(formatCardDate(e.target.value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setProcessModalType('recarga');

        const valorNumerico = getSafeNumericValue(valorRecarga);

        if (valorNumerico <= 0) {
            toast.error('O valor da recarga deve ser maior que zero.');
            setIsProcessing(false);
            setProcessModalStatus('rejected');
            return;
        }

        if (metodoPagamento.includes('cartao') || metodoPagamento.includes('credito') || metodoPagamento.includes('debito') || metodoPagamento.includes('internacional')) {
            if (!validateCardNumberLuhn(cardNum.replace(/\s/g, ''))) {
                toast.error('Número do cartão inválido.');
                setIsProcessing(false);
                setProcessModalStatus('rejected');
                return;
            }
            if (!validateCardDate(cardValid)) {
                toast.error('Data de validade do cartão inválida.');
                setIsProcessing(false);
                setProcessModalStatus('rejected');
                return;
            }
            if (cardCvv.length < 3) {
                toast.error('CVV inválido.');
                setIsProcessing(false);
                setProcessModalStatus('rejected');
                return;
            }
        }

        if (numCartaoTransporte !== confirmNumCartaoTransporte) {
            toast.error('Os números do cartão de transporte não coincidem.');
            setIsProcessing(false);
            setProcessModalStatus('rejected');
            return;
        }

        const payload = {
            valor: valorNumerico,
            metodo: metodoPagamento.toUpperCase().replace(/-/g, '_'),
            numCartaoTransporte: numCartaoTransporte,
            idBandeira: idBandeiraSelecionada,
        };

        const { success, error: apiError } = await request('/api/payments/recarga-transporte', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        if (success) {
            setProcessModalStatus('success');
            setValorRecarga('');
            setNumCartaoTransporte('');
            setConfirmNumCartaoTransporte('');
            setCardNum('');
            setCardValid('');
            setCardCvv('');
            setIdBandeiraSelecionada(null);
            setDisplayCardImage(imgDefault);
        } else {
            toast.error(apiError || 'Erro ao finalizar recarga.');
            setProcessModalStatus('rejected');
        }
    };

    const handleModalClose = () => {
        setIsProcessing(false);
        setProcessModalStatus(null);
        navigate('/dashboard');
    };

    const renderPaymentFields = () => {
        const metodoNormalizado = metodoPagamento.toLowerCase();

        if (metodoNormalizado === 'pix') {
            return (
                <div className="pix-container">
                    <div className="qr-placeholder">Placeholder QR Code</div>
                    <div className="pix-key-section">
                        <p className="pix-key-label">Chave PIX:</p>
                        <div className="pix-key-content">
                            <span className="pix-key-value">placeholder@test02</span>
                            <button className="pix-copy-btn" aria-label="Copiar chave PIX" title="Copiar">
                                <i className="bi bi-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if (['credito', 'debito', 'internacional'].some(tipo => metodoNormalizado.includes(tipo))) {
            return (
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
            );
        }
        return null;
    };

    return (
        <div className="recharge-form-container">
            <h1>Recarga de Transporte</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="valorRecarga">Valor da Recarga</label>
                    <input
                        type="text"
                        id="valorRecarga"
                        value={formatCurrency(valorRecarga)}
                        onChange={handleValorRecargaChange}
                        placeholder="R$ 0,00"
                        inputMode="numeric"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="metodoPagamento">Método de Pagamento</label>
                    <select
                        id="metodoPagamento"
                        value={metodoPagamento}
                        onChange={(e) => setMetodoPagamento(e.target.value)}
                    >
                        {getPaymentOptions().map(option => (
                            <option key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="numCartaoTransporte">Número do Cartão de Transporte</label>
                    <input
                        type="text"
                        id="numCartaoTransporte"
                        value={numCartaoTransporte}
                        onChange={(e) => setNumCartaoTransporte(e.target.value.replace(/\D/g, ''))}
                        placeholder="00.00.000000000-0"
                        maxLength="16"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmNumCartaoTransporte">Confirmar Número do Cartão de Transporte</label>
                    <input
                        type="text"
                        id="confirmNumCartaoTransporte"
                        value={confirmNumCartaoTransporte}
                        onChange={(e) => setConfirmNumCartaoTransporte(e.target.value.replace(/\D/g, ''))}
                        placeholder="00.00.000000000-0"
                        maxLength="16"
                    />
                </div>

                <div className="payment-information">
                    {renderPaymentFields()}
                </div>

                <div className="buscard-image">
                    <img src={displayCardImage} alt="Bandeira do Cartão" />
                </div>

                <button type="submit" disabled={loading || isProcessing}>
                    {loading || isProcessing ? 'Processando...' : 'Finalizar Recarga'}
                </button>
            </form>

            {isProcessing && processModalStatus && (
                <ProcessModal
                    status={processModalStatus}
                    type={processModalType}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}

export default RechargeForm;
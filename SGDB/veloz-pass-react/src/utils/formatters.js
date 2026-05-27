// Formatar moeda (R$)
export const formatCurrency = (value) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
};

// Formatar CPF
export const formatCPF = (cpf) => {
  const cpfLimpo = cpf.replace(/\D/g, '');
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Formatar telefone
export const formatPhone = (phone) => {
  const phoneLimpo = phone.replace(/\D/g, '');
  return phoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

// Formatar número de cartão
export const formatCardNumber = (card) => {
  const cardLimpo = card.replace(/\D/g, '');
  return cardLimpo.replace(/(\d{4})/g, '$1 ').trim();
};

// Formatar data (dd/mm/yyyy)
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

// Formatar hora (HH:MM:SS)
export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('pt-BR');
};

// Truncar texto
export const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Validações de email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validações de CPF
export const isValidCPF = (cpf) => {
  const cpfLimpo = cpf.replace(/\D/g, '');
  return cpfLimpo.length === 11;
};

// Validações de telefone
export const isValidPhone = (phone) => {
  const phoneLimpo = phone.replace(/\D/g, '');
  return phoneLimpo.length === 11;
};

// Validação de senha
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Validação de cartão de crédito
export const isValidCardNumber = (cardNumber) => {
  const cardLimpo = cardNumber.replace(/\D/g, '');
  return cardLimpo.length >= 13 && cardLimpo.length <= 16;
};

// Validação de valor monetário
export const isValidAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

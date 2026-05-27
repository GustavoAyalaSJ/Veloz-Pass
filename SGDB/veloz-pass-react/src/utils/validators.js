export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isValidCPF = (cpf) => {
  const cpfLimpo = cpf.replace(/\D/g, "");
  return cpfLimpo.length === 11;
};

export const isValidPhone = (phone) => {
  const phoneLimpo = phone.replace(/\D/g, "");
  return phoneLimpo.length >= 10 && phoneLimpo.length <= 11;
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isValidAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export function validateCardDate(validade) {
    if (!validade || validade.length < 5) return false;

    const [mes, anoStr] = validade.split("/");
    const mesDigitado = parseInt(mes);
    const anoDigitado = parseInt("20" + anoStr); // Assume ano no formato AA
    const agora = new Date();
    const mesAtual = agora.getMonth() + 1;
    const anoAtual = agora.getFullYear();

    if (mesDigitado < 1 || mesDigitado > 12) return false;

    if (anoDigitado < anoAtual || (anoDigitado === anoAtual && mesDigitado < mesAtual)) {
        return false;
    }
    return true;
}

export function validateCardNumberLuhn(cardNumber) {
    const cleanCardNumber = cardNumber.replace(/\D/g, "");
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        return false;
    }

    let sum = 0;
    let doubleUp = false;
    for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanCardNumber.charAt(i), 10);
        if (doubleUp) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        doubleUp = !doubleUp;
    }
    return (sum % 10) === 0;
}
export const formatCurrency = (value) => {
  if (isNaN(value) || value === null || value === "") {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(value));
};

export function getSafeNumericValue(raw) {
  if (typeof raw !== "string") return parseFloat(raw || 0);
  let clean = raw.replace("R$ ", "").replace(/\./g, "").replace(",", ".");
  return parseFloat(clean) || 0;
}

export const formatCPF = (cpf) => {
  const cpfLimpo = cpf.replace(/\D/g, "");
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const formatPhone = (phone) => {
  const phoneLimpo = phone.replace(/\D/g, "");
  return phoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

export const formatCardNumber = (card) => {
  const cardLimpo = card.replace(/\D/g, "");
  const parts = [];
  for (let i = 0; i < cardLimpo.length; i += 4) {
    parts.push(cardLimpo.substring(i, i + 4));
  }
  return parts.join(" ");
};

export function formatCardDate(value) {
  const cleanValue = value.replace(/\D/g, "");
  if (cleanValue.length > 2) {
    return `${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}`;
  }
  return cleanValue;
}

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
};

export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString("pt-BR");
};

export const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
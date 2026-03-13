-- PostgreSQL
-- Tabela bandeira (métodos de pagamento/bandeiras de cartão)
CREATE TABLE bandeira (
    id_bandeira SERIAL PRIMARY KEY,
    nome_bandeira VARCHAR(50) NOT NULL UNIQUE
);

-- Inserir bandeiras comuns (opcional)
INSERT INTO bandeira (nome_bandeira) VALUES 
    ('VISA'),
    ('MASTERCARD'),
    ('ELO'),
    ('AMEX');

-- Tabela carteira (saldo do usuário)
CREATE TABLE carteira (
    id_carteira SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    saldo_atual DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Tabela movimentacao (histórico de transações)
CREATE TABLE movimentacao (
    id_move SERIAL PRIMARY KEY,
    id_carteira INT NOT NULL,
    n_protocolo VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    id_bandeira INT,
    situacao VARCHAR(50) NOT NULL DEFAULT 'Pendente',
    data_realizada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_carteira) REFERENCES carteira(id_carteira) ON DELETE CASCADE,
    FOREIGN KEY (id_bandeira) REFERENCES bandeira(id_bandeira) ON DELETE SET NULL
);

-- Índices para melhor desempenho
CREATE INDEX idx_movimentacao_carteira ON movimentacao(id_carteira);
CREATE INDEX idx_movimentacao_protocolo ON movimentacao(n_protocolo);
CREATE INDEX idx_movimentacao_data ON movimentacao(data_realizada);
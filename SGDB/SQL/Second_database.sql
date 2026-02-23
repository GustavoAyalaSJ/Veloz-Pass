USE usuario_info;

CREATE TABLE carteira (
    id_carteira INT AUTO_INCREMENT PRIMARY KEY,
    saldo_atual DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    id_usuario INT NOT NULL UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);
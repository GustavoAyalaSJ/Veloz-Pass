const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.cadastro = async (req, res) => {
    const { nome_usuario, cpf, telefone, email, senha, confirmar_senha } = req.body;

    if (!nome_usuario || !cpf || !telefone || !email || !senha || !confirmar_senha) {
        return res.status(400).json({ message: "Preencha todos os campos" });
    }

    if (senha !== confirmar_senha) {
        return res.status(400).json({ message: "As senhas não coincidem" });
    }

    if (senha.length < 8) {
        return res.status(400).json({ message: "Senha deve ter no mínimo 8 caracteres" });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        return res.status(400).json({ message: "CPF inválido" });
    }

    if (!validarCPF(cpfLimpo)) {
        return res.status(400).json({ message: "CPF inválido" });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        await db.query('BEGIN');

        const resultUsuario = await db.query(
            `INSERT INTO usuario (nome_usuario, cpf, telefone, email, senha)
             VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario`,
            [nome_usuario, cpfLimpo, telefone, email, senhaHash]
        );

        const userId = resultUsuario.rows[0].id_usuario;

        await db.query(
            `INSERT INTO carteira (id_usuario, saldo_atual) VALUES ($1, 0.00)`,
            [userId]
        );

        await db.query('COMMIT');

        const token = jwt.sign(
            {
                id: userId,
                email,
                nome: nome_usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: "Cadastro realizado com sucesso!",
            token,
            id: userId,
            nome: nome_usuario
        });

    } catch (err) {
        await db.query('ROLLBACK');
        if (err.code === '23505') {
            return res.status(400).json({ message: "Email ou CPF já cadastrado" });
        }
        res.status(500).json({ message: "Erro ao criar conta" });
    }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Informe email e senha" });
    }

    try {
        const result = await db.query(
            `SELECT id_usuario, nome_usuario, senha FROM usuario WHERE email = $1`, 
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const usuario = result.rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { 
                id: usuario.id_usuario, 
                email: email,
                nome: usuario.nome_usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Login realizado com sucesso',
            token,
            nome: usuario.nome_usuario,
            id: usuario.id_usuario
        });

    } catch (err) {
        console.error("ERRO REAL:", err);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
};

function validarCPF(cpf) {
    if (cpf.length !== 11 || !/^\d+$/.test(cpf)) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // Todos iguais
    
    let soma = 0, resto;
    
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

module.exports = exports;
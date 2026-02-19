const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.cadastro = async (req, res) => {
    const { nome_usuario, cpf, telefone, email, senha, confirmar_senha } = req.body;

    if (!nome_usuario || !cpf || !telefone || !email || !senha || !confirmar_senha) {
        return res.status(400).json({ message: "Preencha todos os campos" });
    }

    if (senha !== confirmar_senha) {
        return res.status(400).json({ message: "As senhas não coincidem" });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
        return res.status(400).json({ message: "CPF inválido" });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        await db.query(
            `INSERT INTO usuario 
            (nome_usuario, cpf, telefone, email, senha)
            VALUES ($1, $2, $3, $4, $5)`,
            [nome_usuario, cpfLimpo, telefone, email, senhaHash]
        );

        res.status(201).json({
            message: "Cadastro realizado com sucesso!",
            nome: nome_usuario
        });

    } catch (err) {

        if (err.code === '23505') {
            return res.status(400).json({ message: "Email ou CPF já cadastrado" });
        }

        console.error(err);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Informe email e senha" });
    }

    try {
        const result = await db.query(
            `SELECT * FROM usuario WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        const usuario = result.rows[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }

        res.json({
            message: 'Login realizado com sucesso',
            nome: usuario.nome_usuario
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro interno' });
    }
};

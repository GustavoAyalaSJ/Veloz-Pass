const bcrypt = require('bcrypt');
const db = require('../db');

exports.cadastro = async (req, res) => {
    console.log(req.body);
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

        const sql = `
            INSERT INTO usuario 
            (nome_usuario, cpf, telefone, email, senha)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [nome_usuario, cpf, telefone, email, senhaHash], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email ou CPF já cadastrado" });
                }
                return res.status(500).json({ message: "Erro interno no servidor" });
            }


            res.status(201).json({
                message: "Cadastro realizado com sucesso!",
                nome: nome_usuario
            });
        });

    } catch (error) {
        res.status(500).send('Erro interno');
    }
};

exports.login = (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Informe email e senha" });
    }


    const sql = `SELECT * FROM usuario WHERE email = ?`;

    db.query(sql, [email], async (err, results) => {

        if (err) {
            return res.status(500).json({ message: 'Erro interno' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        const usuario = results[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }

        res.json({
            message: 'Login realizado com sucesso',
            nome: usuario.nome_usuario
        });
    });
};

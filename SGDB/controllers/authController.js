const bcrypt = require('bcrypt');
const db = require('../db');

exports.cadastro = async (req, res) => {
    const { nome_usuario, cpf, telefone, email, senha } = req.body;

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO usuario 
            (nome_usuario, cpf, telefone, email, senha)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [nome_usuario, cpf, telefone, email, senhaHash], (err) => {
            if (err) {
                return res.status(500).json({ message: "Erro no banco de dados" });
            }

            res.status(201).json({
                message: "Sucesso",
                nome: nome_usuario
            });
        });



    } catch (error) {
        res.status(500).send('Erro interno');
    }
};

exports.login = (req, res) => {
    const { email, senha } = req.body;

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

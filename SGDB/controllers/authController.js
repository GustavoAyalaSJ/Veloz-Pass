const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { data: usuario, error } = await supabase
            .from('usuario')
            .select('id_user, nome_usuario, senha_hash, cod_identificador')
            .eq('email', email)
            .single();

        if (error || !usuario) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) return res.status(401).json({ message: 'Credenciais inválidas' });

        const token = jwt.sign(
            { id: usuario.id_user, email, nome: usuario.nome_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Login realizado!',
            token,
            nome: usuario.nome_usuario,
            id: usuario.id_user,
            cod_identificador: usuario.cod_identificador || null
        });

    } catch (err) {
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

exports.cadastro = async (req, res) => {
    const { nome_usuario, cpf, telefone, email, senha, confirmar_senha, cod_identificador, id_naturalidade } = req.body;

    if (!nome_usuario || !cpf || !telefone || !email || !senha || !confirmar_senha) {
        return res.status(400).json({ message: "Preencha todos os campos" });
    }

    if (senha !== confirmar_senha) {
        return res.status(400).json({ message: "As senhas não coincidem" });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    const telLimpo = telefone.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
        return res.status(400).json({ message: "CPF inválido (11 dígitos)" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Email inválido" });
    }

    if (!cod_identificador || String(cod_identificador).trim().length !== 6) {
        return res.status(400).json({ message: "Seu telefone deve estar nas regiões atendidas de Santa Catarina." });
    }

    const natId = id_naturalidade ? String(id_naturalidade).trim() : null;

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const { data: rpcResult, error: rpcError } = await supabase
            .rpc('rpc_criar_usuario_e_carteira', {
                p_nome_usuario: nome_usuario,
                p_cpf: cpfLimpo,
                p_telefone: telLimpo,
                p_email: email,
                p_senha_hash: senhaHash,
                p_cod_identificador: String(cod_identificador).trim(),
                p_id_naturalidade: natId
            });

        if (rpcError || !rpcResult || rpcResult.success === false) {
            const msg = rpcResult?.erro || rpcError?.message || 'Erro no banco';
            return res.status(400).json({ message: msg });
        }

        const token = jwt.sign(
            { id: rpcResult.id_usuario, email, nome: nome_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: "Cadastro realizado!",
            token,
            id: rpcResult.id_usuario,
            nome: nome_usuario,
            cod_identificador
        });

    } catch (err) {
        res.status(500).json({ message: "Erro interno ao criar conta" });
    }
};

module.exports = exports;
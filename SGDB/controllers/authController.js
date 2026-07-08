const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

/* Código para registrar as credenciais */
exports.login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    try {
        const { data, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('email', emailNormalizado)
            .maybeSingle();

        if (error) {
            return res.status(500).json({
                message: 'Erro interno no servidor.'
            });
        }

        const usuario = data || null;

        if (!usuario) {
            return res.status(401).json({ message: 'Credenciais não correspondem as registradas.' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) return res.status(401).json({ message: 'Senha incorreta.' });

        const token = jwt.sign(
            { id: usuario.id_user, email: usuario.email, nome: usuario.nome_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Login realizado!',
            nome: usuario.nome_usuario,
            cod_identificador: usuario.cod_identificador || null
        });

    } catch (err) {
        res.status(500).json({
            message: "Erro interno no servidor."
        });
    }
};

/* Código para registrar um novo usuário */
exports.cadastro = async (req, res) => {
    const { nome_usuario, cpf, telefone, email, senha, confirmar_senha } = req.body;

    if (!nome_usuario || !cpf || !telefone || !email || !senha || !confirmar_senha) {
        return res.status(400).json({ message: "Preencha todos os campos!" });
    }

    if (senha !== confirmar_senha) {
        return res.status(400).json({ message: "As senhas não coincidem." });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    const telLimpo = telefone.replace(/\D/g, '');
    const emailNormalizado = String(email).trim().toLowerCase();

    const isAllDigitsSame = (s) => {
        const digits = String(s ?? '').replace(/\D/g, '');
        if (!digits.length) return false;
        return digits.split('').every(c => c === digits[0]);
    };

    const cpfDigits = cpfLimpo;
    const telefoneDigits = telLimpo;

    const isBlockedCpf = isAllDigitsSame(cpfDigits);
    const isBlockedTelefone = isAllDigitsSame(telefoneDigits);

    if (isBlockedCpf) {
        return res.status(400).json({ message: 'CPF inválido.' });
    }
    if (isBlockedTelefone) {
        return res.status(400).json({ message: 'Telefone inválido.' });
    }

    if (cpfLimpo.length !== 11) {
        return res.status(400).json({ message: "CPF incompleto ou não corresponde aos requisitos." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
        return res.status(400).json({ message: "Email incompleto ou inválido." });
    }

    const generateCodIdentificador = () => {
        const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let out = '';
        for (let i = 0; i < 6; i++) {
            out += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        return out;
    };

    const cod_identificador = generateCodIdentificador();

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const { data: rpcResult, error: rpcError } = await supabase
            .rpc('rpc_criar_usuario_e_carteira', {
                p_nome_usuario: nome_usuario,
                p_cod_identificador: cod_identificador,
                p_cpf: cpfLimpo,
                p_telefone: telLimpo,
                p_email: emailNormalizado,
                p_senha_hash: senhaHash
            });


        if (rpcError || !rpcResult || rpcResult.success === false) {
            return res.status(502).json({ message: 'Não foi possível concluir o cadastro no momento.', errorType: 'account' });
        }

        const token = jwt.sign(
            { id: rpcResult.id_usuario, email, nome: nome_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: "Cadastro realizado!",
            id: rpcResult.id_usuario,
            nome: nome_usuario,
            cod_identificador
        });

    } catch (err) {
        console.error('Erro ao cadastrar!');
        res.status(500).json({ message: "Erro interno no servidor.", errorType: 'internal' });
    }
};

module.exports = exports;
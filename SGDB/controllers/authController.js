const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { data: usuario, error } = await supabase
            .from('usuario')
            .select('id_usuario, nome_usuario, senha_hash')
            .eq('email', email)
            .single();

        if (error || !usuario) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) return res.status(401).json({ message: 'Credenciais inválidas' });

        const token = jwt.sign(
            { id: usuario.id_usuario, email, nome: usuario.nome_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Login realizado!',
            token,
            nome: usuario.nome_usuario,
            id: usuario.id_usuario
        });

    } catch (err) {
        console.error("Erro no Login:", err);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

exports.cadastro = async (req, res) => {
    const { nome_usuario, cpf, telefone, email, senha, confirmar_senha, cod_identificador } = req.body;

    if (!nome_usuario || !cpf || !telefone || !email || !senha || !confirmar_senha) {
        return res.status(400).json({ message: "Preencha todos os campos" });
    }
    if (senha !== confirmar_senha) return res.status(400).json({ message: "As senhas não coincidem" });

    const cpfLimpo = cpf.replace(/\D/g, '');
    const telLimpo = telefone.replace(/\D/g, '');

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const { data: novoUsuarioArray, error: userError } = await supabase
            .from('usuario')
            .insert([{
                nome_usuario,
                cpf: cpfLimpo,
                telefone: telLimpo,
                email,
                senha_hash: senhaHash,
                cod_identificador: cod_identificador || null
            }])
            .select();

        if (userError) {
            if (userError.code === '23505') {
                return res.status(400).json({ message: "Email ou CPF já cadastrado" });
            }
            throw userError;
        }

        const novoUsuario = novoUsuarioArray[0];

        if (novoUsuario) {
            const { error: walletError } = await supabase
                .from('carteira')
                .insert([{
                    id_usuario: novoUsuario.id_usuario,
                    saldo_atual: 0.00
                }]);
            if (walletError) throw walletError;
        }

        const token = jwt.sign(
            { id: novoUsuario.id_usuario, email, nome: nome_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: "Cadastro e Carteira realizados!",
            token,
            id: novoUsuario.id_usuario,
            nome: nome_usuario,
            cod_identificador: cod_identificador || null
        });

    } catch (err) {
        console.error("Erro no cadastro:", err);
        res.status(500).json({ message: "Erro ao criar conta no Veloz Pass" });
    }
};

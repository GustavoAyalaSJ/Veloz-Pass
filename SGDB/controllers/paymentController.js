const { supabase } = require('../config/supabase');

const METODOS_PERMITIDOS = [
    'DEBITO', 'DÉBITO',
    'CREDITO', 'CRÉDITO',
    'INTERNACIONAL', 'CARTAO_INTERNACIONAL', 'CARTÃO_INTERNACIONAL',
    'PIX',
    'CARTEIRA_DIGITAL'
];

exports.getWalletData = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const idUsuarioAutenticado = req.userId;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: "Acesso negado." });
    }

    try {
        let { data: carteira, error: erroCarteira } = await supabase
            .from('carteira')
            .select('id_carteira, saldo_atual')
            .eq('id_user', idUsuario)
            .single();

        if (erroCarteira || !carteira) {
            const { data: newCarteira, error: createError } = await supabase
                .from('carteira')
                .insert([{ id_user: idUsuario, saldo_atual: 0 }])
                .select()
                .single();

            if (createError) {
                return res.json({ saldo: 0, historico: [] });
            }
            carteira = newCarteira;
        }

        const { data: history } = await supabase
            .from('movimentacao')
            .select('*, bandeira_banco(nome_bandeira)')
            .eq('id_carteira', carteira.id_carteira)
            .eq('tipo_movimentacao', 'Carteira_Digital')
            .order('id_move', { ascending: false })
            .limit(50);

        res.json({
            saldo: parseFloat(carteira.saldo_atual || 0),
            historico: history || []
        });

    } catch (err) {
        res.status(500).json({ error: "Erro interno ao buscar dados" });
    }
};

exports.getHistoricoGeral = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const idUsuarioAutenticado = req.userId;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: "Acesso negado." });
    }

    try {
        const { data: carteira } = await supabase
            .from('carteira')
            .select('id_carteira')
            .eq('id_user', idUsuario)
            .single();

        if (!carteira) {
            return res.json({ historico: [] });
        }

        const { data: historico } = await supabase
            .from('movimentacao')
            .select('*, bandeira_banco(nome_bandeira)')
            .eq('id_carteira', carteira.id_carteira)
            .neq('situacao', 'Em_Revisão')
            .order('id_move', { ascending: false });

        res.json({ historico: historico || [] });

    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar histórico" });
    }
};

exports.processCredit = async (req, res) => {
    const { valor: valorRaw, metodo, numCartao, idBandeira } = req.body;
    const valorNum = parseFloat(valorRaw);
    const idUsuario = req.userId;

    if (isNaN(valorNum) || valorNum <= 0) {
        return res.status(400).json({ error: "Valor inválido" });
    }

    if (!metodo || typeof metodo !== 'string') {
        return res.status(400).json({ error: "Método de pagamento é obrigatório." });
    }

    const metodoBase = metodo.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const mapaMetodos = {
        'CREDITO': 'Crédito',
        'DEBITO': 'Débito',
        'PIX': 'Pix',
        'INTERNACIONAL': 'Internacional',
        'CARTAO_INTERNACIONAL': 'Internacional',
        'CARTEIRA_DIGITAL': 'Carteira_Digital'
    };

    const metodoParaOBanco = mapaMetodos[metodoBase];

    if (!metodoParaOBanco) {
        return res.status(400).json({ error: "Método de pagamento não suportado." });
    }

    if (['DEBITO', 'CREDITO', 'INTERNACIONAL', 'CARTAO_INTERNACIONAL'].includes(metodoBase) && !validarCartao(numCartao)) {
        return res.status(400).json({ error: "Cartão inválido" });
    }

    try {
        const protocolo = 'VP' + Date.now();

        const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_adicionar_credito', {
            p_id_usuario: idUsuario,
            p_valor: valorNum,
            p_metodo_pagamento: metodoParaOBanco,
            p_tipo_movimentacao: 'Carteira_Digital',
            p_id_bandeira: idBandeira || null,
            p_n_protocolo: protocolo
        });

        if (rpcError) {
            console.error('[RPC ERROR]', rpcError);
            return res.status(400).json({ error: rpcError.message || 'Erro no RPC' });
        }
        if (!rpcResult) {
            return res.status(400).json({ error: 'Resposta inválida do servidor' });
        }
        if (!rpcResult.success) {
            console.log(`[REJECTED CREDIT] User ${idUsuario}, Valor ${valorNum}, Reason: ${rpcResult.erro}`);
            return res.status(200).json({
                success: false,
                error: rpcResult.erro || 'Transação rejeitada',
                situacao: rpcResult.situacao,
                protocolo: rpcResult.protocolo
            });
        }

        res.status(200).json({
            success: true,
            situacao: rpcResult.situacao,
            protocolo: rpcResult.protocolo,
            valor: valorNum,
            novo_saldo: rpcResult.novo_saldo
        });

    } catch (err) {
        res.status(500).json({ error: "Erro ao processar crédito" });
    }
};

exports.processRecargaTransporte = async (req, res) => {
    const { valor: valorRaw, metodo, numCartaoTransporte, idBandeira, situacao, tipo } = req.body;
    const valorNum = parseFloat(valorRaw);
    const idUsuario = req.userId;

    console.log('Recarga Debug - valorRaw:', valorRaw, 'type:', typeof valorRaw, 'valorNum:', valorNum, 'userId:', idUsuario);

    if (isNaN(valorNum) || valorNum <= 0) {
        return res.status(400).json({ error: "Valor inválido" });
    }

    const metodoFormatado = metodo?.trim().toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s/g, '_');

    const mapaBancoRecarga = {
        'DEBITO': 'Débito',
        'CARTAO_DE_DEBITO': 'Débito',
        'CREDITO': 'Crédito',
        'CARTAO_DE_CREDITO': 'Crédito',
        'PIX': 'Pix',
        'INTERNACIONAL': 'Internacional',
        'CARTAO_INTERNACIONAL': 'Internacional'
    };

    const metodoParaRPC = mapaBancoRecarga[metodoFormatado];

    if (!metodoParaRPC) {
        return res.status(400).json({ error: "Método de pagamento não reconhecido para recarga de transporte. Use Débito, Crédito, Pix ou Internacional." });
    }
    if (metodoFormatado === 'CARTEIRA_DIGITAL') {
        return res.status(400).json({ error: "Carteira Digital não disponível para recarga de transporte." });
    }

    if (valorNum > 650) {
        return res.status(400).json({ error: 'Valor muito alto rejeitado' });
    }

    const protocolo = 'VPT' + Date.now();
    console.log('Recarga Non-Wallet - Creating pending tx, user:', idUsuario, 'metodo:', metodoFormatado, 'valor:', valorNum);

    try {
        const { data: carteira } = await supabase
            .from('carteira')
            .select('id_carteira')
            .eq('id_user', idUsuario)
            .single();

        if (!carteira || !carteira.id_carteira) {
            return res.status(400).json({ error: 'Carteira do usuário não encontrada' });
        }

        const idCarteira = carteira.id_carteira;

        const situacaoValida = situacao === 'Em_Revisão' ? 'Em_Revisão' : 'Concluído';

        const { error: insertError } = await supabase
            .from('movimentacao')
            .insert({
                id_carteira: idCarteira,
                valor: valorNum,
                metodo_pagamento: mapaBancoRecarga[metodoFormatado],
                tipo_movimentacao: 'Recarga',
                situacao: situacaoValida,
                n_protocolo: protocolo,
                id_bandeira: idBandeira ? parseInt(idBandeira) : null
            });

        if (insertError) {
            console.error('Insert Movimentacao Error:', insertError);
            return res.status(400).json({ error: 'Erro ao registrar recarga' });
        }

        return res.status(200).json({
            success: true,
            protocolo,
            valor: valorNum,
            nCartaoTransporte: numCartaoTransporte,
            situacao: situacaoValida,
            message: 'Recarga registrada com sucesso! Aguarde processamento.'
        });

    } catch (err) {
        console.error('Process Recarga Non-Wallet Error:', err);
        res.status(500).json({ error: "Erro ao processar recarga" });
    }
};

function validarCartao(numCartao) {
    if (!numCartao) return false;
    const limpo = numCartao.replace(/\D/g, '');
    return limpo.length >= 13 && limpo.length <= 16;
}

module.exports = exports;

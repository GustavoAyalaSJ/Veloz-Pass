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
    const { valor: valorRaw, metodo, numCartaoTransporte, idBandeira, situacao } = req.body;
    const valorNum = parseFloat(valorRaw);
    const idUsuario = req.userId;

    if (isNaN(valorNum) || valorNum <= 0) {
        return res.status(400).json({ error: "Valor inválido" });
    }

    const metodoFormatado = metodo?.trim().toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const mapaBancoRecarga = {
        'DEBITO': 'Débito',
        'CREDITO': 'Crédito', 
        'PIX': 'Pix',
        'INTERNACIONAL': 'Internacional',
        'CARTAO_INTERNACIONAL': 'Internacional',
        'CARTEIRA_DIGITAL': 'Carteira Digital'
    };

    if (!mapaBancoRecarga[metodoFormatado]) {
        return res.status(400).json({ error: "Método de pagamento não reconhecido." });
    }

    let situacaoFinal = situacao || 'Concluido';
    if (valorNum > 650) {
        situacaoFinal = 'Recusada';
    } else if (valorNum > 300) {
        situacaoFinal = 'Em_Revisão';
    }

    try {
        const protocolo = 'VPT' + Date.now();
        const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_descontar_saldo', {
            p_id_usuario: idUsuario,
            p_valor: valorNum,
            p_metodo_pagamento: mapaBancoRecarga[metodoFormatado],
            p_tipo_movimentacao: 'Recarga',
            p_id_bandeira: idBandeira ? parseInt(idBandeira) : null,
            p_n_protocolo: protocolo,
            p_situacao: situacaoFinal
        });

        if (rpcError || !rpcResult || rpcResult.erro) {
            console.error('RPC Error:', rpcError || rpcResult?.erro);
            return res.status(400).json({ error: rpcResult?.erro || 'Erro ao processar recarga' });
        }

        return res.status(200).json({
            success: true,
            protocolo: rpcResult.protocolo || protocolo,
            valor: valorNum,
            novo_saldo: rpcResult.novo_saldo,
            nCartaoTransporte: numCartaoTransporte,
            situacao: situacaoFinal
        });

    } catch (err) {
        console.error('Process Recarga Error:', err);
        res.status(500).json({ error: "Erro ao processar recarga" });
    }
};

function validarCartao(numCartao) {
    if (!numCartao) return false;
    const limpo = numCartao.replace(/\D/g, '');
    return limpo.length >= 13 && limpo.length <= 16;
}

module.exports = exports;
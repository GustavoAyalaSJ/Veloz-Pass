const bcrypt = require('bcrypt');
const { supabase } = require('../config/supabase');

const notificationsController = require('./notificationsController');

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
        console.error('[paymentController] erro inesperado em getWalletData');
        res.status(500).json({ error: "Erro interno no servidor." });
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
        console.error('[paymentController] erro inesperado em getHistoricoGeral');
        res.status(500).json({ error: "Erro no histórico." });
    }
};

exports.checkStatus = async (req, res) => {
    const { protocolo } = req.params;
    const idUsuario = req.userId;

    if (!protocolo) {
        return res.status(400).json({ error: 'Protocolo obrigatório.', errorType: 'internal' });
    }

    try {
        const { data: carteira, error: erroCarteira } = await supabase
            .from('carteira')
            .select('id_carteira')
            .eq('id_user', idUsuario)
            .single();

        if (erroCarteira || !carteira) {
            return res.status(404).json({ error: 'Carteira não encontrada.', errorType: 'account' });
        }

        const { data: movimentacao, error: erroMovimentacao } = await supabase
            .from('movimentacao')
            .select('situacao, n_protocolo')
            .eq('id_carteira', carteira.id_carteira)
            .eq('n_protocolo', protocolo)
            .maybeSingle();

        if (erroMovimentacao) {
            console.error('[paymentController] erro ao buscar movimento para status');
            return res.status(500).json({ error: 'Erro interno no servidor ao consultar status.', errorType: 'internal' });
        }

        if (!movimentacao) {
            return res.status(404).json({ error: 'Protocolo não encontrado.', errorType: 'internal' });
        }

        return res.json({
            success: true,
            protocolo,
            situacao: movimentacao.situacao || 'Pendente'
        });
    } catch (err) {
        console.error('[paymentController] erro inesperado em checkStatus');
        return res.status(500).json({ error: 'Erro interno no servidor ao consultar status.', errorType: 'internal' });
    }
};

exports.processCredit = async (req, res) => {
    const { valor: valorRaw, metodo, numCartao, idBandeira } = req.body;
    const valorNum = parseFloat(valorRaw);
    const idUsuario = req.userId;

    if (isNaN(valorNum) || valorNum <= 0) {
        return res.status(400).json({ error: "Valor inválido." });
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
        'CARTAO_INTERNACIONAL': 'Internacional'
    };

    const metodoParaOBanco = mapaMetodos[metodoBase];

    if (!metodoParaOBanco) {
        return res.status(400).json({ error: "Método de pagamento não suportado." });
    }

    console.info('[paymentController] solicitação de crédito recebida');

    if (['DEBITO', 'CREDITO', 'INTERNACIONAL', 'CARTAO_INTERNACIONAL'].includes(metodoBase)) {
        const limpo = String(numCartao ?? '').replace(/\D/g, '');
        const ultimoDigito = limpo ? Number(limpo[limpo.length - 1]) : NaN;

        const rejeitarTriviais = limpo.length > 0 && /^([0-9])\1+$/.test(limpo);

        if (!limpo || limpo.length < 13 || limpo.length > 19 || Number.isNaN(ultimoDigito) || ultimoDigito < 0 || ultimoDigito > 9 || rejeitarTriviais) {
            return res.status(400).json({ error: "Cartão inválido." });
        }
    }


    try {
        const protocol = 'VP' + Date.now();
        console.info('[paymentController] processamento de crédito iniciado');


        const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_adicionar_credito', {
            p_id_usuario: idUsuario,
            p_valor: valorNum,
            p_metodo_pagamento: metodoParaOBanco,
            p_tipo_movimentacao: 'Carteira_Digital',
            p_id_bandeira: idBandeira || null,
            p_n_protocolo: protocol
        });

        if (rpcError) {
            console.error('[paymentController] erro no RPC de crédito');
            return res.status(502).json({ success: false, error: 'Erro interno ao processar crédito.', errorType: 'internal' });
        }
        if (!rpcResult) {
            return res.status(502).json({ success: false, error: 'Erro interno ao processar crédito.', errorType: 'internal' });
        }
        if (!rpcResult.success) {
            console.warn('[paymentController] crédito recusado pelo sistema');

            return res.status(422).json({
                success: false,
                error: 'Não foi possível concluir a operação no momento.',
                situacao: rpcResult.situacao,
                protocolo: rpcResult.protocolo,
                detalhe: {
                    erro: null,
                    mensagem: null
                }
            });
        }

        if (rpcResult.situacao === 'Concluído' || rpcResult.situacao === 'Recusada') {
            await notificationsController.registrarNotificacaoAgora(idUsuario, rpcResult.protocolo, rpcResult.situacao);
        }

        res.status(200).json({
            success: true,
            situacao: rpcResult.situacao,
            protocolo: rpcResult.protocolo,
            valor: valorNum,
            message: rpcResult.mensagem || "Processamento iniciado."
        });

    } catch (err) {
        console.error('[paymentController] erro inesperado em processCredit');
        res.status(500).json({ success: false, error: "Erro ao processar crédito.", errorType: 'internal' });
    }
};

exports.processRecargaTransporte = async (req, res) => {
    const { valor: valorRaw, metodo, numCartaoTransporte, idBandeira } = req.body;
    const valorNum = parseFloat(valorRaw);
    const idUsuario = req.userId;

    if (isNaN(valorNum) || valorNum <= 0) {
        return res.status(400).json({ error: "Valor inválido." });
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
        'CARTAO_INTERNACIONAL': 'Internacional',
        'CARTEIRA_DIGITAL': 'Carteira_Digital'
    };

    const metodoParaRPC = mapaBancoRecarga[metodoFormatado];

    if (!metodoParaRPC) {
        return res.status(400).json({ error: "Método de pagamento não reconhecido para recarga de transporte." });
    }

    if (valorNum > 650) {
        return res.status(400).json({ error: 'Recarregando um valor muito alto!' });
    }

    const protocolo = 'VPT' + Date.now();
    try {
        if (metodoFormatado === 'CARTEIRA_DIGITAL') {
            const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_descontar_saldo', {
                p_id_usuario: idUsuario,
                p_valor: valorNum,
                p_metodo_pagamento: 'Carteira_Digital',
                p_tipo_movimentacao: 'Recarga',
                p_id_bandeira: idBandeira || null,
                p_n_protocolo: protocolo
            });

            if (rpcError) {
                console.error('[paymentController] erro no RPC de recarga');
                return res.status(502).json({ success: false, error: 'Erro interno ao processar recarga.', errorType: 'internal' });
            }

            if (!rpcResult || !rpcResult.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Não foi possível concluir a recarga no momento.',
                    errorType: 'recarga',
                    situacao: 'Recusada'
                });
            }

            await notificationsController.registrarNotificacaoAgora(idUsuario, protocolo, 'Concluído');

            return res.status(200).json({
                success: true,
                protocolo,
                valor: valorNum,
                nCartaoTransporte: numCartaoTransporte,
                situacao: 'Concluído',
                novo_saldo: rpcResult.novo_saldo,
                message: 'Recarga realizada com sucesso!'
            });
        }

        const { data: carteira } = await supabase
            .from('carteira')
            .select('id_carteira')
            .eq('id_user', idUsuario)
            .single();

        if (!carteira || !carteira.id_carteira) {
            return res.status(400).json({ error: 'Carteira do usuário não encontrada.' });
        }

        const idCarteira = carteira.id_carteira;

        const { error: insertError } = await supabase
            .from('movimentacao')
            .insert({
                id_carteira: idCarteira,
                valor: valorNum,
                metodo_pagamento: mapaBancoRecarga[metodoFormatado],
                tipo_movimentacao: 'Recarga',
                situacao: 'Concluído',
                n_protocolo: protocolo,
                id_bandeira: idBandeira ? parseInt(idBandeira) : null
            });

        if (insertError) {
            console.error('[paymentController] falha ao registrar movimentação de recarga');
            return res.status(502).json({ success: false, error: 'Erro ao registrar recarga.', errorType: 'recarga' });
        }

        await notificationsController.registrarNotificacaoAgora(idUsuario, protocolo, 'Concluído');

        return res.status(200).json({
            success: true,
            protocolo,
            valor: valorNum,
            nCartaoTransporte: numCartaoTransporte,
            situacao: 'Concluído',
            message: 'Recarga realizada com sucesso!'
        });

    } catch (err) {
        console.error('[paymentController] erro inesperado em processRecargaTransporte');
        res.status(500).json({ success: false, error: "Erro ao processar recarga", errorType: 'internal' });
    }
};

function validarCartao(numCartao) {
    if (!numCartao) return false;
    const limpo = String(numCartao).replace(/\D/g, '');
    if (limpo.length < 13 || limpo.length > 16) return false;

    let soma = 0;
    let alternar = false;

    for (let i = limpo.length - 1; i >= 0; i--) {
        let n = parseInt(limpo[i], 10);

        if (alternar) {
            n *= 2;
            if (n > 9) n -= 9;
        }

        soma += n;
        alternar = !alternar;
    }

    return (soma % 10) === 0;
}

exports.saveCard = async (req, res) => {
    const { n_card } = req.body;
    const idUsuario = req.userId;

    if (!n_card) {
        return res.status(400).json({ error: "Número do cartão é obrigatório." });
    }

    const cartaoLimpo = n_card.replace(/\D/g, '');

    if (!validarCartao(n_card)) {
        return res.status(400).json({ error: "Número do cartão inválido." });
    }

    try {
        const cartaoHash = await bcrypt.hash(cartaoLimpo, 10);

        const { data, error } = await supabase
            .from('uniquecard')
            .insert([{ id_user: idUsuario, n_card: cartaoHash }])
            .select();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    error: "Este cartão já foi registrado em sua conta.",
                    code: 'CARD_ALREADY_EXISTS'
                });
            }
            throw error;
        }

        res.status(201).json({
            success: true,
            message: "Cartão registrado com sucesso!",
            card: {
                id: data[0].id_card,
                ultimosDígitos: cartaoLimpo.slice(-4)
            }
        });

    } catch (err) {
        console.error('[paymentController] erro inesperado em saveCard');
        res.status(500).json({ error: "Erro ao registrar cartão." });
    }
};

exports.getUserCards = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const idUsuarioAutenticado = req.userId;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: "Acesso negado." });
    }

    try {
        const { data: cartoes, error } = await supabase
            .from('uniquecard')
            .select('id_card')
            .eq('id_user', idUsuario);

        if (error) {
            throw error;
        }

        const cartoesSeguro = cartoes.map(cartao => ({
            id: cartao.id_card
        }));

        res.json({
            success: true,
            cartoes: cartoesSeguro,
            total: cartoesSeguro.length
        });

    } catch (err) {
        console.error('[paymentController] erro inesperado em getUserCards');
        res.status(500).json({ error: "Erro ao recuperar cartões." });
    }
};

exports.verifyCard = async (req, res) => {
    const { n_card } = req.body;
    const idUsuario = req.userId;

    if (!n_card) {
        return res.status(400).json({ error: "Número do cartão é obrigatório." });
    }

    const cartaoLimpo = n_card.replace(/\D/g, '');

    if (!validarCartao(n_card)) {
        return res.status(400).json({ error: "Número do cartão inválido." });
    }

    try {
        const { data: cartoes, error } = await supabase
            .from('uniquecard')
            .select('n_card')
            .eq('id_user', idUsuario);

        if (error) {
            throw error;
        }

        if (!cartoes || cartoes.length === 0) {
            return res.json({
                verified: false,
                message: "Nenhum cartão registrado."
            });
        }

        let cartaoVerificado = false;
        for (const cartao of cartoes) {
            const match = await bcrypt.compare(cartaoLimpo, cartao.n_card);
            if (match) {
                cartaoVerificado = true;
                break;
            }
        }

        res.json({
            verified: cartaoVerificado,
            message: cartaoVerificado ? "Cartão verificado com sucesso!" : "Cartão não encontrado nos registros."
        });

    } catch (err) {
        console.error('[paymentController] erro inesperado em verifyCard');
        res.status(500).json({ error: "Erro ao verificar cartão." });
    }
};

module.exports = exports;
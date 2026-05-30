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
        console.error(err);
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
        console.error(err);
        res.status(500).json({ error: "Erro no histórico." });
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

    if (['DEBITO', 'CREDITO', 'INTERNACIONAL', 'CARTAO_INTERNACIONAL'].includes(metodoBase) && !validarCartao(numCartao)) {
        return res.status(400).json({ error: "Cartão inválido." });
    }

    console.log('Cartão recebido:', numCartao);
    console.log('Passou Luhn?', validarCartao(numCartao));

    try {
        const protocol = 'VP' + Date.now();
        console.log('[processCredit] request', {
            idUsuario,
            valorRaw,
            valorNum,
            metodo,
            metodoBase,
            metodoParaOBanco,
            numCartaoPresente: !!numCartao,
            idBandeira: idBandeira || null
        });


        const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_adicionar_credito', {
            p_id_usuario: idUsuario,
            p_valor: valorNum,
            p_metodo_pagamento: metodoParaOBanco,
            p_tipo_movimentacao: 'Carteira_Digital',
            p_id_bandeira: idBandeira || null,
            p_n_protocolo: protocol
        });

        if (rpcError) {
            console.error('[RPC ERROR]', rpcError);
            return res.status(400).json({ error: rpcError.message || 'Erro no RPC' });
        }
        if (!rpcResult) {
            return res.status(400).json({ error: 'Resposta inválida do servidor' });
        }
        if (!rpcResult.success) {
            console.error('[RPC DECLINED] rpcResult:', {
                situacao: rpcResult.situacao,
                protocolo: rpcResult.protocolo,
                erro: rpcResult.erro,
                mensagem: rpcResult.mensagem,
                received: {
                    valorNum,
                    metodoRaw: metodo,
                    metodoBase,
                    metodoParaOBanco,
                    hasNumCartao: !!numCartao,
                    idBandeira: idBandeira || null
                }
            });

            return res.status(422).json({
                success: false,
                error: rpcResult.erro || rpcResult.mensagem || 'Transação rejeitada',
                situacao: rpcResult.situacao,
                protocolo: rpcResult.protocolo,
                detalhe: {
                    erro: rpcResult.erro || null,
                    mensagem: rpcResult.mensagem || null
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
        console.error('Process Credit Error:', err);
        res.status(500).json({ error: "Erro ao processar crédito." });
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
                console.error('[RPC ERROR - Descontar Saldo]', rpcError);
                return res.status(400).json({ error: rpcError.message || 'Erro ao processar recarga' });
            }

            if (!rpcResult || !rpcResult.success) {
                return res.status(400).json({
                    error: rpcResult?.erro || 'Saldo insuficiente para realizar esta recarga',
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
            console.error('Insert Movimentacao Error:', insertError);
            return res.status(400).json({ error: 'Erro ao registrar recarga.' });
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
        console.error('Process Recarga Non-Wallet Error:', err);
        res.status(500).json({ error: "Erro ao processar recarga" });
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
        console.error('Erro ao salvar cartão:', err);
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
        console.error('Erro ao recuperar cartões:', err);
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
        console.error('Erro ao verificar cartão:', err);
        res.status(500).json({ error: "Erro ao verificar cartão." });
    }
};

module.exports = exports;
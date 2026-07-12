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

function determinarSituacaoCredito(valorRaw) {
    const valorNum = Number(valorRaw);

    if (!Number.isFinite(valorNum) || valorNum <= 0) {
        return 'Recusada';
    }

    if (valorNum < 5) {
        return 'Recusada';
    }

    if (valorNum < 352) {
        return 'Concluído';
    }

    if (valorNum < 652) {
        return 'Em_Revisão';
    }

    return 'Recusada';
}

exports.determinarSituacaoCredito = determinarSituacaoCredito;

exports.getWalletData = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const idUsuarioAutenticado = req.userId;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: "Acesso negado." });
    }

    try {
        const carteira = await getOrCreateCarteira(idUsuarioAutenticado);

        if (!carteira) {
            return res.json({ saldo: 0, historico: [] });
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

async function aplicarAtualizacaoAutomaticaStatus(movimentacao, idCarteira, idUsuario, protocolo) {
    if (!movimentacao || !idCarteira || !protocolo) return null;

    const statusAtual = String(movimentacao.situacao || '').trim();
    if (statusAtual !== 'Em_Revisão') return null;

    const valorNum = Number(movimentacao.valor);
    const dataRealizada = new Date(movimentacao.data_realizada || Date.now());

    if (!Number.isFinite(valorNum) || !Number.isFinite(dataRealizada.getTime())) return null;

    const idadeMs = Date.now() - dataRealizada.getTime();
    const atrasoMinutos = idadeMs / (1000 * 60);

    if (atrasoMinutos < 2) return null;

    let novaSituacao = 'Em_Revisão';

    if (valorNum < 5) {
        novaSituacao = 'Recusada';
    } else if (valorNum < 352) {
        novaSituacao = 'Concluído';
    } else if (valorNum >= 652) {
        novaSituacao = 'Recusada';
    }

    if (novaSituacao === 'Em_Revisão') return null;

    const { error: updateError } = await supabase
        .from('movimentacao')
        .update({ situacao: novaSituacao })
        .eq('id_carteira', idCarteira)
        .eq('n_protocolo', protocolo);

    if (updateError) {
        console.error('[paymentController] erro ao atualizar situação do movimento', updateError);
        return null;
    }

    if (novaSituacao === 'Concluído') {
        const { data: carteiraAtual, error: erroSaldo } = await supabase
            .from('carteira')
            .select('saldo_atual')
            .eq('id_carteira', idCarteira)
            .maybeSingle();

        if (!erroSaldo && carteiraAtual) {
            await supabase
                .from('carteira')
                .update({ saldo_atual: Number(carteiraAtual.saldo_atual || 0) + valorNum })
                .eq('id_carteira', idCarteira);
        }
    }

    await notificationsController.registrarNotificacaoAgora(idUsuario, protocolo, novaSituacao);

    return novaSituacao;
}

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
            .select('id_move, id_carteira, situacao, n_protocolo, valor, data_realizada')
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

        const statusAtualizado = await aplicarAtualizacaoAutomaticaStatus(movimentacao, carteira.id_carteira, idUsuario, protocolo);
        const situacaoFinal = statusAtualizado || movimentacao.situacao;

        return res.json({
            success: true,
            protocolo,
            situacao: situacaoFinal ?? null
        });
    } catch (err) {
        console.error('[paymentController] erro inesperado em checkStatus');
        return res.status(500).json({ error: 'Erro interno no servidor ao consultar status.', errorType: 'internal' });
    }
};

async function getOrCreateCarteira(idUsuario) {
    const { data: carteira, error: erroCarteira } = await supabase
        .from('carteira')
        .select('id_carteira, saldo_atual')
        .eq('id_user', idUsuario)
        .maybeSingle();

    if (!erroCarteira && carteira) return carteira;

    const { data: novaCarteira, error: createError } = await supabase
        .from('carteira')
        .insert([{ id_user: idUsuario, saldo_atual: 0 }])
        .select('id_carteira, saldo_atual')
        .maybeSingle();

    if (novaCarteira) return novaCarteira;

    const { data: carteiraRecuperada, error: buscaError } = await supabase
        .from('carteira')
        .select('id_carteira, saldo_atual')
        .eq('id_user', idUsuario) // String UUID
        .maybeSingle();

    if (buscaError || !carteiraRecuperada) {
        console.error('[paymentController] falha ao getOrCreateCarteira', { idUsuario, erroCarteira, createError, buscaError });
        return null;
    }

    return carteiraRecuperada;
}

exports.processCredit = async (req, res) => {
    const { valor, metodo, idBandeira } = req.body;
    const idUsuario = req.userId;

    try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_adicionar_credito', {
            p_id_usuario: idUsuario,
            p_valor: parseFloat(valor),
            p_metodo_pagamento: metodo,
            p_tipo_movimentacao: 'Carteira_Digital',
            p_id_bandeira: idBandeira ? parseInt(idBandeira, 10) : null
        });

        if (rpcError) return res.status(400).json({ error: rpcError.message });
        
        return res.json(rpcResult);
    } catch (err) {
        return res.status(500).json({ error: "Erro interno no servidor." });
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

        let { data: carteira } = await supabase
            .from('carteira')
            .select('id_carteira')
            .eq('id_user', idUsuario)
            .maybeSingle();

        if (!carteira) {
            const { data: novaCarteira } = await supabase
                .from('carteira')
                .insert([{ id_user: idUsuario, saldo_atual: 0 }])
                .select('id_carteira')
                .single();
            carteira = novaCarteira;
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
    if (!limpo) return false;

    if (limpo.length < 8 || limpo.length > 19) return false;

    if (/^([0-9])\1+$/.test(limpo)) return false;

    if (limpo.length === 15 || limpo.length === 16 || limpo.length === 19) {
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

    return true;
}

exports.getCarteiraSaldo = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const idUsuarioAutenticado = req.userId;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: "Acesso negado." });
    }

    try {
        const carteira = await getOrCreateCarteira(idUsuarioAutenticado);
        if (!carteira) {
            return res.json({
                success: false,
                saldo: 0,
                message: "Carteira não encontrada."
            });
        }

        return res.json({
            success: true,
            saldo: parseFloat(carteira.saldo_atual || 0),
            id_carteira: carteira.id_carteira
        });
    } catch (err) {
        console.error('[paymentController] erro ao obter saldo');
        res.status(500).json({ error: "Erro ao obter saldo." });
    }
};

exports.getHistoricoByTipo = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const { tipo } = req.query;
    const idUsuarioAutenticado = req.userId;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: "Acesso negado." });
    }

    if (!tipo || !['Recarga', 'Carteira_Digital'].includes(tipo)) {
        return res.status(400).json({ error: "Tipo inválido. Use 'Recarga' ou 'Carteira_Digital'." });
    }

    try {
        const { data: carteira } = await supabase
            .from('carteira')
            .select('id_carteira')
            .eq('id_user', idUsuario)
            .maybeSingle();

        if (!carteira) {
            return res.json({ historico: [] });
        }

        const { data: historico } = await supabase
            .from('movimentacao')
            .select('*, bandeira_banco(nome_bandeira)')
            .eq('id_carteira', carteira.id_carteira)
            .eq('tipo_movimentacao', tipo)
            .order('data_realizada', { ascending: false });

        res.json({ historico: historico || [] });

    } catch (err) {
        console.error('[paymentController] erro ao obter histórico por tipo');
        res.status(500).json({ error: "Erro ao obter histórico." });
    }
};

exports.getMovimento = async (req, res) => {
    const { protocolo } = req.params;
    const idUsuario = req.userId;

    if (!protocolo) {
        return res.status(400).json({ error: 'Protocolo obrigatório.' });
    }

    try {
        const { data: carteira } = await supabase
            .from('carteira')
            .select('id_carteira')
            .eq('id_user', idUsuario)
            .maybeSingle();

        if (!carteira) {
            return res.status(404).json({ error: 'Carteira não encontrada.' });
        }

        const { data: movimento } = await supabase
            .from('movimentacao')
            .select('*, bandeira_banco(nome_bandeira)')
            .eq('id_carteira', carteira.id_carteira)
            .eq('n_protocolo', protocolo)
            .maybeSingle();

        if (!movimento) {
            return res.status(404).json({ error: 'Movimento não encontrado.' });
        }

        return res.json({
            success: true,
            data: movimento
        });
    } catch (err) {
        console.error('[paymentController] erro ao obter movimento');
        return res.status(500).json({ error: 'Erro ao obter movimento.' });
    }
};

exports.listarMovimentacoes = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const idUsuarioAutenticado = req.userId;
    const { situacao, tipo, page = 1, limit = 20 } = req.query;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: "Acesso negado." });
    }

    try {
        const { data: carteira } = await supabase
            .from('carteira')
            .select('id_carteira')
            .eq('id_user', idUsuario)
            .maybeSingle();

        if (!carteira) {
            return res.json({ movimentacoes: [], total: 0 });
        }

        let query = supabase
            .from('movimentacao')
            .select('*, bandeira_banco(nome_bandeira)', { count: 'exact' })
            .eq('id_carteira', carteira.id_carteira);

        if (situacao) {
            query = query.eq('situacao', situacao);
        }

        if (tipo) {
            query = query.eq('tipo_movimentacao', tipo);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { data: movimentacoes, count } = await query
            .order('data_realizada', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        return res.json({
            success: true,
            movimentacoes: movimentacoes || [],
            paginacao: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                paginas: Math.ceil((count || 0) / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('[paymentController] erro ao listar movimentações');
        res.status(500).json({ error: "Erro ao listar movimentações." });
    }
};
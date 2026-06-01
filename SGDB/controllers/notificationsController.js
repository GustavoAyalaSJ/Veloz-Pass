const { supabase } = require('../config/supabase');

/* TESTING - Notificações */
exports.listarNotificacoes = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const idUsuarioAutenticado = req.userId;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: 'Acesso negado.' });
    }

    try {
        const agoraIso = new Date().toISOString();

        const { data, error } = await supabase
            .from('notificacoes')
            .select('id_notificacao, protocolo, situacao, data_envio, expires_at')
            .eq('id_user', idUsuario)
            .gt('expires_at', agoraIso)
            .order('data_envio', { ascending: false })
            .limit(20);

        if (error) {
            return res.status(500).json({ error: 'Erro ao listar notificações.' });
        }

        res.json({ notifications: data || [] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno ao listar notificações.' });
    }
};

exports.registrarNotificacaoAgora = async (idUsuario, protocolo, situacao) => {
    if (!idUsuario || !protocolo || !situacao) return;

    const expiracaoData = new Date();
    expiracaoData.setDate(expiracaoData.getDate() + 30);
    const expiresAtISO = expiracaoData.toISOString();

    try {
        const { error } = await supabase.rpc('rpc_registrar_notificacao', {
            p_id_user: idUsuario,
            p_protocolo: protocolo,
            p_situacao: situacao,
            p_expires_at: expiresAtISO
        });

        if (error) {
            console.error('[Notificação RPC Error]', error);
        }
    } catch (err) {
        console.error('[Notificação Error]', err);
    }
};

exports.criarNotificacao = async (req, res) => {
    const { protocolo, situacao } = req.body;
    const idUsuario = req.userId;

    if (!protocolo || !situacao) {
        return res.status(400).json({ error: 'Protocolo e situação são obrigatórios.' });
    }

    try {
        await exports.registrarNotificacaoAgora(idUsuario, protocolo, situacao);
        res.json({ success: true, message: 'Notificação registrada.' });
    } catch (err) {
        console.error('[Criar Notificação Error]', err);
        res.status(500).json({ error: 'Erro ao registrar notificação.' });
    }
};

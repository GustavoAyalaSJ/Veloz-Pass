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
        res.status(500).json({ error: 'Erro interno ao listar notificações.' });
    }
};

exports.registrarNotificacaoAgora = async (idUsuario, protocolo, situacao) => {
    if (!idUsuario || !protocolo || !situacao) return;

    try {
        const { error } = await supabase.rpc('rpc_registrar_notificacao', {
            p_id_user: idUsuario,
            p_protocolo: protocolo,
            p_situacao: situacao
        });

        if (error) {
            console.error('[notificationsController] falha no RPC de notificação');
        }
    } catch (err) {
        console.error('[notificationsController] erro inesperado ao registrar notificação');
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
        console.error('[notificationsController] erro inesperado ao criar notificação');
        res.status(500).json({ error: 'Erro ao registrar notificação.' });
    }
};

exports.deletarNotificacao = async (req, res) => {
    const { idNotificacao } = req.params;
    const idUsuarioAutenticado = req.userId;

    if (!idNotificacao) {
        return res.status(400).json({ error: 'idNotificacao é obrigatório.' });
    }

    try {
        const { data, error } = await supabase
            .from('notificacoes')
            .delete()
            .eq('id_notificacao', idNotificacao)
            .eq('id_user', idUsuarioAutenticado)
            .select('id_notificacao')
            .maybeSingle();

        if (error) {
            return res.status(500).json({ error: 'Erro ao deletar notificação.' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Notificação não encontrada.' });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('[notificationsController] erro inesperado ao deletar notificação');
        return res.status(500).json({ error: 'Erro interno ao deletar notificação.' });
    }
};

exports.obterNotificacao = async (req, res) => {
    const { idNotificacao } = req.params;
    const idUsuarioAutenticado = req.userId;

    if (!idNotificacao) {
        return res.status(400).json({ error: 'idNotificacao é obrigatório.' });
    }

    try {
        const { data, error } = await supabase
            .from('notificacoes')
            .select('*')
            .eq('id_notificacao', idNotificacao)
            .eq('id_user', idUsuarioAutenticado)
            .maybeSingle();

        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar notificação.' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Notificação não encontrada.' });
        }

        return res.json({ success: true, data });
    } catch (err) {
        console.error('[notificationsController] erro ao obter notificação');
        return res.status(500).json({ error: 'Erro ao buscar notificação.' });
    }
};

exports.listarTodasNotificacoes = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const idUsuarioAutenticado = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: 'Acesso negado.' });
    }

    try {
        const offset = (page - 1) * limit;
        const agoraIso = new Date().toISOString();

        const { data, error, count } = await supabase
            .from('notificacoes')
            .select('*', { count: 'exact' })
            .eq('id_user', idUsuario)
            .gt('expires_at', agoraIso)
            .order('data_envio', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return res.status(500).json({ error: 'Erro ao listar notificações.' });
        }

        res.json({
            success: true,
            notifications: data || [],
            paginacao: {
                page,
                limit,
                total: count || 0,
                paginas: Math.ceil((count || 0) / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Erro interno ao listar notificações.' });
    }
};

exports.buscarPorProtocolo = async (req, res) => {
    const { protocolo } = req.params;
    const idUsuarioAutenticado = req.userId;

    if (!protocolo) {
        return res.status(400).json({ error: 'Protocolo é obrigatório.' });
    }

    try {
        const { data, error } = await supabase
            .from('notificacoes')
            .select('*')
            .eq('protocolo', protocolo)
            .eq('id_user', idUsuarioAutenticado)
            .maybeSingle();

        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar notificação.' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Notificação não encontrada.' });
        }

        return res.json({ success: true, data });
    } catch (err) {
        console.error('[notificationsController] erro ao buscar por protocolo');
        return res.status(500).json({ error: 'Erro ao buscar notificação.' });
    }
};

exports.limparNotificacoesExpiradas = async (req, res) => {
    const idUsuarioAutenticado = req.userId;

    try {
        const agoraIso = new Date().toISOString();

        const { error } = await supabase
            .from('notificacoes')
            .delete()
            .eq('id_user', idUsuarioAutenticado)
            .lt('expires_at', agoraIso);

        if (error) {
            return res.status(500).json({ error: 'Erro ao limpar notificações expiradas.' });
        }

        return res.json({ success: true, message: 'Notificações expiradas removidas com sucesso.' });
    } catch (err) {
        console.error('[notificationsController] erro ao limpar notificações expiradas');
        return res.status(500).json({ error: 'Erro ao limpar notificações.' });
    }
};

exports.contarNotificacoes = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const idUsuarioAutenticado = req.userId;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: 'Acesso negado.' });
    }

    try {
        const agoraIso = new Date().toISOString();

        const { count, error } = await supabase
            .from('notificacoes')
            .select('*', { count: 'exact', head: true })
            .eq('id_user', idUsuario)
            .gt('expires_at', agoraIso);

        if (error) {
            return res.status(500).json({ error: 'Erro ao contar notificações.' });
        }

        return res.json({ success: true, total: count || 0 });
    } catch (err) {
        console.error('[notificationsController] erro ao contar notificações');
        return res.status(500).json({ error: 'Erro ao contar notificações.' });
    }
};

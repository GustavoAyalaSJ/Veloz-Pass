const { supabase } = require('../config/supabase');

function formatMensagem(situacao) {
    if (situacao === 'Concluído') {
        return 'Foi confirmado pela nossa equipe, o saldo foi creditado na sua conta.';
    }
    return 'Foi recusado pela nossa equipe, você não perdeu saldo ou foi penalizado na sua conta bancária. Caso de erro, contate suporte.';
}

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

    await supabase.rpc('rpc_registrar_notificacao', {
        p_id_user: idUsuario,
        p_protocolo: protocolo,
        p_situacao: situacao
    }).catch(() => {});
};

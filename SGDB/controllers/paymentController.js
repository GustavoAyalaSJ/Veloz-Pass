const { supabase } = require('../config/supabase');

exports.getWalletData = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const idUsuarioAutenticado = req.userId;

    if (String(idUsuario) !== String(idUsuarioAutenticado)) {
        return res.status(403).json({ error: "Acesso negado." });
    }

    try {
        const { data: carteira, error: erroCarteira } = await supabase
            .from('carteira')
            .select('id_carteira, saldo_atual')
            .eq('id_usuario', idUsuario)
            .single();

        if (erroCarteira || !carteira) {
            return res.json({ saldo: 0, historico: [] });
        }

        const { data: history } = await supabase
            .from('movimentacao')
            .select('*, bandeira_banco(nome_bandeira)')
            .eq('id_carteira', carteira.id_carteira)
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

exports.processCredit = async (req, res) => {
    const { valor: valorRaw, metodo, numCartao, idBandeira } = req.body;
    const valorNum = parseFloat(valorRaw);
    const idUsuario = req.userId;

    if (isNaN(valorNum) || valorNum <= 0) {
        return res.status(400).json({ error: "Valor inválido" });
    }

    if (['DEBITO', 'CREDITO', 'INTERNACIONAL'].includes(metodo) && !validarCartao(numCartao)) {
        return res.status(400).json({ error: "Cartão inválido" });
    }

    try {
        const { data: carteira, error: erroCarteira } = await supabase
            .from('carteira')
            .select('id_carteira, saldo_atual')
            .eq('id_usuario', idUsuario)
            .single();

        if (erroCarteira || !carteira) return res.status(404).json({ error: "Carteira não encontrada" });

        const protocolo = 'VP' + Date.now();
        
        const { error: erroMove } = await supabase
            .from('movimentacao')
            .insert([{
                id_carteira: carteira.id_carteira,
                id_bandeira: idBandeira || null,
                n_protocolo: protocolo,
                tipo: metodo,
                valor: valorNum,
                situacao: 'CONCLUIDO',
                realizado_no: new Date().toISOString()
            }]);

        if (erroMove) throw erroMove;

        const saldoAnterior = parseFloat(carteira.saldo_atual || 0);
        const novoSaldo = saldoAnterior + valorNum;

        const { error: erroSaldo } = await supabase
            .from('carteira')
            .update({ saldo_atual: novoSaldo })
            .eq('id_carteira', carteira.id_carteira);

        if (erroSaldo) throw erroSaldo;

        res.status(200).json({ success: true, protocolo, valor: valorNum });

    } catch (err) {
        console.error("ERRO_SUPABASE:", err);
        res.status(500).json({ error: "Erro ao processar crédito no banco" });
    }
};

function validarCartao(numCartao) {
    if (!numCartao) return false;
    const limpo = numCartao.replace(/\D/g, '');
    return limpo.length >= 13 && limpo.length <= 16;
}

module.exports = exports;
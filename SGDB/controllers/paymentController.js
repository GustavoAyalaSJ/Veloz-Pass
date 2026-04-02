const { supabase } = require('../config/supabase');

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
            .eq('id_usuario', idUsuario)
            .single();

        if (erroCarteira || !carteira) {
            const { data: newCarteira, error: createError } = await supabase
                .from('carteira')
                .insert([{ id_usuario: idUsuario, saldo_atual: 0 }])
                .select()
                .single();

            if (createError) {
                console.error('Erro ao criar carteira:', createError);
                return res.json({ saldo: 0, historico: [] });
            }
            carteira = newCarteira;
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
        console.error("ERRO_SUPABASE getWalletData:", err);
        res.status(500).json({ error: "Erro interno ao buscar dados" });
    }
};

exports.processCredit = async (req, res) => {
    const { valor: valorRaw, metodo, numCartao, idBandeira, origem } = req.body;
    const valorNum = parseFloat(valorRaw);
    const idUsuario = req.userId;

    if (isNaN(valorNum) || valorNum <= 0) {
        return res.status(400).json({ error: "Valor inválido" });
    }

    if (['DEBITO', 'CREDITO', 'INTERNACIONAL'].includes(metodo) && !validarCartao(numCartao)) {
        return res.status(400).json({ error: "Cartão inválido" });
    }

    try {
        let { data: carteira, error: erroCarteira } = await supabase
            .from('carteira')
            .select('id_carteira, saldo_atual')
            .eq('id_usuario', idUsuario)
            .single();

        if (erroCarteira || !carteira) {
            const { data: newCarteira, error: createError } = await supabase
                .from('carteira')
                .insert([{ id_usuario: idUsuario, saldo_atual: 0 }])
                .select('id_carteira, saldo_atual')
                .single();

            if (createError) throw createError;
            carteira = newCarteira;
        }

        const protocolo = 'VP' + Date.now();
        const idManual = Math.floor(Date.now() / 1000); 

        const { error: erroMove } = await supabase
            .from('movimentacao')
            .insert([{
                id_move: idManual,
                id_carteira: carteira.id_carteira,
                id_bandeira: idBandeira || null,
                n_protocolo: protocolo,
                tipo: metodo,
                valor: valorNum,
                situacao: 'CONCLUIDO',
                realizado_no: origem || "Recarga",
                data_realizada: new Date().toISOString()
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
        console.error("ERRO_SUPABASE processCredit:", err);
        res.status(500).json({ error: "Erro ao processar crédito: " + (err.message || "Erro desconhecido") });
    }
};

function validarCartao(numCartao) {
    if (!numCartao) return false;
    const limpo = numCartao.replace(/\D/g, '');
    return limpo.length >= 13 && limpo.length <= 16;
}

module.exports = exports;
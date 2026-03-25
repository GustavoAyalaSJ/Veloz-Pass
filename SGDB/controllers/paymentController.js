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
            .select(`
             *,
             bandeira_banco (nome_bandeira)
           `)
            .eq('id_carteira', carteira.id_carteira)
            .order('id_move', { ascending: false })
            .limit(50);

        res.json({
            saldo: parseFloat(carteira.saldo_atual),
            historico: history || []
        });

    } catch (err) {
        console.error("Erro na carteira:", err.message);
        res.status(500).json({ error: "Erro interno ao buscar dados" });
    }
};

exports.processCredit = async (req, res) => {
    const { valor: valorRaw, metodo, numCartao, idBandeira } = req.body;
    const valor = parseFloat(valorRaw);
    const idUsuario = req.userId;
    console.log(`[PROCESS_CREDIT] User: ${idUsuario}, Body:`, { valor, metodo, numCartao: numCartao?.length || 0, idBandeira });

    if (isNaN(valor) || valor <= 0) {
        console.log('[ERROR] Valor inválido:', valorRaw, '->', valor);
        return res.status(400).json({ error: "Valor inválido", received: valorRaw });
    }

    const tiposPermitidos = ['DEBITO', 'CREDITO', 'INTERNACIONAL', 'PIX', 'CARTEIRA_DIGITAL'];
    if (!tiposPermitidos.includes(metodo)) {
        console.log('[ERROR] Metodo inválido:', metodo);
        return res.status(400).json({ error: "Tipo de movimentação inválido", received: metodo });
    }

    if (['DEBITO', 'CREDITO', 'INTERNACIONAL'].includes(metodo) && !validarCartao(numCartao)) {
        console.log('[ERROR] Cartao inválido:', numCartao);
        return res.status(400).json({ error: "Número de cartão inválido", received: numCartao });
    }

    try {
        const { data: carteira, error: erroCarteira } = await supabase
            .from('carteira')
            .select('id_carteira, saldo_atual')
            .eq('id_usuario', idUsuario)
            .single();

        if (erroCarteira || !carteira) {
            return res.status(404).json({ error: "Carteira não encontrada" });
        }

        const protocolo = 'VP' + Date.now();
        const { error: erroMove } = await supabase
            .from('movimentacao')
            .insert([{
                id_carteira: carteira.id_carteira,
                id_bandeira: idBandeira || null,
                n_protocolo: protocolo,
                tipo: metodo,
                valor,
                situacao: 'PENDENTE',
                realizado_no: new Date().toISOString()
            }]);

        if (erroMove) throw erroMove;

        const novoSaldo = parseFloat(carteira.saldo_atual) + parseFloat(valor);
        const { error: erroSaldo } = await supabase
            .from('carteira')
            .update({ saldo_atual: novoSaldo })
            .eq('id_carteira', carteira.id_carteira);

        if (erroSaldo) throw erroSaldo;

        res.status(200).json({ success: true, protocolo, valor, tipo: metodo });

    } catch (err) {
        console.error("Erro no pagamento:", err);
        res.status(500).json({ error: "Erro ao processar crédito" });
    }
};

function validarCartao(numCartao) {
    if (!numCartao) return false;
    const cartaoLimpo = numCartao.replace(/\D/g, '');
    if (cartaoLimpo.length < 13 || cartaoLimpo.length > 19) return false;
    let soma = 0, alternar = false;
    for (let i = cartaoLimpo.length - 1; i >= 0; i--) {
        let n = parseInt(cartaoLimpo.charAt(i), 10);
        if (alternar) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        soma += n;
        alternar = !alternar;
    }
    return soma % 10 === 0;
}

module.exports = exports;

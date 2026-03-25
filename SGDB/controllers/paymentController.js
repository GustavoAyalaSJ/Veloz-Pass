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

        const { data: history, error: erroHistory } = await supabase
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
    const { valor, metodo, numCartao, idBandeira } = req.body;
    const idUsuarioAutenticado = req.userId;

    if (!valor || valor <= 0) return res.status(400).json({ error: "Valor inválido" });

    const tipo = metodo.toUpperCase();

    const tiposPermitidos = ['DEBITO', 'CREDITO', 'INTERNACIONAL', 'PIX', 'CARTEIRA_DIGITAL'];
    if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({ error: "Tipo de movimentação inválido" });
    }

    if (tipo !== 'PIX' && tipo !== 'CARTEIRA_DIGITAL' && !validarCartao(numCartao)) {
        return res.status(400).json({ error: "Número de cartão inválido" });
    }

    try {
        const { data: carteira, error: erroBusca } = await supabase
            .from('carteira')
            .select('id_carteira, saldo_atual')
            .eq('id_usuario', idUsuarioAutenticado)
            .single();

        if (erroBusca || !carteira) {
            console.error("ERRO: Carteira não encontrada para:", idUsuarioAutenticado);
            return res.status(404).json({
                error: "Carteira não encontrada. Verifique se o usuário foi criado corretamente."
            });
        }

        const protocolo = 'VP' + Date.now();

        const { error: erroMove } = await supabase
            .from('movimentacao')
            .insert([{
                id_carteira: carteira.id_carteira,
                id_bandeira: idBandeira || null, // opcional
                n_protocolo: protocolo,
                tipo,
                valor: parseFloat(valor),
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

        res.status(200).json({ success: true, protocolo, valor, tipo });

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

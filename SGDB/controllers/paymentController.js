const pool = require('../config/db');

exports.getWalletData = async (req, res) => {
    const idUsuario = parseInt(req.params.idUsuario);
    const idUsuarioAutenticado = req.userId; // Do JWT
    
    if (idUsuario !== idUsuarioAutenticado) {
        return res.status(403).json({ 
            error: "Acesso negado. Você só pode acessar seus próprios dados." 
        });
    }

    try {
        const carteiraRes = await pool.query(
            'SELECT id_carteira, saldo_atual FROM carteira WHERE id_usuario = $1',
            [idUsuario]
        );

        if (carteiraRes.rows.length === 0) {
            return res.json({ saldo: 0, historico: [] });
        }

        const id_carteira = carteiraRes.rows[0].id_carteira;
        const saldoAtual = carteiraRes.rows[0].saldo_atual;

        const history = await pool.query(`
            SELECT m.*, b.nome_bandeira 
            FROM movimentacao m 
            LEFT JOIN bandeira b ON m.id_bandeira = b.id_bandeira 
            WHERE m.id_carteira = $1
            ORDER BY m.id_move DESC
            LIMIT 50
        `, [id_carteira]);

        res.json({
            saldo: parseFloat(saldoAtual),
            historico: history.rows
        });

    } catch (err) {
        console.error("Erro ao buscar dados da carteira:", err.message);
        res.status(500).json({ 
            error: "Erro ao buscar dados da carteira"
        });
    }
};

exports.processCredit = async (req, res) => {
    const { valor, metodo, numCartao } = req.body;
    const idUsuarioAutenticado = req.userId;

    if (!idUsuarioAutenticado) {
        return res.status(401).json({ error: "Usuário não autenticado" });
    }

    if (!valor || typeof valor !== 'number' || valor <= 0 || valor > 10000) {
        return res.status(400).json({ 
            error: "Valor inválido. Deve ser entre 0.01 e 10000" 
        });
    }

    const metodosValidos = ['crédito', 'débito', 'internacional', 'pix'];
    if (!metodosValidos.includes(metodo)) {
        return res.status(400).json({ error: "Método de pagamento inválido" });
    }

    if (metodo !== 'pix' && !validarCartao(numCartao)) {
        return res.status(400).json({ error: "Número de cartão inválido" });
    }

    try {
        await pool.query('BEGIN');

        const carteiraRes = await pool.query(
            'SELECT id_carteira FROM carteira WHERE id_usuario = $1',
            [idUsuarioAutenticado]
        );

        if (carteiraRes.rows.length === 0) {
            throw new Error("Carteira não encontrada");
        }

        const idCarteira = carteiraRes.rows[0].id_carteira;

        const protocolo = 'VP' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        await pool.query(
            `INSERT INTO movimentacao 
            (id_carteira, n_protocolo, tipo, valor, id_bandeira, situacao) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [idCarteira, protocolo, metodo, valor, null, 'Pendente']
        );

        await pool.query(
            'UPDATE carteira SET saldo_atual = saldo_atual + $1 WHERE id_carteira = $2',
            [valor, idCarteira]
        );

        await pool.query('COMMIT');

        res.status(200).json({ 
            success: true, 
            message: 'Crédito adicionado com sucesso',
            protocolo,
            valor
        });

    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: "Erro ao processar pagamento" });
    }
};

function validarCartao(numCartao) {
    if (!numCartao) return false;
    
    const cartaoLimpo = numCartao.replace(/\D/g, '');
    if (cartaoLimpo.length < 13 || cartaoLimpo.length > 19) return false;
    
    let soma = 0;
    let alternar = false;
    
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
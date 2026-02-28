const pool = require('../config/db'); // Sua conexão com Postgres

exports.getWalletData = async (req, res) => {
    const { idUsuario } = req.params;
    try {
        const wallet = await pool.query('SELECT * FROM Carteira WHERE id_usuario = $1', [idUsuario]);
        const history = await pool.query(`
            SELECT m.*, b.nome_bandeira 
            FROM Movimentacao m 
            LEFT JOIN Bandeira_Banco b ON m.id_bandeira = b.id_bandeira 
            WHERE m.id_carteira = $1 ORDER BY m.data_realizada DESC`, [wallet.rows[0].id_carteira]);
        
        res.json({ saldo: wallet.rows[0].saldo_atual, historico: history.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.processCredit = async (req, res) => {
    const { idUsuario, valor, metodo, numCartao } = req.body;

    try {
        await pool.query('BEGIN');

        let idBandeira = null;
        if (metodo === 'credito' || metodo === 'debito') {
            idBandeira = parseInt(numCartao.slice(-1));
            if (idBandeira > 5 || idBandeira === 0) idBandeira = 1;
        }

        const carteiraRes = await pool.query('SELECT id_carteira FROM Carteira WHERE id_usuario = $1', [idUsuario]);
        const idCarteira = carteiraRes.rows[0].id_carteira;

        const protocolo = 'VP' + Math.floor(Date.now() / 1000);
        await pool.query(
            'INSERT INTO Movimentacao (id_carteira, n_protocolo, tipo, valor, id_bandeira, situacao) VALUES ($1, $2, $3, $4, $5, $6)',
            [idCarteira, protocolo, metodo, valor, idBandeira, 'Concluído']
        );

        await pool.query('UPDATE Carteira SET saldo_atual = saldo_atual + $1 WHERE id_carteira = $2', [valor, idCarteira]);

        await pool.query('COMMIT');
        res.status(200).json({ success: true, protocolo });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
};
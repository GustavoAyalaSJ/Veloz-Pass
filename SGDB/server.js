const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/introduction', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index2.html'));
});

app.get('/historico_geral', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index3.html'));
});

app.get('/carteira_digital', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index4.html'));
});

app.get('/recarga', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index5.html'));
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index6.html'));
});


app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

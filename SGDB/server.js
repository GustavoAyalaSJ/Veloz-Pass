const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');

const { supabase } = require('./config/supabase.js'); 

const app = express();

app.use(helmet());

app.use(compression());

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://veloz-pass.onrender.com' 
        : ['http://localhost:3000', 'http://localhost:5500', 'https://veloz-pass.onrender.com'],
    credentials: true,
    optionsSuccessStatus: 200
}));

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas tentativas de login, tente novamente em 15 minutos'
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: 'Muitas requisições, tente novamente depois'
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',  
    etag: false
}));

app.use((req, res, next) => {
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
    }
    next();
});

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

app.use('/api/', apiLimiter);

app.use('/auth', loginLimiter, authRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 3000;

app.get('/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bandeira_banco')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Erro Supabase:', error.message);
      return res.status(500).json({ status: 'Erro ao conectar', error: error.message });
    }

    res.json({ status: 'Conectado ao Supabase', exemplo: data });
  } catch (err) {
    console.error('Erro inesperado:', err);
    res.status(500).json({ status: 'Erro inesperado', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV}`);
});

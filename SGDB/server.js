const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');

const app = express();

// Security Headers
app.use(helmet());

// CORS Restringido
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://seudominio.com' 
        : ['http://localhost:3000', 'http://localhost:5500'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Rate Limiting - Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Muitas tentativas de login, tente novamente em 15 minutos'
});

// Rate Limiting - API Geral
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: 'Muitas requisições, tente novamente depois'
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Aplicar rate limiting à API
app.use('/api/', apiLimiter);

app.use('/', authRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV}`);
});

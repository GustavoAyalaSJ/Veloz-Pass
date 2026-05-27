const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
require('dotenv').config();

const { supabase } = require('./config/supabase.js');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const notificationRoutes = require('./routes/notifications');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cookieParser());

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

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: false
}));

const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
});

app.get('/csrf-token', csrfProtection, (req, res) => {
    return res.json({ csrfToken: req.csrfToken() });
});

app.use((req, res, next) => {
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
    }
    next();
});

app.get('/', (req, res) => {
    res.redirect('/introduction');
});

const sendVanillaIndex = (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'IntroducedPage.html'));
};

app.get('/introduction', sendVanillaIndex);
app.get('/dashboard', sendVanillaIndex);
app.get('/historico', sendVanillaIndex);
app.get('/carteira_digital', sendVanillaIndex);
app.get('/recarga', sendVanillaIndex);
app.get('/app', sendVanillaIndex);

app.get('/:any*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/Assets')) {
        return next();
    }
    return sendVanillaIndex(req, res);
});

app.use('/api/', apiLimiter);
app.use('/auth', loginLimiter, csrfProtection, authRoutes);

app.use('/api/payments', csrfProtection, (req, res, next) => {
    if (req.method === 'POST' && (req.path === '/add-credit' || req.path.includes('add-credit'))) {
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.numCartao) {
            sanitizedBody.numCartao = '[REDACTED]';
        }
        console.log(`[PAYMENT ${req.method}] ${req.userId || 'NO_USER'} -> ${req.path}`);
        console.log('Body:', JSON.stringify(sanitizedBody, null, 2));
    }
    next();
}, paymentRoutes);

app.use('/api/notifications', csrfProtection, notificationRoutes);

app.use('/Assets', express.static(path.join(__dirname, 'public', 'pages', 'assets')));

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV}`);
});
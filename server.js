const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const connectDB = require('./config/db');

// Carrega as variáveis de ambiente
dotenv.config({ path: './.env' });

// Configuração do Passport
require('./config/passport-setup')(passport);

// Conecta ao banco de dados
connectDB();

const app = express();

// Middleware de Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware de CORS para permitir requisições do seu frontend
app.use(cors({
    origin: process.env.CLIENT_URL, // URL do seu frontend (Live Server)
    credentials: true
}));

// Middleware de Sessão
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// Middleware do Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware para checar se o usuário está logado
const ensureAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).json({ message: 'Não autorizado' });
    }
};

// --- ROTAS ---

// Rotas de Autenticação
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect(process.env.CLIENT_URL + '/agentes.html'); // Redireciona para a página de agentes após o login
});

app.get('/auth/user', (req, res) => {
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Nenhum usuário logado' });
    }
});

app.get('/auth/logout', (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect(process.env.CLIENT_URL + '/Home.html');
    });
});

// Rotas da API de Personagens
const characterRouter = require('./routes/characters');
app.use('/api/characters', ensureAuth, characterRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando no modo ${process.env.NODE_ENV} na porta ${PORT}`);
});
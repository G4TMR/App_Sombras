// =================================================================
// Sombras do Abismo - Servidor Back-end com Autenticação
// =================================================================

// --- 1. Importações ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

// --- 2. Configuração Inicial ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- 3. Middlewares ---
app.use(express.json());

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

// --- 3.5. Configuração de Sessão e Autenticação ---
// Habilita o proxy para funcionar corretamente no Render
app.set('trust proxy', 1); 
app.use(session({
    secret: process.env.SESSION_SECRET || 'um_segredo_muito_secreto_para_desenvolvimento',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Usa cookies seguros em produção
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- 4. Conexão com o Banco de Dados ---
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/sombras-do-abismo-db';
mongoose.connect(DATABASE_URL)
.then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
.catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// --- 5. Schemas (Moldes) do Banco de Dados ---

// Novo Schema para Usuários
const UserSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: String,
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// Schema de Personagem atualizado com referência ao dono (usuário)
const CharacterSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    class: String,
    element: String,
    attributes: Object,
    personalization: Object,
    status: Object,
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

const Character = mongoose.model('Character', CharacterSchema);

// --- 5.5. Configuração do Passport (Estratégia Google) ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
            return done(null, user);
        } else {
            const newUser = new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value
            });
            await newUser.save();
            return done(null, newUser);
        }
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Middleware para proteger rotas
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Não autorizado. Por favor, faça login.' });
}

// --- 6. Rotas da API ---

// Rotas de Autenticação
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/Home.html` }), // Redireciona para a Home em caso de falha
    (req, res) => {
        // Sucesso na autenticação, redireciona para a página de agentes.
        res.redirect(`${FRONTEND_URL}/agentes.html`);
    }
);

app.get('/auth/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect(FRONTEND_URL);
    });
});

app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Nenhum usuário logado.' });
    }
});

// Rotas de Personagens (agora protegidas e associadas ao usuário)
app.post('/api/characters', ensureAuthenticated, async (req, res) => {
    try {
        const characterData = { ...req.body, owner: req.user._id };
        const newCharacter = new Character(characterData);
        await newCharacter.save();
        res.status(201).json(newCharacter);
    } catch (error) {
        console.error("Erro ao criar personagem:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.get('/api/characters', ensureAuthenticated, async (req, res) => {
    try {
        const characters = await Character.find({ owner: req.user._id });
        res.status(200).json(characters);
    } catch (error) {
        console.error("Erro ao listar personagens:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.get('/api/characters/:id', ensureAuthenticated, async (req, res) => {
    try {
        const character = await Character.findOne({ id: req.params.id, owner: req.user._id });
        if (!character) return res.status(404).json({ message: 'Personagem não encontrado.' });
        res.status(200).json(character);
    } catch (error) {
        console.error("Erro ao buscar personagem:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.put('/api/characters/:id', ensureAuthenticated, async (req, res) => {
    try {
        const updatedCharacter = await Character.findOneAndUpdate(
            { id: req.params.id, owner: req.user._id },
            req.body,
            { new: true }
        );
        if (!updatedCharacter) return res.status(404).json({ message: 'Personagem não encontrado.' });
        res.status(200).json(updatedCharacter);
    } catch (error) {
        console.error("Erro ao atualizar personagem:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.delete('/api/characters/:id', ensureAuthenticated, async (req, res) => {
    try {
        const result = await Character.findOneAndDelete({ id: req.params.id, owner: req.user._id });
        if (!result) return res.status(404).json({ message: 'Personagem não encontrado.' });
        res.status(200).json({ message: 'Personagem excluído com sucesso.' });
    } catch (error) {
        console.error("Erro ao deletar personagem:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// --- 7. Iniciando o Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}.`);
});

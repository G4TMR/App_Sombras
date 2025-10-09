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
const MongoStore = require('connect-mongo'); // 1. Importa o MongoStore

// --- 2. Configuração Inicial ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- 3. Middlewares ---
app.use(express.json({ limit: '10mb' })); // Aumenta o limite para 10MB para aceitar imagens em base64

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
    // 2. Configura o armazenamento da sessão no MongoDB
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL,
        collectionName: 'sessions', // Nome da coleção para guardar as sessões
        ttl: 14 * 24 * 60 * 60 // Tempo de vida da sessão: 14 dias
    }),
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

// Validação para garantir que a URL do banco de dados está definida em produção
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.error('❌ ERRO CRÍTICO: A variável de ambiente DATABASE_URL não está definida.');
    process.exit(1);
}

mongoose.connect(DATABASE_URL)
.then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
.catch(err => {
    console.error('❌ Erro CRÍTICO ao conectar ao MongoDB:', err);
    process.exit(1); // Encerra o processo se a conexão com o DB falhar.
});

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

// Novo Schema para Campanhas
const CampaignSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    synopsis: String,
    imageUrl: String,
    inviteCode: { type: String, unique: true, sparse: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
    createdAt: { type: Date, default: Date.now }
}, { strict: false }); // strict: false para permitir outros campos que o frontend possa enviar
const Campaign = mongoose.model('Campaign', CampaignSchema);

// --- 5.5. Configuração do Passport (Estratégia Google) ---

// Validação para garantir que as variáveis de ambiente do Google estão definidas
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ ERRO CRÍTICO: As variáveis de ambiente GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET não estão definidas.');
    console.error('A autenticação do Google não funcionará. Verifique a configuração no Render.');
    process.exit(1); // Encerra o processo se as chaves não estiverem presentes
}

// Validação extra para o formato do GOOGLE_CLIENT_ID
if (!process.env.GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
    console.warn('⚠️ ALERTA: O GOOGLE_CLIENT_ID parece ter um formato inválido.');
    console.warn('Ele deve terminar com ".apps.googleusercontent.com". Verifique se não há prefixos ou erros de cópia.');
}

const clientIdInUse = process.env.GOOGLE_CLIENT_ID || '';
console.log(`ℹ️  Verificando ID do Cliente em uso: ${clientIdInUse.substring(0, 4)}... (completo no Google)`);

const GOOGLE_CALLBACK_URL = `${BACKEND_URL}/auth/google/callback`;
console.log(`ℹ️  Configurando callback do Google para: ${GOOGLE_CALLBACK_URL}`);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL
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
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

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
        // Busca o personagem pelo ID customizado ou pelo _id do MongoDB
        const character = await Character.findOne({ 
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
                { id: req.params.id }
            ]
        });
        if (!character) return res.status(404).json({ message: 'Personagem não encontrado.' });

        // Verifica se o usuário é o dono do personagem
        const isOwner = character.owner.equals(req.user._id);
        
        // Se não for o dono, verifica se o usuário e o personagem estão na mesma campanha
        // CORREÇÃO: A lógica anterior estava falha. A nova lógica busca por campanhas que contenham o personagem
        // e, DENTRO DESSAS CAMPANHAS, verifica se o usuário logado é o mestre ou um jogador.
        const campaignsWithCharacter = await Campaign.find({ 
            'characters': character._id, // Encontra campanhas que contêm o personagem
            '$or': [{ 'ownerId': req.user._id }, { 'players': req.user._id }] // E onde o usuário logado é mestre ou jogador
        });

        if (!isOwner && campaignsWithCharacter.length === 0) {
            return res.status(403).json({ message: 'Você não tem permissão para visualizar esta ficha.' });
        }

        res.status(200).json(character);
    } catch (error) {
        console.error("Erro ao buscar personagem:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.put('/api/characters/:id', ensureAuthenticated, async (req, res) => {
    try {
        // Primeiro, encontra o personagem pelo ID (pode ser _id ou id customizado)
        const character = await Character.findOne({
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
                { id: req.params.id }
            ]
        });
        if (!character) return res.status(404).json({ message: 'Personagem não encontrado.' });

        // Verifica se o usuário logado é o dono do personagem
        const isOwner = character.owner.equals(req.user._id);

        // Se não for o dono, verifica se o usuário é o mestre de alguma campanha que contém este personagem
        let isCampaignMaster = false;
        if (!isOwner) {
            const campaign = await Campaign.findOne({ characters: character._id, ownerId: req.user._id });
            isCampaignMaster = !!campaign;
        }

        if (!isOwner && !isCampaignMaster) {
            return res.status(403).json({ message: 'Você não tem permissão para editar esta ficha.' });
        }

        const updatedCharacter = await Character.findByIdAndUpdate(character._id, req.body, { new: true });
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

// --- Rotas de Campanhas ---

// Criar uma nova campanha
app.post('/api/campaigns', ensureAuthenticated, async (req, res) => {
    try {
        const campaignData = { ...req.body, ownerId: req.user._id };
        const newCampaign = new Campaign(campaignData);
        await newCampaign.save();
        res.status(201).json(newCampaign);
    } catch (error) {
        console.error("Erro ao criar campanha:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar campanha.' });
    }
});

// Obter todas as campanhas do usuário (criadas e participando)
app.get('/api/campaigns', ensureAuthenticated, async (req, res) => {
    try {
        // A query correta para buscar campanhas onde o usuário é dono OU está na lista de jogadores.
        const campaigns = await Campaign.find({ $or: [{ ownerId: req.user._id }, { players: req.user._id }] })
            .populate('ownerId', 'displayName').sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        console.error("Erro ao listar campanhas:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao listar campanhas.' });
    }
});

// Obter uma campanha específica
app.get('/api/campaigns/:id', ensureAuthenticated, async (req, res) => {
    try {
        // Adicionado .populate() para garantir que ownerId seja sempre um objeto
        // Modificado para buscar por _id (padrão do Mongo) ou pelo campo 'id' (gerado no frontend)
        const campaign = await Campaign.findOne({
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
                { id: req.params.id }
            ]
        }).populate('ownerId', 'displayName')
          // CORREÇÃO: Garante que a lista de jogadores sempre venha populada
          .populate('players', 'displayName email') 
          .populate('characters'); // Popula os dados completos dos personagens

        if (!campaign) return res.status(404).json({ message: 'Campanha não encontrada.' });

        // Verifica se o usuário é o dono ou um jogador
        const isOwner = campaign.ownerId.equals(req.user._id);
        const isPlayer = campaign.players.some(p => p.equals(req.user._id));
        if (!isOwner && !isPlayer) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }
        res.status(200).json(campaign);
    } catch (error) {
        console.error("Erro ao buscar campanha:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar campanha.' });
    }
});

// Atualizar uma campanha
app.put('/api/campaigns/:id', ensureAuthenticated, async (req, res) => {
    try {
        // O parâmetro da URL agora é o _id do MongoDB
        const updatedCampaign = await Campaign.findOneAndUpdate(
            // Encontra pelo _id e garante que o usuário logado é o dono.
            { _id: req.params.id, ownerId: req.user._id }, 
            req.body,
            { new: true }
        );
        if (!updatedCampaign) return res.status(404).json({ message: 'Campanha não encontrada ou você não é o dono.' });
        res.status(200).json(updatedCampaign);
    } catch (error) {
        console.error("Erro ao atualizar campanha:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar campanha.' });
    }
});

// Deletar uma campanha
app.delete('/api/campaigns/:id', ensureAuthenticated, async (req, res) => {
    try {
        // Modificado para buscar por _id ou id, mas garantindo que apenas o dono possa deletar.
        const result = await Campaign.findOneAndDelete({
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
                { id: req.params.id }
            ],
            ownerId: req.user._id // A verificação de dono é crucial e permanece.
        });
        if (!result) return res.status(404).json({ message: 'Campanha não encontrada ou você não é o dono.' });
        res.status(200).json({ message: 'Campanha excluída com sucesso.' });
    } catch (error) {
        console.error("Erro ao deletar campanha:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao deletar campanha.' });
    }
});

// Entrar em uma campanha com código
app.post('/api/campaigns/join', ensureAuthenticated, async (req, res) => {
    const { inviteCode } = req.body;
    if (!inviteCode) {
        return res.status(400).json({ message: 'Código de convite é obrigatório.' });
    }

    try {
        const campaign = await Campaign.findOne({ inviteCode: inviteCode });
        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada com este código.' });
        }

        // Verifica se o usuário já é o dono ou um jogador
        const isOwner = campaign.ownerId.equals(req.user._id);
        const isAlreadyPlayer = campaign.players.some(p => p.equals(req.user._id));

        if (isOwner) {
            return res.status(400).json({ message: 'Você já é o mestre desta campanha.' });
        }
        if (isAlreadyPlayer) {
            return res.status(400).json({ message: 'Você já está participando desta campanha.' });
        }

        // Se não for dono nem jogador, adiciona à lista
        if (!isOwner && !isAlreadyPlayer) {
            campaign.players.push(req.user._id);
            await campaign.save();
        }
        res.status(200).json(campaign);
    } catch (error) {
        console.error("Erro ao entrar na campanha:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao entrar na campanha.' });
    }
});

// Adicionar um personagem a uma campanha
app.put('/api/campaigns/:id/add-character', ensureAuthenticated, async (req, res) => {
    const { characterId } = req.body;
    const campaignId = req.params.id;

    if (!characterId) return res.status(400).json({ message: 'O ID do personagem é obrigatório.' });
    if (!campaignId) return res.status(400).json({ message: 'O ID da campanha é obrigatório.' });

    try {
        // Busca o personagem para garantir que ele pertence ao usuário logado
        const characterToAdd = await Character.findOne({ _id: characterId, owner: req.user._id });
        if (!characterToAdd) {
            return res.status(404).json({ message: 'Personagem não encontrado ou não pertence a você.' });
        }

        const campaign = await Campaign.findOne({
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(campaignId) ? campaignId : null },
                { id: campaignId }
            ]
        });
        if (!campaign) return res.status(404).json({ message: 'Campanha não encontrada.' });

        // Verifica se o personagem já está na campanha
        if (campaign.characters && campaign.characters.includes(characterId)) {
            return res.status(400).json({ message: 'Este agente já está na campanha.' });
        }

        // Adiciona o personagem à campanha
        await Campaign.updateOne({ _id: campaign._id }, { $addToSet: { characters: characterId } });

        // Popula os dados do personagem recém-adicionado para retornar ao frontend
        const populatedCharacter = await Character.findById(characterId).populate('owner', 'displayName');

        res.status(200).json({ 
            message: 'Agente adicionado com sucesso!',
            character: populatedCharacter // Retorna o personagem completo
        });
    } catch (error) {
        console.error("Erro ao adicionar personagem à campanha:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Remover um personagem de uma campanha
app.delete('/api/campaigns/:campaignId/characters/:characterId', ensureAuthenticated, async (req, res) => {
    const { campaignId, characterId } = req.params;

    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.status(404).json({ message: 'Campanha não encontrada.' });

        const character = await Character.findById(characterId);
        if (!character) return res.status(404).json({ message: 'Personagem não encontrado.' });

        // Verifica a permissão: Apenas o dono do personagem ou o mestre da campanha podem remover.
        const isCharacterOwner = character.owner.equals(req.user._id);
        const isCampaignOwner = campaign.ownerId.equals(req.user._id);

        if (!isCharacterOwner && !isCampaignOwner) {
            return res.status(403).json({ message: 'Você não tem permissão para remover este agente.' });
        }

        // Remove o ID do personagem do array 'characters' da campanha
        await Campaign.updateOne(
            { _id: campaignId },
            { $pull: { characters: characterId } }
        );

        res.status(200).json({ message: 'Agente removido da campanha com sucesso.' });
    } catch (error) {
        console.error("Erro ao remover personagem da campanha:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Remover um jogador de uma campanha (apenas para o mestre)
app.delete('/api/campaigns/:campaignId/players/:playerId', ensureAuthenticated, async (req, res) => {
    const { campaignId, playerId } = req.params;

    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }

        // Apenas o mestre da campanha pode remover jogadores.
        if (!campaign.ownerId.equals(req.user._id)) {
            return res.status(403).json({ message: 'Você não tem permissão para remover jogadores desta campanha.' });
        }

        // Remove o ID do jogador do array 'players' da campanha
        await Campaign.updateOne(
            { _id: campaignId },
            { $pull: { players: playerId } }
        );

        res.status(200).json({ message: 'Jogador removido da campanha com sucesso.' });
    } catch (error) {
        console.error("Erro ao remover jogador da campanha:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});
// --- 7. Iniciando o Servidor ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}.`);
});

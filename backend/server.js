// =================================================================
// Sombras do Abismo - Servidor Back-end
// =================================================================

// --- 1. Importações ---
// Express: nosso framework para criar o servidor e as rotas da API
const express = require('express');
// Mongoose: para conectar e interagir com o banco de dados MongoDB
const mongoose = require('mongoose');
// Cors: para permitir que o seu front-end (em outra porta) possa fazer requisições para este servidor
const cors = require('cors');

// --- 2. Configuração Inicial ---
const app = express();
// A porta será fornecida pelo ambiente de produção (como o Render) ou será 3000 em modo local.
const PORT = process.env.PORT || 3000;

// --- 3. Middlewares ---
// Permite que o Express entenda requisições com corpo em JSON
app.use(express.json());

// A URL do front-end virá do ambiente de produção ou será a do Live Server localmente.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';

// Configura o CORS para permitir requisições do seu front-end
// 'credentials: true' é importante para a autenticação com Google no futuro
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

// --- 4. Conexão com o Banco de Dados (MongoDB) ---
// A string de conexão virá do ambiente de produção (Render) ou será a local.
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/sombras-do-abismo-db';
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
.catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// --- 5. Definindo o "Molde" do Personagem (Schema) ---
// Isso diz ao Mongoose como um personagem deve ser salvo no banco de dados.
// É flexível, então não precisa listar todos os campos.
const CharacterSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    class: String,
    element: String,
    attributes: Object,
    personalization: Object,
    status: Object,
    // Adicione outros campos principais que você queira garantir que existam
    createdAt: { type: Date, default: Date.now }
    // O Mongoose permite salvar campos que não estão no Schema se você não for estrito,
    // o que é ótimo para a complexidade da sua ficha.
}, { strict: false }); // 'strict: false' permite salvar campos não definidos aqui.

const Character = mongoose.model('Character', CharacterSchema);

// --- 6. Rotas da API (Os "Endpoints") ---

// Rota para CRIAR um novo personagem
// Corresponde ao `api.post('/characters', ...)` do seu script.js
app.post('/api/characters', async (req, res) => {
    try {
        const characterData = req.body;
        // Validação simples para garantir que o ID existe
        if (!characterData.id) {
            return res.status(400).json({ message: 'ID do personagem é obrigatório.' });
        }

        const newCharacter = new Character(characterData);
        await newCharacter.save(); // Salva no banco de dados

        res.status(201).json(newCharacter); // Responde com sucesso e com o personagem criado
    } catch (error) {
        console.error("Erro ao criar personagem:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao salvar o personagem.' });
    }
});

// Rota para LISTAR todos os personagens
// Corresponde ao `api.get('/characters')` do seu script.js
app.get('/api/characters', async (req, res) => {
    try {
        const characters = await Character.find(); // Busca todos os personagens no banco
        res.status(200).json(characters);
    } catch (error) {
        console.error("Erro ao listar personagens:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar os personagens.' });
    }
});

// Rota para DELETAR um personagem
// Corresponde ao `api.delete('/characters/:characterId')`
app.delete('/api/characters/:id', async (req, res) => {
    try {
        const characterId = req.params.id;
        const result = await Character.findOneAndDelete({ id: characterId });

        if (!result) {
            return res.status(404).json({ message: 'Personagem não encontrado.' });
        }

        res.status(200).json({ message: 'Personagem excluído com sucesso.' });
    } catch (error) {
        console.error("Erro ao deletar personagem:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para BUSCAR UM personagem específico pelo ID
// Corresponde ao `api.get('/characters/:charId')` da sua ficha
app.get('/api/characters/:id', async (req, res) => {
    try {
        const characterId = req.params.id;
        const character = await Character.findOne({ id: characterId });

        if (!character) {
            return res.status(404).json({ message: 'Personagem não encontrado.' });
        }

        res.status(200).json(character);
    } catch (error) {
        console.error("Erro ao buscar personagem por ID:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para ATUALIZAR um personagem
// Corresponde ao `api.put('/characters/:charId', ...)` da sua ficha
app.put('/api/characters/:id', async (req, res) => {
    try {
        const characterId = req.params.id;
        const updatedData = req.body;

        // { new: true } garante que o objeto retornado seja a versão atualizada
        const updatedCharacter = await Character.findOneAndUpdate({ id: characterId }, updatedData, { new: true });

        if (!updatedCharacter) {
            return res.status(404).json({ message: 'Personagem não encontrado para atualizar.' });
        }

        res.status(200).json(updatedCharacter);
    } catch (error) {
        console.error("Erro ao atualizar personagem:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// --- 7. Iniciando o Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}. Acesse http://localhost:${PORT}`);
});

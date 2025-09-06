const express = require('express');
const router = express.Router();
const Character = require('../models/Character');

// @desc    Pegar todos os personagens do usuário logado
// @route   GET /api/characters
router.get('/', async (req, res) => {
    try {
        const characters = await Character.find({ user: req.user.id }).lean();
        // Retorna apenas o 'characterData' de cada documento
        const characterDataOnly = characters.map(c => c.characterData);
        res.json(characterDataOnly);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// @desc    Criar um novo personagem
// @route   POST /api/characters
router.post('/', async (req, res) => {
    try {
        const newCharacter = {
            user: req.user.id,
            characterData: req.body
        };
        await Character.create(newCharacter);
        res.status(201).json({ message: 'Personagem criado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// @desc    Atualizar um personagem
// @route   PUT /api/characters/:id
router.put('/:id', async (req, res) => {
    try {
        await Character.findOneAndUpdate({ 'characterData.id': req.params.id, user: req.user.id }, {
            characterData: req.body
        });
        res.json({ message: 'Personagem atualizado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

module.exports = router;
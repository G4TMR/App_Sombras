const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Usamos 'Mixed' para permitir qualquer estrutura de dados,
    // já que a ficha de personagem é complexa e pode mudar.
    characterData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

module.exports = mongoose.model('Character', CharacterSchema);
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURAÇÃO CRÍTICA ---
// Serve os arquivos estáticos da pasta PAI (onde estão index.html, style.css, script.js)
// __dirname = pasta backend
// ../ = pasta App_Sombras (raiz)
app.use(express.static(path.join(__dirname, '../')));

// Garante que a rota raiz entregue o index.html correto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Servindo arquivos da pasta raiz: ${path.join(__dirname, '../')}`);
});
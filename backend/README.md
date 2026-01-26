# 🌑 Sombras do Abismo - Backend Setup

## 📋 Pré-requisitos

1. **Node.js** (v18+)
2. **MongoDB** local ou MongoDB Atlas
3. **Google OAuth Credentials** (Client ID e Secret)

---

## 🚀 Instalação

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` e crie um `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
GOOGLE_CLIENT_ID=seu-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
MONGO_URI=mongodb://localhost:27017/sombras-abismo
SESSION_SECRET=sua-chave-secreta
```

### 3. Obter Credenciais do Google

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative o **OAuth 2.0** 
4. Crie um **Web Application** OAuth Client
5. Adicione as URIs de redirecionamento:
   - `http://localhost:3000/auth/google/callback` (desenvolvimento)
   - `https://seu-dominio.com/auth/google/callback` (produção)
6. Copie o **Client ID** e **Client Secret** para o `.env`

---

## ▶️ Rodar o Servidor

```bash
# Modo desenvolvimento
npm start

# Ou com nodemon (auto-reload)
npm install -g nodemon
nodemon server.js
```

O servidor estará disponível em: `http://localhost:3000`

---

## 📡 Rotas Disponíveis

### Autenticação

- **GET** `/auth/google` - Inicia login com Google
- **GET** `/auth/google/callback` - Callback do Google OAuth
- **GET** `/auth/user` - Retorna usuário autenticado
- **GET** `/auth/logout` - Fazer logout

### API (Placeholder - implementar conforme necessário)

- **GET** `/api/characters/:id` - Obter personagem
- **GET** `/api/campaigns` - Listar campanhas (requer autenticação)
- **POST** `/api/campaigns` - Criar campanha (requer autenticação)

---

## 🛠️ Próximos Passos

1. ✅ CORS configurado
2. ✅ Autenticação Google pronta
3. ⏳ Implementar modelos MongoDB
4. ⏳ Adicionar mais rotas da API
5. ⏳ Validação de dados
6. ⏳ Rate limiting
7. ⏳ Logs estruturados

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### Erro: "CORS error"
Verifique se a URL do frontend está na lista `allowedOrigins` no `server.js`

### Erro: "MongoDB connection failed"
- Certifique-se que MongoDB está rodando
- Verifique a `MONGO_URI` no `.env`

### Erro: "Invalid OAuth credentials"
- Verifique Client ID e Secret no Google Cloud Console
- Confirme que a Callback URL está registrada

---

## 📚 Documentação

- [Express.js](https://expressjs.com/)
- [Passport.js](http://www.passportjs.org/)
- [Mongoose](https://mongoosejs.com/)
- [MongoDB](https://www.mongodb.com/)

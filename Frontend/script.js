/**
 * Sombras do Abismo - Script Principal
 * Contém a lógica para a criação de personagens e exibição de agentes.
 */

// --- MODO DE DESENVOLVIMENTO (para testar no seu PC) ---
// const API_BASE_URL = 'http://localhost:3000';

// --- MODO DE PRODUÇÃO (para o site online) ---
const API_BASE_URL = 'https://app-sombras.onrender.com'; // URL CORRIGIDA do seu serviço no Render

// Configuração do Axios para comunicação com a API
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Permite que cookies de autenticação sejam enviados
});

// Adiciona um interceptor para lidar com erros de autenticação globalmente
// Isso garante que, se a sessão expirar, o usuário seja redirecionado para o login.
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Se for um erro 401 (Não Autorizado), redireciona para a página de login
            console.warn("Sessão expirada ou não autorizado. Redirecionando para login.");
            window.location.href = `${API_BASE_URL}/auth/google`; // Ou sua página de login
        }
        return Promise.reject(error);
    }
);

let currentUserId = 'local_user_id'; // ID padrão para modo local/não logado. Será atualizado por checkAuthStatus.

const CLASS_BASE_ATTRIBUTES = {
    'Bélico': { forca: 3, agilidade: 2, presenca: 1, vitalidade: 3, inteligencia: 1 },
    'Esotérico': { forca: 1, agilidade: 2, presenca: 3, vitalidade: 2, inteligencia: 2 },
    'Erudito': { forca: 1, agilidade: 1, presenca: 2, vitalidade: 2, inteligencia: 4 },
};

const SPECIALIZATIONS = {
    'Bélico': [
        { name: 'Vanguarda', description: 'Focado na resistência e proteção de aliados, capaz de suportar dano massivo e controlar a linha de frente do combate.' },
        { name: 'Aniquilador', description: 'Especialista em causar o máximo de dano possível, utilizando técnicas brutais para sobrepujar os inimigos rapidamente.' },
        { name: 'Tático de Guerrilha', description: 'Mestre em agilidade e astúcia, usando o ambiente e armadilhas para obter vantagem tática sobre adversários.' }
    ],
    'Esotérico': [
        { name: 'Lâmina Paranormal', description: 'Canaliza energia paranormal diretamente em sua arma, focando em rituais de curto alcance e ataques corpo a corpo devastadores.' },
        { name: 'Conduíte Rúnico', description: 'Utiliza símbolos e tatuagens arcanas para conjurar rituais complexos à distância, controlando o campo de batalha com poder elemental.' },
        { name: 'Ceifador Anímico', description: 'Manipula a energia vital e da morte, drenando a força dos inimigos para fortalecer a si mesmo e a seus aliados.' }
    ],
    'Erudito': [
        { name: 'Estrategista de Campo', description: 'Analisa o combate em tempo real, identificando fraquezas inimigas e coordenando os aliados com precisão letal.' },
        { name: 'Arquiteto da Realidade', description: 'Manipula as leis fundamentais do universo, reescrevendo a física local para criar barreiras, distorcer o espaço ou anular o poder inimigo.' },
        { name: 'Médico de Batalha', description: 'Especialista em anatomia e bioquímica, capaz de curar ferimentos graves e criar concoções que aprimoram o desempenho dos aliados.' }
    ]
};

const DEFAULT_SKILL_TREES = {
    'Bélico': {
        'Temporal': {
            'Vanguarda': [
                { id: 'belico-temporal-vanguarda-1', name: 'Barreira Temporal', description: 'Ao ser atingido, você cria uma distorção que retarda o agressor, reduzindo sua velocidade de movimento e ataque por um turno.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-temporal-vanguarda-2', name: 'Resistência Ancestral', description: 'Você canaliza a resiliência de guerreiros passados, ganhando uma redução de dano temporária baseada em quantos inimigos te cercam.', requirements: {}, unlocked: false, children: [] }
            ],
            'Aniquilador': [
                { id: 'belico-temporal-aniquilador-1', name: 'Golpe Acelerado', description: 'Manipula uma fração de segundo para realizar um ataque extra com sua arma, com dano ligeiramente reduzido.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-temporal-aniquilador-2', name: 'Lâmina do Crepúsculo', description: 'Seu ataque ressoa com a entropia, causando dano adicional a alvos que já estão com pouca vida.', requirements: {}, unlocked: false, children: [] }
            ],
            'Tático de Guerrilha': [
                { id: 'belico-temporal-tatico-1', name: 'Armadilha de Estase', description: 'Você marca uma área no chão. O próximo inimigo a pisar nela fica congelado no tempo por um turno, incapaz de agir.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-temporal-tatico-2', name: 'Passo Fantasma', description: 'Você se desloca brevemente do fluxo do tempo, tornando-se invisível e inalvejável por um curto período.', requirements: {}, unlocked: false, children: [] }
            ]
        },
        'Cerebral': {
            'Vanguarda': [
                { id: 'belico-cerebral-vanguarda-1', name: 'Provocação Psíquica', description: 'Você implanta um comando mental em um alvo, forçando-o a te atacar no próximo turno, ignorando seus aliados.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-cerebral-vanguarda-2', name: 'Fortaleza Mental', description: 'Sua mente se torna uma cidadela, concedendo alta resistência a efeitos de medo, confusão e controle mental.', requirements: {}, unlocked: false, children: [] }
            ],
            'Aniquilador': [
                { id: 'belico-cerebral-aniquilador-1', name: 'Ponto Fraco Exposto', description: 'Sua análise de combate revela uma falha na defesa do inimigo. Seu próximo ataque contra ele é um acerto crítico garantido.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-cerebral-aniquilador-2', name: 'Impacto Mental', description: 'Além do dano físico, seu golpe sobrecarrega a mente do alvo, causando confusão e penalidade em suas ações.', requirements: {}, unlocked: false, children: [] }
            ],
            'Tático de Guerrilha': [
                { id: 'belico-cerebral-tatico-1', name: 'Isca Ilusória', description: 'Você projeta uma cópia perfeita de si mesmo que atrai o fogo inimigo por um turno ou até ser atingida.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-cerebral-tatico-2', name: 'Campo de Silêncio', description: 'Cria uma pequena área onde todos os sons são completamente abafados, ideal para operações furtivas.', requirements: {}, unlocked: false, children: [] }
            ]
        },
        'Visceral': {
            'Vanguarda': [
                { id: 'belico-visceral-vanguarda-1', name: 'Pele de Pedra', description: 'Sua pele endurece como rocha, concedendo uma massiva redução a dano físico por um curto período.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-visceral-vanguarda-2', name: 'Fôlego Infinito', description: 'Sua biologia se adapta, eliminando a necessidade de respirar e concedendo imunidade a venenos gasosos e exaustão.', requirements: {}, unlocked: false, children: [] }
            ],
            'Aniquilador': [
                { id: 'belico-visceral-aniquilador-1', name: 'Frenesi Sangrento', description: 'Quanto menos vida você tem, mais rápido e forte você ataca. Um ciclo de dor e poder.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-visceral-aniquilador-2', name: 'Golpe Esmagador', description: 'Um ataque brutal que quebra ossos, aplicando uma penalidade permanente nos atributos físicos do alvo.', requirements: {}, unlocked: false, children: [] }
            ],
            'Tático de Guerrilha': [
                { id: 'belico-visceral-tatico-1', name: 'Mimetismo Biológico', description: 'Você altera a pigmentação e textura da sua pele para se camuflar perfeitamente com o ambiente.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-visceral-tatico-2', name: 'Injeção de Veneno', description: 'Suas armas ou ataques desarmados podem aplicar uma toxina que causa dano contínuo e reduz a cura recebida pelo alvo.', requirements: {}, unlocked: false, children: [] }
            ]
        },
        'Vital': {
            'Vanguarda': [
                { id: 'belico-vital-vanguarda-1', name: 'Escudo de Força Reativo', description: 'Você projeta um escudo de energia. Se for quebrado, ele explode, causando dano e empurrando inimigos próximos.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-vital-vanguarda-2', name: 'Aura Protetora', description: 'Você emana uma aura de energia que concede uma pequena redução de dano a todos os aliados próximos a você.', requirements: {}, unlocked: false, children: [] }
            ],
            'Aniquilador': [
                { id: 'belico-vital-aniquilador-1', name: 'Lâmina de Energia Pura', description: 'Sua arma é envolta em energia crepitante, ignorando armaduras e causando dano de energia pura.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-vital-aniquilador-2', name: 'Impacto Cinético', description: 'Seu golpe libera uma onda de força telecinética, arremessando o alvo para longe e causando dano de colisão.', requirements: {}, unlocked: false, children: [] }
            ],
            'Tático de Guerrilha': [
                { id: 'belico-vital-tatico-1', name: 'Mina de Proximidade', description: 'Você deixa para trás uma armadilha invisível de energia que explode quando um inimigo se aproxima.', requirements: {}, unlocked: false, children: [] },
                { id: 'belico-vital-tatico-2', name: 'Fio de Força', description: 'Cria um fio de energia quase invisível entre dois pontos. Inimigos que o atravessam sofrem dano e ficam lentos.', requirements: {}, unlocked: false, children: [] }
            ]
        }
    },
    'Esotérico': {
        'Temporal': {
            'Lâmina Paranormal': [
                { id: 'esoterico-temporal-lamina-1', name: 'Lâmina Entrópica', description: 'Sua arma acelera o tempo no ponto de impacto, causando dano de decadência ao longo do tempo.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-temporal-lamina-2', name: 'Corte Acelerado', description: 'Um ataque tão rápido que dobra o tempo, permitindo um segundo golpe imediato.', requirements: {}, unlocked: false, children: [] }
            ],
            'Conduíte Rúnico': [
                { id: 'esoterico-temporal-conduite-1', name: 'Selo de Lentidão', description: 'Desenha uma runa no ar que cria uma área onde o tempo passa mais devagar para seus inimigos.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-temporal-conduite-2', name: 'Rebobinar Ferimento', description: 'Você toca um aliado e reverte um ferimento no tempo, curando uma quantidade significativa de dano.', requirements: {}, unlocked: false, children: [] }
            ],
            'Ceifador Anímico': [
                { id: 'esoterico-temporal-ceifador-1', name: 'Toque do Envelhecimento', description: 'Você toca um alvo e acelera sua idade, aplicando penalidades severas em seus atributos físicos.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-temporal-ceifador-2', name: 'Visão da Morte', description: 'Você marca um inimigo. Se ele morrer em breve, você recupera uma grande quantidade de recursos (PA, Sanidade).', requirements: {}, unlocked: false, children: [] }
            ]
        },
        'Cerebral': {
            'Lâmina Paranormal': [
                { id: 'esoterico-cerebral-lamina-1', name: 'Lâmina Psíquica', description: 'Sua arma corta a mente do alvo, causando dano de sanidade e ignorando completamente a armadura física.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-cerebral-lamina-2', name: 'Corte da Verdade', description: 'Um golpe que revela uma verdade inconveniente sobre o alvo, expondo uma fraqueza e reduzindo sua defesa.', requirements: {}, unlocked: false, children: [] }
            ],
            'Conduíte Rúnico': [
                { id: 'esoterico-cerebral-conduite-1', name: 'Glyfo de Confusão', description: 'Uma runa complexa que, ao ser vista, sobrecarrega a mente do alvo, deixando-o confuso e incapaz de distinguir amigo de inimigo.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-cerebral-conduite-2', name: 'Projétil da Verdade', description: 'Dispara um dardo de luz que revela os atributos e status de um inimigo para toda a equipe.', requirements: {}, unlocked: false, children: [] }
            ],
            'Ceifador Anímico': [
                { id: 'esoterico-cerebral-ceifador-1', name: 'Roubo de Memórias', description: 'Um toque que arranca uma memória recente do alvo, causando dano de sanidade e transferindo uma informação útil para você.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-cerebral-ceifador-2', name: 'Sussurros dos Mortos', description: 'Você ouve os ecos psíquicos de mortos recentes na área, podendo obter pistas sobre a causa de suas mortes.', requirements: {}, unlocked: false, children: [] }
            ]
        },
        'Visceral': {
            'Lâmina Paranormal': [
                { id: 'esoterico-visceral-lamina-1', name: 'Lâmina Voraz', description: 'Sua arma drena a força vital do alvo a cada golpe, curando uma parte do dano que você causa.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-visceral-lamina-2', name: 'Corte Hemorrágico', description: 'Um golpe que abre uma ferida que não fecha, causando dano de sangramento contínuo.', requirements: {}, unlocked: false, children: [] }
            ],
            'Conduíte Rúnico': [
                { id: 'esoterico-visceral-conduite-1', name: 'Marca da Podridão', description: 'Você amaldiçoa um alvo com uma runa de decomposição, fazendo com que ele receba mais dano de todas as fontes.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-visceral-conduite-2', name: 'Drenar Vida à Distância', description: 'Canaliza um feixe de energia que suga a vida de um inimigo para curar a si mesmo ou um aliado.', requirements: {}, unlocked: false, children: [] }
            ],
            'Ceifador Anímico': [
                { id: 'esoterico-visceral-ceifador-1', name: 'Peste Contagiosa', description: 'Você infecta um alvo com uma doença paranormal que causa dano contínuo e pode se espalhar para outros inimigos próximos.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-visceral-ceifador-2', name: 'Transferência de Vitalidade', description: 'Você sacrifica uma porção da sua própria vida para curar um aliado instantaneamente por uma quantidade muito maior.', requirements: {}, unlocked: false, children: [] }
            ]
        },
        'Vital': {
            'Lâmina Paranormal': [
                { id: 'esoterico-vital-lamina-1', name: 'Lâmina Cinética', description: 'Sua arma é coberta por uma força telecinética, aumentando o dano e arremessando os alvos para trás.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-vital-lamina-2', name: 'Corte Disruptor', description: 'O impacto libera uma onda de energia caótica que pode atordoar o alvo ou cancelar uma habilidade que ele estava preparando.', requirements: {}, unlocked: false, children: [] }
            ],
            'Conduíte Rúnico': [
                { id: 'esoterico-vital-conduite-1', name: 'Raio de Força', description: 'Um raio concentrado de pura energia que causa dano massivo a um único alvo.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-vital-conduite-2', name: 'Orbe de Contenção', description: 'Cria uma esfera de energia que aprisiona um inimigo, impedindo-o de se mover ou atacar por um período.', requirements: {}, unlocked: false, children: [] }
            ],
            'Ceifador Anímico': [
                { id: 'esoterico-vital-ceifador-1', name: 'Correntes Espectrais', description: 'Invoca correntes de energia que se prendem a um inimigo, imobilizando-o e causando dano contínuo.', requirements: {}, unlocked: false, children: [] },
                { id: 'esoterico-vital-ceifador-2', name: 'Devorar Alma', description: 'Executa um inimigo com vida muito baixa, desintegrando-o e restaurando todos os seus Pontos de Ação (PA).', requirements: {}, unlocked: false, children: [] }
            ]
        }
    },
    'Erudito': {
        'Temporal': {
            'Estrategista de Campo': [
                { id: 'erudito-temporal-estrategista-1', name: 'Análise Preditiva', description: 'Você analisa os possíveis futuros, concedendo um grande bônus de acerto ou defesa para a próxima ação de um aliado.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-temporal-estrategista-2', name: 'Acelerar Aliado', description: 'Você manipula o fluxo do tempo de um aliado, concedendo a ele uma ação de movimento extra em seu turno.', requirements: {}, unlocked: false, children: [] }
            ],
            'Arquiteto da Realidade': [
                { id: 'erudito-temporal-arquiteto-1', name: 'Bolha de Dilatação Temporal', description: 'Cria uma zona onde o tempo passa 50% mais devagar para os inimigos, ou 50% mais rápido para os aliados.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-temporal-arquiteto-2', name: 'Reescrever Evento Menor', description: 'Uma vez por cena, você pode forçar a repetição de uma rolagem de dados (sua ou de um inimigo) para uma ação que não seja de ataque.', requirements: {}, unlocked: false, children: [] }
            ],
            'Médico de Batalha': [
                { id: 'erudito-temporal-medico-1', name: 'Reversão de Ferimento', description: 'Você rebobina o tempo em um ferimento, curando dano como se ele nunca tivesse acontecido.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-temporal-medico-2', name: 'Prevenção de Dano', description: 'Aplica um selo temporal em um aliado que irá negar completamente a próxima fonte de dano que ele receber.', requirements: {}, unlocked: false, children: [] }
            ]
        },
        'Cerebral': {
            'Estrategista de Campo': [
                { id: 'erudito-cerebral-estrategista-1', name: 'Comando Tático', description: 'Você usa sua superioridade tática para dar um comando a um aliado, permitindo que ele use sua reação para realizar uma ação de movimento ou ataque simples.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-cerebral-estrategista-2', name: 'Expor Fraqueza', description: 'Você grita a fraqueza de um inimigo. Todos os ataques de aliados contra esse alvo recebem um bônus de dano por um turno.', requirements: {}, unlocked: false, children: [] }
            ],
            'Arquiteto da Realidade': [
                { id: 'erudito-cerebral-arquiteto-1', name: 'Paradoxo Lógico', description: 'Você apresenta um paradoxo irresolúvel à mente de um alvo, causando dano de sanidade e o deixando atordoado.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-cerebral-arquiteto-2', name: 'Ignorar Física', description: 'Por um curto período, você pode ignorar uma lei da física, permitindo-se andar por paredes ou sobre a água.', requirements: {}, unlocked: false, children: [] }
            ],
            'Médico de Batalha': [
                { id: 'erudito-cerebral-medico-1', name: 'Diagnóstico Rápido', description: 'Com um olhar, você sabe instantaneamente todos os status, ferimentos e condições (positivas e negativas) de um alvo.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-cerebral-medico-2', name: 'Cirurgia Psíquica', description: 'Você entra na mente de um aliado para remover cirurgicamente efeitos mentais negativos como medo, charme ou confusão.', requirements: {}, unlocked: false, children: [] }
            ]
        },
        'Visceral': {
            'Estrategista de Campo': [
                { id: 'erudito-visceral-estrategista-1', name: 'Injeção de Adrenalina', description: 'Você usa um estimulante para aumentar temporariamente os atributos físicos (Força, Agilidade) de um aliado.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-visceral-estrategista-2', name: 'Análise Biológica', description: 'Você identifica uma vulnerabilidade biológica em uma criatura, concedendo bônus de dano contra ela para toda a equipe.', requirements: {}, unlocked: false, children: [] }
            ],
            'Arquiteto da Realidade': [
                { id: 'erudito-visceral-arquiteto-1', name: 'Metamorfose Instável', description: 'Você altera temporariamente a biologia de um alvo, transformando sua mão em pedra para impedi-lo de atacar, por exemplo.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-visceral-arquiteto-2', name: 'Remodelar Terreno', description: 'Você manipula a terra e a matéria orgânica para criar cobertura ou terreno difícil em uma área.', requirements: {}, unlocked: false, children: [] }
            ],
            'Médico de Batalha': [
                { id: 'erudito-visceral-medico-1', name: 'Sutura Acelerada', description: 'Uma poderosa cura em um único alvo que também remove condições como sangramento e veneno.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-visceral-medico-2', name: 'Concoção de Combate', description: 'Você mistura reagentes rapidamente para criar um tônico que pode ser usado por um aliado para ganhar um bônus temporário.', requirements: {}, unlocked: false, children: [] }
            ]
        },
        'Vital': {
            'Estrategista de Campo': [
                { id: 'erudito-vital-estrategista-1', name: 'Redirecionar Energia', description: 'Você cria um elo entre um aliado e um inimigo. Parte do dano que o aliado receberia é transferido para o inimigo.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-vital-estrategista-2', name: 'Ponto de Foco', description: 'Você marca um alvo com energia. Todos os ataques contra ele têm a precisão aumentada.', requirements: {}, unlocked: false, children: [] }
            ],
            'Arquiteto da Realidade': [
                { id: 'erudito-vital-arquiteto-1', name: 'Anular Poder', description: 'Você projeta um campo que anula efeitos paranormais em uma pequena área, funcionando como uma contra-mágica.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-vital-arquiteto-2', name: 'Barreira de Força', description: 'Cria uma parede de energia sólida e transparente que pode bloquear ataques e passagem.', requirements: {}, unlocked: false, children: [] }
            ],
            'Médico de Batalha': [
                { id: 'erudito-vital-medico-1', name: 'Pulso de Cura', description: 'Libera uma onda de energia benigna que cura uma pequena quantidade de vida de todos os aliados próximos.', requirements: {}, unlocked: false, children: [] },
                { id: 'erudito-vital-medico-2', name: 'Escudo Sanitário', description: 'Cria um escudo de energia em um aliado que o protege de receber status negativos (veneno, paralisia, etc.) por um período.', requirements: {}, unlocked: false, children: [] }
            ]
        }
    },
    'Atributo': {
        'Força': [
            { id: 'forca-5-1', name: 'Golpe Poderoso', description: 'Um ataque básico e potente, que serve como base para técnicas de força mais avançadas.', requirements: { forca: 5 }, unlocked: false, children: [
                { id: 'forca-10-1', name: 'Postura de Colosso', description: 'Foca em peso e estabilidade, aumentando a resistência a ser movido.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-1-1', name: 'Passo de Colosso', description: 'Atravessa inimigos e objetos, causando dano de impacto.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-1-2', name: 'Despedaçador de Concreto', description: 'Quebra barreiras com força, causando dano em área.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-1-3', name: 'Pulso de Choque', description: 'Cria uma onda de choque que atordoa e causa dano em área.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-1-4', name: 'Imunidade a Quedas', description: 'Ganha resistência ou imunidade a dano de queda.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-1-5', name: 'Abalo Sísmico', description: 'Bate no chão, criando um tremor que desequilibra inimigos em área.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-2', name: 'Arremesso Potente', description: 'Permite arremessar objetos pesados com mais força e alcance.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-2-1', name: 'Arremesso Aéreo', description: 'Arremessa um inimigo no ar, deixando-o vulnerável.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-2-2', name: 'Tiro de Colisão', description: 'Arremessa um inimigo em outro, causando dano a ambos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-2-3', name: 'Arremesso Improvável', description: 'Usa objetos do cenário como projéteis mortais.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-2-4', name: 'Arma de Arremesso', description: 'Arremessa sua própria arma e a faz retornar à sua mão.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-2-5', name: 'Ricochete', description: 'Arremessa um objeto que pode ricochetear para atingir um alvo fora da linha de visão.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-3', name: 'Quebra de Armadura', description: 'Um golpe focado que danifica a armadura do inimigo, reduzindo sua defesa.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-3-1', name: 'Golpe Esmagador', description: 'Um ataque que ignora completamente a armadura do alvo.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-3-2', name: 'Ataque de Exaustão', description: 'Reduz o vigor ou pontos de ação do inimigo.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-3-3', name: 'Punho de Ferro', description: 'Aumenta o dano desarmado e permite bloquear ataques com os punhos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-3-4', name: 'Destruidor de Foco', description: 'Interrompe a concentração de inimigos, cancelando habilidades.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-3-5', name: 'Ponto de Ruptura', description: 'Após danificar a armadura, seu próximo golpe no mesmo local causa dano massivo.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-4', name: 'Soco Aéreo', description: 'Cria uma rajada de ar comprimido com um soco, atingindo inimigos à distância.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-4-1', name: 'Soco em Câmera Lenta', description: 'A rajada de ar distorce o tempo, deixando os inimigos lentos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-4-2', name: 'Vácuo Aéreo', description: 'Puxa inimigos próximos para o ponto de impacto da rajada.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-4-3', name: 'O Sopro do Trovão', description: 'A rajada de ar tem um efeito sônico, atordoando os alvos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-4-4', name: 'Soco de Repulsão', description: 'Empurra violentamente os inimigos para trás.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-4-5', name: 'Lâmina de Vento', description: 'A rajada de ar é tão focada que corta como uma lâmina, causando dano de corte à distância.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-5', name: 'Fúria Incontrolável', description: 'Entra em um estado de fúria, aumentando o dano causado mas reduzindo a própria defesa.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-5-1', name: 'Frenesi Implacável', description: 'Enquanto em fúria, cada golpe recebido aumenta a duração da fúria.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-5-2', name: 'Rugido Aterrador', description: 'Solta um rugido que pode causar medo em inimigos próximos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-5-3', name: 'Ignorar a Dor', description: 'Enquanto em fúria, você ignora penalidades de ferimentos leves.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-5-4', name: 'Sede de Sangue', description: 'Derrotar um inimigo enquanto em fúria restaura uma pequena quantidade de vida.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-5-5', name: 'Fúria Cega', description: 'O bônus de dano da fúria é dobrado, mas você não pode distinguir aliados de inimigos por um turno.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'forca-5-2', name: 'Técnica de Agarrão', description: 'Usa a força para controlar a posição de inimigos em combate.', requirements: { forca: 5 }, unlocked: false, children: [
                { id: 'forca-10-6', name: 'Imobilizar', description: 'Prende um inimigo, impedindo-o de se mover ou atacar.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-6-1', name: 'Esmagamento de Ossos', description: 'Causa dano contínuo ao alvo imobilizado.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-6-2', name: 'Sufocar', description: 'Corta a respiração do alvo, causando penalidades.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-6-3', name: 'Nó Humano', description: 'Torce o corpo do alvo de forma a dificultar sua fuga.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-6-4', name: 'Quebrar Articulação', description: 'Aplica uma penalidade permanente a um atributo físico do alvo.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-6-5', name: 'Arremesso de Corpo', description: 'Após imobilizar, arremessa o alvo para longe.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-7', name: 'Escudo Humano', description: 'Usa um inimigo agarrado como cobertura contra ataques.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-7-1', name: 'Cobertura Total', description: 'Aumenta a eficácia do escudo humano, bloqueando mais dano.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-7-2', name: 'Retaliação do Escudo', description: 'Força o inimigo usado como escudo a atacar seus próprios aliados.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-7-3', name: 'Absorção de Impacto', description: 'Reduz o dano que você recebe quando o escudo humano é atingido.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-7-4', name: 'Descarte Explosivo', description: 'Arremessa o escudo humano contra um grupo de inimigos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-7-5', name: 'Mover com Refém', description: 'Move-se em velocidade normal enquanto usa o escudo humano.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-8', name: 'Empurrão Poderoso', description: 'Empurra um inimigo com força, criando distância ou jogando-o em perigos.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-8-1', name: 'Onda de Choque', description: 'O empurrão afeta inimigos em um cone à sua frente.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-8-2', name: 'Abrir Caminho', description: 'Empurra múltiplos inimigos de uma vez para criar uma passagem.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-8-3', name: 'Empurrar para Armadilha', description: 'Empurra um inimigo para uma armadilha ou área perigosa.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-8-4', name: 'Desequilibrar', description: 'O inimigo empurrado fica desequilibrado e vulnerável.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-8-5', name: 'Empurrão em Área', description: 'Empurra todos os inimigos adjacentes para longe de você.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-9', name: 'Quebra-costas', description: 'Um agarrão poderoso que causa dano massivo e pode paralisar.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-9-1', name: 'Paralisia Momentânea', description: 'O alvo fica paralisado por um turno.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-9-2', name: 'Dano de Coluna', description: 'Causa uma penalidade de agilidade permanente no alvo.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-9-3', name: 'Levantar e Quebrar', description: 'Levanta o alvo no ar antes de quebrar suas costas no joelho.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-9-4', name: 'Finalização', description: 'Causa dano extra a alvos já feridos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-9-5', name: 'Arremesso Suplex', description: 'Arremessa o alvo para trás por cima da cabeça.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-10', name: 'Arremesso de Inimigo', description: 'Arremessa um inimigo agarrado contra outro alvo.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-10-1', name: 'Arremesso Giratório', description: 'Gira o inimigo antes de arremessar, atingindo múltiplos alvos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-10-2', name: 'Usar como Projétil', description: 'O dano do arremesso é baseado no peso do inimigo arremessado.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-10-3', name: 'Arremesso em Arco', description: 'Arremessa o inimigo por cima de obstáculos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-10-4', name: 'Impulso de Queda', description: 'Arremessa o inimigo para o alto, aumentando o dano da queda.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-10-5', name: 'Arremesso Múltiplo', description: 'Arremessa dois inimigos leves de uma vez.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'forca-5-3', name: 'Uso de Arma Pesada', description: 'Especialização no manejo de armas grandes e desajeitadas.', requirements: { forca: 5 }, unlocked: false, children: [
                { id: 'forca-10-11', name: 'Maestria com Machados', description: 'Aumenta o dano e a eficácia com machados de batalha.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-11-1', name: 'Corte Decapitador', description: 'Chance de causar morte instantânea em alvos com vida baixa.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-11-2', name: 'Giro do Lenhador', description: 'Um ataque em área que atinge todos os inimigos ao redor.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-11-3', name: 'Arremesso de Machado', description: 'Arremessa o machado com precisão mortal.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-11-4', name: 'Quebrar Escudo', description: 'Destrói o escudo do inimigo com um golpe poderoso.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-11-5', name: 'Fúria do Berserker', description: 'Aumenta o dano a cada golpe consecutivo.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-12', name: 'Maestria com Martelos', description: 'Aumenta o dano e a capacidade de atordoar com martelos.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-12-1', name: 'Golpe Sísmico', description: 'Bate o martelo no chão, criando uma onda de choque.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-12-2', name: 'Esmagar Crânio', description: 'Um golpe na cabeça que pode atordoar ou confundir o alvo.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-12-3', name: 'Arremesso de Martelo', description: 'Arremessa o martelo, que retorna à sua mão.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-12-4', name: 'Atordoamento por Impacto', description: 'Aumenta a chance de atordoar inimigos com cada golpe.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-12-5', name: 'Forja de Batalha', description: 'Usa o martelo para reparar armas e armaduras em campo.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-13', name: 'Maestria com Espadas Grandes', description: 'Maximiza o alcance e o poder de corte de espadas de duas mãos.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-13-1', name: 'Corte Transversal', description: 'Um golpe amplo que atinge múltiplos inimigos em um arco.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-13-2', name: 'Postura de Defesa', description: 'Usa a lâmina larga para bloquear ataques com eficácia.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-13-3', name: 'Estocada Perfurante', description: 'Um ataque focado que perfura armaduras.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-13-4', name: 'Lâmina Larga', description: 'Pode aparar projéteis com a espada.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-13-5', name: 'Dança da Lâmina Pesada', description: 'Uma sequência de ataques fluidos e poderosos.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-14', name: 'Maestria com Lanças', description: 'Usa o alcance da lança para controlar o campo de batalha.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-14-1', name: 'Investida', description: 'Um ataque poderoso enquanto corre em direção ao alvo.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-14-2', name: 'Defesa em Falange', description: 'Cria uma barreira defensiva com a lança, protegendo aliados.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-14-3', name: 'Arremesso de Javelin', description: 'Arremessa a lança com grande força e precisão.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-14-4', name: 'Varredura', description: 'Derruba inimigos em uma área com um movimento de varredura.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-14-5', name: 'Empalar', description: 'Um ataque que pode prender o inimigo no lugar.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-15', name: 'Arma Improvisada', description: 'Capacidade de usar qualquer objeto pesado como uma arma eficaz.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-15-1', name: 'Usar Poste como Clava', description: 'Arranca postes ou canos para usar como armas.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-15-2', name: 'Arremessar Mobília', description: 'Usa mesas, cadeiras e outros móveis como projéteis.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-15-3', name: 'Escudo de Porta', description: 'Arranca uma porta para usar como um escudo improvisado.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-15-4', name: 'Mestre do Inusitado', description: 'Causa dano extra com armas improvisadas.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-15-5', name: 'Durabilidade Improvisada', description: 'Armas improvisadas duram mais tempo antes de quebrar.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'forca-5-4', name: 'Resistência Bruta', description: 'Capacidade de suportar punições físicas extremas.', requirements: { forca: 5 }, unlocked: false, children: [
                { id: 'forca-10-16', name: 'Pele Grossa', description: 'Sua pele se torna mais resistente a danos.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-16-1', name: 'Resistência a Cortes', description: 'Reduz o dano de lâminas e garras.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-16-2', name: 'Resistência a Perfuração', description: 'Reduz o dano de balas e estocadas.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-16-3', name: 'Resistência a Impacto', description: 'Reduz o dano de socos e quedas.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-16-4', name: 'Pele Rochosa', description: 'Concede uma camada de armadura natural.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-16-5', name: 'Redução de Dano Crítico', description: 'Reduz o dano extra recebido de acertos críticos.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-17', name: 'Vigor de Touro', description: 'Sua estamina e capacidade de esforço são sobre-humanas.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-17-1', name: 'Fôlego de Ferro', description: 'Pode prender a respiração por períodos muito longos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-17-2', name: 'Recuperação Rápida', description: 'Recupera pontos de ação mais rapidamente.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-17-3', name: 'Resistência a Exaustão', description: 'Demora mais para sofrer penalidades por cansaço.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-17-4', name: 'Ignorar Ferimentos Leves', description: 'Não sofre penalidades por estar com vida baixa.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-17-5', name: 'Correr sem Cansar', description: 'Pode correr por longas distâncias sem se cansar.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-18', name: 'Ossos Densos', description: 'Seus ossos são mais difíceis de quebrar e podem ser usados ofensivamente.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-18-1', name: 'Resistência a Fraturas', description: 'Reduz a chance de ter ossos quebrados.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-18-2', name: 'Soco de Nudillos de Aço', description: 'Aumenta o dano de ataques desarmados.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-18-3', name: 'Cabeçada', description: 'Um ataque de cabeçada que pode atordoar.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-18-4', name: 'Redução de Dano de Queda', description: 'Recebe menos dano de quedas.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-18-5', name: 'Corpo como Arma', description: 'Seu corpo é considerado uma arma de impacto.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-19', name: 'Determinação Inabalável', description: 'Sua força de vontade te torna resistente a influências externas.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-19-1', name: 'Resistir à Dor', description: 'Pode ignorar penalidades de dor por um tempo.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-19-2', name: 'Ignorar Medo', description: 'Resistência a efeitos de medo e intimidação.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-19-3', name: 'Foco sob Pressão', description: 'Mantém a calma e o foco mesmo sob ataque.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-19-4', name: 'Levantar após Queda', description: 'Levanta-se rapidamente após ser derrubado.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-19-5', name: 'Vontade de Ferro', description: 'Resistência a controle mental e possessão.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-20', name: 'Sobrevivente', description: 'Capacidade de suportar condições ambientais extremas.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-20-1', name: 'Resistência a Veneno', description: 'Reduz o efeito de venenos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-20-2', name: 'Resistência a Doenças', description: 'Reduz a chance de contrair doenças.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-20-3', name: 'Suportar Fome e Sede', description: 'Pode passar mais tempo sem comida e água.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-20-4', name: 'Suportar Temperaturas Extremas', description: 'Resistência a calor e frio intensos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-20-5', name: 'Cicatrização Lenta', description: 'Recupera vida lentamente fora de combate.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'forca-5-5', name: 'Intimidação Física', description: 'Usa seu tamanho e força para aterrorizar e controlar os outros.', requirements: { forca: 5 }, unlocked: false, children: [
                { id: 'forca-10-21', name: 'Postura Ameaçadora', description: 'Adota uma postura que exala perigo.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-21-1', name: 'Olhar Penetrante', description: 'Um olhar que pode fazer um alvo hesitar.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-21-2', name: 'Flexionar Músculos', description: 'Uma demonstração de força que pode intimidar.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-21-3', name: 'Aura de Perigo', description: 'Inimigos próximos sentem um perigo iminente.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-21-4', name: 'Silêncio Ameaçador', description: 'Seu silêncio se torna mais intimidador que palavras.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-21-5', name: 'Invasão de Espaço Pessoal', description: 'Aproxima-se de um alvo para deixá-lo desconfortável.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-22', name: 'Rugido de Batalha', description: 'Um grito que pode desmoralizar inimigos.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-22-1', name: 'Causar Hesitação', description: 'Inimigos afetados perdem sua próxima ação.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-22-2', name: 'Forçar Recuo', description: 'Inimigos fracos recuam com o rugido.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-22-3', name: 'Interromper Ação', description: 'Pode interromper a concentração de um inimigo.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-22-4', name: 'Desmoralizar', description: 'Aplica uma penalidade de ataque aos inimigos afetados.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-22-5', name: 'Rugido em Área', description: 'O rugido afeta uma área maior.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-23', name: 'Demonstração de Força', description: 'Usa o ambiente para mostrar sua força.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-23-1', name: 'Quebrar Objeto', description: 'Quebra um objeto com as mãos para intimidar.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-23-2', name: 'Levantar Peso Impossível', description: 'Levanta um objeto extremamente pesado.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-23-3', name: 'Soco no Chão', description: 'Um soco no chão que cria um pequeno tremor.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-23-4', name: 'Dobrar Metal', description: 'Dobra uma barra de metal com as mãos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-23-5', name: 'Marca de Força', description: 'Deixa a marca de sua mão em uma parede de pedra.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-24', name: 'Reputação de Brutamontes', description: 'Sua fama o precede.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-24-1', name: 'Fama de Invencível', description: 'Inimigos hesitam em te atacar.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-24-2', name: 'Histórias de Violência', description: 'Sua reputação é conhecida em certos círculos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-24-3', name: 'Reconhecimento Imediato', description: 'Inimigos podem te reconhecer e evitar o confronto.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-24-4', name: 'Medo Preventivo', description: 'Inimigos fazem testes de moral ao te ver.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-24-5', name: 'Submissão de Fracos', description: 'Inimigos muito mais fracos se rendem sem lutar.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-25', name: 'Interrogatório Físico', description: 'Usa a força para extrair informações.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-25-1', name: 'Aperto de Mão', description: 'Um aperto de mão que pode quebrar ossos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-25-2', name: 'Pressionar contra Parede', description: 'Imobiliza um alvo contra uma parede para interrogatório.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-25-3', name: 'Ameaça Velada', description: 'Faz uma ameaça física sutil, mas clara.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-25-4', name: 'Quebrar Dedos', description: 'Uma técnica de tortura para obter informações.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-25-5', name: 'Bom Policial, Mau Policial', description: 'Alterna entre gentileza e brutalidade para confundir o alvo.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]}
            ]}
        ],
        'Agilidade': [
            { id: 'agilidade-5-1', name: 'Mergulho no Vazio', description: 'Permite se mover rapidamente para desviar de ataques ou se reposicionar.', requirements: { agilidade: 5 }, unlocked: false, children: [
                { id: 'agilidade-10-1', name: 'Ataque Rápido', description: 'Permite realizar um ataque adicional no mesmo turno, mas com dano reduzido.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-1-1', name: 'Salto Fantasma', description: 'Ao usar o Ataque Rápido, você deixa uma ilusão de si mesmo para trás, confundindo inimigos e aumentando sua chance de esquiva.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-1-2', name: 'Ataque de Sombra', description: 'Seus ataques rápidos agora têm a chance de teleportá-lo para trás do inimigo, permitindo que você atinja pontos fracos.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-1-3', name: 'Rajada de Lâminas', description: 'Você lança uma série de golpes tão rápidos que eles perfuram a defesa de um inimigo, ignorando parte de sua armadura.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-1-4', name: 'Ataque de Reflexo', description: 'Você pode realizar um ataque rápido em resposta a um ataque inimigo que errou.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-1-5', name: 'Fluxo Contínuo', description: 'Após um Ataque Rápido, seu próximo movimento não provoca ataques de oportunidade.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-2', name: 'Desarmar', description: 'Com um ataque rápido e preciso, você pode fazer um inimigo derrubar a arma dele.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-2-1', name: 'Passo no Vazio', description: 'Você pode se mover através de objetos sólidos e inimigos, ignorando barreiras e bloqueios.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-2-2', name: 'Mãos Invisíveis', description: 'Você pode desarmar um inimigo sem que ele perceba que você o tocou, como se a arma dele tivesse caído sozinha.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-2-3', name: 'Roubo de Arma', description: 'Ao desarmar um inimigo, você também pode roubar a arma dele.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-2-4', name: 'Dança da Desorientação', description: 'Ao desarmar um inimigo, você o desorienta, diminuindo a precisão e a chance de acerto dos seus próximos ataques.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-2-5', name: 'Arma Bumerangue', description: 'Você pode usar a arma desarmada do inimigo para um ataque imediato antes de jogá-la no chão.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-3', name: 'Acrobacia de Combate', description: 'Usa o ambiente para se mover de forma imprevisível, ganhando bônus de defesa.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-3-1', name: 'Escalada Rápida', description: 'Sobe paredes e obstáculos com velocidade surpreendente.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-3-2', name: 'Salto Mortal', description: 'Realiza um salto acrobático para passar por cima de um inimigo, posicionando-se em suas costas.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-3-3', name: 'Ataque em Queda', description: 'Ataca de um ponto elevado, adicionando o dano da queda ao seu golpe.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-3-4', name: 'Esquiva Perfeita', description: 'Uma vez por combate, pode evitar completamente o dano de um ataque.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-3-5', name: 'Chute Impulsionado', description: 'Usa uma parede ou aliado para se impulsionar e dar um chute poderoso.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-4', name: 'Mestre da Fuga', description: 'Especialista em escapar de situações perigosas.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-4-1', name: 'Desvencilhar', description: 'Escapa de agarrões e amarras com facilidade.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-4-2', name: 'Bomba de Fumaça', description: 'Cria uma nuvem de fumaça para cobrir sua fuga.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-4-3', name: 'Rastro Falso', description: 'Deixa pistas falsas para confundir perseguidores.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-4-4', name: 'Corrida Parkour', description: 'Move-se por terrenos difíceis sem penalidade de velocidade.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-4-5', name: 'Instinto de Sobrevivência', description: 'Ganha um bônus de velocidade quando está com vida baixa.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-5', name: 'Precisão Cirúrgica', description: 'Seus ataques visam pontos vitais, aumentando a chance de crítico.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-5-1', name: 'Golpe no Tendão', description: 'Um ataque que reduz a velocidade de movimento do alvo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-5-2', name: 'Ataque nos Olhos', description: 'Um ataque que pode cegar temporariamente o alvo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-5-3', name: 'Corte na Artéria', description: 'Causa dano de sangramento contínuo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-5-4', name: 'Ponto de Pressão', description: 'Um golpe que pode paralisar um membro do alvo por um turno.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-5-5', name: 'Golpe Fatal', description: 'Aumenta massivamente o dano de um ataque furtivo ou contra um alvo desprevenido.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'agilidade-5-2', name: 'Furtividade', description: 'A arte de se mover sem ser visto ou ouvido.', requirements: { agilidade: 5 }, unlocked: false, children: [
                { id: 'agilidade-10-6', name: 'Movimento Silencioso', description: 'Reduz o ruído que você faz ao se mover.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-6-1', name: 'Passos de Gato', description: 'Você não faz barulho ao andar ou correr lentamente.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-6-2', name: 'Ignorar Terreno Ruidoso', description: 'Move-se silenciosamente sobre superfícies como cascalho ou folhas secas.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-6-3', name: 'Corrida Silenciosa', description: 'Pode correr sem fazer barulho por um curto período.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-6-4', name: 'Aterrissagem Suave', description: 'Reduz o barulho e o dano de quedas.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-6-5', name: 'Mover-se sem Rastro', description: 'Dificulta o rastreamento de suas pegadas.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-7', name: 'Ocultar-se nas Sombras', description: 'Usa a escuridão para se esconder eficazmente.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-7-1', name: 'Um com a Noite', description: 'Torna-se quase invisível em escuridão total.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-7-2', name: 'Camuflagem Urbana', description: 'Usa multidões e becos para se esconder em cidades.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-7-3', name: 'Manto de Sombras', description: 'Cria uma pequena área de escuridão mágica ao seu redor.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-7-4', name: 'Esconderijo Rápido', description: 'Esconde-se rapidamente após quebrar a linha de visão.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-7-5', name: 'Invisibilidade Momentânea', description: 'Fica invisível por um único turno.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-8', name: 'Ataque Furtivo', description: 'Causa dano extra ao atacar um inimigo desprevenido.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-8-1', name: 'Golpe pelas Costas', description: 'Dano massivamente aumentado ao atacar por trás.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-8-2', name: 'Dano Crítico Aumentado', description: 'Aumenta o multiplicador de dano de acertos críticos furtivos.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-8-3', name: 'Veneno na Lâmina', description: 'Aplica veneno em seu primeiro ataque furtivo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-8-4', name: 'Ataque Surpresa', description: 'O alvo atacado furtivamente fica atordoado por um turno.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-8-5', name: 'Execução Silenciosa', description: 'Derrotar um inimigo com um ataque furtivo não alerta outros próximos.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-9', name: 'Distração', description: 'Cria distrações para desviar a atenção dos inimigos.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-9-1', name: 'Arremessar Pedra', description: 'Arremessa um objeto para criar um som em outro local.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-9-2', name: 'Som Fantasma', description: 'Cria um som ilusório (passos, sussurros) à distância.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-9-3', name: 'Ilusão Menor', description: 'Cria uma pequena ilusão visual estática para enganar guardas.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-9-4', name: 'Bater e Correr', description: 'Realiza um ataque rápido e se esconde novamente no mesmo turno.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-9-5', name: 'Alvo Falso', description: 'Cria um boneco ou objeto que atrai a atenção por um momento.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-10', name: 'Mãos Leves', description: 'Perícia em bater carteiras e abrir fechaduras.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-10-1', name: 'Batedor de Carteira Mestre', description: 'Chance maior de roubar itens sem ser notado.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-10-2', name: 'Abrir Fechaduras', description: 'Usa ferramentas para abrir fechaduras simples.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-10-3', name: 'Desarmar Armadilhas', description: 'Detecta e desativa armadilhas mecânicas.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-10-4', name: 'Plantio de Itens', description: 'Coloca um item no bolso de alguém sem que percebam.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-10-5', name: 'Toque Rápido', description: 'Pode pegar ou plantar um item como uma ação rápida.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'agilidade-5-3', name: 'Ataques à Distância', description: 'Perícia com armas de projéteis, como arcos e bestas.', requirements: { agilidade: 5 }, unlocked: false, children: [
                { id: 'agilidade-10-11', name: 'Maestria com Arco', description: 'Aumenta o dano e a precisão com arcos.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-11-1', name: 'Flecha Perfurante', description: 'Seu tiro ignora parte da armadura do alvo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-11-2', name: 'Chuva de Flechas', description: 'Atira uma saraivada de flechas em uma área.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-11-3', name: 'Flecha com Corda', description: 'Atira uma flecha com uma corda para escalar ou criar tirolesas.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-11-4', name: 'Tiro Duplo', description: 'Atira duas flechas em um único alvo ou em dois alvos próximos.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-11-5', name: 'Flecha de Distração', description: 'Atira uma flecha barulhenta para atrair inimigos.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-12', name: 'Maestria com Besta', description: 'Aumenta o dano e a capacidade de perfuração de bestas.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-12-1', name: 'Virote Pesado', description: 'Um tiro que pode derrubar ou empurrar um inimigo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-12-2', name: 'Recarga Rápida', description: 'Reduz o tempo necessário para recarregar sua besta.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-12-3', name: 'Virote com Gancho', description: 'Dispara um virote com um gancho para se prender a superfícies.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-12-4', name: 'Tiro na Perna', description: 'Um tiro preciso que reduz a velocidade de movimento do alvo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-12-5', name: 'Besta de Repetição', description: 'Modifica sua besta para atirar múltiplos virotes antes de recarregar.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-13', name: 'Arremesso de Lâminas', description: 'Perícia em arremessar facas, adagas e outras armas leves.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-13-1', name: 'Leque de Facas', description: 'Arremessa múltiplas facas em um cone à sua frente.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-13-2', name: 'Lâmina Ricochete', description: 'Sua lâmina arremessada pode atingir um segundo alvo próximo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-13-3', name: 'Arremesso Preciso', description: 'Aumenta a chance de acerto crítico com armas de arremesso.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-13-4', name: 'Lâminas Ocultas', description: 'Saca e arremessa uma lâmina como uma ação muito rápida.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-13-5', name: 'Retorno da Lâmina', description: 'Sua arma de arremesso favorita retorna magicamente à sua mão.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-14', name: 'Tiro Rápido', description: 'Foca em velocidade em detrimento da precisão.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-14-1', name: 'Rajada de Tiros', description: 'Descarrega sua arma rapidamente em uma área para suprimir inimigos.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-14-2', name: 'Atirar em Movimento', description: 'Remove penalidades por atirar enquanto se move.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-14-3', name: 'Foco Rápido', description: 'Reduz o tempo para mirar em um novo alvo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-14-4', name: 'Tiro de Supressão', description: 'Força inimigos em uma área a procurar cobertura.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-14-5', name: 'Sem Tempo para Mirar', description: 'Pode atirar com sua arma à distância em combate corpo a corpo sem penalidade.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-15', name: 'Tiro Preciso', description: 'Foca em um único tiro devastador.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-15-1', name: 'Olho de Águia', description: 'Aumenta o alcance efetivo de suas armas de distância.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-15-2', name: 'Mira em Ponto Vital', description: 'Gasta uma ação para mirar, garantindo um acerto crítico no próximo tiro.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-15-3', name: 'Atirar através de Cobertura', description: 'Seus tiros podem penetrar coberturas leves.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-15-4', name: 'Fôlego Preso', description: 'Ignora penalidades por tremores ou movimento ao mirar.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-15-5', name: 'Um Tiro, Uma Morte', description: 'Dano massivamente aumentado se seu tiro for o único ataque que você faz no turno.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'agilidade-5-4', name: 'Mestre de Lâminas Leves', description: 'Especialização no uso de adagas, rapieiras e espadas curtas.', requirements: { agilidade: 5 }, unlocked: false, children: [
                { id: 'agilidade-10-16', name: 'Esgrima', description: 'Técnicas de duelo com armas de uma mão.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-16-1', name: 'Estocada Perfurante', description: 'Um ataque rápido que ignora parte da armadura.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-16-2', name: 'Finta', description: 'Engana o inimigo para que seu próximo ataque seja mais fácil de acertar.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-16-3', name: 'Mobilidade do Duelista', description: 'Pode se mover antes e depois de atacar.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-16-4', name: 'Aparar e Ripostar', description: 'Após aparar um ataque, pode realizar um contra-ataque imediato.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-16-5', name: 'Toque da Morte', description: 'Um ataque preciso em um ponto vital que causa dano extra.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-17', name: 'Combate com Duas Armas', description: 'Luta com uma arma em cada mão.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-17-1', name: 'Ataque Duplo', description: 'Ataca com ambas as armas em uma única ação.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-17-2', name: 'Defesa com Duas Lâminas', description: 'Usa a segunda arma para um bônus de defesa.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-17-3', name: 'Redemoinho de Aço', description: 'Um ataque que atinge todos os inimigos adjacentes.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-17-4', name: 'Ritmo de Combate', description: 'Cada acerto consecutivo aumenta sua velocidade de ataque.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-17-5', name: 'Ambidesteridade Perfeita', description: 'Remove todas as penalidades por lutar com duas armas.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-18', name: 'Dança das Lâminas', description: 'Um estilo de luta fluido e acrobático.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-18-1', name: 'Fluxo de Combate', description: 'Move-se graciosamente entre os inimigos, evitando ataques de oportunidade.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-18-2', name: 'Esquiva Acrobática', description: 'Usa acrobacias para aumentar sua chance de esquiva.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-18-3', name: 'Ataque em Movimento', description: 'Pode realizar seu turno de ataque completo enquanto se move.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-18-4', name: 'Imprevisível', description: 'Inimigos têm desvantagem ao tentar te atacar.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-18-5', name: 'Ataque Giratório', description: 'Um ataque giratório que atinge múltiplos alvos.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-19', name: 'Cortes Rápidos', description: 'Foca em velocidade para infligir ferimentos múltiplos.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-19-1', name: 'Hemorragia', description: 'Seus cortes causam dano de sangramento contínuo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-19-2', name: 'Mil Cortes', description: 'Um ataque rápido que atinge o mesmo alvo várias vezes.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-19-3', name: 'Lâmina Veloz', description: 'Sua velocidade de ataque com lâminas leves é aumentada.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-19-4', name: 'Ataque nos Pontos de Pressão', description: 'Seus cortes podem causar paralisia ou fraqueza.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-19-5', name: 'Ataque Incansável', description: 'Após derrotar um inimigo, ganha uma ação de ataque extra.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-20', name: 'Lançador de Adagas', description: 'Uso de adagas tanto em combate corpo a corpo quanto arremessadas.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-20-1', name: 'Troca Rápida', description: 'Alterna entre segurar e arremessar adagas sem custo de ação.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-20-2', name: 'Adaga Envenenada', description: 'Aplica veneno rapidamente em suas adagas.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-20-3', name: 'Arremesso Duplo', description: 'Arremessa duas adagas de uma vez.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-20-4', name: 'Precisão de Perto', description: 'Ganha bônus de acerto ao arremessar adagas em alvos próximos.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-20-5', name: 'Chuva de Adagas', description: 'Arremessa todas as suas adagas em uma área.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'agilidade-5-5', name: 'Reflexos Sobre-humanos', description: 'Sua capacidade de reação é mais rápida que o normal.', requirements: { agilidade: 5 }, unlocked: false, children: [
                { id: 'agilidade-10-21', name: 'Esquiva Instintiva', description: 'Esquiva-se de perigos quase sem pensar.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-21-1', name: 'Desvio Mínimo', description: 'Usa o mínimo de movimento para desviar, economizando energia.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-21-2', name: 'Prever Ataque', description: 'Ganha um bônus de defesa contra o primeiro ataque de cada inimigo.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-21-3', name: 'Esquiva Perfeita', description: 'Uma vez por combate, pode evitar completamente o dano de um ataque.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-21-4', name: 'Sombra Escorregadia', description: 'É mais difícil de ser agarrado ou imobilizado.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-21-5', name: 'Intocável', description: 'Após uma esquiva bem-sucedida, o próximo ataque contra você tem desvantagem.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-22', name: 'Aparar Projéteis', description: 'Capaz de desviar ou aparar ataques à distância.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-22-1', name: 'Desviar Balas', description: 'Pode tentar desviar balas com uma lâmina ou objeto.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-22-2', name: 'Devolver ao Remetente', description: 'Pode aparar um projétil e devolvê-lo ao atacante.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-22-3', name: 'Escudo de Lâmina', description: 'Gira sua arma rapidamente para criar uma barreira contra projéteis.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-22-4', name: 'Aparar Explosão', description: 'Pode reduzir o dano de explosões se estiver perto do epicentro.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-22-5', name: 'Campo de Deflexão', description: 'Cria uma aura que tem chance de desviar projéteis automaticamente.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-23', name: 'Agir Primeiro', description: 'Sua velocidade te permite tomar a iniciativa.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-23-1', name: 'Iniciativa Aprimorada', description: 'Ganha um bônus significativo em testes de iniciativa.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-23-2', name: 'Emboscada', description: 'Se você age primeiro no combate, seu primeiro ataque causa dano extra.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-23-3', name: 'Ataque de Oportunidade Aprimorado', description: 'Pode realizar ataques de oportunidade com mais frequência.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-23-4', name: 'Velocidade do Pensamento', description: 'Pode realizar uma ação de movimento antes do combate começar.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-23-5', name: 'Sempre Alerta', description: 'Você não pode ser surpreendido.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-24', name: 'Sentido de Perigo', description: 'Uma percepção aguçada de ameaças iminentes.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-24-1', name: 'Sexto Sentido', description: 'Sente quando está sendo observado ou mirado.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-24-2', name: 'Percepção 360°', description: 'Não pode ser flanqueado facilmente.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-24-3', name: 'Sentir Armadilhas', description: 'Tem uma chance de detectar armadilhas antes de ativá-las.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-24-4', name: 'Intuição de Combate', description: 'Sente qual inimigo é a maior ameaça.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-24-5', name: 'Alerta de Emboscada', description: 'Alerta aliados próximos de uma emboscada iminente.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-25', name: 'Contra-ataque Imediato', description: 'Responde a ataques inimigos com velocidade letal.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-25-1', name: 'Riposta Rápida', description: 'Após uma esquiva, seu próximo ataque é mais rápido.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-25-2', name: 'Punição por Erro', description: 'Se um inimigo erra um ataque contra você, você pode realizar um ataque de oportunidade.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-25-3', name: 'Quebrar o Ritmo', description: 'Interrompe a sequência de ataques de um inimigo com um golpe rápido.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-25-4', name: 'Ataque Reativo', description: 'Pode usar sua reação para atacar um inimigo que se move para perto de você.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-25-5', name: 'Vingança Veloz', description: 'Se um aliado próximo é atingido, você pode usar sua reação para atacar o agressor.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]}
            ]}
        ],
        'Presença': [
            { id: 'presenca-5-1', name: 'Grito de Guerra', description: 'Uma habilidade básica para intimidar inimigos próximos, podendo causar hesitação.', requirements: { presenca: 5 }, unlocked: false, children: [
                { id: 'presenca-10-1', name: 'Aparência Imponente', description: 'Foca na sua capacidade de convencer ou intimidar pessoas e de ter uma presença notável em qualquer ambiente.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-1-1', name: 'O Olhar Vazio', description: 'Um olhar que lança um terror paralisante, forçando inimigos mais fracos a fugir ou ficar atordoados.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-1-2', name: 'Presença Opressora', description: 'Você emite uma aura que diminui a moral de todos os inimigos próximos, reduzindo a precisão e o dano de seus ataques.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-1-3', name: 'Conexão da Multidão', description: 'Você pode se misturar perfeitamente em uma multidão, como se não existisse, tornando impossível para inimigos te detectarem.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-1-4', name: 'Ancoragem Psíquica', description: 'Com sua presença, você pode se conectar com a mente dos seus aliados, melhorando a iniciativa e a coordenação de todo o grupo em combate.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-1-5', name: 'Voz de Comando', description: 'Sua voz inspira tanta autoridade que ordens simples são obedecidas por NPCs de vontade fraca.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'presenca-10-2', name: 'Foco Compartilhado', description: 'Permite ajudar um aliado a focar em uma tarefa, dando a ele um bônus para sua próxima ação.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-2-1', name: 'Conjurador de Medo', description: 'Você manipula as emoções de um inimigo para criar manifestações de seu maior medo, paralisando-o.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-2-2', name: 'Mente Coletiva', description: 'Cria uma conexão mental com seus aliados, permitindo que eles ajam em perfeita sincronia, ignorando o caos da batalha.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-2-3', name: 'Transferência de Habilidade', description: 'Você pode transferir uma de suas habilidades para um aliado, permitindo que ele a use por um curto período.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-2-4', name: 'Sentido de Perigo', description: 'Você pode sentir perigos e armadilhas próximos e alertar seus aliados sobre eles, dando um bônus para que eles os evitem.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-2-5', name: 'Elo de Sacrifício', description: 'Você pode receber parte do dano que seria direcionado a um aliado com quem tem foco.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'presenca-10-3', name: 'Manipulador Social', description: 'Mestre em enganar, persuadir e ler as intenções dos outros.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-3-1', name: 'Detectar Mentiras', description: 'Você tem uma alta chance de saber quando alguém está mentindo para você.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-3-2', name: 'Charme', description: 'Consegue fazer um pedido razoável a um alvo, que o atenderá como se fosse amigo.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-3-3', name: 'Personificação', description: 'Imita a voz e os maneirismos de outra pessoa com perfeição.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-3-4', name: 'Infiltrar Confiança', description: 'Rapidamente ganha a confiança de um grupo ou indivíduo.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-3-5', name: 'Espalhar Boato', description: 'Planta uma informação falsa que se espalha rapidamente.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'presenca-10-4', name: 'Aura Inspiradora', description: 'Sua presença motiva e fortalece seus aliados.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-4-1', name: 'Discurso Motivacional', description: 'Concede bônus temporários de ataque ou defesa para toda a equipe.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-4-2', name: 'Remover Medo', description: 'Remove o efeito de medo de um aliado e o torna imune por um tempo.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-4-3', name: 'Segundo Fôlego', description: 'Inspira um aliado exausto, restaurando parte de seus pontos de ação.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-4-4', name: 'Lealdade Inabalável', description: 'Aliados próximos a você ganham resistência a controle mental.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-4-5', name: 'Grito de Reunião', description: 'Chama aliados dispersos para sua posição.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'presenca-10-5', name: 'Vínculo Paranormal', description: 'Cria uma conexão com o paranormal, sentindo sua presença.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-5-1', name: 'Sentir Entidade', description: 'Detecta a presença e a direção geral de criaturas paranormais próximas.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-5-2', name: 'Comunicação Espiritual', description: 'Tenta se comunicar com espíritos ou ecos psíquicos.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-5-3', name: 'Ler Objeto', description: 'Toca em um objeto para sentir emoções ou eventos fortes associados a ele.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-5-4', name: 'Aura da Verdade', description: 'Emite uma aura que torna difícil para outros mentirem perto de você.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-5-5', name: 'Proteção contra Espíritos', description: 'Você e aliados próximos recebem um bônus de defesa contra ataques de entidades incorpóreas.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'presenca-5-2', name: 'Liderança', description: 'Capacidade de inspirar e comandar aliados em batalha.', requirements: { presenca: 5 }, unlocked: false, children: [
                { id: 'presenca-10-6', name: 'Inspirar Coragem', description: 'Remove o efeito de medo de um aliado e concede um bônus temporário.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-6-1', name: 'Aura de Bravura', description: 'Aliados próximos a você ganham resistência a medo.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-6-2', name: 'Grito de Batalha', description: 'Concede a todos os aliados um bônus de dano no próximo ataque.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-6-3', name: 'Nunca Desista', description: 'Um aliado pode ignorar os efeitos de estar com vida baixa por um turno.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-6-4', name: 'Exemplo Heroico', description: 'Ao realizar um acerto crítico, você inspira um aliado a ganhar uma ação extra.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-6-5', name: 'Discurso Inspirador', description: 'Fora de combate, pode restaurar a sanidade de seus aliados.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'presenca-10-7', name: 'Comando Tático', description: 'Dá ordens diretas a aliados em combate.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-7-1', name: 'Foco no Alvo', description: 'Ordena que todos os aliados foquem em um único inimigo, aumentando o dano contra ele.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-7-2', name: 'Reposicionar', description: 'Permite que um aliado use sua reação para se mover para uma posição mais vantajosa.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-7-3', name: 'Ataque Coordenado', description: 'Você e um aliado atacam o mesmo alvo simultaneamente.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-7-4', name: 'Formação Defensiva', description: 'Ordena que aliados próximos formem uma linha defensiva, aumentando a defesa de todos.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-7-5', name: 'Plano B', description: 'Quando um plano falha, você rapidamente bola outro, concedendo um bônus para a equipe.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'presenca-5-3', name: 'Manipulação Social', description: 'Influencia sutilmente os pensamentos e ações dos outros.', requirements: { presenca: 5 }, unlocked: false, children: [
                { id: 'presenca-10-8', name: 'Persuasão', description: 'Convence outros a concordarem com você ou a fazerem pequenos favores.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-8-1', name: 'Lábia', description: 'Mente de forma convincente.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-8-2', name: 'Diplomacia', description: 'Acalma situações tensas e negocia acordos.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-8-3', name: 'Charme', description: 'Faz com que um alvo o veja de forma amigável por um tempo.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-8-4', name: 'Barganha', description: 'Consegue preços melhores ao comprar e vender.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-8-5', name: 'Argumento Lógico', description: 'Usa a lógica para convencer até os mais céticos.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'presenca-10-9', name: 'Intimidação', description: 'Usa ameaças e postura para conseguir o que quer.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-9-1', name: 'Olhar Ameaçador', description: 'Força um alvo a desviar o olhar e hesitar.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-9-2', name: 'Ameaça Velada', description: 'Faz uma ameaça sutil que deixa o alvo desconfortável.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-9-3', name: 'Interrogatório', description: 'Usa intimidação para extrair informações.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-9-4', name: 'Reputação', description: 'Sua fama o precede, fazendo com que alguns evitem confronto.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-9-5', 'name': 'Causar Medo', 'description': 'Pode forçar um inimigo de vontade fraca a fugir.', 'requirements': { 'presenca': 15 }, 'unlocked': false, 'children': [] }
                ]}
            ]},
            { id: 'presenca-5-4', name: 'Percepção Paranormal', description: 'Sente e interage com o mundo invisível e sobrenatural.', requirements: { presenca: 5 }, unlocked: false, children: [
                { id: 'presenca-10-10', name: 'Sentir o Paranormal', description: 'Detecta a presença de entidades ou fenômenos anormais.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-10-1', name: 'Localizar Fonte', description: 'Determina a direção e a distância de uma presença paranormal.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-10-2', name: 'Identificar Tipo', description: 'Tenta identificar o tipo de entidade (fantasma, demônio, etc.).', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-10-3', name: 'Sentir Emoções', description: 'Sente as emoções ou intenções de uma entidade.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-10-4', name: 'Ver o Invisível', description: 'Por um momento, pode ver criaturas ou objetos invisíveis.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-10-5', name: 'Aviso Prévio', description: 'Sente um perigo paranormal momentos antes de acontecer.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'presenca-10-11', name: 'Interagir com Espíritos', description: 'Comunica-se e influencia entidades não-físicas.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-11-1', name: 'Falar com os Mortos', description: 'Pode fazer perguntas simples a espíritos.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-11-2', name: 'Acalmar Espírito', description: 'Tenta acalmar um espírito raivoso ou assustado.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-11-3', name: 'Exorcismo Menor', description: 'Pode forçar uma entidade fraca a abandonar um local ou objeto.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-11-4', name: 'Barganha Espiritual', description: 'Tenta negociar com uma entidade em troca de informação ou passagem segura.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-11-5', name: 'Proteção Espiritual', description: 'Cria uma barreira temporária que espíritos fracos não podem cruzar.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'presenca-5-5', name: 'Performance', description: 'A arte de atuar, cantar ou tocar um instrumento com um efeito cativante.', requirements: { presenca: 5 }, unlocked: false, children: [
                { id: 'presenca-10-12', name: 'Atuação', description: 'Capacidade de se passar por outra pessoa ou fingir emoções.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-12-1', name: 'Disfarce', description: 'Usa maquiagem e roupas para criar um disfarce convincente.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-12-2', name: 'Imitar Voz', description: 'Imita a voz de outra pessoa com precisão.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-12-3', name: 'Fingir de Morto', description: 'Consegue se passar por morto de forma convincente.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-12-4', name: 'Infiltrado', description: 'Consegue se misturar em um grupo e ganhar sua confiança.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-12-5', name: 'Manipular Emoções', description: 'Usa a atuação para fazer outros sentirem alegria, tristeza ou raiva.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'presenca-10-13', name: 'Música', description: 'Usa um instrumento ou a voz para criar efeitos.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-13-1', name: 'Canção Calmante', description: 'Acalma animais ou pessoas hostis.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-13-2', name: 'Hino de Batalha', description: 'Inspira aliados, concedendo um bônus de ataque.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-13-3', name: 'Melodia Hipnótica', description: 'Pode prender a atenção de alvos, deixando-os distraídos.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-13-4', name: 'Réquiem Sombrio', description: 'Uma música que causa desconforto e medo em inimigos.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-13-5', 'name': 'Música do Silêncio', 'description': 'Cria uma área onde sons são abafados.', 'requirements': { 'presenca': 15 }, 'unlocked': false, 'children': [] }
                ]}
            ]}
        ],
        'Vitalidade': [
            { id: 'vitalidade-5-1', name: 'Recuperação Acelerada', description: 'Sua capacidade de recuperação é aprimorada, recuperando mais vida e vigor em descansos.', requirements: { vitalidade: 5 }, unlocked: false, children: [
                { id: 'vitalidade-10-1', name: 'Resistência à Dor', description: 'Foca em sua capacidade de suportar dano e continuar lutando. Diminui o dano de ataques críticos e de efeitos de sangramento.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-1-1', name: 'Pulso de Vigor', description: 'Você libera um pulso de sua própria energia vital que afeta aliados e inimigos próximos. Os aliados são curados e têm seu vigor restaurado. Os inimigos, por sua vez, sentem sua energia vital sendo drenada, sofrendo dano e ficando mais lentos.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-1-2', name: 'Vitalidade Compartilhada', description: 'Você pode transferir seu vigor e parte de sua energia vital para um aliado, curando-o e permitindo que ele use mais habilidades.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-1-3', name: 'Pele de Ferro', description: 'Por um curto período, sua pele se torna tão dura quanto o ferro, concedendo resistência a dano físico.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-1-4', name: 'Morte Falsa', description: 'Você pode entrar em um estado de "morte falsa" para enganar inimigos. Sua respiração e pulso param, e seu corpo fica frio, parecendo morto.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-1-5', name: 'Indomável', description: 'Você pode gastar pontos de vida para se livrar de efeitos de atordoamento ou paralisia.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'vitalidade-10-2', name: 'Escudo de Vigor', description: 'Você pode usar seu vigor como um escudo, absorvendo parte do dano recebido.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-2-1', name: 'Escudo de Absorção', description: 'Seu escudo de vigor não apenas absorve dano, mas o converte em energia para curar a si mesmo.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-2-2', name: 'Barreira de Energia', description: 'Seu escudo de vigor se torna uma barreira de energia que pode ser usada para proteger aliados de ataques.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-2-3', name: 'Vigor Inesgotável', description: 'Aumenta seu vigor total para que você possa usar mais habilidades.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-2-4', name: 'Segunda Chance', description: 'Você pode evitar a morte uma vez por dia, sobrevivendo com 1 de vida após um ataque fatal.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-2-5', name: 'Retaliação Energética', description: 'Quando seu escudo absorve um ataque corpo a corpo, ele devolve parte do dano como energia.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'vitalidade-10-3', name: 'Fortitude Inabalável', description: 'Sua resistência a elementos e condições é sobre-humana.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-3-1', name: 'Resistência Elemental', description: 'Ganha resistência a um tipo de dano elemental (fogo, frio, etc.).', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-3-2', name: 'Imunidade a Veneno', description: 'Seu corpo processa e anula toxinas comuns.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-3-3', name: 'Tolerância à Fadiga', description: 'Demora muito mais para ficar exausto por esforço físico.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-3-4', name: 'Corpo Estabilizado', description: 'Resiste a efeitos de sangramento e doenças.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-3-5', name: 'Mente Sã em Corpo São', description: 'Sua vitalidade reforça sua mente, dando bônus em testes de sanidade.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'vitalidade-10-4', name: 'Metabolismo Adaptativo', description: 'Seu corpo se adapta rapidamente a ambientes hostis.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-4-1', name: 'Respiração Aquática', description: 'Pode respirar debaixo d\'água por longos períodos.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-4-2', name: 'Visão no Escuro', description: 'Seus olhos se adaptam para enxergar na escuridão total.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-4-3', name: 'Sobrevivente do Deserto', description: 'Requer muito menos água e comida para sobreviver.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-4-4', name: 'Resistência a Temperaturas', description: 'Suporta calor ou frio extremos com mais facilidade.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-4-5', name: 'Regeneração Lenta', description: 'Recupera uma pequena quantidade de vida passivamente fora de combate.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'vitalidade-10-5', name: 'Guardião Resiliente', description: 'Você se especializa em proteger os outros com sua própria vitalidade.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-5-1', name: 'Interceptar', description: 'Você pode se mover para receber um ataque que seria direcionado a um aliado próximo.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-5-2', name: 'Corpo de Escudo', description: 'Você pode usar seu próprio corpo como cobertura para um aliado.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-5-3', name: 'Aura de Cura', description: 'Aliados próximos a você recuperam uma pequena quantidade de vida a cada turno.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-5-4', name: 'Provocação Heroica', description: 'Força um inimigo poderoso a focar os ataques em você.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-5-5', name: 'Último Recurso', description: 'Ao chegar a 0 de vida, você pode realizar uma última ação antes de cair.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'vitalidade-5-2', name: 'Resistência Passiva', description: 'Aumenta suas defesas naturais contra vários tipos de dano.', requirements: { vitalidade: 5 }, unlocked: false, children: [
                { id: 'vitalidade-10-6', name: 'Pele de Couro', description: 'Aumenta a resistência a dano físico (corte, perfuração, impacto).', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-6-1', name: 'Resistência a Cortes', description: 'Reduz significativamente o dano de lâminas.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-6-2', name: 'Resistência a Perfuração', description: 'Reduz significativamente o dano de balas e estocadas.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-6-3', name: 'Resistência a Impacto', description: 'Reduz significativamente o dano de quedas e golpes contundentes.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-6-4', name: 'Pele Rochosa', description: 'Ganha uma camada de armadura natural que absorve dano.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-6-5', name: 'Redução de Dano Crítico', description: 'Transforma acertos críticos recebidos em acertos normais.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'vitalidade-10-7', name: 'Fortitude Elemental', description: 'Seu corpo se adapta para resistir a energias destrutivas.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-7-1', name: 'Resistência ao Fogo', description: 'Suporta altas temperaturas e reduz dano de fogo.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-7-2', name: 'Resistência ao Frio', description: 'Suporta baixas temperaturas e reduz dano de gelo.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-7-3', name: 'Resistência Elétrica', description: 'O dano de eletricidade é reduzido e tem chance de ser ignorado.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-7-4', name: 'Resistência a Ácido', description: 'Sua pele resiste a substâncias corrosivas.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-7-5', name: 'Resistência Paranormal', description: 'Ganha resistência a dano de fontes sobrenaturais.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'vitalidade-5-3', name: 'Bio-Adaptação', description: 'Altera seu próprio corpo para obter vantagens temporárias.', requirements: { vitalidade: 5 }, unlocked: false, children: [
                { id: 'vitalidade-10-8', name: 'Adaptação Ofensiva', description: 'Modifica partes do corpo para se tornarem armas.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-8-1', name: 'Garras Retráteis', description: 'Suas unhas se transformam em garras afiadas.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-8-2', name: 'Espinhos Ósseos', description: 'Pode projetar espinhos de seus braços ou costas.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-8-3', name: 'Mordida Poderosa', description: 'Sua mandíbula ganha força para uma mordida devastadora.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-8-4', name: 'Cuspe Ácido', description: 'Pode cuspir uma substância corrosiva a curta distância.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-8-5', name: 'Membros Elásticos', description: 'Pode esticar seus braços para alcançar alvos distantes.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'vitalidade-10-9', name: 'Adaptação Ambiental', description: 'Modifica seu corpo para sobreviver em ambientes hostis.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-9-1', name: 'Pele Camaleão', description: 'Altera a cor da pele para se camuflar.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-9-2', name: 'Guelras', description: 'Desenvolve guelras para respirar debaixo d\'água.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-9-3', name: 'Visão Noturna', description: 'Seus olhos se adaptam para enxergar na escuridão total.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-9-4', name: 'Membranas de Escalada', description: 'Desenvolve pequenas membranas nas mãos e pés para escalar superfícies.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-9-5', name: 'Corpo Isolante', description: 'Seu corpo regula a temperatura interna, protegendo contra calor e frio extremos.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'vitalidade-5-4', name: 'Sobrevivencialismo', description: 'Técnicas para sobreviver em ambientes hostis e situações de perigo.', requirements: { vitalidade: 5 }, unlocked: false, children: [
                { id: 'vitalidade-10-10', name: 'Mestre da Natureza', description: 'Conhecimento profundo sobre a vida selvagem e plantas.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-10-1', name: 'Encontrar Comida e Água', description: 'Sabe como encontrar sustento em qualquer ambiente.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-10-2', name: 'Criar Abrigo', description: 'Constrói abrigos improvisados rapidamente.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-10-3', name: 'Rastreamento', description: 'Segue rastros de animais e pessoas.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-10-4', name: 'Conhecimento Herbal', description: 'Identifica plantas medicinais e venenosas.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-10-5', name: 'Domador de Animais', description: 'Pode acalmar e até fazer amizade com animais selvagens.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'vitalidade-10-11', name: 'Resiliência Extrema', description: 'Capacidade de suportar condições adversas por longos períodos.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-11-1', name: 'Tolerância a Venenos', description: 'Ganha vantagem em testes para resistir a venenos.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-11-2', 'name': 'Tolerância a Doenças', 'description': 'Ganha vantagem em testes para resistir a doenças.', 'requirements': { 'vitalidade': 15 }, 'unlocked': false, 'children': [] },
                    { id: 'vitalidade-15-11-3', name: 'Suportar Fome e Sede', description: 'Pode passar dias sem comida ou água com penalidades reduzidas.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-11-4', name: 'Não Precisa Dormir', description: 'Pode ficar acordado por vários dias sem penalidades de exaustão.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-11-5', name: 'Vontade de Sobreviver', description: 'Ganha um bônus em testes de morte.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'vitalidade-5-5', name: 'Protetor', description: 'Habilidades focadas em defender e proteger aliados.', requirements: { vitalidade: 5 }, unlocked: false, children: [
                { id: 'vitalidade-10-12', name: 'Posição de Guarda', description: 'Aumenta sua defesa e a de um aliado adjacente.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-12-1', name: 'Muralha Humana', description: 'Você pode bloquear completamente um caminho estreito.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-12-2', name: 'Atenção Dividida', description: 'Pode proteger dois aliados ao mesmo tempo com penalidade reduzida.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-12-3', name: 'Escudo Aliado', description: 'Usa seu escudo para proteger um aliado adjacente.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-12-4', name: 'Vigília', description: 'Ganha bônus em testes de percepção para notar ameaças a um aliado.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-12-5', name: 'Defesa Coordenada', description: 'Concede seu bônus de defesa a um aliado por um turno.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'vitalidade-10-13', name: 'Grito de Provocação', description: 'Chama a atenção de inimigos para si.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-13-1', name: 'Provocação em Massa', description: 'Afeta todos os inimigos em uma área.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-13-2', name: 'Desafio do Campeão', description: 'Força um inimigo poderoso a lutar apenas com você.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-13-3', name: 'Insulto Pessoal', description: 'Enfurece um alvo, fazendo-o atacar de forma imprudente.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-13-4', name: 'Marca do Protetor', description: 'Inimigos que ignoram sua provocação recebem dano.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-13-5', name: 'Aura Ameaçadora', description: 'Inimigos próximos têm mais dificuldade em atacar seus aliados.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]}
            ]}
        ],
        'Inteligência': [
            { id: 'inteligencia-5-1', name: 'Análise Tática', description: 'Permite gastar uma ação para descobrir fraquezas e resistências de um inimigo.', requirements: { inteligencia: 5 }, unlocked: false, children: [
                { id: 'inteligencia-10-1', name: 'Memória Fotográfica', description: 'Foca na sua capacidade de absorver e reter informações rapidamente. Permite que o personagem se lembre de detalhes e informações com facilidade.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-1-1', name: 'Previsão de Falhas', description: 'Você analisa a realidade e o ambiente ao seu redor tão rapidamente que pode prever as falhas mais prováveis em um inimigo ou na estrutura.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-1-2', name: 'Leitura de Mente', description: 'Você pode ler os pensamentos de um inimigo para descobrir seus planos, fraquezas ou segredos.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-1-3', name: 'Conhecimento Arcano', description: 'Você pode identificar rituais, feitiços e outros poderes esotéricos que seriam invisíveis para outros.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-1-4', name: 'Estrategista de Batalha', description: 'Sua mente funciona tão rapidamente em combate que você e seus aliados ganham um bônus de iniciativa e tática, permitindo que ajam antes dos inimigos.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-1-5', name: 'Mímica de Movimento', description: 'Após observar uma ação física, você pode replicá-la com precisão em sua próxima tentativa.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'inteligencia-10-2', name: 'Construção Improvisada', description: 'Permite que o personagem use materiais básicos para criar itens simples, armadilhas e ferramentas.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-2-1', name: 'Transferência de Habilidade', description: 'Você analisa e entende tão bem uma habilidade de um inimigo que consegue reproduzi-la por um curto período.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-2-2', name: 'Engenheiro de Batalha', description: 'Você pode usar materiais ao seu redor para criar armas e armaduras no meio da batalha.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-2-3', name: 'Mestre em Armadilhas', description: 'Você tem um bônus para sentir a presença de armadilhas e desarmá-las.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-2-4', name: 'Tinkerer', description: 'Você pode fazer modificações em armas e equipamentos para dar a eles um bônus temporário de dano ou defesa.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-2-5', name: 'Química de Campo', description: 'Mistura itens comuns para criar ácidos, bombas de fumaça ou antídotos simples.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'inteligencia-10-3', name: 'Hacker Intuitivo', description: 'Especialista em invadir e manipular sistemas eletrônicos.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-3-1', name: 'Bypass de Segurança', description: 'Ignora senhas e travas eletrônicas simples.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-3-2', name: 'Vírus de Distração', description: 'Envia um vírus que desliga luzes, ativa alarmes ou causa caos em um sistema.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-3-3', name: 'Rastrear Sinal', description: 'Localiza a origem de um sinal de rádio ou celular.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-3-4', name: 'Apagar Rastros', description: 'Remove evidências digitais de sua presença em um sistema.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-3-5', name: 'Controle de Drones', description: 'Assume o controle de drones de segurança ou outros dispositivos simples.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'inteligencia-10-4', name: 'Poliglota', description: 'Capacidade de entender e falar múltiplas línguas rapidamente.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-4-1', name: 'Decifrar Código', description: 'Usa seu conhecimento de linguística para decifrar códigos e cifras.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-4-2', name: 'Linguagem Corporal', description: 'Lê a linguagem corporal de alguém para entender suas verdadeiras intenções.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-4-3', name: 'Compreensão Universal', description: 'Consegue entender a essência de línguas desconhecidas ou paranormais.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-4-4', name: 'Sotaque Perfeito', description: 'Fala uma língua sem sotaque, passando-se por um nativo.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-4-5', name: 'Tradução Instantânea', description: 'Atua como tradutor em tempo real para sua equipe.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'inteligencia-10-5', name: 'Detetive Paranormal', description: 'Usa a lógica para investigar o inexplicável.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-5-1', name: 'Conectar Pistas', description: 'Encontra padrões e conexões entre evidências aparentemente não relacionadas.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-5-2', name: 'Reconstruir Cena', description: 'Analisa uma cena para deduzir a sequência de eventos que ocorreram.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-5-3', name: 'Perfil Psicológico', description: 'Cria um perfil preciso de uma pessoa ou criatura com base em suas ações.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-5-4', name: 'Intuição Guiada', description: 'Sua lógica te leva a ter "palpites" corretos sobre onde procurar a próxima pista.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-5-5', name: 'Enfraquecer pelo Conhecimento', description: 'Descobrir o nome verdadeiro ou a origem de uma entidade a enfraquece.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'inteligencia-5-2', name: 'Conhecimento Acadêmico', description: 'Perícia em áreas do saber como história, ciência ou ocultismo.', requirements: { inteligencia: 5 }, unlocked: false, children: [
                { id: 'inteligencia-10-6', name: 'Historiador', description: 'Conhecimento profundo sobre eventos passados, culturas e civilizações.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-6-1', name: 'Lembrar Detalhe', description: 'Lembra-se de um fato histórico relevante para a situação atual.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-6-2', name: 'Analisar Artefato', description: 'Determina a origem e a idade de um objeto antigo.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-6-3', name: 'Conhecer Lendas', description: 'Conhece mitos e lendas que podem conter verdades ocultas.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-6-4', name: 'Prever Padrões', description: 'Usa o conhecimento histórico para prever as ações de um grupo ou pessoa.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-6-5', name: 'Línguas Mortas', description: 'Capaz de decifrar ou entender fragmentos de línguas antigas.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'inteligencia-10-7', name: 'Cientista', description: 'Conhecimento em física, química e outras ciências naturais.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-7-1', name: 'Análise Química', description: 'Analisa uma substância para determinar sua composição.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-7-2', name: 'Cálculo Rápido', description: 'Realiza cálculos complexos de cabeça rapidamente.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-7-3', name: 'Entender Física', description: 'Explica um fenômeno físico e como explorá-lo.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-7-4', name: 'Criar Composto', description: 'Mistura produtos químicos para criar um ácido, explosivo ou antídoto simples.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-7-5', name: 'Método Científico', description: 'Cria um experimento para testar uma hipótese.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'inteligencia-10-8', name: 'Ocultista', description: 'Conhecimento sobre o paranormal, rituais e entidades.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-8-1', name: 'Identificar Ritual', description: 'Reconhece os sinais e o propósito de um ritual paranormal.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-8-2', name: 'Conhecer Entidade', description: 'Lembra-se de informações sobre uma criatura ou entidade específica.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-8-3', name: 'Ler Símbolos', description: 'Decifra símbolos arcanos e runas.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-8-4', name: 'Contra-ritual', description: 'Sabe como interromper ou enfraquecer um ritual em andamento.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-8-5', name: 'Usar Artefato', description: 'Entende como ativar ou usar um item paranormal.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'inteligencia-5-3', name: 'Medicina e Biologia', description: 'Conhecimento sobre o corpo humano e outras formas de vida.', requirements: { inteligencia: 5 }, unlocked: false, children: [
                { id: 'inteligencia-10-9', name: 'Médico de Campo', description: 'Capacidade de tratar ferimentos em situações de combate.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-9-1', name: 'Primeiros Socorros Avançado', description: 'Estabiliza um alvo morrendo e remove condições como sangramento.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-9-2', name: 'Cirurgia Improvisada', description: 'Realiza cirurgias complexas com ferramentas improvisadas.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-9-3', name: 'Diagnóstico Rápido', description: 'Determina a causa de ferimentos ou doenças com um olhar.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-9-4', name: 'Tratar Veneno', description: 'Neutraliza os efeitos da maioria dos venenos.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-9-5', name: 'Reanimação', description: 'Tem uma chance de trazer de volta alguém que acabou de morrer.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'inteligencia-10-10', name: 'Biólogo', description: 'Conhecimento sobre a fauna e flora, normal e paranormal.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-10-1', name: 'Análise de Criatura', description: 'Identifica as fraquezas e habilidades de uma criatura.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-10-2', name: 'Coletar Amostras', description: 'Coleta amostras biológicas de criaturas para estudo.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-10-3', name: 'Entender Ecossistema', description: 'Entende como as criaturas e o ambiente interagem.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-10-4', name: 'Xenobiologia', description: 'Especialista em formas de vida anormais ou alienígenas.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-10-5', name: 'Criar Isca', description: 'Usa conhecimento biológico para criar uma isca para uma criatura específica.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'inteligencia-5-4', name: 'Engenharia e Tecnologia', description: 'Habilidade para criar, consertar e entender máquinas e sistemas.', requirements: { inteligencia: 5 }, unlocked: false, children: [
                { id: 'inteligencia-10-11', name: 'Mecânico', description: 'Perícia em consertar e construir dispositivos mecânicos.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-11-1', name: 'Conserto Rápido', description: 'Conserta um item quebrado temporariamente.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-11-2', name: 'Melhorar Equipamento', description: 'Faz um upgrade em uma arma ou armadura.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-11-3', name: 'Sabotagem', description: 'Sabota um dispositivo mecânico para que ele falhe mais tarde.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-11-4', name: 'Construir Armadilha', description: 'Cria armadilhas mecânicas com sucata.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-11-5', name: 'Engenharia Reversa', description: 'Desmonta um dispositivo para entender como ele funciona.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'inteligencia-10-12', name: 'Hacker', description: 'Perícia em invadir e manipular sistemas de computador.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-12-1', name: 'Invadir Sistema', description: 'Ganha acesso a um sistema de computador protegido.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-12-2', name: 'Desativar Segurança', description: 'Desliga câmeras, alarmes e travas eletrônicas.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-12-3', name: 'Roubar Dados', description: 'Copia arquivos de um sistema sem ser detectado.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-12-4', name: 'Apagar Rastros', description: 'Remove qualquer evidência de sua invasão.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-12-5', name: 'Vírus', description: 'Envia um vírus para sobrecarregar ou controlar um sistema.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]}
            ]},
            { id: 'inteligencia-5-5', name: 'Investigação', description: 'A arte de encontrar pistas, seguir rastros e resolver mistérios.', requirements: { inteligencia: 5 }, unlocked: false, children: [
                { id: 'inteligencia-10-13', name: 'Detetive', description: 'Perícia em encontrar e analisar evidências físicas.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-13-1', name: 'Procurar Pistas', description: 'Encontra pistas escondidas em uma cena de crime.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-13-2', name: 'Análise Forense', description: 'Analisa impressões digitais, pegadas e outras evidências.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-13-3', name: 'Reconstruir Cena', description: 'Deduz a sequência de eventos que ocorreram em um local.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-13-4', name: 'Notar Detalhes', description: 'Percebe detalhes que outros ignorariam.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-13-5', name: 'Conectar Evidências', description: 'Encontra a ligação entre duas peças de evidência aparentemente não relacionadas.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'inteligencia-10-14', name: 'Interrogador', description: 'Perícia em extrair informações de pessoas.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-14-1', name: 'Detectar Mentiras', description: 'Sabe quando alguém está mentindo.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-14-2', name: 'Ler Linguagem Corporal', description: 'Entende as verdadeiras intenções de alguém pela sua postura.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-14-3', name: 'Bom Policial/Mau Policial', description: 'Alterna táticas para confundir e extrair informações.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-14-4', name: 'Pressionar', description: 'Usa uma informação para pressionar o alvo a confessar mais.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-14-5', name: 'Obter Confissão', description: 'Consegue uma confissão completa de um alvo culpado.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]}
            ]}
        ]
    }
};

let SKILL_TREES = JSON.parse(JSON.stringify(DEFAULT_SKILL_TREES));

// =================================================================================
// CLASSE: SkillTreeEditor - Gerencia o dashboard de edição de árvores de habilidades
// =================================================================================
class SkillTreeEditor {
    constructor() {
        this.editorContainer = document.getElementById('skill-tree-editor');
        this.attributeEditorContainer = document.getElementById('attribute-skill-tree-editor');
        this.loadSkillTrees();
        this.render();
        this.setupSaveButton();
    }

    setupSaveButton() {
        const saveButton = document.getElementById('save-skill-tree-changes');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveSkillTrees();
                alert('Alterações nas habilidades foram salvas com sucesso!');
            });
        }
    }

    loadSkillTrees() {
        const storedSkills = localStorage.getItem('sombras-skill-trees');
        try {
            if (!storedSkills) {
                // Se não há nada salvo, usa o padrão e termina.
                SKILL_TREES = JSON.parse(JSON.stringify(DEFAULT_SKILL_TREES));
                return;
            }

            const loadedSkills = JSON.parse(storedSkills);

            // Se os dados são inválidos (não é um objeto), reseta tudo.
            if (!loadedSkills || typeof loadedSkills !== 'object') {
                throw new Error("Dados de habilidades inválidos no localStorage.");
            }

            // Garante que as árvores de CLASSE existam e não estejam vazias.
            ['Bélico', 'Esotérico', 'Erudito'].forEach(className => {
                if (!loadedSkills[className] || typeof loadedSkills[className] !== 'object' || Object.keys(loadedSkills[className]).length === 0) {
                    console.warn(`Árvore de habilidades de '${className}' ausente ou vazia. Restaurando do padrão.`);
                    loadedSkills[className] = DEFAULT_SKILL_TREES[className];
                    return; // Próxima classe
                }

                // Verifica a integridade dos elementos e especializações dentro da classe
                for (const element in DEFAULT_SKILL_TREES[className]) {
                    if (!loadedSkills[className][element] || typeof loadedSkills[className][element] !== 'object' || Array.isArray(loadedSkills[className][element])) {
                        console.warn(`Elemento '${element}' na classe '${className}' é inválido ou um array. Restaurando.`);
                        loadedSkills[className][element] = DEFAULT_SKILL_TREES[className][element];
                        continue; // Próximo elemento
                    }

                    // Verifica as especializações dentro do elemento
                    for (const specName in DEFAULT_SKILL_TREES[className][element]) {
                        if (!loadedSkills[className][element][specName] || !Array.isArray(loadedSkills[className][element][specName])) {
                            console.warn(`Especialização '${specName}' ausente no elemento '${element}' da classe '${className}'. Restaurando.`);
                            loadedSkills[className][element][specName] = DEFAULT_SKILL_TREES[className][element][specName];
                        }
                    }
                }
            });

            // Garante que a árvore de 'Atributo' exista e não esteja vazia. Se estiver, restaura do padrão.
            if (!loadedSkills.Atributo || typeof loadedSkills.Atributo !== 'object' || Object.keys(loadedSkills.Atributo).length === 0) {
                console.warn("Árvore de habilidades de 'Atributo' ausente ou vazia. Restaurando do padrão.");
                loadedSkills.Atributo = DEFAULT_SKILL_TREES.Atributo;
            } else {
                // Verificação mais profunda: garante que cada sub-categoria de atributo é um array.
                for (const attrName in DEFAULT_SKILL_TREES.Atributo) {
                    if (!loadedSkills.Atributo[attrName] || !Array.isArray(loadedSkills.Atributo[attrName])) {
                        console.warn(`Sub-categoria de atributo '${attrName}' ausente ou inválida. Restaurando.`);
                        loadedSkills.Atributo[attrName] = DEFAULT_SKILL_TREES.Atributo[attrName];
                    }
                }
            }

            // Migração para garantir que a estrutura de dados seja a aninhada correta.
            if (loadedSkills.Atributo?.Força?.length > 0 && typeof loadedSkills.Atributo.Força[0].children === 'undefined') {
                console.warn("Detectada estrutura de habilidades de Atributo antiga. Forçando a atualização para a nova estrutura em árvore.");
                loadedSkills.Atributo = DEFAULT_SKILL_TREES.Atributo;
            }

            SKILL_TREES = loadedSkills;
        } catch (error) {
            console.error("Erro ao carregar ou analisar a árvore de habilidades do localStorage. Usando a árvore padrão.", error);
            SKILL_TREES = JSON.parse(JSON.stringify(DEFAULT_SKILL_TREES));
            localStorage.removeItem('sombras-skill-trees'); // Limpa os dados corrompidos para evitar erros futuros.
        }
    }

    _createCategoryElement(category) {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'skill-tree-category';

        const categoryHeader = document.createElement('h3');
        categoryHeader.textContent = category;
        categoryHeader.classList.add('collapsible-header');
        categoryContainer.appendChild(categoryHeader);

        const categoryContent = document.createElement('div');
        categoryContent.className = 'collapsible-content';
        categoryContainer.appendChild(categoryContent);

        categoryHeader.addEventListener('click', () => {
            categoryHeader.classList.toggle('active');
            const content = categoryHeader.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });

        for (const subCategory in SKILL_TREES[category]) {
            const subCategoryElement = this._createSubCategoryElement(category, subCategory);
            categoryContent.appendChild(subCategoryElement);
        }

        return categoryContainer;
    }

    _createSubCategoryElement(category, subCategory) {
        const subCategoryContainer = document.createElement('div');
        subCategoryContainer.className = 'skill-tree-subcategory';

        const subCategoryHeader = document.createElement('h4');
        subCategoryHeader.textContent = subCategory;
        subCategoryHeader.classList.add('collapsible-header');
        subCategoryContainer.appendChild(subCategoryHeader);

        const subCategoryContent = document.createElement('div');
        subCategoryContent.className = 'collapsible-content';
        subCategoryContainer.appendChild(subCategoryContent);

        subCategoryHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            subCategoryHeader.classList.toggle('active');
            const content = subCategoryHeader.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });

        if (category === 'Atributo') {
            const skillListElement = this._createSkillListElement(SKILL_TREES[category][subCategory]);
            subCategoryContent.appendChild(skillListElement);
        } else {
            const specializations = SKILL_TREES[category][subCategory];
            for (const specName in specializations) {
                const specElement = this._createSpecializationElement(specName, specializations[specName]);
                subCategoryContent.appendChild(specElement);
            }
        }

        return subCategoryContainer;
    }

    _createSpecializationElement(specName, skillArray) {
        const specContainer = document.createElement('div');
        specContainer.className = 'skill-tree-specialization';

        const specHeader = document.createElement('h5');
        specHeader.textContent = specName;
        specHeader.classList.add('collapsible-header');
        specContainer.appendChild(specHeader);

        const specContent = document.createElement('div');
        specContent.className = 'collapsible-content';
        specContainer.appendChild(specContent);

        specHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            specHeader.classList.toggle('active');
            const content = specHeader.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });

        const skillListElement = this._createSkillListElement(skillArray);
        specContent.appendChild(skillListElement);

        return specContainer;
    }

    _createSkillListElement(skillArray) {
        const container = document.createElement('div');

        const skillTreeContainer = document.createElement('div');
        skillTreeContainer.className = 'skill-list-tree';

        // Blindagem: Garante que o código não quebre se skillArray não for um array.
        if (Array.isArray(skillArray)) {
            skillArray.forEach(skill => {
                this._renderSkillRecursive(skill, skillTreeContainer, skillArray);
            });
        } else {
            console.error("Erro de renderização: os dados da lista de habilidades não são um array.", skillArray);
        }

        const addRootSkillButton = document.createElement('button');
        addRootSkillButton.textContent = 'Adicionar Habilidade Raiz';
        addRootSkillButton.className = 'add-skill-btn';
        addRootSkillButton.addEventListener('click', () => {
            const newSkill = { id: `new-skill-${Date.now()}`, name: 'Nova Habilidade', description: '', requirements: {}, children: [] };
            skillArray.push(newSkill);
            this.render();
        });

        container.appendChild(skillTreeContainer);
        container.appendChild(addRootSkillButton);

        return container;
    }

    saveSkillTrees() {
        localStorage.setItem('sombras-skill-trees', JSON.stringify(SKILL_TREES));
    }

    render() {
        this.editorContainer.innerHTML = '';
        if (this.attributeEditorContainer) this.attributeEditorContainer.innerHTML = '';

        for (const category in SKILL_TREES) {
            const categoryElement = this._createCategoryElement(category);
            if (category === 'Atributo') {
                this.attributeEditorContainer?.appendChild(categoryElement);
            } else {
                this.editorContainer.appendChild(categoryElement);
            }
        }
    }

    _renderSkillRecursive(skill, parentContainer, parentArray) {
        // Adiciona uma verificação de segurança para evitar que dados corrompidos quebrem a renderização.
        if (!skill) {
            console.warn("Encontrada uma habilidade nula nos dados salvos. Ignorando para evitar erros.");
            return;
        }

        const skillWrapper = document.createElement('div');
        skillWrapper.className = 'skill-node-wrapper';

        const skillNode = this.createSkillNode(skill, parentArray);
        skillWrapper.appendChild(skillNode);

        if (Array.isArray(skill.children) && skill.children.length > 0) {
            skillNode.classList.add('has-children');
            const nodeHeader = skillNode.querySelector('.skill-node-header');

            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'skill-children-container';
            childrenContainer.style.display = 'none'; // Oculta os filhos por padrão

            skill.children.forEach(childSkill => {
                this._renderSkillRecursive(childSkill, childrenContainer, skill.children);
            });
            skillWrapper.appendChild(childrenContainer);

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'skill-node-toggle-btn';
            toggleBtn.innerHTML = '▶';
            nodeHeader.prepend(toggleBtn); // Prepend to the header

            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = skillNode.classList.toggle('expanded');
                childrenContainer.style.display = isExpanded ? 'block' : 'none';
                toggleBtn.innerHTML = isExpanded ? '▼' : '▶';
            });
        }

        parentContainer.appendChild(skillWrapper);
    }

    createSkillNode(skill, parentArray) {
        const skillNode = document.createElement('div');
        skillNode.className = 'skill-node-editor';

        // Header for the node
        const nodeHeader = document.createElement('div');
        nodeHeader.className = 'skill-node-header';

        const nameDisplay = document.createElement('span');
        nameDisplay.className = 'skill-node-name';
        nameDisplay.textContent = skill.name || 'Nova Habilidade';
        
        // Container for editor fields
        const editorContent = document.createElement('div');
        editorContent.className = 'skill-node-content';
        editorContent.style.display = 'none'; // Collapsed by default

        const nameInput = this._createInput('text', skill.name, 'Nome da Habilidade', (val) => {
            skill.name = val;
            nameDisplay.textContent = val || 'Nova Habilidade'; // Update display name
        });
        const descTextarea = this._createInput('textarea', skill.description, 'Descrição', (val) => skill.description = val);
        const reqsValue = skill.requirements ? Object.entries(skill.requirements).map(([k, v]) => `${k}:${v}`).join(', ') : '';
        const reqsInput = this._createInput('text', reqsValue, 'Requisitos (ex: forca:5)', (val) => {
            const reqs = {};
            val.split(',').forEach(req => {
                const [key, value] = req.split(':');
                if (key && value) reqs[key.trim()] = parseInt(value.trim(), 10) || 0;
            });
            skill.requirements = reqs;
        });

        editorContent.appendChild(nameInput);
        editorContent.appendChild(descTextarea);
        editorContent.appendChild(reqsInput);

        // Action buttons
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'skill-node-actions';

        const addChildBtn = this._createButton('+ Ramificação', 'add-child', () => {
            if (!Array.isArray(skill.children)) skill.children = [];
            skill.children.push({ id: `new-skill-${Date.now()}`, name: 'Nova Ramificação', description: '', requirements: {}, children: [] });
            this.render();
        });

        const deleteBtn = this._createButton('Excluir', 'delete', () => {
            const index = parentArray.findIndex(s => s && s.id === skill.id);
            if (index > -1) {
                parentArray.splice(index, 1);
                this.render();
            }
        });

        actionsContainer.appendChild(addChildBtn);
        actionsContainer.appendChild(deleteBtn);

        nodeHeader.appendChild(nameDisplay);
        nodeHeader.appendChild(actionsContainer);
        
        skillNode.appendChild(nodeHeader);
        skillNode.appendChild(editorContent);

        // Click to expand/collapse the editor
        nodeHeader.addEventListener('click', (e) => {
            // Prevent toggling when clicking action or toggle buttons
            if (e.target.closest('.skill-action-btn') || e.target.closest('.skill-node-toggle-btn')) return;
            
            const isExpanded = skillNode.classList.toggle('is-editing');
            editorContent.style.display = isExpanded ? 'block' : 'none';
        });

        return skillNode;
    }

    _createInput(type, value, placeholder, onChange) {
        const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
        if (type !== 'textarea') input.type = type;
        input.value = value;
        input.placeholder = placeholder;
        input.addEventListener('change', (e) => {
            onChange(e.target.value);
        });
        return input;
    }

    _createButton(text, className, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `skill-action-btn ${className}`;
        button.addEventListener('click', onClick);
        return button;
    }
}


// =================================================================================
// CLASSE: CharacterCreator - Gerencia o assistente de criação de personagens
// =================================================================================
class CharacterCreator {
    constructor() {
        this.elementData = {
            Temporal: {
                title: 'Temporal',
                color: '#9E9E9E',
                shadow: 'rgba(158, 158, 158, 0.4)',
                lore: 'O Temporal não é apenas sobre o tempo; é sobre o ciclo inevitável da vida, morte e renascimento. Seus portadores sentem o peso dos éons, o eco de futuros que poderiam ser e o cheiro da decadência que alimenta nova vida. Eles não veem a morte como um fim, mas como uma vírgula na grande sentença da existência. Manipular o Temporal é tocar na entropia, acelerar o apodrecimento de um inimigo ou vislumbrar os fios do destino para evitar um golpe fatal. É um poder melancólico, poderoso e que exige um profundo respeito pelo equilíbrio natural.'
            },
            Cerebral: {
                title: 'Cerebral',
                color: '#ffc107',
                shadow: 'rgba(255, 193, 7, 0.4)',
                lore: 'O conhecimento é poder, mas o conhecimento proibido é transcendência. O Cerebral representa a mente humana levada ao seu limite absoluto, tocando em conceitos que a realidade mal consegue conter. Seus agentes são canais para símbolos ancestrais, equações que dobram o espaço e verdades que podem quebrar a sanidade de mentes inferiores. Eles não lançam feitiços; eles impõem sua lógica sobre o universo. Um portador do Cerebral pode reescrever a percepção de um alvo, decifrar qualquer código ou manifestar construtos de pura informação. A estética angelical é uma ironia, pois o poder que detêm vem dos lugares mais sombrios da compreensão.'
            },
            Visceral: {
                title: 'Visceral',
                color: '#dc3545',
                shadow: 'rgba(220, 53, 69, 0.4)',
                lore: 'A carne é fraca? Não para um portador do Visceral. Para eles, o corpo é a mais perfeita e maleável das máquinas. Este elemento é a celebração da biologia em sua forma mais crua e brutal. Seus agentes podem endurecer a pele como aço, regenerar feridas em segundos, ou transformar seus próprios membros em armas mortais. O poder Visceral é instintivo, alimentado pela dor, pela raiva e pela adrenalina. Não há sutileza aqui, apenas a afirmação primal de que a vontade de sobreviver e dominar pode moldar a própria matéria viva. É o poder da besta interior, finalmente liberta.'
            },
            Vital: {
                title: 'Vital',
                color: '#9b59b6',
                shadow: 'rgba(155, 89, 182, 0.4)',
                lore: 'Se o universo é uma tapeçaria ordenada, o Vital é a energia caótica que corre entre os fios, ameaçando desfazê-la a qualquer momento. Este é o elemento da energia em seu estado mais puro e indomado. Seus portadores são baterias vivas de poder bruto, capazes de liberar explosões de força telecinética, criar escudos de energia instável ou simplesmente desintegrar a matéria com um toque. O Vital não obedece a leis, ele as cria e as destrói. É perigoso, imprevisível e incrivelmente poderoso, exigindo um controle férreo para não ser consumido pela própria energia que comanda.'
            }
        };

        this.currentStep = 1;
        this.attributePoints = 4;
        this.baseAttributeValue = 1;
        this.currentCharacter = {
            id: `char_${Date.now()}`,
            class: '',
            element: '',
            specialization: null,
            level: 1,
            xp: 0,
            attributePoints: 0,
            skillPoints: 0,
            skills: [],
            attributes: {
                forca: 1,
                agilidade: 1,
                presenca: 1,
                vitalidade: 1,
                inteligencia: 1
            },
            status: { sanidade: 50 },
            pericias: {},
            inventario: [],
            personalization: {},
            createdAt: new Date().toISOString()
        };

        this.elements = {
            steps: document.querySelectorAll('.full-screen-section'),
            navSteps: document.querySelectorAll('.step-item'),
            classCards: document.querySelectorAll('.class-card'),
            elementCards: document.querySelectorAll('.element-card'),
            attributeControls: document.querySelectorAll('.attribute-control'),
            attributePointsSpan: document.getElementById('attribute-points'),
            personalizationForm: document.getElementById('personalization-form'),
            wizardButtons: {
                backToClass: document.getElementById('back-to-class'),
                backToElementFromAttributes: document.getElementById('back-to-element-from-attributes'),
                toFinalize: document.getElementById('to-finalize'),
                backToAttributes: document.getElementById('back-to-attributes'),
                finish: document.getElementById('finish-wizard')
            },
            loreModal: {
                overlay: document.getElementById('element-lore-overlay'),
                content: document.getElementById('element-lore-modal'),
                title: document.getElementById('modal-element-title'),
                lore: document.getElementById('modal-element-lore'),
                confirmBtn: document.getElementById('modal-confirm-btn'),
                cancelBtn: document.getElementById('modal-cancel-btn')
            }
        };

        this.creationMode = new URLSearchParams(window.location.search).get('mode') || 'online';

        this.initialize();
    }

    initialize() {
        if (!document.getElementById('step-1')) return;

        this.setupClassSelection();
        this.setupElementSelection();
        this.setupAttributeDistribution();
        this.setupPersonalizationForm();
        this.setupWizardButtons();
        this.displayLocalModeWarning();
        this.restoreFormData();
        this.updateCharacterSummary();
    }

    displayLocalModeWarning() {
        if (this.creationMode !== 'local') return;

        const placeholder = document.getElementById('local-mode-warning-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <div class="content-box" style="background-color: rgba(255, 193, 7, 0.1); border-color: #ffc107; text-align: center; margin-bottom: 2rem;">
                    <h3 style="color: #ffc107; font-family: var(--font-display); font-size: 1.8rem; margin-top: 0;">⚠️ MODO DE TESTE ATIVADO ⚠️</h3>
                    <p style="color: #f0f0f0; margin-bottom: 0;">Você está criando um agente de teste. Esta ficha será salva <strong>apenas no seu navegador</strong> e será perdida se você limpar os dados do site.</p>
                </div>
            `;
        }
    }

    navigateToStep(stepNumber) {
        this.currentStep = stepNumber;
        this.elements.steps.forEach(step => step.classList.remove('active-section'));
        const nextStepElement = document.getElementById(`step-${stepNumber}`);
        if (nextStepElement) {
            nextStepElement.classList.add('active-section');
        }

        this.elements.navSteps.forEach(nav => {
            nav.classList.remove('active');
            if (nav.id.includes(`nav-step-${stepNumber}`)) {
                nav.classList.add('active');
            }
        });
        this.saveFormData();
    }

    setupClassSelection() {
        this.elements.classCards.forEach(card => {
            card.addEventListener('click', () => {
                this.elements.classCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                const selectedClass = card.dataset.class;
                this.currentCharacter.class = selectedClass;
                this.updateCharacterSummary();
                this.navigateToStep(2);
            });
        });
    }

    setupElementSelection() {
        this.elements.elementCards.forEach(card => {
            card.addEventListener('click', () => {
                const elementName = card.dataset.element;
                this.showLoreModal(elementName);
            });
        });
    }

    showLoreModal(elementName) {
        const element = this.elementData[elementName];
        const { loreModal } = this.elements;

        if (!element || !loreModal.overlay) return;

        loreModal.content.style.setProperty('--element-color', element.color);
        loreModal.content.style.setProperty('--element-color-shadow', element.shadow);
        loreModal.title.textContent = element.title;
        loreModal.lore.textContent = element.lore;

        loreModal.overlay.classList.add('visible');

        const confirmHandler = () => {
            this.currentCharacter.element = elementName;
            this.updateCharacterSummary();
            this.saveFormData();
            this.hideLoreModal();
            this.navigateToStep(3);
            cleanup();
        };

        const cancelHandler = () => {
            this.hideLoreModal();
            cleanup();
        };

        const cleanup = () => {
            loreModal.confirmBtn.removeEventListener('click', confirmHandler);
            loreModal.cancelBtn.removeEventListener('click', cancelHandler);
        };

        loreModal.confirmBtn.addEventListener('click', confirmHandler);
        loreModal.cancelBtn.addEventListener('click', cancelHandler);
    }

    hideLoreModal() {
        this.elements.loreModal.overlay.classList.remove('visible');
    }

    setupAttributeDistribution() {
        this.elements.attributeControls.forEach(control => {
            const incrementBtn = control.querySelector('.btn-increment');
            const decrementBtn = control.querySelector('.btn-decrement');
            const attributeInput = control.querySelector('input');
            const attribute = attributeInput.name;

            incrementBtn.addEventListener('click', () => {
                if (this.attributePoints > 0) {
                    this.attributePoints--;
                    this.currentCharacter.attributes[attribute]++;
                    this.updateAttributeUI();
                }
            });

            decrementBtn.addEventListener('click', () => {
                if (this.currentCharacter.attributes[attribute] > this.baseAttributeValue) {
                    this.attributePoints++;
                    this.currentCharacter.attributes[attribute]--;
                    this.updateAttributeUI();
                }
            });
        });
    }

    updateAttributeUI() {
        if(this.elements.attributePointsSpan) {
            this.elements.attributePointsSpan.textContent = this.attributePoints;
        }
        for (const attribute in this.currentCharacter.attributes) {
            const input = document.getElementById(attribute);
            if (input) {
                input.value = this.currentCharacter.attributes[attribute];
            }
        }
        this.updateCharacterSummary();
        this.saveFormData();
    }

    setupPersonalizationForm() {
        const form = this.elements.personalizationForm;
        if (!form) return;

        // Se estiver criando para uma campanha, passa o ID para o formulário
        const campaignId = new URLSearchParams(window.location.search).get('campaignId');
        if (campaignId) {
            const campaignIdInput = document.createElement('input');
            campaignIdInput.type = 'hidden';
            campaignIdInput.name = 'campaignId';
            campaignIdInput.value = campaignId;
            form.appendChild(campaignIdInput);
        }

        // Lida com campos de texto
        form.addEventListener('input', debounce((e) => {
            if (e.target.type === 'file') return; // Ignora o input de arquivo aqui
            const formData = new FormData(form);
            // Filtra para não incluir o campo de arquivo no objeto
            const formEntries = Object.fromEntries(formData.entries());
            delete formEntries.imageFile;
            this.currentCharacter.personalization = { ...this.currentCharacter.personalization, ...formEntries };
            this.updateCharacterSummary();
            this.saveFormData();
        }, 300));

        // Lida com o campo de imagem
        const imageInput = document.getElementById('char-image-input');
        const imagePreview = document.getElementById('char-image-preview');
        imageInput.addEventListener('change', async () => {
            const file = imageInput.files[0];
            if (file) {
                this.currentCharacter.personalization.imageUrl = await readFileAsDataURL(file);
                imagePreview.src = this.currentCharacter.personalization.imageUrl;
            }
        });
    }

    setupWizardButtons() {
        const { wizardButtons, navSteps } = this.elements;

        wizardButtons.backToClass?.addEventListener('click', () => this.navigateToStep(1));
        wizardButtons.backToElementFromAttributes?.addEventListener('click', () => this.navigateToStep(2));
        wizardButtons.toFinalize?.addEventListener('click', () => this.navigateToStep(4));
        wizardButtons.backToAttributes?.addEventListener('click', () => this.navigateToStep(3));
        wizardButtons.finish?.addEventListener('click', () => this.saveCharacter());

        navSteps.forEach(nav => {
            nav.addEventListener('click', () => {
                // Regex corrigido para pegar o segundo número, que representa a etapa de destino
                const stepMatch = nav.id.match(/nav-step-\d+-(\d+)/);
                if (stepMatch && stepMatch[1]) { 
                    const step = parseInt(stepMatch[1]);
                    this.navigateToStep(step);
                }
            });
        });
    }

    updateCharacterSummary() {
        const summaryContainer = document.getElementById('character-summary-container');
        if (!summaryContainer) return;

        const { class: charClass, element, attributes, personalization } = this.currentCharacter;
        const attrText = `FOR: ${attributes.forca} | AGI: ${attributes.agilidade} | PRE: ${attributes.presenca} | VIT: ${attributes.vitalidade} | INT: ${attributes.inteligencia}`;
        summaryContainer.innerHTML = `
            <div class="summary-item"><strong>Nome:</strong> ${personalization.name || '...'}
            <div class="summary-item"><strong>Jogador:</strong> ${personalization.player || '...'}
            <div class="summary-item"><strong>Classe:</strong> ${charClass || 'Não definida'}
            <div class="summary-item"><strong>Elemento:</strong> ${element || 'Não definido'}
            <div class="summary-item"><strong>Atributos:</strong> ${attrText}
        `;
    }

    saveFormData() {
        sessionStorage.setItem('character-in-progress', JSON.stringify(this.currentCharacter));
    }

    restoreFormData() {
        const savedData = sessionStorage.getItem('character-in-progress');
        if (savedData) {
            this.currentCharacter = JSON.parse(savedData);

            if (this.currentCharacter.class) {
                this.elements.classCards.forEach(card => {
                    if (card.dataset.class === this.currentCharacter.class) {
                        card.classList.add('active');
                    }
                });
            }

            if (this.elements.personalizationForm) {
                for (const key in this.currentCharacter.personalization) {
                    const input = this.elements.personalizationForm.elements[key];
                    if (input) {
                        input.value = this.currentCharacter.personalization[key];
                    }
                }
                // Restaura a pré-visualização da imagem
                if (this.currentCharacter.personalization.imageUrl) {
                    const imagePreview = document.getElementById('char-image-preview');
                    if (imagePreview) imagePreview.src = this.currentCharacter.personalization.imageUrl;
                }
            }
            this.updateAttributeUI();
        }
    }

    clearFormData() {
        sessionStorage.removeItem('character-in-progress'); 
    }

    async saveCharacterLocally() {
        try {
            let localCharacters = JSON.parse(localStorage.getItem('sombras-local-characters')) || [];
            // Garante que não haja IDs duplicados
            localCharacters = localCharacters.filter(char => char.id !== this.currentCharacter.id);
            localCharacters.unshift(this.currentCharacter); // Adiciona no início
            localStorage.setItem('sombras-local-characters', JSON.stringify(localCharacters));
            
            this.clearFormData();
            window.location.href = 'agentes.html';

        } catch (error) {
            console.error('Erro ao salvar personagem localmente:', error);
            alert('Ocorreu um erro ao salvar a ficha de teste. Verifique o console.');
        }
    }

    async saveCharacter() {
        const { name, player } = this.currentCharacter.personalization;
        const campaignId = new URLSearchParams(window.location.search).get('campaignId');
        if (!name || !player) {
            alert('Por favor, preencha os campos obrigatórios (Nome do Agente e Nome do Jogador) para finalizar.');
            return;
        }

        // Se estiver em modo local, usa a função de salvamento local
        if (this.creationMode === 'local') {
            this.saveCharacterLocally();
            return;
        }

        this.currentCharacter.baseAttributes = CLASS_BASE_ATTRIBUTES[this.currentCharacter.class];

        // Adiciona os status e atributos derivados que faltavam
        const attrs = this.currentCharacter.attributes;
        const hpMax = 10 + (attrs.vitalidade * 2);
        const sanityMax = 10 + (attrs.presenca * 2);
        const paMax = 5 + Math.floor(attrs.agilidade / 2);

        this.currentCharacter.status = {
            hp_current: hpMax,
            hp_max: hpMax,
            sanity_current: sanityMax,
            sanity_max: sanityMax,
            pa_current: paMax,
            pa_max: paMax,
        };

        this.currentCharacter.classStats = {
            defense: 10 + attrs.agilidade,
        };

        try {
            // Usando Axios para enviar o personagem para o backend
            const response = await api.post('/api/characters', this.currentCharacter); // Salva o personagem na conta do usuário
            const newCharacter = response.data;

            // Se foi criado a partir de uma campanha, adiciona o personagem a ela
            if (campaignId && newCharacter) {
                await api.put(`/api/campaigns/${campaignId}/add-character`, { characterId: newCharacter._id });
                alert('Agente criado e adicionado à campanha com sucesso!');
                // Redireciona de volta para a página da campanha
                window.location.href = `gerenciar-campanha.html?id=${campaignId}`;
                return;
            }

            // Fluxo normal: redireciona para a lista de agentes
            this.clearFormData();
            window.location.href = 'agentes.html';
        } catch (error) {
            console.error("Erro detalhado ao salvar personagem:", error.response || error);
            if (error.response) {
                // O servidor respondeu com um status de erro (4xx, 5xx)
                const errorData = error.response.data;
                alert(`Erro ao salvar personagem: ${errorData.message || 'Erro desconhecido.'}`);
                if (error.response.status === 401) {
                    // Se não autorizado, redireciona para o login
                    window.location.href = `${API_BASE_URL}/auth/google`;
                }
            } else {
                // Erro de rede ou outro problema
                console.error('Erro de rede ao salvar personagem:', error.message);
                alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
            }
        }
    }
}

// =================================================================================
// CLASSE: CharacterDisplay - Gerencia a exibição dos agentes salvos
// =================================================================================
class CharacterDisplay {
    constructor() {
        this.onlineContainer = document.getElementById('online-agents-content');
        this.localContainer = document.getElementById('local-agents-content');
        this.loadOnlineCharacters();
        this.loadLocalCharacters();
    }

    async loadOnlineCharacters() {
        if (!this.onlineContainer) return;
        try {
            // Usando Axios para buscar os personagens do usuário logado
            const response = await api.get('/characters');
            this.renderCharacters(response.data, this.onlineContainer, 'online');
        } catch (error) {
            if (error.response) {
                // O servidor respondeu com um status de erro
                console.error('Falha ao carregar personagens. O usuário pode não estar logado.');
                if (error.response.status === 401) {
                    // Se não estiver autorizado, mostra a mensagem de login
                    this.onlineContainer.innerHTML = `<div class="empty-state" style="padding: 2rem 0;"><p class="empty-message">Você precisa estar logado para ver seus agentes online.</p><a href="${API_BASE_URL}/auth/google" class="create-character-btn">Fazer Login com Google</a></div>`;
                }
            } else {
                // Erro de rede
                console.error('Erro de rede ao carregar personagens:', error.message);
                this.onlineContainer.innerHTML = `<div class="empty-state" style="padding: 2rem 0;"><p class="empty-message">Erro de conexão com o servidor.</p><p class="empty-submessage">Verifique se o backend está rodando e tente novamente.</p></div>`;
            }
        }
    }

    loadLocalCharacters() {
        if (!this.localContainer) return;
        try {
            const localCharacters = JSON.parse(localStorage.getItem('sombras-local-characters')) || [];
            this.renderCharacters(localCharacters, this.localContainer, 'local');
        } catch (error) {
            console.error('Erro ao carregar personagens locais:', error);
            this.localContainer.innerHTML = `<p>Ocorreu um erro ao ler os agentes de teste.</p>`;
        }
    }

    renderCharacters(characters, container, mode) {
        if (!container) return;

        container.innerHTML = ''; // Limpa o container

        if (characters.length === 0) {
            const message = mode === 'online' 
                ? 'Nenhum agente online criado ainda.'
                : 'Nenhum agente de teste criado. Crie um para vê-lo aqui!';
            container.innerHTML = `<p class="empty-message" style="text-align: center; padding: 2rem 0;">${message}</p>`;
            return;
        }

        let grid = container.querySelector('.characters-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'characters-grid';
            container.appendChild(grid);
        }
        grid.innerHTML = '';

        characters.forEach(char => {
            const card = this.createCharacterCard(char, mode);
            grid.appendChild(card);
        });
    }

    createCharacterCard(character, mode = 'online') {
        const card = document.createElement('div');
        card.className = 'character-card';
        if (character.element) {
            card.classList.add(character.element.toLowerCase());
        }

        const p = character.personalization || {};
        const attrs = character.attributes || { forca: '?', agilidade: '?', presenca: '?', vitalidade: '?', inteligencia: '?' };
        const creationDate = character.createdAt ? new Date(character.createdAt).toLocaleDateString('pt-BR') : 'Data inválida';

        card.dataset.id = character.id;
        card.dataset.mode = mode;

        const imageHtml = p.imageUrl 
            ? `<img src="${p.imageUrl}" alt="Retrato de ${p.name}" class="character-card-image">`
            : '';

       card.innerHTML = `
            ${imageHtml}
            <div class="character-header">
                <h3>${p.name || 'Agente Sem Nome'}</h3>
                <span class="character-class">${character.class || 'Classe Desconhecida'}</span>
                <span class="character-element">${character.element || ''}</span>
            </div>
            <div class="character-info">
                <p><strong>Profissão:</strong> ${p.profession || 'Não informado'}</p> 
            </div>
            <div class="character-attributes">
                <div class="attr-item">
                    <span class="attr-icon"><svg class="attr-svg-icon-small" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.5,8.5c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S19.6,8.5,18.5,8.5z M12,13c-1.66,0-3-1.34-3-3s1.34-3,3-3,3,1.34,3,3 S13.66,13,12,13z M5.5,10.5c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.4,10.5,5.5,10.5z M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10 s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/></svg></span>
                    <span>${attrs.forca} FOR</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon"><svg class="attr-svg-icon-small" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg></span>
                    <span>${attrs.agilidade} AGI</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon"><svg class="attr-svg-icon-small" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,4.5C7,4.5,2.73,7.61,1,12c1.73,4.39,6,7.5,11,7.5s9.27-3.11,11-7.5C21.27,7.61,17,4.5,12,4.5z M12,14.5 c-2.48,0-4.5-2.02-4.5-4.5S9.52,5.5,12,5.5s4.5,2.02,4.5,4.5S14.48,14.5,12,14.5z M12,7.5C10.62,7.5,9.5,8.62,9.5,10 s1.12,2.5,2.5,2.5s2.5-1.12,2.5-2.5S13.38,7.5,12,7.5z"/></svg></span>
                    <span>${attrs.presenca} PRE</span>
                </div>
                <div class="attr-item">
                     <span class="attr-icon"><svg class="attr-svg-icon-small" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></span>
                    <span>${attrs.vitalidade} VIT</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon"><svg class="attr-svg-icon-small" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z M12.5,15.5h-1V14h1V15.5z M12.5,12.5h-1V7h1V12.5z"/></svg></span>
                    <span>${attrs.inteligencia} INT</span>
                </div>
            </div>
            <div class="character-footer">
                <span class="created-date">${creationDate}</span>
                <div class="character-actions">
                    <button class="view-btn">Acessar Ficha</button>
                    <button class="delete-btn">Excluir</button>
                </div>
            </div>
        `;

        const viewUrl = mode === 'local' 
            ? `ficha-agente.html?id=${character.id}&mode=local`
            : `ficha-agente.html?id=${character.id}`;

        card.querySelector('.view-btn').addEventListener('click', () => window.location.href = viewUrl);
        card.querySelector('.delete-btn').addEventListener('click', () => this.deleteCharacter(character.id, mode));

        return card;
    }

    async deleteCharacter(characterId, mode) {
        if (confirm('Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.')) {
            if (mode === 'local') {
                let localCharacters = JSON.parse(localStorage.getItem('sombras-local-characters')) || [];
                localCharacters = localCharacters.filter(char => char.id !== characterId);
                localStorage.setItem('sombras-local-characters', JSON.stringify(localCharacters));
                this.loadLocalCharacters(); // Recarrega apenas a lista local
                return;
            }

            // Lógica para deletar online
            try {
                // Usando Axios para deletar o personagem
                await api.delete(`/characters/${characterId}`);
                // Recarrega a lista de personagens online para refletir a exclusão
                this.loadOnlineCharacters();
            } catch (error) {
                if (error.response) {
                    alert(`Erro ao excluir personagem: ${error.response.data.message || 'Tente novamente.'}`);
                    if (error.response.status === 401) {
                        window.location.href = `${API_BASE_URL}/auth/google`;
                    }
                } else {
                    console.error('Erro de rede ao excluir personagem:', error.message);
                    alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
                }
            }
        }
    }
}

// =================================================================================
// CLASSE: CharacterSheet - Gerencia a exibição da ficha completa do agente
// =================================================================================
class CharacterSheet {
    constructor(characterId = null, container = document) {
        document.body.classList.add('sheet-page-body');
        this.character = null;
        this.characterId = characterId; // Armazena o ID passado
        this.container = container; // Onde a ficha será renderizada (página ou modal)
    }

    async initialize() {
        await this.loadCharacter();
        if (!this.character) return; // Para a execução se o personagem não for carregado

        this.renderSheet();

        // Lógica para o botão "Voltar para a Campanha"
        const params = new URLSearchParams(window.location.search);
        const campaignId = params.get('campaignId');
        const backBtn = document.getElementById('back-to-campaign-btn');
        if (campaignId && backBtn) {
            backBtn.href = `gerenciar-campanha.html?id=${campaignId}`;
            backBtn.style.display = 'inline-block';
        }

        if (this.character) {
            this.setupEventListeners();
            this.renderSkillTree();
            this.checkSpecialization(); // Verifica se a escolha de especialização deve ser mostrada
            this.renderProficiencies();
            this.checkLevelUp();
        }
    }

    async loadCharacter() {
        const params = new URLSearchParams(window.location.search);
        const charId = params.get('id');
        const mode = params.get('mode');

        try {
            if (mode === 'local') {
                // Carrega do localStorage para modo de teste
                const localCharacters = JSON.parse(localStorage.getItem('sombras-local-characters')) || [];
                this.character = localCharacters.find(char => char.id === charId) || null;
            } else if (charId) {
                // Carrega da API para modo online
                const response = await api.get(`/api/characters/${charId}`);
                this.character = response.data;
            } else {
                // Nenhum ID e não é modo local, então não há o que carregar.
                this.character = null;
            }
        } catch (error) {
            console.error('Erro ao carregar a ficha do personagem:', error);
            this.character = null; // Garante que o personagem é nulo em caso de erro
            if (error.response && (error.response.status === 401 || error.response.status === 404)) {
                alert('Sua sessão expirou ou você não tem permissão para ver esta ficha. Por favor, faça login novamente.');
                window.location.href = 'agentes.html';
            }
        } finally {
            // Este bloco agora executa para AMBOS os modos (local e online)
            if (!this.character) {
                document.getElementById('character-not-found').style.display = 'block';
            } else {
                // Lógica de migração para garantir que fichas antigas funcionem.
                // Isso atualiza a estrutura de dados do personagem se estiver faltando algo.
                let needsSave = false;

                // Garante que todas as propriedades essenciais existam
                if (typeof this.character.level === 'undefined') { this.character.level = 1; needsSave = true; }
                if (typeof this.character.specialization === 'undefined') { this.character.specialization = null; needsSave = true; }
                if (typeof this.character.xp === 'undefined') { this.character.xp = 0; needsSave = true; }
                if (typeof this.character.nf === 'undefined') { this.character.nf = 0; needsSave = true; }
                if (typeof this.character.attributePoints === 'undefined') { this.character.attributePoints = 0; needsSave = true; }
                if (typeof this.character.skillPoints === 'undefined') { this.character.skillPoints = 0; needsSave = true; }
                if (!this.character.skills) { this.character.skills = []; needsSave = true; }
                if (!this.character.inventario) { this.character.inventario = []; needsSave = true; }
                if (!this.character.personalization) { this.character.personalization = {}; needsSave = true; }
                
                // Garante que os atributos base da classe estão salvos no personagem
                if (!this.character.baseAttributes) {
                    this.character.baseAttributes = CLASS_BASE_ATTRIBUTES[this.character.class] || { forca: 1, agilidade: 1, presenca: 1, vitalidade: 1, inteligencia: 1 };
                    needsSave = true;
                }
                // Migração de atributos mais robusta para garantir que todos existam.
                const defaultAttributes = { forca: 1, agilidade: 1, presenca: 1, vitalidade: 1, inteligencia: 1 };
                const currentAttributes = this.character.attributes || {};
                const mergedAttributes = { ...defaultAttributes, ...currentAttributes };
                if (JSON.stringify(mergedAttributes) !== JSON.stringify(this.character.attributes)) {
                    this.character.attributes = mergedAttributes;
                    needsSave = true;
                }

                const attrs = this.character.attributes;

                if (!this.character.status || !this.character.status.hasOwnProperty('pa_max')) {
                    const hpMax = 10 + (attrs.vitalidade * 2);
                    const sanityMax = 10 + (attrs.presenca * 2);
                    const paMax = 5 + Math.floor(attrs.agilidade / 2);

                    this.character.status = {
                        hp_max: this.character.status?.hp_max || hpMax,
                        hp_current: this.character.status?.hp_current ?? (this.character.status?.hp_max || hpMax),
                        sanity_max: this.character.status?.sanity_max || sanityMax,
                        sanity_current: this.character.status?.sanity_current ?? (this.character.status?.sanity_max || sanityMax),
                        pa_max: paMax,
                        pa_current: paMax,
                    };
                    needsSave = true;
                }

                if (!this.character.classStats || !this.character.classStats.hasOwnProperty('defense')) {
                    this.character.classStats = { defense: 10 + attrs.agilidade };
                    needsSave = true;
                }

                if (needsSave) this.saveCharacterChanges();
            }
        }
    }

    renderSheet() {
        if (!this.character) return;

        // Com a migração em loadCharacter, podemos confiar que a estrutura de dados principal está completa.
        const {
            level, xp, nf, attributePoints, skillPoints, attributes, classStats,
            personalization = {}, status, pericias = {}, inventario = []
        } = this.character;

        const sheetContainer = document.getElementById('sheet-container');
        const header = sheetContainer.querySelector('.sheet-header');
        const charImage = document.getElementById('sheet-char-image');
        // Limpa classes de elementos anteriores e adiciona a classe base e a do elemento atual
        sheetContainer.className = 'sheet-container'; // Reseta para a classe base
        if (this.character.element) {
            const elementClass = this.character.element.toLowerCase(); 
            // Adiciona a classe do elemento para aplicar o tema visual
            sheetContainer.classList.add(elementClass);
        }

        // Atualiza o cabeçalho
        if (charImage) {
            charImage.src = personalization.imageUrl || 'https://via.placeholder.com/150';
            charImage.alt = `Retrato de ${personalization.name || 'Agente Sem Nome'}`;
        }
        header.querySelector('h2').textContent = personalization.name || 'Agente Sem Nome';
        header.querySelector('#sheet-char-element').textContent = `Elemento: ${this.character.element || 'Nenhum'}`;
        
        // Atualiza o display da classe/especialização no cabeçalho e no bloco de atributos
        const classDisplay = this.character.class || 'Classe';
        const specDisplay = this.character.specialization ? ` (${this.character.specialization})` : '';
        header.querySelector('#sheet-char-class-player').textContent = `${classDisplay}${specDisplay} | Jogador: ${personalization.player || 'N/A'}`;
        
        const classSpecLabel = document.getElementById('sheet-class-specialization');
        if (classSpecLabel) classSpecLabel.textContent = this.character.specialization || this.character.class;

        document.title = `${personalization.name || 'Agente'} | Ficha de Agente`;
        document.getElementById('sheet-level').textContent = level;
        document.getElementById('sheet-nf').textContent = nf;
        document.getElementById('sheet-attribute-points').textContent = attributePoints;
        document.getElementById('sheet-skill-points').textContent = skillPoints;

        document.getElementById('sheet-forca').textContent = attributes.forca || '-';
        document.getElementById('sheet-agilidade').textContent = attributes.agilidade || '-';
        document.getElementById('sheet-presenca').textContent = attributes.presenca || '-';
        document.getElementById('sheet-vitalidade').textContent = attributes.vitalidade || '-';
        document.getElementById('sheet-inteligencia').textContent = attributes.inteligencia || '-';

        this.updateBar('hp', status.hp_current, status.hp_max);
        this.updateBar('sanity', status.sanity_current, status.sanity_max);
        this.updateBar('pa', status.pa_current, status.pa_max);

        document.getElementById('sheet-defense').textContent = classStats.defense || '--';

        document.getElementById('sheet-protection').textContent = this.character.protection || 0;
        document.getElementById('sheet-res-balistica').textContent = this.character.resBalistica || 0;
        document.getElementById('sheet-res-corte').textContent = this.character.resCorte || 0;
        document.getElementById('sheet-res-paranormal').textContent = this.character.resParanormal || 0;
        document.getElementById('sheet-proficiencies').textContent = this.character.proficiencies || 'Armas simples.';

        // Controla a visibilidade do botão de especialização
        const specBlock = document.getElementById('class-specialization-block');
        if (specBlock) {
            specBlock.classList.toggle('can-specialize', this.character.skillPoints > 0 && !this.character.specialization);
        }

        this.renderActionsPanel();

        document.getElementById('sheet-container').style.display = 'flex';
    }

    renderProficiencies() {
        const container = document.getElementById('proficiencies-list');
        if (!container) return;

        container.innerHTML = '';

        const proficiencies = [
            { name: 'Acrobacia', attr: 'AGI' },
            { name: 'Adestramento', attr: 'PRE' },
            { name: 'Artes', attr: 'PRE' },
            { name: 'Atletismo', attr: 'FOR' },
            { name: 'Atualidades', attr: 'INT' },
            { name: 'Ciências', attr: 'INT' },
            { name: 'Crime', attr: 'AGI' },
            { name: 'Diplomacia', attr: 'PRE' },
            { name: 'Enganação', attr: 'PRE' },
            { name: 'Fortitude', attr: 'VIT' },
            { name: 'Furtividade', attr: 'AGI' },
            { name: 'Iniciativa', attr: 'AGI' },
            { name: 'Intimidação', attr: 'PRE' },
            { name: 'Intuição', attr: 'PRE' },
            { name: 'Investigação', attr: 'INT' },
            { name: 'Luta', attr: 'FOR' },
            { name: 'Medicina', attr: 'INT' },
            { name: 'Ocultismo', attr: 'INT' },
            { name: 'Percepção', attr: 'PRE' },
            { name: 'Pilotagem', attr: 'AGI' },
            { name: 'Pontaria', attr: 'AGI' },
            { name: 'Profissão (___)', attr: 'INT' },
            { name: 'Profissão (___)', attr: 'INT' },
            { name: 'Reflexos', attr: 'AGI' },
            { name: 'Religião', attr: 'INT' },
            { name: 'Sobrevivência', attr: 'INT' },
            { name: 'Tática', attr: 'INT' },
            { name: 'Tecnologia', attr: 'INT' },
            { name: 'Vontade', attr: 'PRE' },
        ];

        proficiencies.forEach(prof => {
            const li = document.createElement('li');
            li.className = 'proficiency-item';
            li.dataset.proficiency = prof.name;

            // Lógica para carregar o estado (treinada, outros) virá aqui no futuro
            const isTrained = false;

            li.innerHTML = `
                <div class="checkbox-container">
                    <input type="checkbox" ${isTrained ? 'checked' : ''}>
                </div>
                <div class="proficiency-name-container"><span class="proficiency-name">${prof.name}</span> <span class="proficiency-attr">(${prof.attr})</span></div>
                <div class="proficiency-roll-container">
                    <span class="dice-icon">🎲</span>
                </div>
                <div class="proficiency-total-container"><span class="proficiency-total">-</span></div>
            `;

            const rollBtn = li.querySelector('.proficiency-roll-container');
            const totalSpan = li.querySelector('.proficiency-total');
            const diceIcon = li.querySelector('.dice-icon');

            rollBtn.addEventListener('click', () => {
                // Lógica simplificada para a rolagem
                diceIcon.classList.add('rolling');
                totalSpan.textContent = '...';

                // Simula a rolagem e atualiza o resultado após a animação
                setTimeout(() => {
                    const roll = Math.floor(Math.random() * 20) + 1;
                    totalSpan.textContent = roll;
                    diceIcon.classList.remove('rolling');
                }, 500); // Duração da animação de giro do ícone
            });

            container.appendChild(li);
        });
    }

    renderActionsPanel() {
        const inventoryList = document.getElementById('sheet-inventory-list');
        inventoryList.innerHTML = '';
        if (this.character.inventario && this.character.inventario.length > 0) {
            this.character.inventario.forEach((item, index) => {
                inventoryList.appendChild(this.createInventoryItem(item, index));
            });
        } else {
            inventoryList.innerHTML = '<li><p>Nenhum item no inventário.</p></li>';
        }

        const p = this.character.personalization || {};
        document.getElementById('sheet-appearance').value = p.appearance || '';
        document.getElementById('sheet-history').value = p.history || '';
        document.getElementById('sheet-motivation').value = p.motivation || '';
    }

    updateBar(type, current, max) {
        const fill = document.getElementById(`${type}-bar-fill`);
        const currentDisplay = document.getElementById(`${type}-current`);
        const maxInput = document.getElementById(`${type}-max`);

        if (!fill || !currentDisplay || !maxInput) return;

        const percentage = max > 0 ? (current / max) * 100 : 0;
        fill.style.width = `${percentage}%`;
        currentDisplay.textContent = current;
        maxInput.value = max;
    }

    createInventoryItem(item, index) {
        const li = document.createElement('li');
        li.dataset.index = index;
        li.innerHTML = `
            <span class="inventory-item-name" contenteditable="true">${item}</span>
            <div class="inventory-actions">
                <button class="delete-item-btn" title="Excluir item">&times;</button>
            </div>
        `;
        return li;
    }

    setupEventListeners() {
        document.querySelector('.actions-accordion').addEventListener('click', (e) => {
            if (e.target.classList.contains('accordion-header')) {
                const currentPanel = e.target.closest('.accordion-panel');
                
                document.querySelectorAll('.actions-accordion .accordion-panel.active').forEach(activePanel => {
                    if (activePanel !== currentPanel) {
                        activePanel.classList.remove('active');
                    }
                });
                currentPanel.classList.toggle('active');
            }
        });

        document.querySelector('.status-bars-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('status-btn')) {
                const stat = e.target.dataset.stat;
                const amount = parseInt(e.target.dataset.amount, 10);
                
                if (stat && amount) {
                    const statType = stat.split('_')[0];
                    const maxStatKey = `${statType}_max`;

                    let currentValue = this.character.status[stat];
                    const maxValue = this.character.status[maxStatKey];

                    currentValue += amount;

                    if (currentValue < 0) currentValue = 0;
                    if (currentValue > maxValue) currentValue = maxValue;

                    this.character.status[stat] = currentValue;
                    this.saveCharacterChanges();
                    this.updateBar(statType, currentValue, maxValue);
                }
            }
        });

        document.querySelector('.primary-attributes-display').addEventListener('click', (e) => {
            if (e.target.classList.contains('attr-btn')) {
                const block = e.target.closest('.primary-attr-block');
                const attrName = block.dataset.attr;
                const action = e.target.dataset.action;

                if (action === 'increase') {
                    if (this.character.attributePoints > 0) {
                        this.character.attributePoints--;
                        this.character.attributes[attrName]++;
                        this.recalculateDerivedStats();
                        this.saveCharacterChanges();
                        this.renderSheet();
                    } else {
                        alert('Você não tem Pontos de Atributo para gastar.');
                    }
                }
                // A lógica para diminuir o atributo (e devolver o ponto) pode ser adicionada aqui se necessário.
                // Por enquanto, o foco é apenas em gastar os pontos.
            }
        });

        // Adiciona listener para o novo botão de especialização
        const specBlock = document.getElementById('class-specialization-block');
        if (specBlock) {
            specBlock.addEventListener('click', (e) => {
                if (e.target.closest('[data-action="specialize"]')) {
                    this.handleSpecializationChoice();
                }
            });
        }

        document.getElementById('nf-control').addEventListener('click', (e) => {
            if (e.target.classList.contains('progression-btn')) {
                const amount = parseInt(e.target.dataset.amount, 10);
                if (!isNaN(amount)) {
                    const oldNf = this.character.nf || 0;
                    this.character.nf = (this.character.nf || 0) + amount;
                    if (this.character.nf < 0) this.character.nf = 0; // Não permite NF negativo
                    const newNf = this.character.nf;

                    if (amount > 0) { // Aumentando o NF
                        // Ganha 1 ponto de atributo (simples) para cada +1 de NF
                        this.character.attributePoints = (this.character.attributePoints || 0) + 1;
                        // Se o novo NF é múltiplo de 5, ganha 1 ponto de habilidade (especial)
                        if (newNf > 0 && newNf % 5 === 0) {
                            this.character.skillPoints = (this.character.skillPoints || 0) + 1;
                        }
                    } else if (amount < 0 && oldNf > 0) { // Diminuindo o NF
                        // Perde 1 ponto de atributo (simples)
                        this.character.attributePoints = (this.character.attributePoints || 0) - 1;
                        // Se o NF antigo era múltiplo de 5, perde 1 ponto de habilidade (especial)
                        if (oldNf > 0 && oldNf % 5 === 0) {
                            this.character.skillPoints = (this.character.skillPoints || 0) - 1;
                        }
                    }

                    // Garante que os pontos não fiquem negativos
                    if (this.character.attributePoints < 0) this.character.attributePoints = 0;
                    if (this.character.skillPoints < 0) this.character.skillPoints = 0;

                    document.getElementById('sheet-attribute-points').textContent = this.character.attributePoints;
                    document.getElementById('sheet-skill-points').textContent = this.character.skillPoints;

                    document.getElementById('sheet-nf').textContent = this.character.nf;
                    this.saveCharacterChanges();
                    this.checkSpecialization(); // Verifica se a escolha de especialização deve ser mostrada
                }
            }
        });


        document.getElementById('hp-max').addEventListener('change', (e) => this.updateStatus('hp_max', e.target.value));
        document.getElementById('sanity-max').addEventListener('change', (e) => this.updateStatus('sanity_max', e.target.value));
        document.getElementById('pa-max').addEventListener('change', (e) => this.updateStatus('pa_max', e.target.value));

        document.getElementById('sheet-appearance').addEventListener('blur', (e) => this.updatePersonalization('appearance', e.target.value));
        document.getElementById('sheet-history').addEventListener('blur', (e) => this.updatePersonalization('history', e.target.value));
        document.getElementById('sheet-motivation').addEventListener('blur', (e) => this.updatePersonalization('motivation', e.target.value));

        document.getElementById('dice-roller-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const count = parseInt(document.getElementById('dice-count').value, 10);
            const type = parseInt(document.getElementById('dice-type').value, 10);
            const bonus = parseInt(document.getElementById('dice-bonus').value, 10);
            this.rollDice(type, count, bonus, "Rolagem Manual");
        });

        const notesTextarea = document.getElementById('sheet-notes');
        if (notesTextarea) notesTextarea.addEventListener('blur', (e) => {
            this.character.notes = e.target.value;
            this.saveCharacterChanges();
        });

        const inventoryList = document.getElementById('sheet-inventory-list');
        document.getElementById('add-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('add-item-input');
            const newItem = input.value.trim();
            if (newItem) {
                if (!this.character.inventario) this.character.inventario = [];
                this.character.inventario.push(newItem);
                this.saveCharacterChanges();
                this.renderSheet();
                input.value = '';
            }
        });

        inventoryList.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-item-btn')) {
                const index = e.target.closest('li').dataset.index;
                this.character.inventario.splice(index, 1);
                this.saveCharacterChanges();
                this.renderSheet();
            }
        });

        inventoryList.addEventListener('blur', (e) => {
            if (e.target.classList.contains('inventory-item-name')) {
                const index = e.target.closest('li').dataset.index;
                this.character.inventario[index] = e.target.textContent;
                this.saveCharacterChanges();
            }
        }, true);

        document.getElementById('add-xp-btn').addEventListener('click', () => {
            const amount = parseInt(prompt('Quantidade de XP a adicionar:'));
            if (!isNaN(amount) && amount > 0) {
                this.addXp(amount);
            }
        });

        document.getElementById('level-up-btn').addEventListener('click', () => {
            this.levelUp();
        });
    }

    addXp(amount) {
        this.character.xp += amount;
        this.checkLevelUp();
        this.saveCharacterChanges();
        this.renderSheet();
    }

    checkLevelUp() {
        const xpToNextLevel = this.character.level * 100;
        if (this.character.xp >= xpToNextLevel) {
            document.getElementById('level-up-btn').style.display = 'block';
        }
    }

    levelUp() {
        const xpToNextLevel = this.character.level * 100;
        if (this.character.xp >= xpToNextLevel) {
            this.character.level++;
            this.character.xp -= xpToNextLevel; // Deduz o XP usado para upar
            this.character.attributePoints += 2;
            this.character.skillPoints += 1;
            document.getElementById('level-up-btn').style.display = 'none';

            this.saveCharacterChanges();
            this.renderSheet();
        }
    }

    checkSpecialization() {
        // Condições para mostrar o modal:
        // 1. NF é 5 ou maior.
        // 2. O personagem ainda não tem uma especialização.
        // 3. O personagem tem pelo menos 1 ponto de habilidade para gastar.
        if (this.character.nf >= 5 && !this.character.specialization && this.character.skillPoints > 0) {
            this.showSpecializationChoice();
        }
    }

    showSpecializationChoice() {
        const modalOverlay = document.getElementById('specialization-choice-overlay');
        const optionsContainer = document.getElementById('specialization-options-container');
        const confirmationContainer = document.getElementById('spec-confirmation-content');
        if (!modalOverlay || !optionsContainer || !confirmationContainer) return;

        // Reseta o modal para o estado inicial (mostrando opções)
        optionsContainer.style.display = 'grid';
        confirmationContainer.style.display = 'none';
        optionsContainer.innerHTML = ''; // Limpa opções anteriores

        const availableSpecs = SPECIALIZATIONS[this.character.class];
        if (!availableSpecs) return;

        availableSpecs.forEach(spec => {
            const card = document.createElement('div');
            card.className = 'specialization-card';
            card.innerHTML = `<h3>${spec.name}</h3><p>${spec.description}</p><button class="wizard-btn">Escolher</button>`;
            card.addEventListener('click', () => this.showSpecializationConfirmation(spec));
            optionsContainer.appendChild(card);
        });

        modalOverlay.classList.add('sticky-modal'); // Impede o fechamento por clique externo
        modalOverlay.classList.add('visible');
    }

    showSpecializationConfirmation(spec) {
        const optionsContainer = document.getElementById('specialization-options-container');
        const confirmationContainer = document.getElementById('spec-confirmation-content');
        
        // Preenche os dados da confirmação
        confirmationContainer.querySelector('h2').textContent = `Confirmar: ${spec.name}`;
        confirmationContainer.querySelector('p').innerHTML = `Você está prestes a gastar <strong>1 Ponto de Habilidade</strong> para se tornar um(a) <strong>${spec.name}</strong>. Esta escolha é permanente e definirá seu caminho. Deseja continuar?`;

        // Troca a visibilidade dos painéis
        optionsContainer.style.display = 'none';
        confirmationContainer.style.display = 'flex';

        // Limpa listeners antigos e adiciona novos para os botões de confirmação
        const confirmBtn = document.getElementById('confirm-spec-btn');
        const cancelBtn = document.getElementById('cancel-spec-btn');

        const confirmHandler = () => {
            this.finalizeSpecialization(spec.name);
            cleanup();
        };
        const cancelHandler = () => {
            // Volta para a tela de seleção
            optionsContainer.style.display = 'grid';
            confirmationContainer.style.display = 'none';
            cleanup();
        };
        const cleanup = () => {
            confirmBtn.removeEventListener('click', confirmHandler);
            cancelBtn.removeEventListener('click', cancelHandler);
        };

        confirmBtn.addEventListener('click', confirmHandler);
        cancelBtn.addEventListener('click', cancelHandler);
    }

    finalizeSpecialization(specName) {
        this.character.skillPoints--;
        this.character.specialization = specName;
        document.getElementById('specialization-choice-overlay').classList.remove('visible', 'sticky-modal');
        this.saveCharacterChanges();
        this.renderSheet();
        this.renderSkillTree();
    }

    handleSpecializationChoice() {
        if (this.character.skillPoints < 1) {
            alert("Você não tem Pontos de Habilidade suficientes.");
            return;
        }
        // Se tiver pontos, mostra o modal. O ponto será deduzido na confirmação.
        this.showSpecializationChoice();
    }

    rollDice(sides, count, bonus, label) {
        let total = 0;
        let rolls = [];
        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(roll);
            total += roll;
        }
        total += bonus;

        const log = document.getElementById('roll-log');
        const logPlaceholder = log.querySelector('.log-placeholder');
        if (logPlaceholder) logPlaceholder.remove();

        const newLogEntry = document.createElement('p');
        newLogEntry.innerHTML = `<strong>${label}:</strong> ${total} <span>([${rolls.join(', ')}] + ${bonus})</span>`;
        log.prepend(newLogEntry);

        // Envia a rolagem para o log da campanha via localStorage
        const campaignId = new URLSearchParams(window.location.search).get('campaignId');
        if (campaignId) {
            const rollData = {
                id: `roll_${Date.now()}`,
                characterName: this.character.personalization.name || 'Agente',
                label: label,
                result: total,
                details: `([${rolls.join(', ')}] + ${bonus})`
            };
            localStorage.setItem('lastCampaignRoll', JSON.stringify({ campaignId, rollData }));
        }
    }

    updatePersonalization(key, value) {
        if (!this.character.personalization) this.character.personalization = {};
        this.character.personalization[key] = value;
        this.saveCharacterChanges();
    }

    updateStatus(key, value) {
        if (!this.character.status) this.character.status = {};
        const newMaxValue = parseInt(value, 10);
        this.character.status[key] = newMaxValue;

        const currentKey = key.replace('_max', '_current');
        if (this.character.status[currentKey] > newMaxValue) {
            this.character.status[currentKey] = newMaxValue;
        }
        this.renderSheet();
        this.saveCharacterChanges();
    }

    // Função para buscar uma habilidade pelo ID em toda a árvore
    findSkillById(skillId, tree = SKILL_TREES) {
        for (const key in tree) {
            if (Array.isArray(tree[key])) {
                for (const skill of tree[key]) {
                    if (skill.id === skillId) return skill;
                    if (skill.children) {
                        const found = this.findSkillById(skillId, { children: skill.children });
                        if (found) return found;
                    }
                }
            } else if (typeof tree[key] === 'object' && tree[key] !== null) {
                const found = this.findSkillById(skillId, tree[key]);
                if (found) return found;
            }
        }
        return null;
    }

    renderSkillTree() {
        const container = document.getElementById('unlocked-skills-container');
        if (!container) return;

        container.innerHTML = ''; // Limpa o container

        const unlockedSkillIds = this.character.skills || [];

        if (unlockedSkillIds.length === 0) {
            container.innerHTML = `<p class="empty-skill-tree">Nenhuma habilidade foi desbloqueada ainda.</p>`;
            return;
        }

        unlockedSkillIds.forEach(skillId => {
            const skillData = this.findSkillById(skillId);
            if (skillData) {
                const skillNode = this.createSkillDisplayNode(skillData);
                container.appendChild(skillNode);
            }
        });
    }

    createSkillDisplayNode(skill) {
        const skillNode = document.createElement('div');
        skillNode.className = 'skill-node unlocked'; // Usa a classe de nó, já estilizada
        skillNode.innerHTML = `
            <h4 class="skill-name">${skill.name}</h4>
            <p class="skill-description">${skill.description}</p>
        `;
        return skillNode;
    }

    _renderSkillNodeRecursive(skill, parentContainer, parentSkill) {
        const skillWrapper = document.createElement('div');
        skillWrapper.className = 'skill-node-wrapper-player';

        const skillNode = this.createSkillNode(skill, parentSkill);
        skillWrapper.appendChild(skillNode);

        if (skill.children && skill.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'skill-children-container-player';
            skill.children.forEach(childSkill => {
                this._renderSkillNodeRecursive(childSkill, childrenContainer, skill);
            });
            skillWrapper.appendChild(childrenContainer);
        }

        parentContainer.appendChild(skillWrapper);
    }

    createSkillNode(skill, parentSkill) {
        const skillNode = document.createElement('div');
        skillNode.className = 'skill-node';
        const isUnlocked = this.character.skills && this.character.skills.includes(skill.id);
        if (isUnlocked) {
            skillNode.classList.add('unlocked');
        }

        let requirementsMet = true;
        for (const req in skill.requirements) {
            if (this.character.attributes[req] < skill.requirements[req]) {
                requirementsMet = false;
                break;
            }
        }

        const parentUnlocked = !parentSkill || (this.character.skills && this.character.skills.includes(parentSkill.id));
        if (!parentUnlocked) {
            skillNode.classList.add('locked-by-parent');
        }

        skillNode.innerHTML = `
            <h4 class="skill-name">${skill.name}</h4>
            <p class="skill-description">${skill.description}</p>
            <div class="skill-requirements">
                <strong>Requisitos:</strong>
                <span>${Object.entries(skill.requirements).map(([key, value]) => `${key.toUpperCase()} ${value}`).join(', ')}</span>
            </div>
        `;

        if (!isUnlocked && requirementsMet && parentUnlocked && this.character.skillPoints > 0) {
            const unlockButton = document.createElement('button');
            unlockButton.textContent = 'Desbloquear';
            unlockButton.className = 'unlock-skill-btn';
            unlockButton.addEventListener('click', () => {
                this.unlockSkill(skill.id);
            });
            skillNode.appendChild(unlockButton);
        }

        return skillNode;
    }

    unlockSkill(skillId) {
        if (this.character.skillPoints > 0) {
            this.character.skillPoints--;
            this.character.skills.push(skillId);
            this.saveCharacterChanges();
            this.renderSkillTree();
            this.renderSheet();
        } else {
            alert("Você não tem pontos de habilidade suficientes para desbloquear esta habilidade.");
        }
    }

    recalculateDerivedStats() {
        if (!this.character) return;

        const attrs = this.character.attributes;

        // Recalcula HP Máximo
        const newHpMax = 10 + (attrs.vitalidade * 2);
        if (this.character.status.hp_max !== newHpMax) {
            const diff = newHpMax - this.character.status.hp_max;
            this.character.status.hp_max = newHpMax;
            this.character.status.hp_current += diff; // Aumenta o HP atual junto com o máximo
            if (this.character.status.hp_current > newHpMax) this.character.status.hp_current = newHpMax;
        }

        // Recalcula Sanidade Máxima
        this.character.status.sanity_max = 10 + (attrs.presenca * 2);

        // Recalcula PA Máximo
        this.character.status.pa_max = 5 + Math.floor(attrs.agilidade / 2);

        // Recalcula Defesa
        this.character.classStats.defense = 10 + attrs.agilidade;
    }

    async saveCharacterChanges() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'local') {
            let localCharacters = JSON.parse(localStorage.getItem('sombras-local-characters')) || [];
            const charIndex = localCharacters.findIndex(c => c.id === this.character.id);
            if (charIndex > -1) localCharacters[charIndex] = this.character;
            localStorage.setItem('sombras-local-characters', JSON.stringify(localCharacters));
            return;
        }
        // Usando Axios para atualizar o personagem (PUT request)
        try {
            await api.put(`/characters/${this.character.id}`, this.character);
            console.log('Ficha salva no backend!');
        } catch (err) {
            console.error("Erro ao salvar ficha no backend:", err);
            if (err.response && err.response.status === 401) {
                alert('Sua sessão expirou. Por favor, faça login novamente para salvar.');
            }
        }
    }
}

// =================================================================================
// CLASSE: ElementLorePage - Gerencia a exibição da página de lore de elemento
// =================================================================================
class ElementLorePage {
    constructor() {
        this.elementData = {
            Temporal: {
                title: 'Temporal',
                color: '#9E9E9E',
                shadow: 'rgba(158, 158, 158, 0.4)',
                lore: 'O Temporal não é apenas sobre o tempo; é sobre o ciclo inevitável da vida, morte e renascimento. Seus portadores sentem o peso dos éons, o eco de futuros que poderiam ser e o cheiro da decadência que alimenta nova vida. Eles não veem a morte como um fim, mas como uma vírgula na grande sentença da existência. Manipular o Temporal é tocar na entropia, acelerar o apodrecimento de um inimigo ou vislumbrar os fios do destino para evitar um golpe fatal. É um poder melancólico, poderoso e que exige um profundo respeito pelo equilíbrio natural.'
            },
            Cerebral: {
                title: 'Cerebral',
                color: '#ffc107',
                shadow: 'rgba(255, 193, 7, 0.4)',
                lore: 'O conhecimento é poder, mas o conhecimento proibido é transcendência. O Cerebral representa a mente humana levada ao seu limite absoluto, tocando em conceitos que a realidade mal consegue conter. Seus agentes são canais para símbolos ancestrais, equações que dobram o espaço e verdades que podem quebrar a sanidade de mentes inferiores. Eles não lançam feitiços; eles impõem sua lógica sobre o universo. Um portador do Cerebral pode reescrever a percepção de um alvo, decifrar qualquer código ou manifestar construtos de pura informação. A estética angelical é uma ironia, pois o poder que detêm vem dos lugares mais sombrios da compreensão.'
            },
            Visceral: {
                title: 'Visceral',
                color: '#dc3545',
                shadow: 'rgba(220, 53, 69, 0.4)',
                lore: 'A carne é fraca? Não para um portador do Visceral. Para eles, o corpo é a mais perfeita e maleável das máquinas. Este elemento é a celebração da biologia em sua forma mais crua e brutal. Seus agentes podem endurecer a pele como aço, regenerar feridas em segundos, ou transformar seus próprios membros em armas mortais. O poder Visceral é instintivo, alimentado pela dor, pela raiva e pela adrenalina. Não há sutileza aqui, apenas a afirmação primal de que a vontade de sobreviver e dominar pode moldar a própria matéria viva. É o poder da besta interior, finalmente liberta.'
            },
            Vital: {
                title: 'Vital',
                color: '#9b59b6',
                shadow: 'rgba(155, 89, 182, 0.4)',
                lore: 'Se o universo é uma tapeçaria ordenada, o Vital é a energia caótica que corre entre os fios, ameaçando desfazê-la a qualquer momento. Este é o elemento da energia em seu estado mais puro e indomado. Seus portadores são baterias vivas de poder bruto, capazes de liberar explosões de força telecinética, criar escudos de energia instável ou simplesmente desintegrar a matéria com um toque. O Vital não obedece a leis, ele as cria e as destrói. É perigoso, imprevisível e incrivelmente poderoso, exigindo um controle férreo para não ser consumido pela própria energia que comanda.'
            }
        };
        this.params = new URLSearchParams(window.location.search);
        this.elementName = this.params.get('elemento');
        this.render();
    }

    render() {
        const titleEl = document.getElementById('element-title');
        const loreEl = document.getElementById('element-lore');

        if (!this.elementName || !this.elementData[this.elementName]) {
            if (titleEl) titleEl.textContent = 'Elemento não encontrado';
            if (loreEl) loreEl.textContent = 'O elemento especificado não foi encontrado.';
            return;
        }

        const element = this.elementData[this.elementName];
        const contentBox = document.getElementById('lore-content-box');
        const title = document.getElementById('element-title');
        const divider = document.querySelector('#lore-content-box .element-divider');
        const text = document.getElementById('element-lore');

        if (!contentBox || !title || !divider || !text) {
            console.error("Um ou mais elementos da página de lore não foram encontrados no DOM.");
            return;
        }

        document.title = `${element.title} | Lore do Elemento`;
        contentBox.style.borderColor = element.color;
        title.textContent = element.title;
        title.style.color = element.color;
        divider.style.background = `linear-gradient(to right, transparent, ${element.color}, transparent)`;
        text.textContent = element.lore;
    }
}

// =================================================================================
// CLASSE: ThreatListPage - Gerencia a página de listagem de ameaças
// =================================================================================
class ThreatListPage {
    constructor() {
        this.params = new URLSearchParams(window.location.search);
        this.category = this.params.get('categoria');
        this.element = this.params.get('elemento');
        this.container = document.getElementById('threat-list-container');
        this.titleElement = document.getElementById('threat-list-title');

        // Dados de exemplo. No futuro, isso viria de uma API.
        this.allThreats = {
            entidades_menores: [
                { name: 'Sombra Sussurrante', description: 'Uma entidade que se alimenta de segredos e medos, manifestando-se através de sussurros no escuro.', level: 'Alto', levelClass: 'danger', element: 'Temporal' },
                { name: 'Poltergeist Ruidoso', description: 'Espírito travesso que move objetos e causa desordem para atrair atenção.', level: 'Baixo', levelClass: 'medium', element: 'Vital' },
            ],
            aberracoes: [
                { name: 'Espelho Fragmentado', description: 'Reflexos distorcidos que ganham vida própria, capazes de trocar de lugar com suas vítimas.', level: 'Médio', levelClass: 'medium', element: 'Visceral' },
                { name: 'Carne Rastejante', description: 'Uma massa amorfa de tecido orgânico que absorve matéria para crescer.', level: 'Alto', levelClass: 'danger', element: 'Visceral' },
            ],
            horrores_ancestrais: [
                { name: 'Colecionador de Memórias', description: 'Criatura que rouba lembranças preciosas, deixando apenas vazios dolorosos em suas vítimas.', level: 'Extremo', levelClass: 'high', element: 'Cerebral' },
                { name: 'O Geômetra Cego', description: 'Uma entidade de outra dimensão que reescreve a realidade local com geometria impossível.', level: 'Extremo', levelClass: 'high', element: 'Cerebral' },
            ]
        };

        this.render();
    }

    render() {
        if ((!this.category || !this.allThreats[this.category]) && !this.element) {
            this.titleElement.textContent = 'Categoria não encontrada';
            this.container.innerHTML = '<p class="loading-message">A categoria de ameaças que você procurou não existe.</p>';
            return;
        }

        const categoryTitle = this.element ? `Ameaças do Elemento ${this.element}` : this.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        this.titleElement.textContent = categoryTitle;
        document.title = `${categoryTitle} | Sombras do Abismo`;

        let threats = [];
        if (this.category) {
            threats = this.allThreats[this.category] || [];
        } else if (this.element) {
            // Filtra todas as ameaças de todas as categorias pelo elemento
            Object.values(this.allThreats).forEach(categoryList => {
                threats.push(...categoryList.filter(threat => threat.element === this.element));
            });
        }

        this.container.innerHTML = ''; // Limpa a mensagem de "carregando"

        if (threats.length === 0) {
            this.container.innerHTML = '<p class="loading-message">Nenhuma ameaça encontrada nesta categoria.</p>';
            return;
        }

        threats.forEach(threat => {
            const card = this.createThreatCard(threat);
            this.container.appendChild(card);
        });
    }

    createThreatCard(threat) {
        const card = document.createElement('div');
        card.className = 'threat-item'; // Reutiliza o estilo de item de ameaça

        card.innerHTML = `
            <h4>${threat.name}</h4>
            <p>${threat.description}</p>
            <span class="threat-level ${threat.levelClass}">Nível: ${threat.level}</span>
        `;

        return card;
    }
}

// =================================================================================
// FUNÇÕES DE GERENCIAMENTO DE CAMPANHA
// =================================================================================

/**
 * Busca uma campanha específica pelo seu ID no localStorage.
 * @param {string} campaignId - O ID da campanha a ser buscada.
 * @returns {object|null} O objeto da campanha ou nulo se não for encontrado.
 */
async function getCampaignById(campaignId) {
    // 1. Tenta buscar na API primeiro (para ter os dados mais recentes)
    // A rota da API agora popula os personagens, então sempre buscamos online primeiro.
    try {
        // A rota da API agora popula os personagens, então sempre buscamos online primeiro.
        const response = await api.get(`/api/campaigns/${campaignId}`);
        return response.data;
    } catch (error) {
        console.warn("Falha ao buscar campanha da API, tentando localStorage...", error);
    }

    // 2. Se a API falhar (offline), tenta encontrar no localStorage
    try {
        const localCampaigns = JSON.parse(localStorage.getItem('sombras-campaigns')) || [];
        const localCampaign = localCampaigns.find(c => c.id === campaignId);
        if (localCampaign) {
            return localCampaign;
        }
    } catch (e) {
        console.error("Erro ao ler campanhas do localStorage:", e);
    }

    // 2. Se não encontrou localmente, tenta buscar na API (para acesso online)
    try {
        const response = await api.get(`/api/campaigns/${campaignId}`); // A rota correta já estava aqui, o erro estava em outro lugar.
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar campanha por ID:", error);
        return null;
    }
}

/**
 * Atualiza uma campanha existente no localStorage.
 * @param {object} updatedCampaign - O objeto da campanha com os dados atualizados.
 */
async function updateCampaign(updatedCampaign, showIndicator = false) {
    // 1. Atualiza localmente
    try {
        let campaigns = JSON.parse(localStorage.getItem('sombras-campaigns')) || [];
        const campaignIndex = campaigns.findIndex(c => c.id === updatedCampaign.id);
        if (campaignIndex > -1) {
            campaigns[campaignIndex] = { ...campaigns[campaignIndex], ...updatedCampaign };
            localStorage.setItem('sombras-campaigns', JSON.stringify(campaigns));
        }

        if (showIndicator) {
            const saveIndicator = document.getElementById('save-status-indicator');
            if (saveIndicator) {
                saveIndicator.textContent = 'Salvo!';
                saveIndicator.classList.add('show');
                setTimeout(() => saveIndicator.classList.remove('show'), 2000);
            }
        }
    } catch (error) {
        console.error("Erro ao atualizar campanha localmente:", error);
    }

    // 2. Tenta atualizar no servidor se estiver online
    try {
        await api.put(`/api/campaigns/${updatedCampaign.id}`, updatedCampaign);
    } catch (error) {
        console.error("Erro ao atualizar campanha:", error);
        alert("Ocorreu um erro ao atualizar a campanha.");
    }
}

/**
 * Exclui uma campanha do localStorage.
 * @param {string} campaignId - O ID da campanha a ser excluída.
 */
async function deleteCampaign(campaignId) {
    if (!confirm('Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.')) return;
    
    // 1. Tenta deletar no servidor
    try {
        await api.delete(`/api/campaigns/${campaignId}`);
    } catch (error) {
        console.error("Erro ao excluir campanha no servidor:", error);
        // Não interrompe, permite que a exclusão local ocorra mesmo assim
    }

    // 2. Deleta localmente, independentemente do sucesso do servidor (para modo offline)
    try {
        let campaigns = JSON.parse(localStorage.getItem('sombras-campaigns')) || [];
        const updatedCampaigns = campaigns.filter(c => c.id !== campaignId && c._id !== campaignId);
        localStorage.setItem('sombras-campaigns', JSON.stringify(updatedCampaigns));
    } catch (error) {
        console.error("Erro ao excluir campanha localmente:", error);
        // Mesmo que a exclusão local falhe, a do servidor já pode ter funcionado.
        // Apenas informa o usuário e redireciona.
    }
    
    alert('Campanha excluída.');
    window.location.href = 'campanhas.html';
}

/**
 * Remove um personagem de uma campanha.
 * @param {string} campaignId - O ID da campanha.
 * @param {string} characterId - O ID do personagem a ser removido.
 * @param {HTMLElement} cardElement - O elemento do card a ser removido da UI.
 */
async function removeAgentFromCampaign(campaignId, characterId, cardElement) {
    if (!confirm('Tem certeza que deseja remover este agente da campanha?')) return;

    try {
        await api.delete(`/api/campaigns/${campaignId}/characters/${characterId}`);
        alert('Agente removido da campanha com sucesso.');
        cardElement.remove(); // Remove o card da tela

        // Verifica se a grade de agentes ficou vazia
        const agentsGrid = document.getElementById('campaign-agents-grid');
        if (agentsGrid && agentsGrid.children.length === 0) {
            document.getElementById('no-agents-in-campaign').style.display = 'flex';
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao remover o agente.';
        alert(errorMessage);
        console.error("Erro ao remover agente da campanha:", error);
    }
}
// =================================================================================
// FUNÇÕES DE CAMPANHA
// =================================================================================

/**
 * Extrai o ID de um objeto ou string, garantindo que seja sempre uma string para comparação.
 * @param {string|object} idField - O campo que pode ser um ID string ou um objeto com _id.
 * @returns {string|null} O ID como string ou null se não puder ser extraído.
 */
function getObjectIdAsString(idField) {
    if (typeof idField === 'string') return idField;
    if (typeof idField === 'object' && idField !== null && idField._id) return idField._id;
    return null;
}

/**
 * Salva uma nova campanha no localStorage e redireciona para a página de campanhas.
 * @param {object} campaignData - O objeto da campanha a ser salvo.
 */
async function saveCampaign(campaignData) {
    const user = await checkAuthStatus();
    const ownerId = user ? user._id : 'local_user_id';

    // CORREÇÃO: Garante que o ownerId seja um objeto, mesmo localmente, para consistência.
    const newCampaignData = { 
        ...campaignData, 
        ownerId: user ? { _id: user._id, displayName: user.displayName } : ownerId, 
        players: [], inviteCode: generateUniqueInviteCode() 
    };

    // 1. Salva localmente SEMPRE
    try {
        const localCampaigns = JSON.parse(localStorage.getItem('sombras-campaigns')) || [];
        localCampaigns.unshift(newCampaignData);
        localStorage.setItem('sombras-campaigns', JSON.stringify(localCampaigns));
    } catch (error) {
        console.error("Erro ao salvar campanha localmente:", error);
    }

    // 2. Se estiver logado, salva no servidor
    try {
        if (user) {
            // Envia para a API apenas o ID, como o backend espera, com o prefixo correto.
            await api.post('/api/campaigns', { ...newCampaignData, ownerId: user._id });
        }
        window.location.href = 'campanhas.html';
    } catch (error) {
        console.error("Erro ao salvar campanha:", error);
        alert("Ocorreu um erro ao salvar a campanha. Verifique o console para mais detalhes.");
    }
}

/**
 * Exibe as campanhas salvas na página de campanhas.
 */
function displayCampaigns(allCampaigns, userId) {
    const myCampaignsGrid = document.getElementById('my-campaigns-grid');
    const joinedCampaignsSection = document.getElementById('joined-campaigns-section');
    const emptyMyCampaigns = document.getElementById('empty-my-campaigns');
    const joinedCampaignsGrid = document.getElementById('joined-campaigns-grid');
    const emptyJoinedCampaigns = document.getElementById('empty-joined-campaigns');

    if (!myCampaignsGrid || !joinedCampaignsGrid || !joinedCampaignsSection) return;

    myCampaignsGrid.innerHTML = '';
    joinedCampaignsGrid.innerHTML = '';

    // 1. Filtra as campanhas onde o usuário é o dono.
    const ownedCampaigns = allCampaigns.filter(c => getObjectIdAsString(c.ownerId) === userId);
    const ownedCampaignIds = new Set(ownedCampaigns.map(c => c.id)); // Cria um conjunto de IDs das campanhas do usuário.

    // 2. Filtra as campanhas onde o usuário é um jogador, mas NÃO o dono.
    const joinedCampaigns = allCampaigns.filter(c => 
        !ownedCampaignIds.has(c.id) && c.players?.some(p => getObjectIdAsString(p) === userId)
    );

    // Renderizar "Minhas Campanhas"
    if (ownedCampaigns.length > 0) {
        emptyMyCampaigns.style.display = 'none';
        ownedCampaigns.forEach(campaign => {
            myCampaignsGrid.appendChild(createCampaignCard(campaign, true)); // true indica que é uma campanha do mestre
        });
    } else {
        emptyMyCampaigns.style.display = 'flex';
    }

    // Renderizar "Campanhas Incluídas"
    if (joinedCampaigns.length > 0) {
        joinedCampaignsSection.style.display = 'block';
        emptyJoinedCampaigns.style.display = 'none';
        joinedCampaigns.forEach(campaign => {
            joinedCampaignsGrid.appendChild(createCampaignCard(campaign, false)); // false indica que é uma campanha de jogador
        });
    } else {
        joinedCampaignsSection.style.display = 'block'; // Mostrar a seção mesmo que vazia
        emptyJoinedCampaigns.style.display = 'flex';
    }
}

/**
 * Cria um card de campanha para exibição.
 * @param {object} campaign - O objeto da campanha.
 * @param {boolean} isOwned - True se o usuário é o mestre da campanha, false caso contrário.
 * @returns {HTMLElement} O elemento do card da campanha.
 */
function createCampaignCard(campaign, isOwned) {
    const card = document.createElement('div');
    card.className = 'campaign-card';
    const synopsisSnippet = campaign.synopsis ? campaign.synopsis.substring(0, 150) + (campaign.synopsis.length > 150 ? '...' : '') : 'Nenhuma sinopse fornecida.';
    
    const imageHtml = campaign.imageUrl
        ? `<img src="${campaign.imageUrl}" alt="Capa da campanha ${campaign.title}" class="campaign-card-image">`
        : '';

    card.innerHTML = `
        ${imageHtml}
        <h3>${campaign.title}</h3>
        <p>${synopsisSnippet}</p>
        <div class="campaign-card-footer">
            <span class="campaign-date">Criada em: ${new Date(campaign.createdAt).toLocaleDateString('pt-BR')}</span>
            <button class="wizard-btn" onclick="window.location.href='gerenciar-campanha.html?id=${campaign.id}${isOwned ? '' : '&view=player'}'">
                ${isOwned ? 'Gerenciar' : 'JOGAR'}
            </button>
        </div>
    `;
    return card;
}

/**
 * Gera um código de convite único para a campanha.
 * @returns {string} O código de convite gerado.
 */
function generateUniqueInviteCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SDA-';
    for (let i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Verifica se o código já existe (improvável para 4 caracteres, mas boa prática)
    const campaigns = JSON.parse(localStorage.getItem('sombras-campaigns')) || [];
    if (campaigns.some(c => c.inviteCode === result)) {
        return generateUniqueInviteCode(); // Gera novamente se houver colisão
    }
    return result;
}

/**
 * Adiciona o usuário atual a uma campanha usando um código de convite.
 * @param {string} inviteCode - O código de convite.
 */
async function joinCampaignByCode(inviteCode, formElement) {    
    const user = await checkAuthStatus();
    if (!user) {
        alert('Você precisa estar logado para entrar em uma campanha.');
        return;
    }

    const submitButton = formElement.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loader"></span>Entrando...'; // Adiciona um spinner (CSS necessário)

    // Adicione este CSS ao seu style.css para o spinner
    /*
    .loader { width: 16px; height: 16px; border: 2px solid #FFF; border-bottom-color: transparent; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite; margin-right: 8px; }
    @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    */

    try {
        const response = await api.post('/api/campaigns/join', { inviteCode });
        alert(`Você entrou na campanha "${response.data.title}"!`);
        window.location.href = `campanhas.html`; // Redireciona para a própria página para forçar o recarregamento
    } catch (error) {
        // Exibe a mensagem de erro específica vinda do servidor, ou uma mensagem genérica se não houver.
        const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao tentar entrar na campanha. Tente novamente.';
        alert(errorMessage);
        console.error("Erro ao entrar na campanha:", error);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

/**
 * Inicializa a página de gerenciamento de campanha, carregando dados e configurando eventos.
 */
async function initializeCampaignManagement() {
    const params = new URLSearchParams(window.location.search);
    const campaignId = params.get('id');
    const viewMode = params.get('view'); // Novo: Captura o modo de visualização

    if (!campaignId) {
        alert('ID da campanha não encontrado.');
        window.location.href = 'campanhas.html';
        return;
    }

    // Garante que o ID do usuário atual está carregado
    const user = await checkAuthStatus();
    const userId = user ? user._id : 'local_user_id'; // Define o ID para online ou offline

    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
        alert('Campanha não encontrada ou você não tem permissão para acessá-la.');
        window.location.href = 'campanhas.html';
        return;
    }

    // Verifica se o usuário é o dono da campanha ou um jogador
    if (viewMode === 'player' && campaign.players && campaign.players.some(p => getObjectIdAsString(p) === userId)) {
        // O usuário é um jogador e quer a visão de jogador
        document.getElementById('player-view-container').style.display = 'block';
        initializePlayerView(campaign);
    } else if (getObjectIdAsString(campaign.ownerId) === userId) {
        // O usuário é o mestre, mostra a visão de gerenciamento
        document.getElementById('campaign-management-container').style.display = 'block';
        initializeMasterView(campaign);
    } else if (campaign.players && campaign.players.some(p => getObjectIdAsString(p) === userId)) {
        // O usuário é um jogador (caso geral), mostra a visão de jogador
        document.getElementById('player-view-container').style.display = 'block';
        initializePlayerView(campaign);
    } else {
        // O usuário não é nem o mestre nem um jogador
        alert('Você não tem permissão para acessar esta campanha.');
        window.location.href = 'campanhas.html';
    }
}

/**
 * Adiciona uma entrada de log ao painel de atividades da campanha.
 * @param {object} rollData - Os dados da rolagem de dados.
 */
function addRollToCampaignLog(rollData) {
    const logContainer = document.getElementById('real-time-log');
    if (!logContainer) return;

    const placeholder = logContainer.querySelector('.log-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    const newLogEntry = document.createElement('p');
    newLogEntry.innerHTML = `<strong>${rollData.characterName}</strong> rolou <strong>${rollData.label}</strong>: <span class="roll-result">${rollData.result}</span> <span class="roll-details">${rollData.details}</span>`;
    logContainer.prepend(newLogEntry);
}

/**
 * Inicia o listener para o log de atividades da campanha.
 */
function initializeCampaignLogListener(campaignId) {
    window.addEventListener('storage', (event) => {
        if (event.key === 'lastCampaignRoll' && event.newValue) {
            const { campaignId: eventCampaignId, rollData } = JSON.parse(event.newValue);
            if (eventCampaignId === campaignId) {
                addRollToCampaignLog(rollData);
            }
        }
    });
}

/**
 * Remove um jogador de uma campanha. Apenas para o mestre.
 * @param {string} campaignId - O ID da campanha.
 * @param {string} playerId - O ID do jogador a ser removido.
 * @param {HTMLElement} cardElement - O elemento do card do jogador a ser removido da UI.
 */
async function removePlayerFromCampaign(campaignId, playerId, cardElement) {
    if (!confirm('Tem certeza que deseja remover este jogador da campanha? Seus agentes permanecerão na campanha e precisarão ser removidos manualmente.')) return;

    try {
        await api.delete(`/api/campaigns/${campaignId}/players/${playerId}`);
        alert('Jogador removido com sucesso.');
        cardElement.remove(); // Remove o card do jogador da tela

        const playersGrid = document.getElementById('campaign-players-list');
        if (playersGrid && playersGrid.children.length === 0) {
            document.getElementById('no-players-in-campaign').style.display = 'block';
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao remover o jogador.';
        alert(errorMessage);
    }
}

/**
 * Renderiza a lista de jogadores na visão do Mestre.
 * @param {object} campaign - O objeto da campanha com os jogadores populados.
 */
function renderCampaignPlayers(campaign) {
    const playersListContainer = document.getElementById('campaign-players-list');
    const noPlayersMessage = document.getElementById('no-players-in-campaign');

    if (!playersListContainer) return;

    playersListContainer.innerHTML = ''; // Limpa a lista existente

    if (campaign.players && campaign.players.length > 0) {
        noPlayersMessage.style.display = 'none';
        campaign.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card'; // Novo estilo para o card do jogador
            playerCard.innerHTML = `
                <div class="player-info-content">
                    <h4>${player.displayName}</h4>
                    <p>${player.email}</p>
                </div>
                <button class="delete-btn small-btn" title="Remover Jogador">&times;</button>
            `;
            playersListContainer.appendChild(playerCard);

            const removeBtn = playerCard.querySelector('.delete-btn');
            removeBtn.addEventListener('click', () => removePlayerFromCampaign(campaign._id, player._id, playerCard));
        });
    } else {
        noPlayersMessage.style.display = 'block';
    }
}

/**
 * Renderiza as áreas de "Fog of War" no mapa.
 * @param {object} campaign - O objeto da campanha.
 * @param {HTMLElement} mapBoard - O elemento do tabuleiro do mapa.
 * @param {boolean} isMasterView - Se a visão é a do mestre.
 */
function renderFogOfWar(campaign, mapBoard, isMasterView) {
    // Limpa a névoa antiga
    mapBoard.querySelectorAll('.fog-of-war').forEach(fog => fog.remove());

    if (campaign.mapData?.fog) {
        campaign.mapData.fog.forEach(fogData => {
            const fogElement = document.createElement('div');
            fogElement.className = 'fog-of-war';
            fogElement.id = fogData.id;
            fogElement.style.left = `${fogData.x}%`;
            fogElement.style.top = `${fogData.y}%`;
            fogElement.style.width = `${fogData.width}%`;
            fogElement.style.height = `${fogData.height}%`;
            mapBoard.appendChild(fogElement);

            if (isMasterView) {
                // Permite ao mestre remover a névoa
                fogElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showMapContextMenu(e.clientX, e.clientY, fogData.id);
                });
            }
        });
    }
}

/**
 * Exibe o menu de contexto customizado no mapa.
 * @param {number} x - Posição X do mouse.
 * @param {number} y - Posição Y do mouse.
 * @param {string|null} fogId - O ID da área de névoa clicada, se houver.
 */
function showMapContextMenu(x, y, fogId = null) {
    const menu = document.getElementById('map-context-menu');
    menu.style.display = 'block';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    const removeFogOption = document.getElementById('remove-fog-area');
    removeFogOption.style.display = fogId ? 'block' : 'none';
    removeFogOption.dataset.fogId = fogId;
}

/**
 * Esconde o menu de contexto do mapa.
 */
function hideMapContextMenu() {
    const menu = document.getElementById('map-context-menu');
    if (menu) menu.style.display = 'none';
}


/**
 * Inicializa a funcionalidade do mapa interativo para o mestre.
 * @param {object} campaign - O objeto da campanha.
 */
function initializeMasterMap(campaign) {
    const mapBoard = document.getElementById('map-board');
    mapBoard.classList.add('master-view'); // Adiciona classe para estilização
    const uploadInput = document.getElementById('map-upload-input');
    const tokenList = document.getElementById('map-character-tokens');
    const resetMapBtn = document.getElementById('reset-map-btn');
    const contextMenu = document.getElementById('map-context-menu');
    const toggleDrawModeBtn = document.getElementById('toggle-draw-mode');
    const removeFogBtn = document.getElementById('remove-fog-area');

    let isDrawingMode = false;
    let isDrawing = false;
    let startX, startY;
    let selectionRect = null;

    // Garante que a estrutura de dados exista
    if (!campaign.mapData) campaign.mapData = {};
    if (!campaign.mapData.fog) campaign.mapData.fog = [];

    // Carrega o mapa e os tokens salvos
    if (campaign.mapData?.imageUrl) {
        mapBoard.style.backgroundImage = `url('${campaign.mapData.imageUrl}')`;
        document.getElementById('map-upload-placeholder').style.display = 'none';
    }
    if (campaign.mapData?.tokens) {
        campaign.mapData.tokens.forEach(tokenData => {
            createTokenOnBoard(tokenData, mapBoard, campaign);
        });
    }

    // Renderiza a névoa de guerra
    renderFogOfWar(campaign, mapBoard, true);

    // Lógica de upload do mapa
    uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = await readFileAsDataURL(file);
            mapBoard.style.backgroundImage = `url('${imageUrl}')`;
            document.getElementById('map-upload-placeholder').style.display = 'none';
            
            if (!campaign.mapData) campaign.mapData = {};
            campaign.mapData.imageUrl = imageUrl;
            updateCampaign(campaign);
        }
    });

    // Popula a lista de tokens arrastáveis
    tokenList.innerHTML = '';
    campaign.characters.forEach(char => {
        const tokenListItem = document.createElement('div');
        tokenListItem.className = 'token-list-item';
        tokenListItem.draggable = true;
        tokenListItem.dataset.characterId = char._id;
        tokenListItem.innerHTML = `
            <img src="${char.personalization.imageUrl || 'https://via.placeholder.com/30'}" alt="${char.personalization.name}">
            <span>${char.personalization.name}</span>
        `;
        tokenList.appendChild(tokenListItem);

        tokenListItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', char._id);
        });
    });

    // Lógica para soltar tokens no mapa
    mapBoard.addEventListener('dragover', (e) => e.preventDefault());
    mapBoard.addEventListener('drop', (e) => {
        e.preventDefault();
        const charId = e.dataTransfer.getData('text/plain');
        const character = campaign.characters.find(c => c._id === charId);

        if (character) {
            const rect = mapBoard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const tokenData = {
                id: `token_${charId}`,
                characterId: charId,
                imageUrl: character.personalization.imageUrl || 'https://via.placeholder.com/50',
                x: (x / rect.width) * 100, // Salva como porcentagem
                y: (y / rect.height) * 100,
            };

            if (!campaign.mapData) campaign.mapData = { tokens: [] };
            if (!campaign.mapData.tokens) campaign.mapData.tokens = [];

            // Remove token antigo se já existir
            campaign.mapData.tokens = campaign.mapData.tokens.filter(t => t.characterId !== charId);
            campaign.mapData.tokens.push(tokenData);
            
            updateCampaign(campaign);
            // Limpa e recria todos os tokens para evitar duplicatas
            mapBoard.querySelectorAll('.map-token').forEach(t => t.remove());
            campaign.mapData.tokens.forEach(td => createTokenOnBoard(td, mapBoard, campaign));
        }
    });

    // Lógica do Menu de Contexto e Desenho
    mapBoard.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showMapContextMenu(e.clientX, e.clientY);
    });

    document.addEventListener('click', hideMapContextMenu);

    toggleDrawModeBtn.addEventListener('click', () => {
        isDrawingMode = !isDrawingMode;
        toggleDrawModeBtn.textContent = isDrawingMode ? 'Desativar Modo Desenho' : 'Ativar Modo Desenho';
        mapBoard.style.cursor = isDrawingMode ? 'crosshair' : 'default';
        hideMapContextMenu();
    });

    removeFogBtn.addEventListener('click', (e) => {
        const fogIdToRemove = e.target.dataset.fogId;
        if (fogIdToRemove) {
            campaign.mapData.fog = campaign.mapData.fog.filter(f => f.id !== fogIdToRemove);
            updateCampaign(campaign);
            renderFogOfWar(campaign, mapBoard, true);
        }
        hideMapContextMenu();
    });

    // Eventos de desenho no mapa
    mapBoard.addEventListener('mousedown', (e) => {
        if (!isDrawingMode || e.button !== 0) return; // Apenas botão esquerdo
        isDrawing = true;
        const rect = mapBoard.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;

        selectionRect = document.createElement('div');
        selectionRect.className = 'draw-selection-rect';
        mapBoard.appendChild(selectionRect);
        selectionRect.style.left = `${startX}px`;
        selectionRect.style.top = `${startY}px`;
    });

    mapBoard.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = mapBoard.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(currentX, startX);
        const top = Math.min(currentY, startY);

        selectionRect.style.width = `${width}px`;
        selectionRect.style.height = `${height}px`;
        selectionRect.style.left = `${left}px`;
        selectionRect.style.top = `${top}px`;
    });

    mapBoard.addEventListener('mouseup', (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        mapBoard.removeChild(selectionRect);
        selectionRect = null;

        const rect = mapBoard.getBoundingClientRect();
        const fogData = {
            id: `fog_${Date.now()}`,
            x: (parseFloat(e.target.style.left || startX) / rect.width) * 100,
            y: (parseFloat(e.target.style.top || startY) / rect.height) * 100,
            width: (Math.abs((e.clientX - rect.left) - startX) / rect.width) * 100,
            height: (Math.abs((e.clientY - rect.top) - startY) / rect.height) * 100,
        };

        // Adiciona a nova área de névoa e salva
        campaign.mapData.fog.push(fogData);
        updateCampaign(campaign);
        renderFogOfWar(campaign, mapBoard, true); // Re-renderiza a névoa
    });

    // Resetar o mapa
    resetMapBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar o mapa (remover imagem de fundo, tokens e névoa)?')) {
            campaign.mapData = { imageUrl: null, tokens: [], fog: [] };
            updateCampaign(campaign, true);
            renderMapState();
        }
    });

    // Inicialização
    renderMapState();
    populateTokenList();
    setupDragAndDrop();
}

/**
 * Inicializa a visualização do Mestre para gerenciar a campanha.
 * @param {object} campaign - O objeto da campanha.
 */
function initializeMasterView(campaign) {
    // Elementos de exibição
    const titleDisplay = document.getElementById('campaign-title-display');
    const synopsisDisplay = document.getElementById('campaign-synopsis-display');
    const coverImageDisplay = document.getElementById('campaign-cover-image-display');

    // Elementos do modal
    const modalOverlay = document.getElementById('edit-campaign-modal-overlay');
    const titleModalInput = document.getElementById('campaign-title-modal');
    const synopsisModalTextarea = document.getElementById('campaign-synopsis-modal');
    const imageModalInput = document.getElementById('campaign-image-modal');
    const inviteCodeDisplay = document.getElementById('campaign-invite-code-display');
    const generateCodeBtn = document.getElementById('generate-invite-code-btn');
    const imageModalPreview = document.getElementById('campaign-image-modal-preview');

    // Migração de dados para campanhas antigas
    let needsSave = false;
    if (!campaign.players) { campaign.players = []; needsSave = true; }
    if (!campaign.inviteCode) { campaign.inviteCode = generateUniqueInviteCode(); needsSave = true; }
    if (needsSave) {
        console.log("Migrando campanha antiga. Adicionando código de convite.");
        updateCampaign(campaign); // Salva a campanha com os novos campos
    }

    // Renderiza a lista de jogadores
    renderCampaignPlayers(campaign);

    // Inicializa o mapa do mestre
    initializeMasterMap(campaign);

    // Renderiza a lista de agentes para o mestre
    const masterAgentsGrid = document.getElementById('master-agents-grid');
    const noAgentsMessage = document.getElementById('no-agents-for-master');
    if (masterAgentsGrid) {
        masterAgentsGrid.innerHTML = '';
        if (campaign.characters && campaign.characters.length > 0) {
            noAgentsMessage.style.display = 'none';
            campaign.characters.forEach(character => {
                masterAgentsGrid.appendChild(createAgentCardForCampaign(character, campaign.id, true)); // Passa true para isMasterView
            });
        } else {
            noAgentsMessage.style.display = 'block';
        }
    }

    // Preenche os campos do formulário
    titleDisplay.textContent = campaign.title;
    synopsisDisplay.textContent = campaign.synopsis || 'Nenhuma sinopse fornecida.';
    if (campaign.imageUrl) {
        coverImageDisplay.style.backgroundImage = `url('${campaign.imageUrl}')`;
    }
    inviteCodeDisplay.textContent = campaign.inviteCode;
    
    // Lida com a mudança de imagem no modal
    const imageFileInput = document.getElementById('campaign-image-modal-input');
    imageFileInput.addEventListener('change', () => {
        const file = imageFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { imageModalPreview.src = e.target.result; };
            reader.readAsDataURL(file);
        }
    });

    // Abrir o modal
    document.getElementById('edit-campaign-info-btn').addEventListener('click', () => {
        titleModalInput.value = campaign.title;
        synopsisModalTextarea.value = campaign.synopsis;
        imageModalPreview.src = campaign.imageUrl || 'https://via.placeholder.com/300x180';
        imageFileInput.value = ''; // Limpa o seletor de arquivo
        modalOverlay.classList.add('visible');
    });

    // Fechar o modal
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        modalOverlay.classList.remove('visible');
    });

    // Função que lida com a atualização
    document.getElementById('save-edit-btn').addEventListener('click', async () => {
        const title = titleModalInput.value.trim();
        const synopsis = synopsisModalTextarea.value.trim();
        const imageFile = imageFileInput.files[0];

        let imageUrl = campaign.imageUrl; // Mantém a imagem antiga por padrão
        if (imageFile) {
            imageUrl = await readFileAsDataURL(imageFile); // Se uma nova foi escolhida, converte
        }

        if (!title) {
            alert('O título da campanha não pode ficar vazio.');
            return;
        }

        const updatedCampaignData = { id: campaign.id, title, synopsis, imageUrl };
        updateCampaign(updatedCampaignData, true);
        
        // Atualiza a UI e fecha o modal
        initializeCampaignManagement(); // Recarrega os dados na tela
        modalOverlay.classList.remove('visible');
    });

    // Configura o botão de exclusão
    const deleteBtn = document.getElementById('delete-campaign-btn');
    deleteBtn.addEventListener('click', () => deleteCampaign(campaign.id));

    // Configura o botão de gerar código de convite
    generateCodeBtn.addEventListener('click', () => {
        campaign.inviteCode = generateUniqueInviteCode();
        updateCampaign(campaign, true);
        inviteCodeDisplay.textContent = campaign.inviteCode;
    });

    // Configura a lógica das abas (tabs)
    const tabLinks = document.querySelectorAll('#campaign-management-container .tab-link');
    const tabContents = document.querySelectorAll('#campaign-management-container .tab-content');
    if (tabLinks.length > 0 && tabContents.length > 0) {
        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.dataset.tab;
                tabLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                tabContents.forEach(c => c.id === tabId ? c.classList.add('active') : c.classList.remove('active'));
            });
        });

        // Inicia o listener para o log de rolagens
        initializeCampaignLogListener(campaign.id);
    }
}

/**
 * Inicializa a visualização do mapa para o jogador.
 * @param {object} campaign - O objeto da campanha.
 */
function initializePlayerMap(campaign) {
    const mapBoard = document.getElementById('player-map-board');
    mapBoard.classList.add('player-view'); // Adiciona classe para estilização
    mapBoard.innerHTML = ''; // Limpa o mapa

    if (campaign.mapData?.imageUrl) {
        mapBoard.style.backgroundImage = `url('${campaign.mapData.imageUrl}')`;
    } else {
        mapBoard.innerHTML = '<div class="map-upload-placeholder"><p>O mestre ainda não carregou um mapa.</p></div>';
    }

    if (campaign.mapData?.tokens) {
        campaign.mapData.tokens.forEach(tokenData => {
            // Cria o token, mas sem a funcionalidade de arrastar
            const tokenElement = createTokenOnBoard(tokenData, mapBoard, campaign, false);
        });
    }

    // Renderiza a névoa de guerra para o jogador
    renderFogOfWar(campaign, mapBoard, false);
}

/**
 * Inicializa a visualização do Jogador para a campanha.
 * @param {object} campaign - O objeto da campanha.
 */
async function initializePlayerView(campaign) {
    // Garante que o ID do usuário está carregado
    const user = await checkAuthStatus();
    if (!user) {
        console.warn("Usuário não logado, algumas funcionalidades podem ser limitadas.");
    }

    const titleDisplay = document.getElementById('player-view-campaign-title');
    const synopsisDisplay = document.getElementById('player-view-campaign-synopsis');
    const coverImageDisplay = document.getElementById('player-view-campaign-cover');
    const addAgentBtn = document.getElementById('add-agent-to-campaign-btn');

    // Preenche o cabeçalho da campanha
    titleDisplay.textContent = campaign.title;
    synopsisDisplay.textContent = campaign.synopsis || 'Nenhuma sinopse fornecida.';
    if (campaign.imageUrl) {
        coverImageDisplay.style.backgroundImage = `url('${campaign.imageUrl}')`;
    }

    // Lógica para o modal de adicionar agente
    const modalOverlay = document.getElementById('add-agent-modal-overlay');
    const cancelBtn = document.getElementById('cancel-add-agent-btn');
    const agentListContainer = document.getElementById('select-agent-list');
    const createAndAddBtn = document.getElementById('create-and-add-agent-btn');

    // Modifica o link do botão "Criar Novo Agente" para incluir o ID da campanha
    if (createAndAddBtn) {
        createAndAddBtn.href = `criar-agente.html?campaignId=${campaign.id}`;
    }

    addAgentBtn.addEventListener('click', async () => {
        // Busca os personagens do usuário
        try {
            const response = await api.get('/api/characters');
            const userCharacters = response.data;
            agentListContainer.innerHTML = ''; // Limpa a lista

            if (userCharacters.length > 0) {
                userCharacters.forEach(char => {
                    const card = document.createElement('div'); // Um estilo mais simples para o modal
                    card.className = 'character-card simple-card'; 
                    card.innerHTML = `
                        <h3>${char.personalization.name}</h3>
                        <p>${char.class} | ${char.element}</p>
                    `;
                    card.addEventListener('click', async () => {
                        // Adiciona o personagem à campanha
                        const campaignIdToAdd = campaign._id || campaign.id;
                        try {
                            const response = await api.put(`/api/campaigns/${campaignIdToAdd}/add-character`, { characterId: char._id });
                            alert(`Agente "${char.personalization.name}" adicionado com sucesso!`);                           
                            modalOverlay.classList.remove('visible');
                            // Atualiza a UI dinamicamente sem recarregar a página
                            addAgentToCampaignUI(response.data.character);
                        } catch (error) {
                            const errorMessage = error.response?.data?.message || 'Erro ao adicionar agente.';
                            alert(errorMessage);
                        }
                    });
                    agentListContainer.appendChild(card);
                });
            } else {
                agentListContainer.innerHTML = '<p class="empty-message">Você não tem nenhum agente criado.</p>';
            }

            modalOverlay.classList.add('visible');
        } catch (error) {
            console.error("Erro ao buscar agentes do usuário:", error);
            alert('Não foi possível carregar seus agentes. Tente novamente.');
        }
    });

    cancelBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('visible');
    });

    // Renderiza os personagens que já estão na campanha
    const agentsGrid = document.getElementById('campaign-agents-grid');
    const noAgentsMessage = document.getElementById('no-agents-in-campaign');
    
    agentsGrid.innerHTML = ''; // Limpa a grade

    if (campaign.characters && campaign.characters.length > 0) {
        noAgentsMessage.style.display = 'none';
        campaign.characters.forEach(character => {
            const agentCard = createAgentCardForCampaign(character, campaign._id || campaign.id);
            agentsGrid.appendChild(agentCard);
        });
    } else {
        noAgentsMessage.style.display = 'flex';
    }

    // Inicializa o mapa do jogador
    initializePlayerMap(campaign);

    // Configura as abas do jogador
    const playerTabLinks = document.querySelectorAll('#player-view-container .tab-link');
    const playerTabContents = document.querySelectorAll('#player-view-container .tab-content');
    playerTabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.dataset.tab;
            playerTabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            playerTabContents.forEach(c => c.id === tabId ? c.classList.add('active') : c.classList.remove('active'));
        });
    });
}

/**
 * Adiciona dinamicamente o card de um novo agente à grade da campanha na UI.
 * @param {object} character - O objeto do personagem recém-adicionado.
 */
function addAgentToCampaignUI(character) {
    if (!character) return;

    const agentsGrid = document.getElementById('campaign-agents-grid');
    const noAgentsMessage = document.getElementById('no-agents-in-campaign');

    // Esconde a mensagem de "nenhum agente" e adiciona o novo card
    noAgentsMessage.style.display = 'none';
    const agentCard = createAgentCardForCampaign(character, new URLSearchParams(window.location.search).get('id'));
    agentsGrid.appendChild(agentCard);
}

/**
 * Cria e posiciona um token no mapa.
 * @param {object} tokenData - Dados do token {id, characterId, imageUrl, x, y}.
 * @param {HTMLElement} mapBoard - O elemento do tabuleiro do mapa.
 * @param {object} campaign - O objeto da campanha.
 * @param {boolean} isDraggable - Se o token pode ser arrastado (visão do mestre).
 */
function createTokenOnBoard(tokenData, mapBoard, campaign, isDraggable = true) {
    let tokenElement = document.getElementById(tokenData.id);
    if (!tokenElement) {
        tokenElement = document.createElement('div');
        tokenElement.id = tokenData.id;
        tokenElement.className = 'map-token';
        mapBoard.appendChild(tokenElement);
    }

    tokenElement.style.backgroundImage = `url('${tokenData.imageUrl}')`;
    tokenElement.style.left = `${tokenData.x}%`;
    tokenElement.style.top = `${tokenData.y}%`;

    if (isDraggable) {
        tokenElement.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const rect = mapBoard.getBoundingClientRect();
            let offsetX = e.clientX - tokenElement.getBoundingClientRect().left;
            let offsetY = e.clientY - tokenElement.getBoundingClientRect().top;

            function onMouseMove(moveEvent) {
                let newX = moveEvent.clientX - rect.left - offsetX;
                let newY = moveEvent.clientY - rect.top - offsetY;
                
                tokenElement.style.left = `${newX}px`;
                tokenElement.style.top = `${newY}px`;
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                tokenData.x = (parseFloat(tokenElement.style.left) / rect.width) * 100;
                tokenData.y = (parseFloat(tokenElement.style.top) / rect.height) * 100;
                updateCampaign(campaign);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
}
/**
 * Cria um card de agente para ser exibido dentro da página da campanha.
 * É uma versão simplificada do card da página 'agentes.html'.
 * @param {object} character - O objeto do personagem.
 * @returns {HTMLElement} O elemento do card do agente.
 */
function createAgentCardForCampaign(character, campaignId, isMasterView = false) { // Linha duplicada removida
    const card = document.createElement('div');
    card.className = 'character-card simple-card'; // Usa a classe para diminuir o tamanho
    if (character.element) {
        card.classList.add(character.element.toLowerCase());
    }

    const p = character.personalization || {};
    const imageHtml = p.imageUrl
        ? `<img src="${p.imageUrl}" alt="Retrato de ${p.name}" class="character-card-image">`
        : '';

    // Verifica se o personagem pertence ao usuário logado (currentUserId é uma variável global)
    // Se for a visão do mestre, o botão de deletar aparece em todos.
    // Se for a visão do jogador, o botão só aparece se ele for o dono do personagem.
    const isOwner = character.owner === currentUserId;
    const deleteButtonHtml = (isMasterView || isOwner) // Linha duplicada removida
        ? `<button class="delete-btn small-btn" title="Remover da Campanha">&times;</button>`
        : '';

    card.innerHTML = `
        ${imageHtml}
        <div class="character-header">
            <h3>${p.name || 'Agente Sem Nome'}</h3>
            <span class="character-class">${character.class || 'Classe'}</span>
        </div>
        <div class="character-info">
            <p><strong>Jogador:</strong> ${p.player || 'N/A'}</p>
        </div>
        <div class="character-footer campaign-view">
            <button class="view-btn">Ver Ficha</button>
            ${deleteButtonHtml}
        </div>
    `;

    card.querySelector('.view-btn').addEventListener('click', () => {
        // O ID pode ser `_id` vindo do populate da API
        const charId = character._id; // Use _id directly
        window.location.href = `ficha-agente.html?id=${charId}&campaignId=${campaignId}`;
    });

    // Adiciona o evento de clique para o botão de deletar, se ele existir
    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => removeAgentFromCampaign(campaignId, character._id, card));
    }

    return card;
}

// =================================================================================
// FUNÇÕES UTILITÁRIAS E INICIALIZAÇÃO
// =================================================================================

/**
 * Atraso na execução de uma função para evitar chamadas excessivas.
 * @param {Function} func - A função a ser executada.
 * @param {number} delay - O tempo de espera em milissegundos.
 * @returns {Function} A nova função com debounce.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Lê um arquivo de imagem e retorna uma Data URL (base64).
 * @param {File} file - O arquivo de imagem a ser lido.
 * @returns {Promise<string>} Uma promessa que resolve com a Data URL da imagem.
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// Função para marcar o link de navegação ativo
function updateActiveLinks() {
    const navLinks = document.querySelectorAll('.home-header nav a');
    if (navLinks.length === 0) return;

    const currentPage = window.location.pathname.split('/').pop().toLowerCase();

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop().toLowerCase();
        link.classList.remove('active-link');

        const isCurrentPage = linkPage === currentPage;
        const isHomePage = (currentPage === '' || currentPage === 'home.html' || currentPage === 'index.html') && (linkPage === 'home.html' || linkPage === 'index.html');
        const isAgentCreationPage = (currentPage === 'criar-agente.html' || currentPage === 'ficha-agente.html' || currentPage === 'elemento-lore.html') && linkPage === 'agentes.html';

        if (isCurrentPage || isHomePage || isAgentCreationPage) {
            link.classList.add('active-link');
        }
    });
}

// Função para verificar o status de login e atualizar o header
async function checkAuthStatus() {
    const nav = document.querySelector('.home-header nav'); // CORREÇÃO: Busca o elemento nav dentro do cabeçalho
    if (!nav) {
        console.warn("Elemento de navegação '.home-header nav' não encontrado. A verificação de status será pulada.");
        return null; // Retorna nulo se o nav não for encontrado
    }

    const existingAuthContainer = nav.querySelector('.auth-container');
    if (existingAuthContainer) existingAuthContainer.remove(); // Limpa o container antigo

    const authContainer = document.createElement('div'); // Cria um novo
    authContainer.className = 'auth-container';
    // Define o botão de login como padrão inicial
    authContainer.innerHTML = `<a href="${API_BASE_URL}/auth/google" class="login-btn auth-link">Login com Google</a>`;
    nav.appendChild(authContainer); // Adiciona ao menu

    try {
        const response = await api.get('/auth/user');
        const user = response.data;

        if (user && user._id) {
            // Se encontrar um usuário logado, atualiza o container
            authContainer.innerHTML = `<span class="user-info">Olá, <span class="user-display-name">${user.displayName}</span>! <a href="${API_BASE_URL}/auth/logout" class="auth-link">[Sair]</a></span>`;
            currentUserId = user._id;
            return user;
        }
        return null; // Retorna nulo se não houver usuário
    } catch (error) {
        // Se a API falhar (ex: 401, erro de rede), o botão de login já está na tela.
        console.log('Nenhuma sessão de usuário ativa encontrada. O botão de login será exibido.');
        return null;
    }
}

// Função para carregar o header dinamicamente
async function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    try {
        // Usando Axios para carregar o HTML do cabeçalho
        const response = await axios.get('_header.html');
        const data = response.data;
        header = headerPlaceholder; // Atribui o elemento à variável global
        headerPlaceholder.innerHTML = data;
    } catch (error) {
        console.error('Erro ao carregar o cabeçalho:', error);
        if (window.location.protocol === 'file:') {
            headerPlaceholder.innerHTML = `<div style="padding: 1.5rem; text-align: center; background-color: #5d1a22; color: white; border: 3px solid #ff4d4d; border-radius: 8px; margin: 1rem;">
                    <h3 style="margin-top:0; font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: #ffc107;">ERRO: O MENU NÃO PODE SER CARREGADO</h3>
                    <p style="margin-bottom:0; font-size: 1.1rem;">Isso acontece porque o projeto foi aberto como um arquivo local (<code>file:///</code>).</p>
                    <p style="margin-top: 0.5rem; font-size: 1.2rem; font-weight: bold;"><strong>SOLUÇÃO:</strong> Use a extensão <strong>"Live Server"</strong> no VS Code.</p>
                    <p style="margin-top: 0.5rem;">Clique com o botão direito no arquivo <code>Home.html</code> e escolha <strong>"Open with Live Server"</strong>.</p>
                </div>`;
        } else {
            headerPlaceholder.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar o cabeçalho. Verifique o console para mais detalhes.</p>';
        }
    }
}

/**
 * Verifica e aplica o modo de desenvolvedor se ativado via URL ou localStorage.
 */
function checkAndApplyDevMode() {
    const params = new URLSearchParams(window.location.search);
    const isDevMode = localStorage.getItem('devMode') === 'true' || params.get('dev') === 'true';

    if (isDevMode) {
        document.body.classList.add('dev-mode');
        console.log('Modo Desenvolvedor Ativado. Recursos premium desbloqueados.');
    }
}

let header; // Variável global para o header element
// Inicialização do Script quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    await loadHeader();

    checkAndApplyDevMode(); // Verifica o modo dev logo no início
    updateActiveLinks();
    const user = await checkAuthStatus(); // Espera a verificação de auth e armazena o usuário
    
    const path = window.location.pathname;
    if (path.includes('criar-agente.html')) {
        // A classe CharacterCreator agora lida com a lógica de modo internamente
        const creator = new CharacterCreator();
        // A inicialização já é chamada dentro do construtor, então não precisa de `creator.initialize()`

    }
    if (path.includes('campanhas.html')) {
        // Adiciona o listener para o formulário de entrar na campanha
        const joinCampaignForm = document.getElementById('join-campaign-form');
        if (joinCampaignForm) {
            joinCampaignForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const inviteCode = document.getElementById('join-code-input').value.trim().toUpperCase();
                joinCampaignByCode(inviteCode, joinCampaignForm);
            });
        }

        // Lógica de exibição de campanhas refatorada para garantir a ordem
        let campaignsData = [];
        const userId = user ? user._id : 'local_user_id';

        if (user) {
            try {
                // Adiciona um parâmetro de cache-busting para garantir dados novos
                const response = await api.get(`/api/campaigns?t=${new Date().getTime()}`); // Linha duplicada removida
                campaignsData = response.data;
            } catch (error) {
                console.error("Falha ao buscar campanhas da API:", error);
            }
        } else {
            campaignsData = JSON.parse(localStorage.getItem('sombras-campaigns')) || [];
        }
        displayCampaigns(campaignsData, userId);
    }
    if (path.includes('gerenciar-campanha.html')) {
        initializeCampaignManagement();
    }
    if (path.includes('agentes.html')) {
        new CharacterDisplay();
    }
    if (path.includes('ficha-agente.html')) {
        const sheet = new CharacterSheet();
        await sheet.initialize();
    }
    if (path.includes('elemento-lore.html')) {
        new ElementLorePage();
    }
    if (path.includes('ameacas-lista.html')) {
        new ThreatListPage();
    }
    // O editor de habilidades agora é carregado na página 'patente.html' quando o dev mode está ativo.
    const isDevMode = document.body.classList.contains('dev-mode');
    if (path.includes('dev-dashboard.html') || (path.includes('patente.html') && isDevMode)) {
        new SkillTreeEditor();
    }

    const devModeForm = document.getElementById('dev-mode-form');
    if (devModeForm) {
        devModeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('dev-mode-input');
            if (input.value === '503038.123') {
                localStorage.setItem('devMode', 'true');
                alert('Modo Desenvolvedor Ativado! As ferramentas de edição de habilidades foram liberadas nesta página. A página será recarregada.');
                window.location.reload();
            } else {
                alert('Código de acesso incorreto.');
            }
        });
    }

    const deactivateDevBtn = document.getElementById('deactivate-dev-mode');
    if (deactivateDevBtn) {
        deactivateDevBtn.addEventListener('click', () => {
            if (confirm('Deseja realmente sair do Modo Desenvolvedor?')) {
                localStorage.removeItem('devMode');
                alert('Modo Desenvolvedor Desativado. A página será recarregada.');
                window.location.reload();
            }
        });
    }

});it
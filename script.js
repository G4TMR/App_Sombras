/**
 * Sombras do Abismo - Script Principal
 * Contém a lógica para a criação de personagens e exibição de agentes.
 */

const CLASS_BASE_ATTRIBUTES = {
    'Bélico': { forca: 3, agilidade: 2, presenca: 1, vitalidade: 3, inteligencia: 1 },
    'Esotérico': { forca: 1, agilidade: 2, presenca: 3, vitalidade: 2, inteligencia: 2 },
    'Erudito': { forca: 1, agilidade: 1, presenca: 2, vitalidade: 2, inteligencia: 4 },
};

const DEFAULT_SKILL_TREES = {
    'Bélico': {},
    'Esotérico': {},
    'Erudito': {},
    'Atributo': {
        'Força': [
            { id: 'forca-5-1', name: 'Golpe Poderoso', description: 'Um ataque básico e potente, que serve como base para técnicas de força mais avançadas.', requirements: { forca: 5 }, unlocked: false, children: [
                { id: 'forca-10-1', name: 'Postura de Colosso', description: 'Foca em peso e estabilidade, aumentando a resistência a ser movido.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-1-1', name: 'Passo de Colosso', description: 'Atravessa inimigos e objetos, causando dano de impacto.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-1-2', name: 'Despedaçador de Concreto', description: 'Quebra barreiras com força, causando dano em área.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-1-3', name: 'Pulso de Choque', description: 'Cria uma onda de choque que atordoa e causa dano em área.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-1-4', name: 'Imunidade a Quedas', description: 'Ganha resistência ou imunidade a dano de queda.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-2', name: 'Arremesso Potente', description: 'Permite arremessar objetos pesados com mais força e alcance.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-2-1', name: 'Arremesso Aéreo', description: 'Arremessa um inimigo no ar, deixando-o vulnerável.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-2-2', name: 'Tiro de Colisão', description: 'Arremessa um inimigo em outro, causando dano a ambos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-2-3', name: 'Arremesso Improvável', description: 'Usa objetos do cenário como projéteis mortais.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-2-4', name: 'Arma de Arremesso', description: 'Arremessa sua própria arma e a faz retornar à sua mão.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-3', name: 'Quebra de Armadura', description: 'Um golpe focado que danifica a armadura do inimigo, reduzindo sua defesa.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-3-1', name: 'Golpe Esmagador', description: 'Um ataque que ignora completamente a armadura do alvo.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-3-2', name: 'Ataque de Exaustão', description: 'Reduz o vigor ou pontos de ação do inimigo.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-3-3', name: 'Punho de Ferro', description: 'Aumenta o dano desarmado e permite bloquear ataques com os punhos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-3-4', name: 'Destruidor de Foco', description: 'Interrompe a concentração de inimigos, cancelando habilidades.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'forca-10-4', name: 'Soco Aéreo', description: 'Cria uma rajada de ar comprimido com um soco, atingindo inimigos à distância.', requirements: { forca: 10 }, unlocked: false, children: [
                    { id: 'forca-15-4-1', name: 'Soco em Câmera Lenta', description: 'A rajada de ar distorce o tempo, deixando os inimigos lentos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-4-2', name: 'Vácuo Aéreo', description: 'Puxa inimigos próximos para o ponto de impacto da rajada.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-4-3', name: 'O Sopro do Trovão', description: 'A rajada de ar tem um efeito sônico, atordoando os alvos.', requirements: { forca: 15 }, unlocked: false, children: [] },
                    { id: 'forca-15-4-4', name: 'Soco de Repulsão', description: 'Empurra violentamente os inimigos para trás.', requirements: { forca: 15 }, unlocked: false, children: [] }
                ]}
            ]}
        ],
        'Agilidade': [
            { id: 'agilidade-5-1', name: 'Mergulho no Vazio', description: 'Permite se mover rapidamente para desviar de ataques ou se reposicionar.', requirements: { agilidade: 5 }, unlocked: false, children: [
                { id: 'agilidade-10-1', name: 'Ataque Rápido', description: 'Permite realizar um ataque adicional no mesmo turno, mas com dano reduzido.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-1-1', name: 'Salto Fantasma', description: 'Ao usar o Ataque Rápido, você deixa uma ilusão de si mesmo para trás, confundindo inimigos e aumentando sua chance de esquiva.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-1-2', name: 'Ataque de Sombra', description: 'Seus ataques rápidos agora têm a chance de teleportá-lo para trás do inimigo, permitindo que você atinja pontos fracos.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-1-3', name: 'Rajada de Lâminas', description: 'Você lança uma série de golpes tão rápidos que eles perfuram a defesa de um inimigo, ignorando parte de sua armadura.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-1-4', name: 'Ataque de Reflexo', description: 'Você pode realizar um ataque rápido em resposta a um ataque inimigo que errou.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'agilidade-10-2', name: 'Desarmar', description: 'Com um ataque rápido e preciso, você pode fazer um inimigo derrubar a arma dele.', requirements: { agilidade: 10 }, unlocked: false, children: [
                    { id: 'agilidade-15-2-1', name: 'Passo no Vazio', description: 'Você pode se mover através de objetos sólidos e inimigos, ignorando barreiras e bloqueios.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-2-2', name: 'Mãos Invisíveis', description: 'Você pode desarmar um inimigo sem que ele perceba que você o tocou, como se a arma dele tivesse caído sozinha.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-2-3', name: 'Roubo de Arma', description: 'Ao desarmar um inimigo, você também pode roubar a arma dele.', requirements: { agilidade: 15 }, unlocked: false, children: [] },
                    { id: 'agilidade-15-2-4', name: 'Dança da Desorientação', description: 'Ao desarmar um inimigo, você o desorienta, diminuindo a precisão e a chance de acerto dos seus próximos ataques.', requirements: { agilidade: 15 }, unlocked: false, children: [] }
                ]}
            ]}
        ],
        'Presença': [
            { id: 'presenca-5-1', name: 'Grito de Guerra', description: 'Uma habilidade básica para intimidar inimigos próximos, podendo causar hesitação.', requirements: { presenca: 5 }, unlocked: false, children: [
                { id: 'presenca-10-1', name: 'Aparência Imponente', description: 'Foca na sua capacidade de convencer ou intimidar pessoas e de ter uma presença notável em qualquer ambiente.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-1-1', name: 'O Olhar Vazio', description: 'Um olhar que lança um terror paralisante, forçando inimigos mais fracos a fugir ou ficar atordoados.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-1-2', name: 'Presença Opressora', description: 'Você emite uma aura que diminui a moral de todos os inimigos próximos, reduzindo a precisão e o dano de seus ataques.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-1-3', name: 'Conexão da Multidão', description: 'Você pode se misturar perfeitamente em uma multidão, como se não existisse, tornando impossível para inimigos te detectarem.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-1-4', name: 'Ancoragem Psíquica', description: 'Com sua presença, você pode se conectar com a mente dos seus aliados, melhorando a iniciativa e a coordenação de todo o grupo em combate.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'presenca-10-2', name: 'Foco Compartilhado', description: 'Permite ajudar um aliado a focar em uma tarefa, dando a ele um bônus para sua próxima ação.', requirements: { presenca: 10 }, unlocked: false, children: [
                    { id: 'presenca-15-2-1', name: 'Conjurador de Medo', description: 'Você manipula as emoções de um inimigo para criar manifestações de seu maior medo, paralisando-o.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-2-2', name: 'Mente Coletiva', description: 'Cria uma conexão mental com seus aliados, permitindo que eles ajam em perfeita sincronia, ignorando o caos da batalha.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-2-3', name: 'Transferência de Habilidade', description: 'Você pode transferir uma de suas habilidades para um aliado, permitindo que ele a use por um curto período.', requirements: { presenca: 15 }, unlocked: false, children: [] },
                    { id: 'presenca-15-2-4', name: 'Sentido de Perigo', description: 'Você pode sentir perigos e armadilhas próximos e alertar seus aliados sobre eles, dando um bônus para que eles os evitem.', requirements: { presenca: 15 }, unlocked: false, children: [] }
                ]}
            ]}
        ],
        'Vitalidade': [
            { id: 'vitalidade-5-1', name: 'Recuperação Acelerada', description: 'Sua capacidade de recuperação é aprimorada, recuperando mais vida e vigor em descansos.', requirements: { vitalidade: 5 }, unlocked: false, children: [
                { id: 'vitalidade-10-1', name: 'Resistência à Dor', description: 'Foca em sua capacidade de suportar dano e continuar lutando. Diminui o dano de ataques críticos e de efeitos de sangramento.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-1-1', name: 'Pulso de Vigor', description: 'Você libera um pulso de sua própria energia vital que afeta aliados e inimigos próximos. Os aliados são curados e têm seu vigor restaurado. Os inimigos, por sua vez, sentem sua energia vital sendo drenada, sofrendo dano e ficando mais lentos.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-1-2', name: 'Vitalidade Compartilhada', description: 'Você pode transferir seu vigor e parte de sua energia vital para um aliado, curando-o e permitindo que ele use mais habilidades.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-1-3', name: 'Pele de Ferro', description: 'Por um curto período, sua pele se torna tão dura quanto o ferro, concedendo resistência a dano físico.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-1-4', name: 'Morte Falsa', description: 'Você pode entrar em um estado de "morte falsa" para enganar inimigos. Sua respiração e pulso param, e seu corpo fica frio, parecendo morto.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'vitalidade-10-2', name: 'Escudo de Vigor', description: 'Você pode usar seu vigor como um escudo, absorvendo parte do dano recebido.', requirements: { vitalidade: 10 }, unlocked: false, children: [
                    { id: 'vitalidade-15-2-1', name: 'Escudo de Absorção', description: 'Seu escudo de vigor não apenas absorve dano, mas o converte em energia para curar a si mesmo.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-2-2', name: 'Barreira de Energia', description: 'Seu escudo de vigor se torna uma barreira de energia que pode ser usada para proteger aliados de ataques.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-2-3', name: 'Vigor Inesgotável', description: 'Aumenta seu vigor total para que você possa usar mais habilidades.', requirements: { vitalidade: 15 }, unlocked: false, children: [] },
                    { id: 'vitalidade-15-2-4', name: 'Segunda Chance', description: 'Você pode evitar a morte uma vez por dia, sobrevivendo com 1 de vida após um ataque fatal.', requirements: { vitalidade: 15 }, unlocked: false, children: [] }
                ]}
            ]}
        ],
        'Inteligência': [
            { id: 'inteligencia-5-1', name: 'Análise Tática', description: 'Permite gastar uma ação para descobrir fraquezas e resistências de um inimigo.', requirements: { inteligencia: 5 }, unlocked: false, children: [
                { id: 'inteligencia-10-1', name: 'Memória Fotográfica', description: 'Foca na sua capacidade de absorver e reter informações rapidamente. Permite que o personagem se lembre de detalhes e informações com facilidade.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-1-1', name: 'Previsão de Falhas', description: 'Você analisa a realidade e o ambiente ao seu redor tão rapidamente que pode prever as falhas mais prováveis em um inimigo ou na estrutura.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-1-2', name: 'Leitura de Mente', description: 'Você pode ler os pensamentos de um inimigo para descobrir seus planos, fraquezas ou segredos.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-1-3', name: 'Conhecimento Arcano', description: 'Você pode identificar rituais, feitiços e outros poderes esotéricos que seriam invisíveis para outros.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-1-4', name: 'Estrategista de Batalha', description: 'Sua mente funciona tão rapidamente em combate que você e seus aliados ganham um bônus de iniciativa e tática, permitindo que ajam antes dos inimigos.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
                ]},
                { id: 'inteligencia-10-2', name: 'Construção Improvisada', description: 'Permite que o personagem use materiais básicos para criar itens simples, armadilhas e ferramentas.', requirements: { inteligencia: 10 }, unlocked: false, children: [
                    { id: 'inteligencia-15-2-1', name: 'Transferência de Habilidade', description: 'Você analisa e entende tão bem uma habilidade de um inimigo que consegue reproduzi-la por um curto período.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-2-2', name: 'Engenheiro de Batalha', description: 'Você pode usar materiais ao seu redor para criar armas e armaduras no meio da batalha.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-2-3', name: 'Mestre em Armadilhas', description: 'Você tem um bônus para sentir a presença de armadilhas e desarmá-las.', requirements: { inteligencia: 15 }, unlocked: false, children: [] },
                    { id: 'inteligencia-15-2-4', name: 'Tinkerer', description: 'Você pode fazer modificações em armas e equipamentos para dar a eles um bônus temporário de dano ou defesa.', requirements: { inteligencia: 15 }, unlocked: false, children: [] }
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
    }

    loadSkillTrees() {
        const storedSkills = localStorage.getItem('sombras-skill-trees');
        if (storedSkills) {
            const loadedSkills = JSON.parse(storedSkills);
            // Migration for old data: ensure 'Atributo' tree exists.
            if (!loadedSkills['Atributo']) {
                loadedSkills['Atributo'] = DEFAULT_SKILL_TREES['Atributo'];
            }
            // Migração mais robusta: verifica se a estrutura de dados é a nova (aninhada).
            // Se a primeira habilidade de Força não tiver a propriedade 'children', é a estrutura antiga.
            if (loadedSkills.Atributo?.Força?.length > 0) {
                // Se a estrutura antiga (lista plana) for detectada (mais de 1 item na raiz ou sem a propriedade 'children'), força a atualização.
                if (loadedSkills.Atributo.Força.length > 1 || typeof loadedSkills.Atributo.Força[0].children === 'undefined') {
                    console.log("Detectada estrutura de habilidades antiga ou inválida. Forçando a atualização para a nova estrutura em árvore.");
                    loadedSkills['Atributo'] = DEFAULT_SKILL_TREES['Atributo'];
                }
            }
            SKILL_TREES = loadedSkills;
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

        const skillTreeContainer = document.createElement('div');
        skillTreeContainer.className = 'skill-list-tree';

        const rootSkills = SKILL_TREES[category][subCategory];
        rootSkills.forEach(skill => {
            this._renderSkillRecursive(skill, skillTreeContainer, rootSkills);
        });

        const addRootSkillButton = document.createElement('button');
        addRootSkillButton.textContent = 'Adicionar Habilidade Raiz';
        addRootSkillButton.className = 'add-skill-btn';
        addRootSkillButton.addEventListener('click', () => {
            const newSkill = { id: `new-skill-${Date.now()}`, name: 'Nova Habilidade', description: '', requirements: {}, children: [] };
            rootSkills.push(newSkill);
            this.render();
            this.saveSkillTrees();
        });

        subCategoryContent.appendChild(skillTreeContainer);
        subCategoryContent.appendChild(addRootSkillButton);

        return subCategoryContainer;
    }

    _renderSkillRecursive(skill, parentContainer, parentArray) {
        const skillWrapper = document.createElement('div');
        skillWrapper.className = 'skill-node-wrapper';

        const skillNode = this.createSkillNode(skill, parentArray);
        skillWrapper.appendChild(skillNode);

        if (skill.children && skill.children.length > 0) {
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
        const reqsInput = this._createInput('text', Object.entries(skill.requirements).map(([k, v]) => `${k}:${v}`).join(', '), 'Requisitos (ex: forca:5)', (val) => {
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
            if (!skill.children) skill.children = [];
            skill.children.push({ id: `new-skill-${Date.now()}`, name: 'Nova Ramificação', description: '', requirements: {}, children: [] });
            this.render();
            this.saveSkillTrees();
        });

        const deleteBtn = this._createButton('Excluir', 'delete', () => {
            const index = parentArray.findIndex(s => s.id === skill.id);
            if (index > -1) {
                parentArray.splice(index, 1);
                this.render();
                this.saveSkillTrees();
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
            this.saveSkillTrees();
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

        this.initialize();
    }

    initialize() {
        if (!document.getElementById('step-1')) return;

        this.setupClassSelection();
        this.setupElementSelection();
        this.setupAttributeDistribution();
        this.setupPersonalizationForm();
        this.setupWizardButtons();
        this.restoreFormData();
        this.updateCharacterSummary();
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

        form.addEventListener('input', (e) => {
            const formData = new FormData(form);
            this.currentCharacter.personalization = Object.fromEntries(formData.entries());
            this.updateCharacterSummary();
            this.saveFormData();
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
                const stepMatch = nav.id.match(/nav-step-(\d+)/);
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
            }
            this.updateAttributeUI();
        }
    }

    clearFormData() {
        sessionStorage.removeItem('character-in-progress'); 
    }

    async saveCharacter() {
        const { name, player } = this.currentCharacter.personalization;
        if (!name || !player) {
            alert('Por favor, preencha os campos obrigatórios (Nome do Agente e Nome do Jogador) para finalizar.');
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
            const response = await fetch('http://localhost:3000/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentCharacter),
                credentials: 'include'
            });

            if (response.ok) {
                this.clearFormData();
                window.location.href = 'agentes.html';
            } else {
                const errorData = await response.json();
                alert(`Erro ao salvar personagem: ${errorData.message}`);
                if (response.status === 401) {
                    window.location.href = 'http://localhost:3000/auth/google';
                }
            }
        } catch (error) {
            console.error('Erro de rede ao salvar personagem:', error);
            alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
        }
    }
}

// =================================================================================
// CLASSE: CharacterDisplay - Gerencia a exibição dos agentes salvos
// =================================================================================
class CharacterDisplay {
    constructor() {
        this.container = document.querySelector('.agentes-content');
        this.loadCharacters();
    }

    async loadCharacters() {
        try {
            const response = await fetch('http://localhost:3000/api/characters', { credentials: 'include' });
            if (response.ok) {
                const characters = await response.json();
                this.renderCharacters(characters);
            } else {
                console.error('Falha ao carregar personagens. O usuário pode não estar logado.');
                // Redireciona para o login se não estiver autorizado
                if (response.status === 401) {
                    this.container.innerHTML = `<div class="empty-state"><p class="empty-message">Você precisa estar logado para ver seus agentes.</p><a href="http://localhost:3000/auth/google" class="create-character-btn">Login com Google</a></div>`;
                }
            }
        } catch (error) {
            console.error('Erro de rede ao carregar personagens:', error);
            this.container.innerHTML = `<div class="empty-state"><p class="empty-message">Erro de conexão com o servidor.</p><p class="empty-submessage">Verifique se o backend está rodando e tente novamente.</p></div>`;
        }
    }

    renderCharacters(characters) {
        if (!this.container) return;

        const emptyMessage = this.container.querySelector('.empty-message');
        if (characters.length === 0) {
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        if (emptyMessage) emptyMessage.style.display = 'none';

        let grid = this.container.querySelector('.characters-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'characters-grid';
            this.container.appendChild(grid);
        }
        grid.innerHTML = '';

        characters.forEach(char => {
            const card = this.createCharacterCard(char);
            grid.appendChild(card);
        });
    }

    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = 'character-card';
        if (character.element) {
            card.classList.add(character.element.toLowerCase());
        }

        const p = character.personalization || {};
        console.log('Rendering character card for:', p.name);
        const attrs = character.attributes || { forca: '?', agilidade: '?', presenca: '?', vitalidade: '?', inteligencia: '?' };
        const creationDate = character.createdAt ? new Date(character.createdAt).toLocaleDateString('pt-BR') : 'Data inválida';
        const elementClass = character.element ? character.element.toLowerCase() : '';

        card.dataset.id = character.id;

        card.innerHTML = `
            <div class="character-header">
                <h3>${p.name || 'Agente Sem Nome'}</h3>
                <span class="character-class">${character.class || 'Classe Desconhecida'}</span>
                <span class="character-element ${elementClass}">${character.element || ''}</span>
            </div>
            <div class="character-info">
                <p><strong>Profissão:</strong> ${p.profession || 'Não informado'}</p>
            </div>
            <div class="character-attributes">
                <div class="attr-item">
                    <span class="attr-icon"><svg class="attr-svg-icon-small" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></span>
                    <span>${attrs.forca} FOR</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon"><svg class="attr-svg-icon-small" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg></span>
                    <span>${attrs.agilidade} AGI</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon"><svg class="attr-svg-icon-small" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 10c-2.48 0-4.5-2.02-4.5-4.5S9.52 5.5 12 5.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm0-7C10.62 7.5 9.5 8.62 9.5 10s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5S13.38 7.5 12 7.5z"/></svg></span>
                    <span>${attrs.inteligencia} INT</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon"><svg class="attr-svg-icon-small" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg></span>
                    <span>${attrs.presenca} PRE</span>
                </div>
                 <div class="attr-item">
                    <span class="attr-icon"><svg class="attr-svg-icon-small" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></span>
                    <span>${attrs.vitalidade} VIT</span>
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

        card.querySelector('.view-btn').addEventListener('click', () => window.location.href = `ficha-agente.html?id=${character.id}`);
        card.querySelector('.delete-btn').addEventListener('click', () => this.deleteCharacter(character.id));

        return card;
    }

    async deleteCharacter(characterId) {
        if (confirm('Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.')) {
            // A rota de delete não foi implementada no backend de exemplo,
            // mas aqui é onde a chamada fetch seria feita.
            // Ex: await fetch(`http://localhost:3000/api/characters/${characterId}`, { method: 'DELETE' });
            alert('Funcionalidade de exclusão ainda não implementada no backend.');

            // let characters = JSON.parse(localStorage.getItem('sombras-characters')) || [];
            // characters = characters.filter(char => char.id !== characterId);
            // localStorage.setItem('sombras-characters', JSON.stringify(characters));
            // this.loadCharacters();
        }
    }
}

// =================================================================================
// CLASSE: CharacterSheet - Gerencia a exibição da ficha completa do agente
// =================================================================================
class CharacterSheet {
    constructor() {
        document.body.classList.add('sheet-page-body');
        this.character = null;
        this.loadCharacter();
        if (this.character) {
            this.renderSheet();
            this.setupEventListeners();
            this.renderSkillTree();
            this.checkLevelUp();
        }
    }

    async loadCharacter() {
        const params = new URLSearchParams(window.location.search);
        const charId = params.get('id');
        if (!charId) {
            document.getElementById('character-not-found').style.display = 'block';
            return;
        }
        
        // No novo sistema, cada personagem seria carregado individualmente
        // A rota para isso não foi implementada no backend de exemplo,
        // então vamos continuar usando o localStorage por enquanto para a ficha.
        // Em uma implementação completa, a linha abaixo seria um fetch.
        // Ex: const response = await fetch(`http://localhost:3000/api/characters/${charId}`);
        const characters = JSON.parse(localStorage.getItem('sombras-characters')) || [];
        this.character = characters.find(char => char.id === charId);

        if (!this.character) {
            document.getElementById('character-not-found').style.display = 'block';
        } else {
            // Lógica de migração para garantir que fichas antigas funcionem.
            // Isso atualiza a estrutura de dados do personagem se estiver faltando algo.
            let needsSave = false;

            // Garante que todas as propriedades essenciais existam
            if (typeof this.character.level === 'undefined') { this.character.level = 1; needsSave = true; }
            if (typeof this.character.xp === 'undefined') { this.character.xp = 0; needsSave = true; }
            if (typeof this.character.attributePoints === 'undefined') { this.character.attributePoints = 0; needsSave = true; }
            if (typeof this.character.skillPoints === 'undefined') { this.character.skillPoints = 0; needsSave = true; }
            if (!this.character.skills) { this.character.skills = []; needsSave = true; }
            if (!this.character.inventario) { this.character.inventario = []; needsSave = true; }
            if (!this.character.personalization) { this.character.personalization = {}; needsSave = true; }
            
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

    renderSheet() {
        if (!this.character) return;

        // Com a migração em loadCharacter, podemos confiar que a estrutura de dados principal está completa.
        const {
            level, xp, attributePoints, skillPoints, attributes, classStats,
            personalization = {}, status, pericias = {}, inventario = []
        } = this.character;

        const sheetContainer = document.getElementById('sheet-container');
        const header = document.querySelector('.sheet-header');
        sheetContainer.className = 'sheet-container';
        if (this.character.element) {
            const elementClass = this.character.element.toLowerCase();
            sheetContainer.classList.add(elementClass);
        }
        header.querySelector('h2').textContent = personalization.name || 'Agente Sem Nome';
        header.querySelector('#sheet-char-element').textContent = `Elemento: ${this.character.element || 'Nenhum'}`;
        header.querySelector('#sheet-char-class-player').textContent = `${this.character.class || 'Classe'} | Jogador: ${personalization.player || 'N/A'}`;
        document.title = `${personalization.name || 'Agente'} | Ficha de Agente`;

        document.getElementById('sheet-level').textContent = level;
        document.getElementById('sheet-xp').textContent = xp;
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

        this.renderActionsPanel();

        document.getElementById('sheet-container').style.display = 'flex';
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
            this.character.xp -= xpToNextLevel;
            this.character.attributePoints += 2;
            this.character.skillPoints += 1;
            document.getElementById('level-up-btn').style.display = 'none';
            this.saveCharacterChanges();
            this.renderSheet();
        }
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

    renderSkillTree() {
        const classContainer = document.getElementById('class-skill-tree-container');
        const attributeContainer = document.getElementById('attribute-skill-tree-container');
        if (!classContainer || !attributeContainer) return;

        classContainer.innerHTML = '';
        attributeContainer.innerHTML = '';

        const classTree = SKILL_TREES[this.character.class] ? SKILL_TREES[this.character.class][this.character.element] || [] : [];
        const attributeTree = SKILL_TREES['Atributo'];

        if (classTree.length === 0) {
            classContainer.innerHTML = '<p class="empty-skill-tree">Nenhuma árvore de habilidades de classe disponível.</p>';
        } else {
            classTree.forEach(skill => {
                this._renderSkillNodeRecursive(skill, classContainer, null);
            });
        }

        for (const attribute in attributeTree) {
            const attributeSubContainer = document.createElement('div');
            attributeSubContainer.className = 'skill-tree-sub-category';
            attributeSubContainer.innerHTML = `<h4>${attribute}</h4>`;

            const treeRoot = document.createElement('div');
            treeRoot.className = 'skill-tree-root';
            attributeTree[attribute].forEach(skill => {
                this._renderSkillNodeRecursive(skill, treeRoot, null);
            });
            attributeSubContainer.appendChild(treeRoot);
            attributeContainer.appendChild(attributeSubContainer);
        }
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
        }
    }

    async saveCharacterChanges() {
        try {
            await fetch(`http://localhost:3000/api/characters/${this.character.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.character),
                credentials: 'include'
            });
            console.log('Ficha salva no backend!');
        } catch (err) {
            console.error("Erro ao salvar ficha no backend:", err);
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
        if (!this.elementName || !this.elementData[this.elementName]) {
            document.getElementById('lore-element-title').textContent = 'Elemento não encontrado';
            document.getElementById('lore-element-text').textContent = 'O elemento especificado não foi encontrado.';
            return;
        }

        const element = this.elementData[this.elementName];
        const contentBox = document.getElementById('lore-content-box');
        const title = document.getElementById('lore-element-title');
        const divider = document.getElementById('lore-element-divider');
        const text = document.getElementById('lore-element-text');

        document.title = `${element.title} | Lore do Elemento`;
        contentBox.style.borderColor = element.color;
        title.textContent = element.title;
        title.style.color = element.color;
        divider.style.background = `linear-gradient(to right, transparent, ${element.color}, transparent)`;
        text.textContent = element.lore;
    }
}

// =================================================================================
// FUNÇÕES UTILITÁRIAS E INICIALIZAÇÃO
// =================================================================================

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
        const isAgentCreationPage = (currentPage === 'criar-agente.html' || currentPage === 'ficha-agente.html') && linkPage === 'agentes.html';

        if (isCurrentPage || isHomePage || isAgentCreationPage) {
            link.classList.add('active-link');
        }
    });
}

// Função para verificar o status de login e atualizar o header
async function checkAuthStatus() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    // Espera o header ser carregado
    while (!headerPlaceholder.querySelector('nav')) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const nav = headerPlaceholder.querySelector('nav');
    // Remove qualquer container de autenticação anterior para evitar duplicatas
    const existingAuthContainer = nav.querySelector('.auth-container');
    if (existingAuthContainer) {
        existingAuthContainer.remove();
    }

    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';

    try {
        const response = await fetch('http://localhost:3000/auth/user', { credentials: 'include' });
        
        if (response.ok) {
            const user = await response.json();
            authContainer.innerHTML = `<span class="user-info">Olá, ${user.displayName}! <a href="http://localhost:3000/auth/logout" class="auth-link">[Sair]</a></span>`;
        } else {
            authContainer.innerHTML = `<a href="http://localhost:3000/auth/google" class="login-btn auth-link">Login com Google</a>`;
        }
    } catch (error) {
        console.log('Servidor backend offline. Mostrando botão de login padrão.');
        authContainer.innerHTML = `<a href="http://localhost:3000/auth/google" class="login-btn auth-link">Login com Google</a>`;
    }
    
    nav.appendChild(authContainer);
}

// Função para carregar o header dinamicamente
async function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    try {
        const response = await fetch('/_header.html'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        headerPlaceholder.innerHTML = data;
    } catch (error) {
        console.error('Erro ao carregar o cabeçalho:', error);
        if (window.location.protocol === 'file:') {
            headerPlaceholder.innerHTML = `
                <div style="padding: 1.5rem; text-align: center; background-color: #5d1a22; color: white; border-bottom: 2px solid #dc3545;">
                    <h3 style="margin-top:0; font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem;">ERRO DE CARREGAMENTO DO MENU</h3>
                    <p style="margin-bottom:0;">O menu não pôde ser carregado. Isso ocorre ao abrir o arquivo HTML diretamente.<br>
                    <strong>Solução:</strong> No VS Code, clique com o botão direito no arquivo <strong>index.html</strong> e escolha <strong>"Open with Live Server"</strong>.</p>
                </div>`;
        } else {
            headerPlaceholder.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar o cabeçalho. Verifique o console para mais detalhes.</p>';
        }
    }
}

// Inicialização do Script quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    await loadHeader();
    updateActiveLinks();
    checkAuthStatus();

    const path = window.location.pathname;
    if (path.includes('criar-agente.html')) {
        new CharacterCreator();
    }
    if (path.includes('agentes.html')) {
        new CharacterDisplay();
    }
    if (path.includes('ficha-agente.html')) {
        new CharacterSheet();
    }
    if (path.includes('elemento-lore.html')) {
        new ElementLorePage();
    }
    if (path.includes('dev-dashboard.html')) {
        new SkillTreeEditor();
    }

    const devModeForm = document.getElementById('dev-mode-form');
    if (devModeForm) {
        devModeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('dev-mode-input');
            if (input.value === 'DEVMODE2025') {
                window.location.href = 'dev-dashboard.html';
            }
        });
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === 'true') {
        document.body.classList.add('dev-mode');
        console.log('Modo Desenvolvedor Ativado.');
    }
});
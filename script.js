/**
 * Sombras do Abismo - Script Principal
 * Contém a lógica para a criação de personagens e exibição de agentes.
 */

// =================================================================================
// CLASSE: CharacterCreator - Gerencia o assistente de criação de personagens
// =================================================================================
class CharacterCreator {
    constructor() {
        this.elementData = {
            Temporal: {
                title: 'Temporal',
                color: '#9E9E9E', // Cinza para representar o Preto de forma legível
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
        this.attributePoints = 10;
        this.baseAttributeValue = 1;
        this.currentCharacter = {
            id: `char_${Date.now()}`,
            class: '',
            element: '',
            baseAttributes: {
                vigor: this.baseAttributeValue,
                agilidade: this.baseAttributeValue,
                intelecto: this.baseAttributeValue,
                presenca: this.baseAttributeValue
            },
            status: { sanidade: 50 },
            pericias: {
                'Atletismo': 0,
                'Furtividade': 0,
                'Investigação': 0,
                'Percepção': 0,
                'Tecnologia': 0,
                'Medicina': 0,
                'Ocultismo': 0
            },            
            inventario: [],
            personalization: {},
            createdAt: new Date().toISOString()
        };

        // Mapeamento de elementos do DOM para evitar repetição de seletores
        this.elements = {
            steps: document.querySelectorAll('.full-screen-section'),
            navSteps: document.querySelectorAll('.step-item'),
            classCards: document.querySelectorAll('.class-card'),
            elementCards: document.querySelectorAll('.element-card'),
            attributePointsDisplay: document.getElementById('attribute-points'),
            attributeControls: document.querySelectorAll('.attributes-container .attribute-group'),
            skillsListContainer: document.getElementById('skills-list'),
            skillsSelectedCount: document.getElementById('skills-selected-count'),
            skillsLimit: document.getElementById('skills-limit'),
            personalizationForm: document.getElementById('personalization-form'),
            wizardButtons: {
                nextToCustomize: document.getElementById('next-to-customize'),
                backToClass: document.getElementById('back-to-class'),
                backToElement: document.getElementById('back-to-element'),
                backToAttributes: document.getElementById('back-to-attributes'), // Este será o da etapa 4
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
        this.generateSkillsList();
        this.setupAttributeControls();
        this.setupSkillSelection();
        this.setupPersonalizationForm();
        this.setupWizardButtons();
        this.restoreFormData(); // Restaura dados ao carregar a página
        this.updateCharacterSummary();
    }

    // Navega entre as etapas do assistente
    navigateToStep(stepNumber) {
        this.currentStep = stepNumber;
        this.elements.steps.forEach(step => step.classList.remove('active-section'));
        const nextStepElement = document.getElementById(`step-${stepNumber}`);
        if (nextStepElement) {
            nextStepElement.classList.add('active-section');
        }

        // Atualiza a navegação de passos em todos os cabeçalhos de etapa
        this.elements.navSteps.forEach(nav => {
            nav.classList.remove('active');
            if (nav.id.includes(`nav-step-${stepNumber}`)) {
                nav.classList.add('active');
            }
        });
        this.saveFormData();
    }

    // Configura a seleção de classe
    setupClassSelection() {
        this.elements.classCards.forEach(card => {
            card.addEventListener('click', () => {
                this.elements.classCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                const selectedClass = card.dataset.class;
                this.currentCharacter.class = selectedClass;
                this.updateCharacterSummary();
                this.navigateToStep(2); // Avança para a seleção de elemento
            });
        });
    }

    // Configura a seleção de elemento
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

        // Aplica estilos e conteúdo dinâmico
        loreModal.content.style.setProperty('--element-color', element.color);
        loreModal.content.style.setProperty('--element-color-shadow', element.shadow);
        loreModal.title.textContent = element.title;
        loreModal.lore.textContent = element.lore;

        // Mostra o modal
        loreModal.overlay.classList.add('visible');

        // Configura botões do modal
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

    // Configura os botões de + e - dos atributos
    setupAttributeControls() {        
        this.elements.attributeControls.forEach(group => {
            const attribute = group.dataset.attribute;
            const valueSpan = group.querySelector('.attribute-value');
            const plusBtn = group.querySelector('.plus');
            const minusBtn = group.querySelector('.minus');

            plusBtn.addEventListener('click', () => {
                if (this.attributePoints > 0) {
                    this.attributePoints--;
                    this.currentCharacter.baseAttributes[attribute]++;
                    this.updateAttributeDisplay();
                }
            });

            minusBtn.addEventListener('click', () => {
                if (this.currentCharacter.baseAttributes[attribute] > this.baseAttributeValue) {
                    this.attributePoints++;
                    this.currentCharacter.baseAttributes[attribute]--;
                    this.updateAttributeDisplay();
                }
            });
        });
        this.updateAttributeDisplay();
    }

    updateAttributeDisplay() {
        if (!this.elements.attributePointsDisplay) return;
        this.elements.attributePointsDisplay.textContent = this.attributePoints;

        this.elements.attributeControls.forEach(group => {
            const attribute = group.dataset.attribute;
            const valueSpan = group.querySelector('.attribute-value');
            const plusBtn = group.querySelector('.plus');
            const minusBtn = group.querySelector('.minus');

            valueSpan.textContent = this.currentCharacter.baseAttributes[attribute];
            plusBtn.disabled = this.attributePoints === 0;
            minusBtn.disabled = this.currentCharacter.baseAttributes[attribute] === this.baseAttributeValue;
        });

        this.updateSkillAllowance();
        this.updateCharacterSummary();
        this.saveFormData();
    }

    generateSkillsList() {
        if (!this.elements.skillsListContainer) return;
        const skills = Object.keys(this.currentCharacter.pericias);
        this.elements.skillsListContainer.innerHTML = '';
        skills.forEach(skill => {
            const li = document.createElement('li');
            li.innerHTML = `
                <label>
                    <input type="checkbox" data-skill="${skill}">
                    <span>${skill}</span>
                </label>
            `;
            this.elements.skillsListContainer.appendChild(li);
        });
    }

    setupSkillSelection() {
        if (!this.elements.skillsListContainer) return;
        this.elements.skillsListContainer.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const skill = e.target.dataset.skill;
                this.currentCharacter.pericias[skill] = e.target.checked ? 1 : 0; // 1 para treinado, 0 para não
                this.updateSkillAllowance();
                this.updateCharacterSummary();
                this.saveFormData();
            }
        });
    }

    updateSkillAllowance() {
        if (!this.elements.skillsLimit) return;
        const intelecto = this.currentCharacter.baseAttributes.intelecto;
        const selectedSkills = Object.values(this.currentCharacter.pericias).filter(v => v > 0).length;

        this.elements.skillsLimit.textContent = intelecto;
        this.elements.skillsSelectedCount.textContent = selectedSkills;

        const checkboxes = this.elements.skillsListContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const label = checkbox.parentElement;
            if (!checkbox.checked && selectedSkills >= intelecto) {
                checkbox.disabled = true;
                label.classList.add('disabled');
            } else {
                checkbox.disabled = false;
                label.classList.remove('disabled');
            }
        });
    }
    
    // Configura o formulário de personalização
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

    // Configura os botões de navegação do assistente (Voltar/Próximo)
    setupWizardButtons() {
        const { wizardButtons, navSteps } = this.elements;

        // Botões de navegação
        wizardButtons.nextToCustomize?.addEventListener('click', () => this.navigateToStep(4));
        wizardButtons.backToClass?.addEventListener('click', () => this.navigateToStep(1));
        wizardButtons.backToElement?.addEventListener('click', () => this.navigateToStep(2));
        wizardButtons.backToAttributes?.addEventListener('click', () => this.navigateToStep(3));
        wizardButtons.finish?.addEventListener('click', () => this.saveCharacter());

        // Permite navegação livre clicando nos indicadores de passo
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

    // Atualiza o resumo do personagem na etapa de personalização
    updateCharacterSummary() {
        const summaryContainer = document.getElementById('character-summary-container');
        if (!summaryContainer) return;

        const { class: charClass, element, baseAttributes, personalization } = this.currentCharacter;
        summaryContainer.innerHTML = `
            <div class="summary-item"><strong>Nome:</strong> ${personalization.name || '...'}</div>
            <div class="summary-item"><strong>Jogador:</strong> ${personalization.player || '...'}</div>
            <div class="summary-item"><strong>Classe:</strong> ${charClass || 'Não definida'}</div>
            <div class="summary-item"><strong>Elemento:</strong> ${element || 'Não definido'}</div>
            <div class="summary-item"><strong>Atributos:</strong> VIG: ${baseAttributes.vigor} | AGI: ${baseAttributes.agilidade} | INT: ${baseAttributes.intelecto} | PRE: ${baseAttributes.presenca}</div>
        `;
    }

    // Salva os dados do formulário no sessionStorage para persistir entre as etapas
    saveFormData() {
        sessionStorage.setItem('character-in-progress', JSON.stringify(this.currentCharacter));
    }

    // Restaura os dados do formulário do sessionStorage
    restoreFormData() {
        const savedData = sessionStorage.getItem('character-in-progress');
        if (savedData) {
            this.currentCharacter = JSON.parse(savedData);

            // Restaura a classe selecionada
            if (this.currentCharacter.class) {
                this.elements.classCards.forEach(card => {
                    if (card.dataset.class === this.currentCharacter.class) {
                        card.classList.add('active');
                    }
                });
            }

            // Restaura os pontos de atributo
            const usedPoints = Object.values(this.currentCharacter.baseAttributes).reduce((sum, val) => sum + (val - this.baseAttributeValue), 0);
            this.attributePoints = 10 - usedPoints;
            this.updateAttributeDisplay();

            // Restaura as perícias
            if (this.elements.skillsListContainer) {
                const checkboxes = this.elements.skillsListContainer.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    if (this.currentCharacter.pericias && this.currentCharacter.pericias[cb.dataset.skill]) {
                        cb.checked = this.currentCharacter.pericias[cb.dataset.skill] > 0;
                    }
                });
                this.updateSkillAllowance();
            }
            
            // Restaura o formulário de personalização
            if (this.elements.personalizationForm) {
                for (const key in this.currentCharacter.personalization) {
                    const input = this.elements.personalizationForm.elements[key];
                    if (input) {
                        input.value = this.currentCharacter.personalization[key];
                    }
                }
            }
        }
    }

    // Limpa os dados do sessionStorage
    clearFormData() {
        // Limpa apenas a chave do criador, mantendo a do elemento temporariamente se necessário
        sessionStorage.removeItem('character-in-progress'); 
    }

    // Salva o personagem finalizado no localStorage
    saveCharacter() {
        const { name, player } = this.currentCharacter.personalization;
        if (!name || !player) { // Validação
            alert('Por favor, preencha os campos obrigatórios (Nome do Agente e Nome do Jogador) para finalizar.');
            return;
        }

        // Define os atributos base com base na classe escolhida
        const baseStats = {
            'Artilheiro': { hp: 12, defense: 2, pa: 3 },
            'Colosso':    { hp: 20, defense: 5, pa: 3 },
            'Arcanista':  { hp: 10, defense: 1, pa: 5 },
            'Laminante':  { hp: 15, defense: 3, pa: 3 }
        };
        const agi = this.currentCharacter.baseAttributes.agilidade;

        this.currentCharacter.classStats = baseStats[this.currentCharacter.class] || { hp: 10, defense: 1, pa: 3 };
        this.currentCharacter.status = { 
            hp_current: this.currentCharacter.classStats.hp, hp_max: this.currentCharacter.classStats.hp, 
            sanity_current: 50, sanity_max: 50,
            pa_current: this.currentCharacter.classStats.pa, pa_max: this.currentCharacter.classStats.pa
        };
        this.currentCharacter.deslocamento = 10 + agi;
        this.currentCharacter.nfm = 0;

        let existingCharacters = [];
        try {
            const storedData = localStorage.getItem('sombras-characters');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                if (Array.isArray(parsedData)) {
                    existingCharacters = parsedData;
                }
            }
        } catch (error) {
            console.error('Erro ao ler personagens existentes do localStorage. Os dados podem estar corrompidos e serão sobrescritos.', error);
            // Se houver erro, começamos com um array vazio, limpando os dados corrompidos.
        }

        existingCharacters.push(this.currentCharacter);
        localStorage.setItem('sombras-characters', JSON.stringify(existingCharacters));

        this.clearFormData();
        window.location.href = 'agentes.html'; // Redireciona diretamente
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

    loadCharacters() {
        let characters = [];
        try {
            const storedData = localStorage.getItem('sombras-characters');
            if (storedData) {
                characters = JSON.parse(storedData);
                // Garante que o dado salvo é um array. Se não for, o trata como vazio.
                if (!Array.isArray(characters)) {
                    characters = [];
                }
            }
        } catch (error) {
            console.error('Erro ao carregar personagens do localStorage. O dado pode estar corrompido.', error);
            characters = []; // Em caso de erro, começa com uma lista vazia.
            localStorage.removeItem('sombras-characters'); // Limpa os dados corrompidos para evitar erros futuros.
        }
        this.renderCharacters(characters);
    }

    renderCharacters(characters) {
        if (!this.container) return;

        const emptyMessage = this.container.querySelector('.empty-message');
        if (characters.length === 0) {
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        if (emptyMessage) emptyMessage.style.display = 'none';

        // Cria um grid se não existir
        let grid = this.container.querySelector('.characters-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'characters-grid';
            this.container.appendChild(grid);
        }
        grid.innerHTML = ''; // Limpa o grid antes de renderizar

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

        // --- CORREÇÃO: Adiciona checagens para evitar erros com dados antigos/incompletos ---
        // Define valores padrão caso as propriedades não existam no objeto 'character'
        const p = character.personalization || {};
        const attrs = character.baseAttributes || { vigor: '?', agilidade: '?', intelecto: '?', presenca: '?' };
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
                    <span class="attr-icon">💪</span>
                    <span>${attrs.vigor} VIG</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon">🤸</span>
                    <span>${attrs.agilidade} AGI</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon">🧠</span>
                    <span>${attrs.intelecto} INT</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon">🗣️</span>
                    <span>${attrs.presenca} PRE</span>
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

    deleteCharacter(characterId) {
        if (confirm('Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.')) {
            let characters = JSON.parse(localStorage.getItem('sombras-characters')) || [];
            characters = characters.filter(char => char.id !== characterId);
            localStorage.setItem('sombras-characters', JSON.stringify(characters));
            this.loadCharacters(); // Recarrega e renderiza a lista atualizada
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
        this.characters = [];
        this.loadCharacter();
        if (this.character) {
            this.renderSheet();
            this.setupEventListeners();
        }
    }

    loadCharacter() {
        const params = new URLSearchParams(window.location.search);
        const charId = params.get('id');
        if (!charId) {
            document.getElementById('character-not-found').style.display = 'block';
            return;
        }

        this.characters = JSON.parse(localStorage.getItem('sombras-characters')) || [];
        this.character = this.characters.find(char => char.id === charId);

        if (!this.character) {
            document.getElementById('character-not-found').style.display = 'block';
        }
    }

    renderSheet() { // Totalmente reescrito para o novo layout
        // Defensive check for character
        if (!this.character) return;

        // Use default empty objects to prevent errors if data is missing
        const { 
            baseAttributes = {}, 
            classStats = { hp: 'N/A', defense: 'N/A', pa: 'N/A' }, 
            personalization = {}, 
            status = { hp_current: 'N/A', hp_max: 'N/A', sanity_current: 'N/A', sanity_max: 'N/A' },
            pericias = {}, 
            inventario = [] 
        } = this.character;

        // Header
        const sheetContainer = document.getElementById('sheet-container');
        const header = document.querySelector('.sheet-header');
        sheetContainer.classList.remove('temporal', 'cerebral', 'visceral', 'vital');
        if (this.character.element) {
            const elementClass = this.character.element.toLowerCase();
            sheetContainer.classList.add(elementClass);
        }
        header.querySelector('h2').textContent = personalization.name || 'Agente Sem Nome';
        header.querySelector('p').textContent = `${this.character.class || 'Classe'} | Jogador: ${personalization.player || 'N/A'}`;
        document.title = `${personalization.name || 'Agente'} | Ficha de Agente`;

        // Atributos Primários
        document.getElementById('sheet-vigor').textContent = baseAttributes.vigor || '-';
        document.getElementById('sheet-agilidade').textContent = baseAttributes.agilidade || '-';
        document.getElementById('sheet-intelecto').textContent = baseAttributes.intelecto || '-';
        document.getElementById('sheet-presenca').textContent = baseAttributes.presenca || '-';

        // Atributos Secundários
        document.getElementById('sheet-nfm').textContent = `${this.character.nfm || 0}%`;
        document.getElementById('sheet-pa').textContent = status.pa_max || classStats.pa || '--';
        document.getElementById('sheet-deslocamento').textContent = `${this.character.deslocamento || '--'} m`;

        // Barras de Status
        this.updateBar('hp', status.hp_current, status.hp_max);
        this.updateBar('sanity', status.sanity_current, status.sanity_max);
        this.updateBar('pa', status.pa_current, status.pa_max);

        // Defesa
        document.getElementById('sheet-defense').textContent = classStats.defense || '--';

        // Resistências e Proficiências (placeholders)
        document.getElementById('sheet-protection').textContent = this.character.protection || 0;
        document.getElementById('sheet-res-balistica').textContent = this.character.resBalistica || 0;
        document.getElementById('sheet-res-corte').textContent = this.character.resCorte || 0;
        document.getElementById('sheet-res-paranormal').textContent = this.character.resParanormal || 0;
        document.getElementById('sheet-proficiencies').textContent = this.character.proficiencies || 'Armas simples.';
        
        // Renderiza Painel de Perícias Interativo
        this.renderSkillsPanel();

        // Renderiza Painel de Ações (Direita)
        this.renderActionsPanel();

        document.getElementById('sheet-container').style.display = 'block';
    }

    renderSkillsPanel() {
        const skillsList = document.getElementById('sheet-skills-list');
        skillsList.innerHTML = '';
        if (this.character.pericias) {
            for (const skillName in this.character.pericias) {
                const skillValue = this.character.pericias[skillName];
                if (skillValue > 0) { // Só mostra perícias treinadas
                    const skillElement = document.createElement('div');
                    skillElement.className = 'interactive-skill-item';
                    skillElement.dataset.skill = skillName;
                    skillElement.innerHTML = `
                        <span class="skill-name">${skillName}</span>
                        <div class="skill-controls">
                            <button class="skill-btn minus" title="Diminuir bônus">-</button>
                            <span class="skill-bonus">${skillValue}</span>
                            <button class="skill-btn plus" title="Aumentar bônus">+</button>
                        </div>
                        <button class="skill-roll-btn">Rolar d20</button>
                    `;
                    skillsList.appendChild(skillElement);
                }
            }
        }
    }

    renderActionsPanel() {
        // Inventário
        const inventoryList = document.getElementById('sheet-inventory-list');
        inventoryList.innerHTML = '';
        if (this.character.inventario && this.character.inventario.length > 0) {
            this.character.inventario.forEach((item, index) => {
                inventoryList.appendChild(this.createInventoryItem(item, index));
            });
        } else {
            inventoryList.innerHTML = '<li><p>Nenhum item no inventário.</p></li>';
        }

        // Detalhes e Origem (agora em textareas)
        const p = this.character.personalization || {};
        document.getElementById('sheet-appearance').value = p.appearance || '';
        document.getElementById('sheet-history').value = p.history || '';
        document.getElementById('sheet-motivation').value = p.motivation || '';
    }

    updateBar(type, current, max) {
        const fill = document.getElementById(`${type}-bar-fill`);
        const text = document.getElementById(`${type}-value-text`);
        if (!fill || !text) return;
        const percentage = max > 0 ? (current / max) * 100 : 0;
        fill.style.width = `${percentage}%`;
        text.textContent = `${current}/${max}`;
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

    setupEventListeners() { // Totalmente reescrito para os novos elementos
        // Acordion
        document.querySelector('.actions-accordion').addEventListener('click', (e) => {
            if (e.target.classList.contains('accordion-header')) {
                const currentPanel = e.target.closest('.accordion-panel');
                
                // Fecha outros painéis abertos
                document.querySelectorAll('.actions-accordion .accordion-panel.active').forEach(activePanel => {
                    if (activePanel !== currentPanel) {
                        activePanel.classList.remove('active');
                    }
                });
                // Alterna o painel clicado
                currentPanel.classList.toggle('active');
            }
        });

        // Painel de Perícias (delegação de eventos)
        document.getElementById('sheet-skills-list').addEventListener('click', (e) => {
            const skillItem = e.target.closest('.interactive-skill-item');
            if (!skillItem) return;
            const skillName = skillItem.dataset.skill;

            if (e.target.classList.contains('plus')) {
                this.character.pericias[skillName]++;
                this.saveCharacterChanges();
                this.renderSkillsPanel();
            } else if (e.target.classList.contains('minus')) {
                if (this.character.pericias[skillName] > 1) {
                    this.character.pericias[skillName]--;
                    this.saveCharacterChanges();
                    this.renderSkillsPanel();
                }
            } else if (e.target.classList.contains('skill-roll-btn')) {
                const bonus = this.character.pericias[skillName];
                this.rollDice(20, 1, bonus, skillName);
            }
        });

        // Salvar detalhes e origem
        document.getElementById('sheet-appearance').addEventListener('blur', (e) => this.updatePersonalization('appearance', e.target.value));
        document.getElementById('sheet-history').addEventListener('blur', (e) => this.updatePersonalization('history', e.target.value));
        document.getElementById('sheet-motivation').addEventListener('blur', (e) => this.updatePersonalization('motivation', e.target.value));

        // Rolagem de dados genérica
        document.getElementById('dice-roller-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const count = parseInt(document.getElementById('dice-count').value, 10);
            const type = parseInt(document.getElementById('dice-type').value, 10);
            const bonus = parseInt(document.getElementById('dice-bonus').value, 10);
            this.rollDice(type, count, bonus, "Rolagem Manual");
        });

        // Salvar notas (movido para cá)
        const notesTextarea = document.getElementById('sheet-notes');
        if (notesTextarea) notesTextarea.addEventListener('blur', (e) => {
            this.character.notes = e.target.value; // Supondo que 'notas' esteja na raiz do objeto de personagem
            this.saveCharacterChanges();
        });

        // Gerenciar inventário
        const inventoryList = document.getElementById('sheet-inventory-list');
        document.getElementById('add-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('add-item-input');
            const newItem = input.value.trim();
            if (newItem) {
                if (!this.character.inventario) this.character.inventario = [];
                this.character.inventario.push(newItem);
                this.saveCharacterChanges();
                this.renderSheet(); // Re-render para mostrar o novo item
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
        }, true); // Use capture para pegar o evento de blur
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
        this.character.status[key] = parseInt(value, 10);
        this.renderSheet(); // Re-renderiza para atualizar a barra
        this.saveCharacterChanges();
    }

    saveCharacterChanges() {
        const charIndex = this.characters.findIndex(char => char.id === this.character.id);
        if (charIndex > -1) {
            this.characters[charIndex] = this.character;
            localStorage.setItem('sombras-characters', JSON.stringify(this.characters));
            console.log('Ficha salva!');
        }
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
});

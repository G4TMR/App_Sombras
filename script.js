/**
 * Sombras do Abismo - Script Principal
 * Contém a lógica para a criação de personagens e exibição de agentes.
 */

// =================================================================================
// CLASSE: CharacterCreator - Gerencia o assistente de criação de personagens
// =================================================================================
class CharacterCreator {
    constructor() {
        this.currentStep = 1;
        this.attributePoints = 10;
        this.baseAttributeValue = 1;
        this.currentCharacter = {
            id: `char_${Date.now()}`,
            class: '',
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
            attributePointsDisplay: document.getElementById('attribute-points'),
            attributeControls: document.querySelectorAll('.attributes-container .attribute-group'),
            skillsListContainer: document.getElementById('skills-list'),
            skillsSelectedCount: document.getElementById('skills-selected-count'),
            skillsLimit: document.getElementById('skills-limit'),
            personalizationForm: document.getElementById('personalization-form'),
            wizardButtons: {
                nextToAttributes: document.querySelector('.class-card'), // Qualquer card serve para o evento
                nextToCustomize: document.getElementById('next-to-customize'),
                backToClass: document.getElementById('back-to-class'),
                backToAttributes: document.getElementById('back-to-attributes'),
                finish: document.getElementById('finish-wizard')
            }
        };

        this.initialize();
    }

    initialize() {
        if (!document.getElementById('step-1')) return; // Garante que o código só rode na página certa
        this.setupClassSelection();
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

                // Define os atributos base com base na classe escolhida
                const baseStats = {
                    'Artilheiro': { hp: 12, defense: 2, pa: 3 },
                    'Colosso':    { hp: 20, defense: 5, pa: 3 },
                    'Arcanista':  { hp: 10, defense: 1, pa: 5 }, // Exemplo de bônus de classe
                    'Laminante':  { hp: 15, defense: 3, pa: 3 }
                };

                this.currentCharacter.classStats = baseStats[selectedClass] || { hp: 10, defense: 1, pa: 3 };
                this.updateCharacterSummary();
                this.navigateToStep(2);
            });
        });
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

        wizardButtons.nextToCustomize?.addEventListener('click', () => this.navigateToStep(3));
        wizardButtons.backToClass?.addEventListener('click', () => this.navigateToStep(1));
        wizardButtons.backToAttributes?.addEventListener('click', () => this.navigateToStep(2));
        wizardButtons.finish?.addEventListener('click', () => this.saveCharacter());

        // Permite navegação clicando nos indicadores de passo
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

        const { class: charClass, baseAttributes, personalization } = this.currentCharacter;
        summaryContainer.innerHTML = `
            <div class="summary-item"><strong>Nome:</strong> ${personalization.name || '...'}</div>
            <div class="summary-item"><strong>Jogador:</strong> ${personalization.player || '...'}</div>
            <div class="summary-item"><strong>Classe:</strong> ${charClass || 'Não definida'}</div>
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
        sessionStorage.removeItem('character-in-progress');
    }

    // Salva o personagem finalizado no localStorage
    saveCharacter() {
        const { name, player } = this.currentCharacter.personalization;
        if (!name || !player) { // Validação
            alert('Por favor, preencha os campos obrigatórios (Nome do Agente e Nome do Jogador) para finalizar.');
            return;
        }

        const existingCharacters = JSON.parse(localStorage.getItem('sombras-characters')) || [];
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
        const characters = JSON.parse(localStorage.getItem('sombras-characters')) || [];
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
        card.dataset.id = character.id;

        const creationDate = new Date(character.createdAt).toLocaleDateString('pt-BR');

        card.innerHTML = `
            <div class="character-header">
                <h3>${character.personalization.name || 'Agente Sem Nome'}</h3>
                <span class="character-class">${character.class}</span>
            </div>
            <div class="character-info">
                <p><strong>Profissão:</strong> ${character.personalization.profession || 'Não informado'}</p>
            </div>
            <div class="character-attributes">
                <div class="attr-item">
                    <span class="attr-icon">💪</span>
                    <span>${character.baseAttributes.vigor} VIG</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon">🤸</span>
                    <span>${character.baseAttributes.agilidade} AGI</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon">🧠</span>
                    <span>${character.baseAttributes.intelecto} INT</span>
                </div>
                <div class="attr-item">
                    <span class="attr-icon">🗣️</span>
                    <span>${character.baseAttributes.presenca} PRE</span>
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
        this.character = null;
        this.loadCharacter();
        if (this.character) {
            this.renderSheet();
        }
    }

    loadCharacter() {
        const params = new URLSearchParams(window.location.search);
        const charId = params.get('id');
        if (!charId) {
            document.getElementById('character-not-found').style.display = 'block';
            return;
        }

        const characters = JSON.parse(localStorage.getItem('sombras-characters')) || [];
        this.character = characters.find(char => char.id === charId);

        if (!this.character) {
            document.getElementById('character-not-found').style.display = 'block';
        }
    }

    renderSheet() {
        // Defensive check for character
        if (!this.character) return;

        // Use default empty objects to prevent errors if data is missing
        const { 
            baseAttributes = {}, 
            classStats = { hp: 'N/A', defense: 'N/A', pa: 'N/A' }, 
            personalization = {}, 
            status = { sanidade: 'N/A' }, 
            pericias = {}, 
            inventario = [] 
        } = this.character;

        // Header
        document.getElementById('sheet-char-name').textContent = personalization.name || 'Agente Sem Nome';
        document.getElementById('sheet-char-class-player').textContent = `${this.character.class || 'Classe'} | Jogador: ${personalization.player || 'N/A'}`;
        document.title = `${personalization.name || 'Agente'} | Ficha de Agente`;

        // Atributos (agora combinando base + classe)
        document.getElementById('sheet-hp').textContent = `${classStats.hp}/${classStats.hp}`;
        document.getElementById('sheet-sanity').textContent = `${status.sanidade}/${status.sanidade}`;
        document.getElementById('sheet-defense').textContent = classStats.defense;
        document.getElementById('sheet-pa').textContent = classStats.pa;

        // Perícias
        const skillsList = document.getElementById('sheet-skills-list');
        skillsList.innerHTML = '';
        if (pericias) {
            const trainedSkills = Object.keys(pericias).filter(skill => pericias[skill] > 0);
            if (trainedSkills.length > 0) {
                trainedSkills.forEach(skill => {
                    const li = document.createElement('li');
                    li.innerHTML = `<span>${skill}</span> <strong>+${pericias[skill]}</strong>`;
                    skillsList.appendChild(li);
                });
            } else {
                skillsList.innerHTML = '<li><p>Nenhuma perícia treinada.</p></li>';
            }
        }

        // Inventário
        const inventoryList = document.getElementById('sheet-inventory-list');
        inventoryList.innerHTML = '';
        if (inventario && inventario.length > 0) {
            inventario.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                inventoryList.appendChild(li);
            });
        } else {
            inventoryList.innerHTML = '<li><p>Nenhum item no inventário.</p></li>';
        }

        // Detalhes
        document.getElementById('sheet-appearance').textContent = personalization.appearance || 'Não descrito.';
        document.getElementById('sheet-history').textContent = personalization.history || 'Não descrita.';
        document.getElementById('sheet-motivation').textContent = personalization.motivation || 'Não descrito.';

        document.getElementById('sheet-container').style.display = 'block';
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
        const isHomePage = (currentPage === '' || currentPage === 'index.html') && (linkPage === 'home.html' || linkPage === 'index.html');
        const isAgentCreationPage = currentPage === 'criar-agente.html' && linkPage === 'agentes.html';

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

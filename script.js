// Estado do Personagem
let characterState = {
    nf: 0,
    selectedSpecialization: null // null significa que ainda não escolheu
};

// Configurações
const NF_REQUIRED = 5;

// Elementos do DOM
const nfDisplay = document.getElementById('nf-display');
const skillCards = document.querySelectorAll('.skill-card');
const btnLevelUp = document.getElementById('btn-levelup');
const btnReset = document.getElementById('btn-reset');

// Função Principal: Atualiza a Interface baseada no Estado
function updateUI() {
    // Atualiza texto do NF
    nfDisplay.textContent = characterState.nf;

    skillCards.forEach(card => {
        const cardId = card.getAttribute('data-id');

        // Remove todas as classes de estado para recalcular
        card.classList.remove('locked', 'available', 'selected', 'discarded');

        // Lógica de Estados
        if (characterState.selectedSpecialization) {
            // CASO 1: Já escolheu uma especialização
            if (characterState.selectedSpecialization === cardId) {
                card.classList.add('selected');
            } else {
                card.classList.add('discarded');
            }
        } else {
            // CASO 2: Ainda não escolheu
            if (characterState.nf >= NF_REQUIRED) {
                card.classList.add('available');
            } else {
                card.classList.add('locked');
            }
        }
    });
}

// Evento de Clique nos Botões de Selecionar
document.querySelectorAll('.btn-choose').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Encontra a carta pai do botão clicado
        const card = btn.closest('.skill-card');
        const cardId = card.getAttribute('data-id');

        // Só permite ação se:
        // 1. Tiver NF suficiente
        // 2. Ainda não tiver escolhido nada
        if (characterState.nf >= NF_REQUIRED && !characterState.selectedSpecialization) {
            
            // Confirmação simples (opcional)
            const confirmChoice = confirm("Deseja seguir este caminho? As outras opções serão perdidas.");
            
            if (confirmChoice) {
                characterState.selectedSpecialization = cardId;
                updateUI();
            }
        }
    });
});

// Controles de Teste
btnLevelUp.addEventListener('click', () => {
    characterState.nf += 5;
    updateUI();
});

btnReset.addEventListener('click', () => {
    characterState.nf = 0;
    characterState.selectedSpecialization = null;
    updateUI();
});

// Inicialização
updateUI();
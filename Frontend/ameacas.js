document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('threat-modal');
    const closeModalButton = document.querySelector('.close-button');
    const modalContent = document.getElementById('threat-sheet-content');

    // Função para buscar as ameaças usando a instância global do Axios
    const fetchThreats = async () => {
        try {
            // A instância 'api' já está configurada no script.js para lidar com a URL base e autenticação
            const response = await api.get('/api/threats');
            const threats = response.data;
            displayThreats(threats);

        } catch (error) {
            console.error('Erro ao carregar ameaças:', error);
            // O interceptor do Axios no script.js já deve lidar com erros 401 (não autorizado)
            // Exibe uma mensagem de erro genérica no container principal
            const container = document.querySelector('.threats-container');
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h2 style="color: var(--color-danger);">Erro ao Carregar Ameaças</h2>
                        <p class="info-text">Não foi possível conectar ao bestiário. Verifique sua conexão ou tente novamente mais tarde.</p>
                    </div>
                `;
            }
        }
    };

    const displayThreats = (threats) => {
        // Limpa as seções antes de adicionar novo conteúdo
        document.querySelectorAll('.threat-grid').forEach(grid => grid.innerHTML = '');

        threats.forEach(threat => {
            const threatCard = `
                <div class="threat-card" data-threat-id="${threat._id}">
                    <h3>${threat.name}</h3>
                    <p>${threat.lore_short || 'Descrição indisponível.'}</p>
                </div>
            `;

            // CORREÇÃO: Garante que a ameaça tenha um elemento antes de tentar exibi-la.
            if (threat.element) {
                // Converte o nome do elemento para minúsculas para corresponder ao ID do HTML
                const elementId = `threats-${threat.element.toLowerCase()}`;
                const grid = document.querySelector(`#${elementId} .threat-grid`);
                if (grid) {
                    grid.innerHTML += threatCard;
                }
            }
        });
        
        // Adiciona os event listeners aos cards recém-criados
        document.querySelectorAll('.threat-card').forEach(card => {
            card.addEventListener('click', () => {
                const threatId = card.dataset.threatId;
                const selectedThreat = threats.find(t => t._id === threatId);
                if (selectedThreat) {
                    openThreatModal(selectedThreat);
                }
            });
        });
    };

    const openThreatModal = (threat) => {
        const abilitiesHtml = threat.abilities && threat.abilities.length > 0 
            ? threat.abilities.map(ability => `
            <li><strong>${ability.name}:</strong> ${ability.description}</li>
            `).join('')
            : '<li>Nenhuma habilidade especial registrada.</li>';

        const sheetHtml = `
            <h2>${threat.name}</h2>

            <div class="threat-sheet-section">
                <h3>Descrição & Comportamento</h3>
                <p>${threat.lore || 'Lore desconhecido.'}</p>
            </div>

            <div class="threat-sheet-section">
                <h3>Habilidades e Poderes</h3>
                <ul class="threat-sheet-abilities">
                    ${abilitiesHtml}
                </ul>
            </div>
        `;

        // Limpa classes de elemento anteriores e define a cor do elemento atual no modal
        modal.classList.remove('temporal-modal', 'cerebral-modal', 'visceral-modal', 'vital-modal');
        if (threat.element) {
            const elementClass = `${threat.element.toLowerCase()}-modal`;
            modal.classList.add(elementClass);
        }

        modalContent.innerHTML = sheetHtml;
        modal.classList.add('show'); // Adiciona a classe para ativar a animação de fade-in
    };

    const closeThreatModal = () => {
        modal.classList.remove('show'); // Remove a classe para o fade-out
    };

    // Eventos para fechar o modal
    closeModalButton.addEventListener('click', closeThreatModal);
    window.onclick = (event) => {
        if (event.target == modal) {
            closeThreatModal();
        }
    };

    // Inicia o processo de busca e exibição das ameaças
    fetchThreats();
});
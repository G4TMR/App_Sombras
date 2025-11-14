document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000'; // Mude para a URL do seu backend em produção

    const modal = document.getElementById('threat-modal');
    const closeModalButton = document.querySelector('.close-button');
    const modalContent = document.getElementById('threat-sheet-content');

    const fetchThreats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/threats`, {
                credentials: 'include' // Essencial para enviar o cookie de sessão
            });

            if (response.status === 401) {
                // Se não estiver autenticado, redireciona para a home
                window.location.href = '/Home.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Falha ao carregar as ameaças.');
            }

            const threats = await response.json();
            displayThreats(threats);

        } catch (error) {
            console.error('Erro:', error);
            // Opcional: mostrar uma mensagem de erro na tela
        }
    };

    const displayThreats = (threats) => {
        // Limpa as seções antes de adicionar novo conteúdo
        document.querySelector('#threats-conhecimento .threat-grid').innerHTML = '';
        document.querySelector('#threats-morte .threat-grid').innerHTML = '';
        document.querySelector('#threats-sangue .threat-grid').innerHTML = '';
        document.querySelector('#threats-energia .threat-grid').innerHTML = '';

        threats.forEach(threat => {
            const threatCard = `
                <div class="threat-card" data-threat-id="${threat._id}">
                    <div class="threat-card-image">
                        <img src="${threat.imageUrl || 'placeholder.png'}" alt="Imagem de ${threat.name}">
                    </div>
                    <div class="threat-card-body">
                        <h3>${threat.name}</h3>
                        <p>${threat.lore_short}</p>
                    </div>
                    <button class="threat-card-button">Ver Ficha</button>
                </div>
            `;

            const elementId = `threats-${threat.element.toLowerCase()}`;
            const grid = document.querySelector(`#${elementId} .threat-grid`);
            if (grid) {
                grid.innerHTML += threatCard;
            }
        });

        // Adiciona os event listeners aos botões recém-criados
        document.querySelectorAll('.threat-card-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.threat-card');
                const threatId = card.dataset.threatId;
                const selectedThreat = threats.find(t => t._id === threatId);
                if (selectedThreat) {
                    openThreatModal(selectedThreat);
                }
            });
        });
    };

    const openThreatModal = (threat) => {
        const abilitiesHtml = threat.abilities.map(ability => `
            <li><strong>${ability.name}:</strong> ${ability.description}</li>
        `).join('');

        const sheetHtml = `
            <div class="threat-sheet-header">
                <div class="threat-sheet-image">
                    <img src="${threat.imageUrl || 'placeholder.png'}" alt="Imagem de ${threat.name}">
                </div>
                <div class="threat-sheet-info">
                    <h2>${threat.name}</h2>
                    <span class="element-tag">${threat.element}</span>
                    <p><strong>Dificuldade:</strong> ${threat.stats.difficulty}</p>
                </div>
            </div>

            <div class="threat-sheet-section">
                <h3>Lore</h3>
                <p>${threat.lore}</p>
            </div>

            <div class="threat-sheet-section">
                <h3>Habilidades e Poderes</h3>
                <ul class="threat-sheet-abilities">
                    ${abilitiesHtml}
                </ul>
            </div>

            <div class="threat-sheet-section">
                <h3>Notas do Mestre</h3>
                <p>${threat.stats.notes || 'Nenhuma nota adicional.'}</p>
            </div>
        `;

        modalContent.innerHTML = sheetHtml;
        modal.style.display = 'block';
    };

    // Fechar o modal
    closeModalButton.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Inicia o processo
    fetchThreats();
});
const skillTrees = {
  belico: {
    className: "Bélico",
    description: "Especialistas em combate, seja com armas de fogo, lâminas ou os próprios punhos. São a linha de frente contra as sombras.",
    icon: "⚔️",
    position: { x: 50, y: 50 }, // Nó central
    specializations: [
      {
        id: "belico_colosso",
        name: "Colosso",
        description: "Focado na resistência e força bruta, um pilar inabalável no campo de batalha.",
        type: "specialization",
        icon: "🏋️",
        skills: [
          { id: "colosso_1", name: "Pele de Ferro", description: "Aumenta a defesa passiva.", type: "passive", cost: 1 },
          { id: "colosso_2", name: "Golpe Esmagador", description: "Ataque pesado que pode atordoar.", type: "active", cost: 2 },
        ]
      },
      {
        id: "belico_tropa_assalto",
        name: "Tropa de Assalto",
        description: "Especialista em táticas de invasão e combate com armas de fogo a curta e média distância.",
        type: "specialization",
        icon: "🔫",
        skills: [
          { id: "tropa_1", name: "Tiro Rápido", description: "Permite um segundo tiro com penalidade.", type: "active", cost: 2 },
          { id: "tropa_2", name: "Recarga Tática", description: "Recarrega mais rápido em cobertura.", type: "passive", cost: 1 },
        ]
      },
      {
        id: "belico_paladino",
        name: "Paladino",
        description: "Guerreiro que protege seus aliados com sua vida, usando escudos e fé para resistir ao paranormal.",
        type: "specialization",
        icon: "🛡️",
        skills: [
          { id: "paladino_1", name: "Escudo Sagrado", description: "Bloqueia dano paranormal.", type: "reaction", cost: 1 },
          { id: "paladino_2", name: "Aura Protetora", description: "Concede bônus de defesa a aliados próximos.", type: "passive", cost: 2 },
        ]
      },
      {
        id: "belico_franco_atirador",
        name: "Franco-Atirador",
        description: "Mestre da precisão a longa distância, eliminando alvos antes que se tornem uma ameaça.",
        type: "specialization",
        icon: "🎯",
        skills: [
          { id: "franco_1", name: "Mira Mortal", description: "Aumenta a chance de acerto crítico.", type: "passive", cost: 2 },
          { id: "franco_2", name: "Tiro Perfurante", description: "Ignora parte da armadura do alvo.", type: "active", cost: 2 },
        ]
      },
      {
        id: "belico_duelista",
        name: "Duelista",
        description: "Especialista em combate com lâminas, focado em agilidade, aparar e contra-atacar.",
        type: "specialization",
        icon: "🤺",
        skills: [
          { id: "duelista_1", name: "Ripostar", description: "Contra-ataca após uma defesa bem-sucedida.", type: "reaction", cost: 1 },
          { id: "duelista_2", name: "Dança das Lâminas", description: "Aumenta a esquiva em combate corpo a corpo.", type: "passive", cost: 2 },
        ]
      }
    ]
  },
  esoterico: {
    className: "Esotérico",
    description: "Manipuladores de energia e matéria, que usam o poder dos elementos para enfrentar o abismo.",
    icon: "🔮",
    position: { x: 50, y: 50 },
    specializations: [
      {
        id: "esoterico_alquimista",
        name: "Alquimista",
        description: "Cria poções, venenos e elixires com efeitos paranormais para alterar o campo de batalha.",
        type: "specialization",
        icon: "⚗️",
        skills: [
          { id: "alquimista_1", name: "Bomba de Fumaça", description: "Cria uma área que bloqueia a visão.", type: "active", cost: 1 },
          { id: "alquimista_2", name: "Poção Curativa", description: "Cria uma poção que restaura vida.", type: "active", cost: 2 },
        ]
      },
      {
        id: "esoterico_runico",
        name: "Rúnico",
        description: "Inscreve runas em objetos e no ambiente para criar armadilhas e efeitos duradouros.",
        type: "specialization",
        icon: "📜",
        skills: [
          { id: "runico_1", name: "Runa de Alarme", description: "Alerta quando um inimigo se aproxima.", type: "active", cost: 1 },
          { id: "runico_2", name: "Runa Explosiva", description: "Cria uma armadilha que explode.", type: "active", cost: 2 },
        ]
      },
      {
        id: "esoterico_tecelao",
        name: "Tecelão",
        description: "Manipula os fios da realidade para criar ilusões, distorções e controlar a percepção dos alvos.",
        type: "specialization",
        icon: "🕸️",
        skills: [
          { id: "tecelao_1", name: "Imagem Espelhada", description: "Cria um clone ilusório.", type: "active", cost: 2 },
          { id: "tecelao_2", name: "Manto de Sombras", description: "Aumenta a furtividade.", type: "passive", cost: 1 },
        ]
      },
      {
        id: "esoterico_astrologo",
        name: "Astrólogo",
        description: "Lê as estrelas e o cosmos para prever o futuro, amaldiçoar inimigos e abençoar aliados.",
        type: "specialization",
        icon: "🔭",
        skills: [
          { id: "astrologo_1", name: "Bênção Estelar", description: "Concede bônus em um teste.", type: "active", cost: 1 },
          { id: "astrologo_2", name: "Maldição Cósmica", description: "Aplica penalidade a um inimigo.", type: "active", cost: 2 },
        ]
      },
      {
        id: "esoterico_ceifador",
        name: "Ceifador",
        description: "Manipula a energia da vida e da morte, drenando inimigos e fortalecendo-se com a essência roubada.",
        type: "specialization",
        icon: "💀",
        skills: [
          { id: "ceifador_1", name: "Toque Vampírico", description: "Drena vida de um alvo.", type: "active", cost: 2 },
          { id: "ceifador_2", name: "Pacto de Sangue", description: "Sacrifica vida por mais poder.", type: "passive", cost: 1 },
        ]
      }
    ]
  },
  erudito: {
    className: "Erudito",
    description: "Estudiosos do oculto, que usam seu conhecimento para fortalecer aliados e enfraquecer inimigos.",
    icon: "🧠",
    position: { x: 50, y: 50 },
    specializations: [
      {
        id: "erudito_tatico",
        name: "Tático",
        description: "Analisa o campo de batalha para coordenar a equipe e explorar as fraquezas do inimigo.",
        type: "specialization",
        icon: "🗺️",
        skills: [
          { id: "tatico_1", name: "Analisar Inimigo", description: "Descobre uma fraqueza do alvo.", type: "active", cost: 1 },
          { id: "tatico_2", name: "Comando de Voz", description: "Permite que um aliado se mova.", type: "reaction", cost: 1 },
        ]
      },
      {
        id: "erudito_tecnico",
        name: "Técnico",
        description: "Especialista em tecnologia, hacking e criação de dispositivos para superar obstáculos.",
        type: "specialization",
        icon: "⚙️",
        skills: [
          { id: "tecnico_1", name: "Hackear Sistema", description: "Invade sistemas eletrônicos.", type: "active", cost: 2 },
          { id: "tecnico_2", name: "Conserto Rápido", description: "Repara um item quebrado.", type: "active", cost: 1 },
        ]
      },
      {
        id: "erudito_apotecario",
        name: "Apotecário",
        description: "Mestre em química e biologia, criando compostos para curar, fortalecer ou envenenar.",
        type: "specialization",
        icon: "🧪",
        skills: [
          { id: "apotecario_1", name: "Estimulante", description: "Concede bônus de atributo a um aliado.", type: "active", cost: 2 },
          { id: "apotecario_2", name: "Toxina Debilitante", description: "Envenena um alvo, causando dano contínuo.", type: "active", cost: 2 },
        ]
      },
      {
        id: "erudito_investigador",
        name: "Investigador",
        description: "Focado em encontrar pistas, decifrar enigmas e entender os mistérios do paranormal.",
        type: "specialization",
        icon: "🔍",
        skills: [
          { id: "investigador_1", name: "Conectar Pistas", description: "Recebe uma dica do mestre.", type: "active", cost: 1 },
          { id: "investigador_2", name: "Sexto Sentido", description: "Detecta perigos ocultos.", type: "passive", cost: 2 },
        ]
      },
      {
        id: "erudito_medico_campo",
        name: "Médico de Campo",
        description: "Especialista em manter a equipe viva, tratando ferimentos graves sob pressão.",
        type: "specialization",
        icon: "🩺",
        skills: [
          { id: "medico_1", name: "Primeiros Socorros", description: "Estabiliza um aliado morrendo.", type: "active", cost: 1 },
          { id: "medico_2", name: "Reanimar", description: "Traz um aliado de volta à consciência.", type: "active", cost: 3 },
        ]
      }
    ]
  },
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = skillTrees;
} else {
  window.skillTrees = skillTrees;
}
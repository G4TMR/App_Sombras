const skillTrees = {
  belico: {
    className: "Bélico",
    specializations: [
      {
        id: "belico_combatente",
        name: "Combatente",
        description: "Focado em maximizar o potencial de dano, utilizando técnicas agressivas para subjugar os inimigos.",
        type: "specialization",
        cost: 1,
        requirements: { nf: 5 },
        position: { x: 25, y: 10 }, // Posição em % (x, y) para o frontend
      },
      {
        id: "belico_protetor",
        name: "Protetor",
        description: "Especializado em defesa, resistência e proteção de aliados, servindo como a muralha do time.",
        type: "specialization",
        cost: 1,
        requirements: { nf: 5 },
        position: { x: 75, y: 10 },
      },
    ],
    skills: [
      // --- Ramo Combatente ---
      {
        id: "belico_ataque_especial",
        name: "Ataque Especial",
        description: "Gaste 2 PA para adicionar seu atributo de Força novamente ao dano de um ataque.",
        type: "active",
        cost: 1,
        requirements: { nf: 10, skills: ["belico_combatente"] },
        position: { x: 25, y: 25 },
      },
      {
        id: "belico_sangue_e_aco",
        name: "Sangue e Aço",
        description: "Quando você sofre dano, recebe +1 em rolagens de ataque até o fim da sua próxima rodada.",
        type: "passive",
        cost: 1,
        requirements: { nf: 15, skills: ["belico_ataque_especial"] },
        position: { x: 25, y: 40 },
      },
      // --- Ramo Protetor ---
      {
        id: "belico_posicao_defensiva",
        name: "Posição Defensiva",
        description: "Gaste 1 PA para aumentar sua Defesa em +5 até o início do seu próximo turno.",
        type: "active",
        cost: 1,
        requirements: { nf: 10, skills: ["belico_protetor"] },
        position: { x: 75, y: 25 },
      },
      {
        id: "belico_proteger_aliado",
        name: "Proteger Aliado",
        description: "Uma vez por rodada, você pode sofrer o dano de um ataque que mirava um aliado adjacente.",
        type: "reaction",
        cost: 1,
        requirements: { nf: 15, skills: ["belico_posicao_defensiva"] },
        position: { x: 75, y: 40 },
      },
    ],
  },
  esoterico: {
    className: "Esotérico",
    specializations: [
      {
        id: "esoterico_elementalista",
        name: "Elemental",
        description: "Focado no controle bruto e destrutivo do seu elemento, causando dano em área e controlando o campo.",
        type: "specialization",
        cost: 1,
        requirements: { nf: 5 },
        position: { x: 25, y: 10 },
      },
      {
        id: "esoterico_manipulador",
        name: "Manipulador",
        description: "Usa o elemento de forma sutil e técnica para enfraquecer inimigos e fortalecer aliados.",
        type: "specialization",
        cost: 1,
        requirements: { nf: 5 },
        position: { x: 75, y: 10 },
      },
    ],
    skills: [
      // --- Ramo Elemental ---
      {
        id: "esoterico_raio_elemental",
        name: "Raio Elemental",
        description: "Gaste 2 PA para lançar um raio do seu elemento que causa 2d8 de dano elemental.",
        type: "active",
        cost: 1,
        requirements: { nf: 10, skills: ["esoterico_elementalista"] },
        position: { x: 25, y: 25 },
      },
      // --- Ramo Manipulador ---
      {
        id: "esoterico_elo_elemental",
        name: "Elo Elemental",
        description: "Gaste 2 PA para encantar a arma de um aliado com seu elemento, adicionando 1d6 de dano elemental por uma cena.",
        type: "active",
        cost: 1,
        requirements: { nf: 10, skills: ["esoterico_manipulador"] },
        position: { x: 75, y: 25 },
      },
    ],
  },
  erudito: {
    className: "Erudito",
    specializations: [
      {
        id: "erudito_investigador",
        name: "Investigador",
        description: "Mestre em dedução e análise, focado em descobrir pistas e fraquezas no oculto.",
        type: "specialization",
        cost: 1,
        requirements: { nf: 5 },
        position: { x: 25, y: 10 },
      },
      {
        id: "erudito_suporte",
        name: "Suporte",
        description: "Utiliza seu conhecimento para coordenar a equipe, curar e fortalecer seus aliados em combate.",
        type: "specialization",
        cost: 1,
        requirements: { nf: 5 },
        position: { x: 75, y: 10 },
      },
    ],
    skills: [
      // --- Ramo Investigador ---
      {
        id: "erudito_analisar_criatura",
        name: "Analisar Criatura",
        description: "Gaste uma ação e faça um teste de Inteligência. Se passar, o Mestre revela uma fraqueza ou um status da criatura.",
        type: "active",
        cost: 1,
        requirements: { nf: 10, skills: ["erudito_investigador"] },
        position: { x: 25, y: 25 },
      },
      // --- Ramo Suporte ---
      {
        id: "erudito_primeiros_socorros",
        name: "Primeiros Socorros Aprimorados",
        description: "Gaste 1 PA para curar um aliado em 1d8 + sua Presença.",
        type: "active",
        cost: 1,
        requirements: { nf: 10, skills: ["erudito_suporte"] },
        position: { x: 75, y: 25 },
      },
    ],
  },
};

module.exports = skillTrees;
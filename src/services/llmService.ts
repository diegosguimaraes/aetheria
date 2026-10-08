import {
    GeminiPlanetResponse,
    GeminiNpcDetailsResponse,
    GeminiMissionResponse,
    NPCRole,
    Perk,
    MissionObjectiveType,
    FactionInfo,
    GeminiColonyEventResponse,
    ColonyEventEffectType
} from '../types'; 
import {
    INITIAL_SHIP_MODULES, 
    INITIAL_RESOURCES 
} from '../constants'; 

// Helper to parse JSON from potentially messy LLM text output
const parseJsonFromText = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response (first attempt):", e, "Original text:", text);
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonStr) as T;
      } catch (e2) {
        console.error("Failed to parse JSON after attempting to isolate object:", e2, "Attempted JSON string:", jsonStr);
      }
    }
    return null;
  }
};

const generateGeminiContent = async (prompt: string, expectJson: boolean = true): Promise<string | null> => {
  try {
    const response = await fetch('/.netlify/functions/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, expectJson }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error('Content generation failed:', response.status);
      return null;
    }

    const { content } = await response.json();
    if (typeof content !== 'string' || !content.trim()) {
      console.error("No content found in Gemini response");
      return null;
    }
    return content;
  } catch {
    console.error("Content generation is unavailable.");
    return null;
  }
};


export const generatePlanetDetails = async (isColonizationAttempt?: boolean): Promise<GeminiPlanetResponse | null> => {
  let promptContent = `
    Você é um assistente de IA para um jogo de exploração espacial.
    Gere uma descrição única e evocativa para um planeta recém-descoberto.
    Responda APENAS com um objeto JSON válido.
    O JSON deve ter a seguinte estrutura e os valores devem ser em português do Brasil:
    {
      "name": "Nome do Planeta",
      "biome": "Bioma Principal",
      "description": "Uma descrição cativante de 2-3 frases.",
      "features": ["Característica 1", "Característica 2"],
      "resourcesHint": ["Dica de recurso 1", "Dica de recurso 2"]
  `;

  if (isColonizationAttempt) {
    promptContent += `,
      "colonyName": "Nome da colônia",
      "colonyFoundingEvent": "Descrição do evento de fundação"
    `;
  }

  promptContent += `
    }
    NÃO inclua markdown como \`\`\`json. Forneça o JSON bruto.
  `;

  const rawResponse = await generateGeminiContent(promptContent, true);
  if (!rawResponse) return null;
  return parseJsonFromText<GeminiPlanetResponse>(rawResponse);
};

export const generateNpcDetails = async (role: NPCRole): Promise<GeminiNpcDetailsResponse | null> => {
  const promptContent = `
    Você é um assistente de IA para um jogo de exploração espacial.
    Gere detalhes para um NPC. O papel do NPC é: ${role}.
    Responda APENAS com um objeto JSON válido.
    O JSON deve ter a seguinte estrutura e os valores devem ser em português do Brasil:
    {
      "name": "Nome do NPC",
      "backstory": "Uma breve e intrigante história de fundo de 2-3 frases."
    }
    NÃO inclua markdown como \`\`\`json. Forneça o JSON bruto.
  `;
  const rawResponse = await generateGeminiContent(promptContent, true);
  if (!rawResponse) return null;
  return parseJsonFromText<GeminiNpcDetailsResponse>(rawResponse);
};

export const generateNpcDialogue = async (
  npcName: string,
  npcRole: NPCRole,
  npcBackstory: string,
  playerMessage: string,
  history: { speaker: 'Player' | 'NPC'; message: string }[],
  playerPerks?: Perk[]
): Promise<string | null> => {
  const historyString = history.map(entry => `${entry.speaker === 'Player' ? 'Jogador' : npcName}: ${entry.message}`).join('\n');

  let playerPerkNotes = "";
  if (playerPerks && playerPerks.some(p => p.id === 'silverTongue')) {
    playerPerkNotes = "Nota sobre o Jogador: Ele(a) possui a vantagem 'Língua de Prata', sendo naturalmente persuasivo(a).";
  }

  const promptContent = `
    Você é ${npcName}, um(a) ${npcRole} em um jogo de exploração espacial.
    Sua história: ${npcBackstory}
    Histórico da conversa até agora:
    ${historyString}
    O jogador disse: "${playerMessage}"
    ${playerPerkNotes}

    Responda como ${npcName}, mantendo sua personalidade e papel de forma concisa e relevante para a mensagem do jogador, em português do Brasil.
    NÃO inclua o nome "${npcName}:" ou "Jogador:" no início da sua resposta. Apenas a fala.
  `;

  return generateGeminiContent(promptContent, false);
};

export const generateMission = async (
  characterName: string | undefined,
  availableItems: string[], 
  availableLocations: string[], 
  factionContext?: FactionInfo
): Promise<GeminiMissionResponse | null> => {
  const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)] || "Dados Confidenciais";
  const randomLocation = availableLocations[Math.floor(Math.random() * availableLocations.length)] || "Estação Orbital K-7";
  const quantity = Math.floor(Math.random() * 5) + 1;

  const missionArchetypes = [
    {
      type: MissionObjectiveType.DELIVER,
      titleExample: `Entrega Urgente de ${randomItem}`,
      descriptionExample: `Um contato precisa que ${quantity} unidade(s) de ${randomItem} seja(m) entregue(s) em ${randomLocation}.`,
      objectiveExample: `Entregar ${quantity}x ${randomItem} para ${randomLocation}`,
      objectiveDetails: {
        type: MissionObjectiveType.DELIVER,
        targetItemName: randomItem,
        targetQuantity: quantity,
        targetLocationName: randomLocation,
      }
    },
    {
      type: MissionObjectiveType.SCAN_FOR_FACTION,
      titleExample: `Levantamento Científico em ${randomLocation}`,
      descriptionExample: `Dados preliminares sugerem atividade anômala em ${randomLocation}.`,
      objectiveExample: `Escanear a área de ${randomLocation}`,
      objectiveDetails: {
        type: MissionObjectiveType.SCAN_FOR_FACTION,
        targetSystemId: "ID_DO_SISTEMA_ALVO",
        targetLocationName: randomLocation,
      }
    },
  ];

  const selectedArchetype = missionArchetypes[Math.floor(Math.random() * missionArchetypes.length)];
  
  let promptContent = `
    Você é um Gerador de Missões para um jogo de exploração espacial.
    O jogador se chama ${characterName || "o Piloto"}.
    ${factionContext ? `A missão está sendo oferecida pela facção: ${factionContext.name} (${factionContext.description}).` : "Gere uma missão adequada para um piloto independente."}

    Crie uma missão baseada no seguinte arquétipo:
    Tipo de Missão Sugerido: ${selectedArchetype.type}

    Responda APENAS com um objeto JSON válido, seguindo esta estrutura (valores em português do Brasil):
    {
      "title": "Título Criativo",
      "description": "Descrição detalhada",
      "objective": "Objetivo textual",
      "rewardsString": "Ex: '1500 Créditos, Módulo:sm_shield_light'",
      "objectiveDetails": {
        "type": "${selectedArchetype.objectiveDetails.type}", 
        "targetItemName": "${selectedArchetype.objectiveDetails.type === MissionObjectiveType.DELIVER ? randomItem : ''}",
        "targetQuantity": ${selectedArchetype.objectiveDetails.type === MissionObjectiveType.DELIVER ? quantity : 0},
        "targetLocationName": "${randomLocation}",
        "targetSystemId": "",
        "targetPlanetId": "",
        "resourceToTransport": "",
        "destinationStationId": ""
      }
      ${factionContext ? `,
      "issuerFactionId": "${factionContext.id}",
      "reputationReward": { "factionId": "${factionContext.id}", "amount": 10 }` : ''}
    }

    Recompensas de módulo: ${INITIAL_SHIP_MODULES.map(m => m.id).slice(0, 5).join(', ')}.
    NÃO inclua markdown como \`\`\`json. Forneça o JSON bruto.
  `;

  const rawResponse = await generateGeminiContent(promptContent, true);
  if (!rawResponse) return null;
  
  const parsed = parseJsonFromText<GeminiMissionResponse>(rawResponse);

  if (parsed && !parsed.objectiveDetails) {
     parsed.objectiveDetails = {
        type: MissionObjectiveType.DELIVER,
        targetItemName: randomItem,
        targetQuantity: quantity,
        targetLocationName: randomLocation,
     }
  }
  
  return parsed;
};


export const generateDynamicPlanetLore = async (planetName: string, planetBiome: string, systemName: string): Promise<string | null> => {
    const prompt = `
        Você é um escritor de lore para um jogo de exploração espacial.
        O jogador descobriu um planeta chamado "${planetName}" no sistema "${systemName}". O bioma principal é "${planetBiome}".
        Crie uma nova descrição ÚNICA e EVOCATIVA para "${planetName}" (2-3 frases).
        Responda APENAS com o texto da nova descrição, em português do Brasil.
    `;
    return generateGeminiContent(prompt, false);
};

export const generateColonyEventDetails = async (
  planetName: string,
  planetBiome: string
): Promise<GeminiColonyEventResponse | null> => {
  const commonResourceNames = INITIAL_RESOURCES.filter(r => r.rarity === 'common' || r.rarity === 'uncommon').slice(0, 7).map(r => r.name).join(', ');

  const prompt = `
    Você é um Gerador de Eventos para uma colônia em um jogo de exploração espacial.
    Planeta: ${planetName}, Bioma: ${planetBiome}.
    Recursos possíveis: ${commonResourceNames}.

    Responda APENAS com um objeto JSON válido.
    O JSON deve ter a seguinte estrutura (valores em português do Brasil):
    {
      "title": "Título do Evento",
      "description": "Descrição detalhada",
      "requiresPlayerAction": true, 
      "choices": [ 
        {
          "id": "id_escolha",
          "text": "Texto da escolha",
          "effects": [
             { "type": "${ColonyEventEffectType.CREDIT_CHANGE}", "amount": -100 }
          ],
          "tooltip": "Dica"
        }
      ]
    }
    NÃO inclua markdown como \`\`\`json. Forneça o JSON bruto.
  `;
  const rawResponse = await generateGeminiContent(prompt, true);
  if (!rawResponse) return null;
  return parseJsonFromText<GeminiColonyEventResponse>(rawResponse);
};

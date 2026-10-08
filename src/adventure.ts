import { Mission, MissionObjectiveType, Planet, PlayerState, SpaceStation, StarSystem } from './types';

export function createFirstAdventure(): Mission[] {
  return [
    {
      id: 'adventure-first-orbit', category: 'adventure', title: 'Um pequeno passo',
      description: 'A comandante Lira tem uma proposta: antes de alcançar as estrelas, conheça seu próprio quintal. Leve a Pioneiro Estelar até a órbita de Nova Terra.',
      objective: 'Viaje até Nova Terra, no Sistema Sol.',
      objectiveDetails: { type: MissionObjectiveType.VISIT_LOCATION, targetPlanetId: 'planet_earth_like', targetLocationName: 'Nova Terra' },
      rewards: { credits: 300, researchPoints: 10 }, rewardsString: '300 Créditos · 10 Pesquisa', isCompleted: false, acceptedTick: 0,
    },
    {
      id: 'adventure-first-survey', category: 'adventure', title: 'O que existe sob a superfície?',
      description: 'Cada mundo guarda uma história. Use o scanner de recursos em Nova Terra para enviar o primeiro relatório à Liga dos Exploradores.',
      objective: 'Em Nova Terra, use o scanner de recursos.',
      objectiveDetails: { type: MissionObjectiveType.SURVEY_PLANET, targetPlanetId: 'planet_earth_like', targetLocationName: 'Nova Terra' },
      rewards: { credits: 450, researchPoints: 20 }, rewardsString: '450 Créditos · 20 Pesquisa', isCompleted: false, acceptedTick: 0,
      prerequisiteMissionId: 'adventure-first-orbit',
    },
    {
      id: 'adventure-beyond-sol', category: 'adventure', title: 'Além do horizonte',
      description: 'Seu relatório abriu as portas da fronteira. Escolha uma estrela próxima, trace sua rota e viaje para fora do Sistema Sol. A próxima descoberta é sua.',
      objective: 'Viaje até qualquer sistema fora de Sol.',
      objectiveDetails: { type: MissionObjectiveType.EXPLORE_SYSTEM },
      rewards: { credits: 800, researchPoints: 30, skillPoints: 1 }, rewardsString: '800 Créditos · 30 Pesquisa · 1 Habilidade', isCompleted: false, acceptedTick: 0,
      prerequisiteMissionId: 'adventure-first-survey',
    },
  ];
}

export function getMissionProgress(mission: Mission, player: PlayerState, planets: Planet[], missions: Mission[], stations: SpaceStation[] = []) {
  const locked = !!mission.prerequisiteMissionId && !missions.some(candidate => candidate.id === mission.prerequisiteMissionId && candidate.isCompleted);
  const details = mission.objectiveDetails;
  let current = 0;
  let target = 1;
  if (details?.type === MissionObjectiveType.VISIT_LOCATION) {
    current = Number(player.currentLocation === details.targetPlanetId || (player.visitedLocationIds || []).includes(details.targetPlanetId || ''));
  } else if (details?.type === MissionObjectiveType.SURVEY_PLANET) {
    current = Number((player.surveyedPlanetIds || []).includes(details.targetPlanetId || ''));
  } else if (details?.type === MissionObjectiveType.EXPLORE_SYSTEM) {
    current = Number(player.currentSystemId !== null && player.currentSystemId !== 'sol');
    if (details.targetSystemId) current = Number((player.visitedLocationIds || []).includes(details.targetSystemId) || player.currentSystemId === details.targetSystemId);
  } else if (details?.type === MissionObjectiveType.DELIVER || details?.type === MissionObjectiveType.TRANSPORT_FOR_FACTION) {
    const resource = details.targetItemName || details.resourceToTransport || '';
    target = details.targetQuantity || 1;
    current = Math.min(target, player.inventory[resource] || 0);
    const destination = details.destinationStationId || [...planets, ...stations].find(location => location.name === details.targetLocationName)?.id;
    if (destination && player.currentLocation !== destination) current = 0;
    if (!destination) current = 0;
  } else if (details?.type === MissionObjectiveType.SCAN_FOR_FACTION) {
    current = Number(player.currentSystemId === details.targetSystemId && (!details.targetPlanetId || (player.surveyedPlanetIds || []).includes(details.targetPlanetId)));
  }
  return { current, target, locked, ready: !locked && current >= target && !mission.isCompleted, percent: Math.round(Math.min(1, current / target) * 100) };
}

export function createExplorationContract(player: PlayerState, systems: StarSystem[], missions: Mission[]): Mission | null {
  const activeTargets = new Set(missions.filter(mission => !mission.isCompleted).map(mission => mission.objectiveDetails?.targetSystemId));
  const currentSystem = systems.find(system => system.id === player.currentSystemId);
  const candidates = systems.filter(system => system.id !== player.currentSystemId && !activeTargets.has(system.id))
    .sort((first, second) => {
      const distance = (system: StarSystem) => currentSystem ? Math.hypot(system.position.x - currentSystem.position.x, system.position.y - currentSystem.position.y) : 0;
      return distance(first) - distance(second);
    });
  const destination = candidates.find(system => !(player.visitedLocationIds || []).includes(system.id)) || candidates[0];
  if (!destination) return null;
  return {
    id: crypto.randomUUID(), category: 'contract', title: `Cartas de ${destination.name}`,
    description: 'A Liga dos Exploradores está ampliando seu atlas. Visite o sistema indicado e registre uma nova rota para os próximos viajantes.',
    objective: `Viaje para ${destination.name}.`,
    objectiveDetails: { type: MissionObjectiveType.EXPLORE_SYSTEM, targetSystemId: destination.id, targetLocationName: destination.name },
    rewards: { credits: 400, researchPoints: 15 }, rewardsString: '400 Créditos · 15 Pesquisa', isCompleted: false,
  };
}

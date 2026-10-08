
export interface Planet {
  id: string;
  name: string;
  biome: string;
  description: string;
  features: string[];
  resourcesHint: string[];
  discoveredResources: string[];
  imageUrl: string;
  isColonized: boolean;
  population: number;
  buildings: BuildingInstance[]; // Alterado de Building[] para BuildingInstance[]
  colonyHubId?: string;
  baseProduction: Record<string, number>;
  baseConsumption?: Record<string, number>; // Itens que a colônia NPC consome
  advancedConsumption?: Record<string, number>; // Calculated demand for player colonies per tick
  colonyMorale?: number; // Added: 0-100 morale for player colonies
  systemId: string;
  ownerFactionId?: string | null; // ID da facção NPC dona do planeta, ou null/player ID
  planetaryStationId?: string | null; // ID da "estação" que representa o porto/mercado desta colônia NPC
}

// Removida a interface Building antiga, pois será substituída conceitualmente
// pela combinação de BuildingInstance e ColonialBuildingDefinition.

export interface BuildingInstance {
  instanceId: string; // Unique ID for this specific building on this planet
  definitionId: string; // ID of the ColonialBuildingDefinition
  operationalStatus?: 'active' | 'damaged' | 'offline'; // Future use - UNCOMMENTED
}

export interface ColonialBuildingEffect {
  researchPointBonusPerTick?: number;
  resourceProductionBonus?: { resourceName: string; amountPerTick: number };
  moraleBonusPerTick?: number; // Added
  textEffect?: string; // Adicionado para efeitos descritivos
  systemModifierEffects?: { // Adicionado para a Plataforma de Defesa
    pirateSpawnChanceReduction?: number;
  };
  // Futuros efeitos: moraleBoost, defenseRating, etc.
}

export interface ColonialBuildingDefinition {
  id: string; // e.g., bldg_research_lab_t1
  name: string;
  description: string;
  cost: Record<string, number>; // resourceName: quantity, também pode incluir "Créditos": amount
  effects: ColonialBuildingEffect;
  effectDescription?: string; // Adicionado para descrição textual do efeito principal
  maxPerPlanet?: number; // Opcional: quantas vezes este edifício pode ser construído em um único planeta
  icon?: string; // Opcional: para UI, e.g., 'lab_icon.png' ou um nome de ícone do Icons.tsx
  requiredTech?: string; // Opcional: ID de uma TechNode necessária para construir
}


export interface Resource {
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'strategic'; // Added 'strategic'
  baseValue: number; // Valor base do recurso
}

export interface Item {
  id:string;
  name: string;
  description: string;
  craftingRecipe: Record<string, number>;
  effects?: string;
  type?: 'module' | 'equipment' | 'consumable' | 'colony_component' | 'artifact'; // Adicionado 'artifact'
  isTechItem?: boolean;
  researchPointsYield?: number; // Pontos de pesquisa que o artefato concede
  isAnalyzed?: boolean; // Se o artefato já foi analisado
}

export enum NPCRole {
  TRADER = 'Trader',
  PIRATE = 'Pirate',
  EXPLORER = 'Explorer',
  SCIENTIST = 'Scientist',
  MINER = 'Miner',
}

export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  backstory: string;
  dialogueHistory: { speaker: 'Player' | 'NPC'; message: string }[];
  currentPlanetId?: string;
  currentLocationId?: string; // Pode ser planeta ou estação
  ship?: Ship; // NPCs podem ter naves, especialmente piratas
}

export enum MissionObjectiveType {
  DELIVER = 'DELIVER',
  SCAN_FOR_FACTION = 'SCAN_FOR_FACTION',
  TRANSPORT_FOR_FACTION = 'TRANSPORT_FOR_FACTION',
  VISIT_LOCATION = 'VISIT_LOCATION',
  SURVEY_PLANET = 'SURVEY_PLANET',
  EXPLORE_SYSTEM = 'EXPLORE_SYSTEM',
  // Futuros tipos: VISIT_LOCATION, ELIMINATE_NPC_TARGET
}

export interface MissionObjectiveDetails {
  type: MissionObjectiveType;
  targetItemName?: string;    // Nome do item (ex: "Minério de Ferro")
  targetQuantity?: number;    // Quantidade do item
  targetLocationName?: string; // Nome do local (ex: "Estação Alpha Centauri" ou "Nova Terra")
  targetSystemId?: string; // Para missões SCAN_FOR_FACTION
  targetPlanetId?: string; // Para missões SCAN_FOR_FACTION (opcional)
  resourceToTransport?: string; // Para missões TRANSPORT_FOR_FACTION
  destinationStationId?: string; // Para missões TRANSPORT_FOR_FACTION
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  objective: string; // Descrição em linguagem natural do objetivo
  objectiveDetails?: MissionObjectiveDetails; // Detalhes estruturados do objetivo
  rewards: Record<string, number | string>;
  rewardsString?: string;
  isCompleted: boolean;
  issuerNpcId?: string;
  issuerFactionId?: string; // ID da facção que emitiu a missão
  reputationReward?: { factionId: string; amount: number }; // Recompensa de reputação
  acceptedTick?: number; // Tick do jogo quando a missão foi aceita
  prerequisiteMissionId?: string;
  category?: 'adventure' | 'contract';
}

export interface GeminiPlanetResponse {
  name: string;
  biome: string;
  description: string;
  features: string[];
  resourcesHint: string[];
  colonyName?: string;
  colonyFoundingEvent?: string;
}

export interface GeminiNpcDetailsResponse {
  name: string;
  backstory: string;
}

export interface GeminiMissionResponse {
  title: string;
  description: string;
  objective: string;
  rewardsString: string;
  objectiveDetails?: MissionObjectiveDetails; // Gemini deve tentar preencher isso
  issuerFactionId?: string;
  reputationReward?: { factionId: string; amount: number };
}

export interface GeminiResourceListResponse {
  resources: { name: string; description: string }[];
}

export type GameView =
  'galaxy' | 'planet' | 'inventory' | 'npcs' | 'missions' |
  'colonies' | 'profile' | 'skillTree' | 'techTree' |
  'stationDetails' | 'shipyard' | 'hangar' | 'crafting' |
  'systemDetail' | 'diplomacy' | 'colonyMarket' | 'researchLabView' |
  'combat' | 'policies'; // Added 'policies'

export interface PlayerInventory {
  [resourceName: string]: number;
}

export interface Perk {
  id: string;
  name: string;
  description: string;
}

export interface CharacterOrigin {
  id: string;
  name: string;
  description: string;
  perks: Perk[];
  startingBonus?: Partial<Omit<PlayerState, 'characterName' | 'originId' | 'activePerks' | 'ownedShips' | 'currentShipId' | 'isTraveling' | 'travelDetails' | 'currentSystemId' | 'knownSystemIds' | 'backgroundMusicVolume' | 'activeTreaties' | 'combatState' | 'combatSummaryData' | 'activePolicies' | 'colonyLLMEventAttemptTracker' >>;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  effectDescription: string;
  cost: number;
  prerequisites?: string[];
  icon?: string;
}

export interface TechNode {
  id: string;
  name: string;
  description: string;
  effectDescription: string;
  cost: number;
  prerequisites?: string[];
  icon?: string;
}

export type ShipModuleType = 'engine' | 'weapon' | 'shield' | 'cargo' | 'scanner' | 'special_utility' | 'colony_component_ship';

export interface ShipModuleEffects {
  cargoCapacity?: number;
  speed?: number;
  shieldStrength?: number;
  hullIntegrity?: number;
  scanRange?: number;

  // Weapon Specific
  weaponDamage?: number; // Generic, to be deprecated or used as a base for simple display
  attackPower?: number; // Base accuracy/targeting capability contribution
  kineticDamage?: number;
  energyDamage?: number;
  explosiveDamage?: number;
  weaponRange?: 'short' | 'medium' | 'long';
  weaponAccuracyBonus?: number; // Direct bonus/penalty to hit chance calculation
  shieldPenetration?: number; // 0.0 to 1.0 - percentage of damage that bypasses shields
  armorPenetrationMultiplier?: number; // Multiplier for damage dealt directly to hull (e.g., 1.2 for +20%)

  // Defense Specific
  defenseRating?: number; // Base evasion/difficulty to hit contribution
  kineticResistance?: number;
  energyResistance?: number;
  explosiveResistance?: number;

  // Utility/Special Module Specific
  repairAmount?: number; // Amount of hull repaired by an active repair module
  defenseRatingBuff?: number; // Temporary bonus to defenseRating (e.g., from "Defend" action enhanced by a module)
  cooldownTurns?: number; // Number of turns a special module needs to recharge
}

export interface ShipModule {
  id: string;
  name: string;
  description: string;
  type: ShipModuleType;
  effects: ShipModuleEffects;
  cost: number;
  isTechItem?: boolean;
}

export interface ShipStats {
  baseCargoCapacity: number;
  baseSpeed: number;
  baseShieldStrength: number;
  baseHullIntegrity: number;
  baseAttackPower: number;
  baseDefenseRating: number;
  baseKineticDamage: number;
  baseEnergyDamage: number;
  baseExplosiveDamage: number;
  baseKineticResistance: number;
  baseEnergyResistance: number;
  baseExplosiveResistance: number;

  totalCargoCapacity: number;
  totalSpeed: number;
  totalShieldStrength: number;
  totalHullIntegrity: number;
  totalAttackPower: number;
  totalDefenseRating: number;
  totalKineticDamage: number;
  totalEnergyDamage: number;
  totalExplosiveDamage: number;
  totalKineticResistance: number;
  totalEnergyResistance: number;
  totalExplosiveResistance: number;
}

export interface Ship {
  id: string;
  name: string;
  hullTypeId: string;
  baseStats: Omit<ShipStats,
    'totalCargoCapacity' | 'totalSpeed' | 'totalShieldStrength' | 'totalHullIntegrity' |
    'totalAttackPower' | 'totalDefenseRating' | 'totalKineticDamage' | 'totalEnergyDamage' |
    'totalExplosiveDamage' | 'totalKineticResistance' | 'totalEnergyResistance' | 'totalExplosiveResistance'
  >;
  modules: (ShipModule | null)[];
  maxModuleSlots: number;
  currentHullIntegrity?: number;
  currentShieldStrength?: number;
}

export interface ShipHull {
  id: string;
  name: string;
  description: string;
  baseStats: Omit<ShipStats,
    'totalCargoCapacity' | 'totalSpeed' | 'totalShieldStrength' | 'totalHullIntegrity' |
    'totalAttackPower' | 'totalDefenseRating' | 'totalKineticDamage' | 'totalEnergyDamage' |
    'totalExplosiveDamage' | 'totalKineticResistance' | 'totalEnergyResistance' | 'totalExplosiveResistance'
  >;
  maxModuleSlots: number;
  baseCost: number;
  initialModules?: (string | null)[];
}

export type StationType = 'research' | 'military' | 'commercial' | 'defense' | 'outpost' | 'orbital_hub' | 'pirate_den' | 'unknown' | 'planetary_port';

export interface MarketListing {
  quantity: number;
  sellPriceModifier: number;
  isProduced: boolean;
  buyPriceModifier: number;
  isConsumed: boolean;
}

export interface SpaceStation {
  id: string;
  name: string;
  faction: string;
  description: string;
  services: ('shipyard' | 'missions_hub' | 'research_lab')[];
  availableShipModuleIds: string[];
  availableShipHullIds: string[];
  shipModulePriceModifier?: number;
  shipHullPriceModifier?: number;
  imageUrl: string;
  systemId: string;
  stationType: StationType;
  marketInventory?: Record<string, MarketListing>;
  hasPirateEncounter?: boolean;
}

export type DestinationType = 'planet' | 'station' | 'system';

export interface TravelDetails {
  destinationId: string;
  destinationType: DestinationType;
  arrivalTick: number;
  departureTick: number;
  travelTicksTotal: number;
}

export interface AnomalyEvent {
    id: string;
    type: 'generic_signal' | 'derelict_ship' | 'energy_fluctuation';
    description: string;
    investigated: boolean;
}

export interface StarSystem {
  id: string;
  name: string;
  position: { x: number; y: number };
  faction: string;
  description: string;
  planetsInSystem: string[];
  stationsInSystem: string[];
  iconType: 'default' | 'important' | 'capital';
  securityLevel?: 'high' | 'medium' | 'low' | 'lawless';
  starColorCss?: string; // Added for star color
}

export enum DiplomaticStatus {
  War = 'Guerra',
  Hostile = 'Hostil',
  Neutral = 'Neutro',
  Friendly = 'Amigável',
  Alliance = 'Aliança'
}

export interface FactionInfo {
  id: string;
  name: string;
  description: string;
  colorClass: string;
  homeSystemIds?: string[];
  traits?: string[];
}

export enum TreatyType {
  TradeAgreement = 'Acordo Comercial',
  NonAggressionPact = 'Pacto de Não Agressão',
  Alliance = 'Aliança'
}

export interface ActiveTreaty {
  type: TreatyType;
  factionId: string;
  startTick: number;
  durationTicks: number;
}

export interface DiplomaticAction {
  id: string;
  name: string;
  description: string;
  reputationEffect: number;
  cost?: number;
  requiresStatus?: DiplomaticStatus[];
  unavailableIfStatus?: DiplomaticStatus[];
  createsTreaty?: TreatyType;
  treatyDurationTicks?: number;
  breaksExistingTreatyTypes?: TreatyType[];
  setsStatusTo?: DiplomaticStatus;
  requiresNoActiveTreatyOfType?: TreatyType;
}

// Combat System Types
export type CombatActionType = 'ATTACK_PRIMARY' | 'DEFEND' | 'FLEE' | 'USE_MODULE';

export interface CombatParticipantStats {
  shipId: string;
  name: string;
  isPlayer: boolean;
  hullTypeId: string;
  currentHull: number;
  maxHull: number;
  currentShields: number;
  maxShields: number;
  attackPower: number;
  defenseRating: number;
  kineticDamage: number;
  energyDamage: number;
  explosiveDamage: number;
  kineticResistance: number;
  energyResistance: number;
  explosiveResistance: number;
  speed: number;
  initiativeRoll?: number;
  modules: (ShipModule | null)[];
  temporaryEffects?: { defenseRatingBonus?: number; turnsRemaining?: number };
  moduleCooldowns?: Record<string, number>; // moduleId -> turns remaining
}

export interface CombatState {
  isActive: boolean;
  participants: CombatParticipantStats[];
  turnOrder: string[];
  currentTurnParticipantId: string | null;
  combatLog: string[];
  enemyShipDetails?: Ship;
  playerShipStartStats?: ShipStats;
  enemyShipStartStats?: ShipStats;
  roundCounter: number;
}

export interface CombatSummaryData {
  type: 'victory' | 'defeat' | 'fled';
  message: string;
  enemyName?: string;
  loot?: {
    credits?: number;
    resources?: Record<string, number>; // Ex: { "Minério de Ferro": 50 }
    modules?: ShipModule[]; // Array de módulos obtidos
  };
}

export interface PolicyEffect {
  flatCreditBonusPerTick?: number;
  flatResearchPointBonusPerTick?: number;
  resourceProductionPerTick?: { resourceName: string; amount: number }[];
  skillPointGainIntervalModifier?: number; // e.g., 0.5 means twice as fast, 2 means half as fast
                                           // or specific: skillPointsPerXTicks?: { points: number; ticks: number }
  flatSkillPointBonusPerTick?: number; // Alternative: simpler to implement initially
}

export interface PolicyDefinition {
  id: string;
  name: string;
  description: string;
  effectDescription: string;
  activationCost?: { credits?: number; researchPoints?: number; };
  ongoingEffect: PolicyEffect;
  icon?: string;
  category?: 'Economy' | 'Military' | 'Exploration' | 'Social';
}

export interface ActivePolicy {
  policyId: string;
  activationTick: number;
}

// --- Colony Events ---
export enum ColonyEventEffectType {
  RESOURCE_CHANGE = 'RESOURCE_CHANGE', // e.g., +100 Iron Ore, -50 Energy Credits
  CREDIT_CHANGE = 'CREDIT_CHANGE',     // e.g., +1000 Credits
  POPULATION_CHANGE = 'POPULATION_CHANGE', // e.g., +50 Population
  MORALE_CHANGE = 'MORALE_CHANGE',       // e.g., +10 Morale (requires morale system)
  BUILDING_STATUS_CHANGE = 'BUILDING_STATUS_CHANGE', // e.g., specific building damaged/repaired
  RESEARCH_POINTS_CHANGE = 'RESEARCH_POINTS_CHANGE',
  // Add more as needed
}

export interface ColonyEventEffect {
  type: ColonyEventEffectType;
  resourceName?: string; // For RESOURCE_CHANGE
  buildingId?: string;   // For BUILDING_STATUS_CHANGE
  buildingInstanceId?: string; // For BUILDING_STATUS_CHANGE, to target a specific instance
  newStatus?: 'active' | 'damaged' | 'offline'; // For BUILDING_STATUS_CHANGE
  amount: number;        // General purpose amount (positive or negative)
  message?: string;      // Optional message specific to this effect, e.g. "Production of X increased!"
}

export interface ColonyEventChoice {
  id: string; // e.g., "investigate", "ignore", "send_relief"
  text: string; // Text displayed to the player for this choice
  effects: ColonyEventEffect[]; // Effects if this choice is chosen
  tooltip?: string; // Optional tooltip for the choice
}

export interface ColonyEventTypeDefinition {
  id: string; // Unique ID for the event type, e.g., "evt_resource_boom_iron"
  titlePlaceholder: string; // e.g., "Descoberta Mineral em {planetName}!"
  descriptionPlaceholder: string; // e.g., "Nossos mineradores em {planetName} encontraram um veio inesperadamente rico de Minério de Ferro!"
  baseChance: number; // Probability (0.0 to 1.0) of this event type being considered each tick if base event chance hits
  imageDallE?: string; // Future: DALL-E prompt or URL
  soundEffect?: string; // Future: Sound effect key
  durationTicks?: number; // How long the event stays active if it requires player action and isn't resolved
  requiresPlayerAction: boolean;
  choices?: ColonyEventChoice[]; // Only if requiresPlayerAction is true
  immediateEffects?: ColonyEventEffect[]; // Only if requiresPlayerAction is false
  // conditions?: Record<string, any>; // Future: e.g., { minPopulation: 1000, hasBuilding: 'bldg_mine_fe_1' }
}

export interface ColonyEvent {
  id: string; // Unique instance ID for this specific event occurrence
  eventTypeId: string; // Links to ColonyEventTypeDefinition
  planetId: string; // Planet where the event is happening
  title: string; // Final title (placeholders resolved)
  description: string; // Final description
  triggerTick: number; // Game tick when the event was triggered
  isResolved: boolean;
  chosenChoiceId?: string; // If player made a choice
  activeChoices?: ColonyEventChoice[]; // Specific choices available for this instance (if requiresPlayerAction)
  // appliedEffects?: ColonyEventEffect[]; // Could log which effects were applied for immediate events
}

export interface GeminiColonyEventResponse {
  title: string;
  description: string;
  requiresPlayerAction: boolean;
  choices?: ColonyEventChoice[];
  immediateEffects?: ColonyEventEffect[];
}
// --- End Colony Events ---


export interface PlayerState {
  characterName: string;
  originId?: string;
  activePerks: Perk[];
  credits: number;
  inventory: PlayerInventory;
  craftedItems: Item[];
  currentLocation: string;
  currentSystemId: string | null;
  knownSystemIds: string[];
  visitedLocationIds?: string[];
  surveyedPlanetIds?: string[];
  lastTickTime: number;

  skillPoints: number;
  researchPoints: number;
  unlockedSkills: string[];
  unlockedTechs: string[];

  ownedShips: Ship[];
  currentShipId: string | null;
  ownedShipModules: ShipModule[];

  isTraveling: boolean;
  travelDetails: TravelDetails | null;
  backgroundMusicVolume: number;

  factionReputations: Record<string, number>;
  activeTreaties: ActiveTreaty[];
  activePolicies: ActivePolicy[]; // Added
  colonyLLMEventAttemptTracker?: Record<string, number>; // planetId -> gameTick of last attempt

  combatState: CombatState | null;
  combatSummaryData: CombatSummaryData | null;
}

export type GamePhase =
  'titleScreen' | 'characterCreation' | 'playing' |
  'paused' | 'loadGameModal' | 'profileView' | 'renameShipModal' |
  'anomalyEventModal' | 'settingsModal' | 'combatView' | 'combatSummary';

export interface FullGameState {
  starSystems?: StarSystem[];
  playerState: PlayerState;
  discoveredPlanets: Planet[];
  encounteredNPCs: NPC[];
  activeMissions: Mission[];
  discoveredStations: SpaceStation[];
  activeColonyEvents: ColonyEvent[]; // Added for colony events
  gameVersion: string;
  lastView?: GameView;
  gameTickCounter?: number;
}

export interface SavedGameMeta {
  slotKey: string;
  saveDate: string;
  characterName: string;
  currentShipName: string;
  timestamp: number;
  isQuickSave?: boolean;
}

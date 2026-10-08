
import React, { useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import {
  Planet, NPC, Mission, Item, GameView, NPCRole, PlayerState,
  GamePhase, CharacterOrigin, Perk, FullGameState, SavedGameMeta, SkillNode, TechNode,
  Ship, ShipModule, SpaceStation, ShipHull, ShipModuleEffects,
  DestinationType, TravelDetails, AnomalyEvent, StarSystem, Resource, MissionObjectiveType,
  FactionInfo, DiplomaticStatus, DiplomaticAction, TreatyType, ActiveTreaty, MarketListing,
  CombatState, CombatActionType, CombatParticipantStats, CombatSummaryData,
  BuildingInstance, ColonialBuildingDefinition, PolicyDefinition, ActivePolicy,
  ColonyEvent, ColonyEventEffectType, ColonyEventTypeDefinition, ColonyEventChoice, GeminiColonyEventResponse
} from './types'; // Correct: assuming types.ts is in src/
import {
  NPC_ROLES_LIST, CRAFTABLE_ITEMS, MAX_PLANETS_DISCOVERABLE, MAX_NPCS_ENCOUNTERABLE, MAX_MISSIONS_ACTIVE,
  GAME_TICK_INTERVAL_MS, POPULATION_GROWTH_RATE_PER_TICK,
  BASE_PLANET_PRODUCTION, COLONIZATION_CREDIT_COST, CHARACTER_ORIGINS,
  INITIAL_PLAYER_STATE_BASE, GAME_SAVE_KEY_PREFIX, GAME_VERSION, DEFAULT_SAVE_SLOT_KEY,
  SAVE_METADATA_KEY, INITIAL_SKILL_TREE, INITIAL_TECH_TREE, INITIAL_RESOURCES, SYSTEM_PLANETS,
  INITIAL_SKILL_POINTS, INITIAL_RESEARCH_POINTS,
  TICKS_FOR_SKILL_POINT_GAIN, TICKS_FOR_RESEARCH_POINT_GAIN, SKILL_POINTS_PER_GAIN, RESEARCH_POINTS_PER_GAIN,
  INITIAL_SHIP_MODULES, DEFAULT_PLAYER_SHIP_ID, SHIP_HULLS, ALL_STATIONS_DATA,
  DEFAULT_PLAYER_SHIP_HULL_ID, RESOURCE_UNIT_WEIGHT, MODULE_SELL_PRICE_MODIFIER,
  TRAVEL_BASE_CREDIT_COST, TRAVEL_TIME_BASE_TICKS_PER_HOP, TRAVEL_TIME_SPEED_DIVISOR,
  ANOMALY_SCAN_COST_CREDITS, ANOMALY_FIND_CHANCE, ANOMALY_MODULE_CHANCE, ANOMALY_RESOURCE_CHANCE,
  FINDABLE_MODULE_IDS_VIA_ANOMALY, ANOMALY_BASE_RESOURCE_REWARD_QUANTITY, ANOMALY_ARTIFACT_CHANCE, DISCOVERABLE_ARTIFACTS,
  STAR_SYSTEMS_DATA, SCAN_SYSTEM_COST_CREDITS, BASE_SCANNER_RANGE_AU,
  BACKGROUND_MUSIC_URL, DEFAULT_BACKGROUND_MUSIC_VOLUME, PLANET_TYPES,
  FIXED_LORE_PLANET_IDS,
  ALL_FACTIONS_DATA, INITIAL_FACTION_REPUTATIONS, REPUTATION_THRESHOLDS, BASIC_DIPLOMATIC_ACTIONS,
  TRADE_AGREEMENT_PRICE_MODIFIER,
  MARKET_STOCK_REFRESH_INTERVAL_TICKS, MARKET_STOCK_ADJUSTMENT_AMOUNT, MAX_RESOURCE_STOCK_PER_ITEM, MIN_RESOURCE_STOCK_PER_ITEM,
  COLONIAL_BUILDING_DEFINITIONS, POLICY_DEFINITIONS, MAX_ACTIVE_POLICIES, POLICY_TICK_INTERVAL_FOR_SKILL_POINT,
  REPAIR_COST_PER_HULL_POINT_CREDITS, REPAIR_COST_PER_HULL_POINT_TITANIUM, REPAIR_RESOURCE_NAME, BASE_PIRATE_SPAWN_CHANCE,
  COLONY_EVENT_TYPE_DEFINITIONS, COLONY_EVENT_BASE_CHANCE_PER_TICK, LLM_EVENT_ROLL_CHANCE,
  MIN_POP_FOR_ADVANCED_CONSUMPTION, PER_CAPITA_CONSUMPTION_RATES,
  INITIAL_COLONY_MORALE, MORALE_GAIN_PER_SURPLUS_UNIT, MORALE_LOSS_PER_DEFICIT_UNIT, MORALE_BASE_CHANGE_TOWARDS_NEUTRAL,
  MIN_COLONY_MORALE, MAX_COLONY_MORALE, getMoraleProductionMultiplier, MORALE_HAPPY_THRESHOLD, MORALE_UNHAPPY_THRESHOLD
} from './constants'; // Correct: assuming constants.ts is in src/
import {
    generatePlanetDetails,
    generateNpcDetails,
    generateNpcDialogue,
    generateMission,
    generateDynamicPlanetLore,
    generateColonyEventDetails // Added LLM event generation
} from './services/llmService'; // Corrected import path
import {
    generateId as generateIdUtil,
    calculateDistance, getPlanetImageUrl,
    calculateShipStats, calculateCurrentCargoUsage,
} from './utils'; // Corrected import path
import { Icons } from './icons'; // Corrected import path
import { createFirstAdventure, createExplorationContract, getMissionProgress } from './adventure';
import { listSavedGames, loadSavedGame, storeSavedGame, deleteSavedGame } from './services/saveService';

import LoadingSpinner from './components/LoadingSpinner'; // Corrected import path
import TitleScreen from './components/ui/TitleScreen'; // Corrected import path
import CharacterCreationScreen from './components/ui/CharacterCreationScreen'; // Corrected import path
import PauseMenuModal from './components/ui/PauseMenuModal'; // Corrected import path
import LoadGameModal from './components/ui/LoadGameModal'; // Corrected import path
import DeleteConfirmModal from './components/ui/DeleteConfirmModal'; // Corrected import path
import RenameShipModal from './components/ui/RenameShipModal'; // Corrected import path
import TravelModal from './components/ui/TravelModal'; // Corrected import path
import AnomalyInvestigateModal from './components/ui/AnomalyInvestigateModal'; // Corrected import path
import SettingsModal from './components/ui/SettingsModal'; // Corrected import path
import GameInterface from './components/GameInterface'; // Corrected import path
import CombatSummaryModal from './components/ui/CombatSummaryModal'; // Corrected import path
import ColonyEventModal from './components/ui/ColonyEventModal'; // Added ColonyEventModal

import GalaxyView from './components/views/GalaxyView'; 
import PlanetView from './components/views/PlanetView'; // Corrected import path
import InventoryView from './components/views/InventoryView'; // Corrected import path
import NpcView from './components/views/NpcView'; // Corrected import path
import MissionsView from './components/views/MissionsView'; // Corrected import path
import CraftingView from './components/views/CraftingView'; // Corrected import path
import ColoniesView from './components/views/ColoniesView'; // Corrected import path
import ProfileView from './components/views/ProfileView'; // Corrected import path
import SkillTreeView from './components/views/SkillTreeView'; // Corrected import path
import TechTreeView from './components/views/TechTreeView'; // Corrected import path
import StationDetailsView from './components/ui/StationDetailsView'; // Corrected import path (to ui)
import ShipyardView from './components/views/ShipyardView'; // Corrected import path
import HangarView from './components/views/HangarView'; // Corrected import path
import SystemView from './components/views/SystemView'; // Corrected import path
import DiplomacyView from './components/views/DiplomacyView'; // Corrected import path
import ColonyMarketView from './components/views/ColonyMarketView'; // Corrected import path
import ResearchLabView from './components/views/ResearchLabView'; // Corrected import path
import CombatView from './components/views/CombatView'; // Corrected import path
import PolicyView from './components/views/PolicyView'; // Corrected import path

const getDiplomaticStatus = (reputation: number): DiplomaticStatus => {
    if (reputation <= REPUTATION_THRESHOLDS[DiplomaticStatus.War]) return DiplomaticStatus.War;
    if (reputation <= REPUTATION_THRESHOLDS[DiplomaticStatus.Hostile]) return DiplomaticStatus.Hostile;
    if (reputation < REPUTATION_THRESHOLDS[DiplomaticStatus.Friendly]) return DiplomaticStatus.Neutral;
    if (reputation < REPUTATION_THRESHOLDS[DiplomaticStatus.Alliance]) return DiplomaticStatus.Friendly;
    return DiplomaticStatus.Alliance;
};

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('titleScreen');
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [activeColonyEvents, setActiveColonyEvents] = useState<ColonyEvent[]>([]);
  const [unresolvedColonyEventToShow, setUnresolvedColonyEventToShow] = useState<ColonyEvent | null>(null);


  const [discoveredPlanets, setDiscoveredPlanets] = useState<Planet[]>(
    SYSTEM_PLANETS.map(p => ({...p, discoveredResources: p.discoveredResources || [] }))
  );
  const [discoveredStations, setDiscoveredStations] = useState<SpaceStation[]>(ALL_STATIONS_DATA.map(s => ({...s})));
  const [_starSystems, _setStarSystems] = useState<StarSystem[]>(STAR_SYSTEMS_DATA);

  const [selectedSystemIdForDetailView, setSelectedSystemIdForDetailView] = useState<string | null>(null);
  const [selectedFactionForDiplomacy, setSelectedFactionForDiplomacy] = useState<FactionInfo | null>(null);
  const [selectedPlanetaryMarketStationId, setSelectedPlanetaryMarketStationId] = useState<string | null>(null);


  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);
  const [isAnalyzingArtifact, setIsAnalyzingArtifact] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [characterNameInput, setCharacterNameInput] = useState('');
  const [selectedOriginId, setSelectedOriginId] = useState<string>(CHARACTER_ORIGINS[0]?.id || '');

  const [savedGamesMeta, setSavedGamesMeta] = useState<SavedGameMeta[]>([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<{ isOpen: boolean, slotKeyToDelete: string | null }>({ isOpen: false, slotKeyToDelete: null });
  const [showRenameShipModal, setShowRenameShipModal] = useState<{isOpen: boolean, shipId: string | null, currentName: string}>({isOpen: false, shipId: null, currentName: ''});
  const [renameShipInput, setRenameShipInput] = useState('');

  const [currentAnomalyEvent, setCurrentAnomalyEvent] = useState<AnomalyEvent | null>(null);
  const [showAnomalyInvestigateModal, setShowAnomalyInvestigateModal] = useState(false);

  const [currentView, setCurrentView] = useState<GameView>('galaxy');
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [selectedStation, setSelectedStation] = useState<SpaceStation | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [npcInteractionMessage, setNpcInteractionMessage] = useState('');
  const [encounteredNPCs, setEncounteredNPCs] = useState<NPC[]>([]);
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveInFlightRef = useRef(false);
  const claimedMissionIdsRef = useRef(new Set<string>());

  const gameTickCounterRef = useRef(0);
  const policySkillPointCounterRef = useRef(0);
  const tickIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [phaseBeforeSettings, setPhaseBeforeSettings] = useState<GamePhase>('titleScreen');
  const [viewBeforeCombat, setViewBeforeCombat] = useState<GameView>('galaxy');
  const playerStateRef = useRef(playerState); // Ref for async access to playerState


  const currentShip = playerState?.currentShipId ? playerState.ownedShips.find(s => s.id === playerState.currentShipId) : null;
  const currentShipCalculatedStats = currentShip ? calculateShipStats(currentShip) : null; // Allow null
  const currentCargoUsage = playerState ? calculateCurrentCargoUsage(playerState.inventory) : 0;
  const isFighting = playerState?.combatState?.isActive === true;

  const showNotification = useCallback((message: string, duration = 3000) => {
    setNotification(message);
    setTimeout(() => setNotification(null), duration);
  }, [setNotification]);

  const showError = useCallback((message: string, duration = 4000) => {
    setError(message);
    setTimeout(() => setError(null), duration);
  }, [setError]);

  const getTranslatedNpcRole = (role: NPCRole) =>  { return role as string; };

    const createShipFromHull = (hullId: string, shipInstanceId: string, shipName: string): Ship | null => {
        const hull = SHIP_HULLS.find(h => h.id === hullId);
        if (!hull) return null;
        const newShip: Ship = {
        id: shipInstanceId,
        name: shipName,
        hullTypeId: hull.id,
        baseStats: { ...hull.baseStats },
        modules: hull.initialModules?.map(modIdOrData => {
            if (typeof modIdOrData === 'string') {
                return INITIAL_SHIP_MODULES.find(m => m.id === modIdOrData) || null;
            }
            return modIdOrData;
        }) || Array(hull.maxModuleSlots).fill(null),
        maxModuleSlots: hull.maxModuleSlots,
        };

        const tempStats = calculateShipStats(newShip);
        newShip.currentHullIntegrity = tempStats.totalHullIntegrity;
        newShip.currentShieldStrength = tempStats.totalShieldStrength;
        return newShip;
    };


  const fetchAllSavedGamesMeta = useCallback(async () => {
      let legacy: SavedGameMeta[] = [];
      try {
        const parsed = JSON.parse(localStorage.getItem(SAVE_METADATA_KEY) || '[]');
        if (Array.isArray(parsed)) legacy = parsed.filter(meta => meta && typeof meta.slotKey === 'string' && localStorage.getItem(meta.slotKey));
      } catch {}
      try {
        const cloud = await listSavedGames();
        setSavedGamesMeta([...cloud, ...legacy.filter(meta => !cloud.some(save => save.slotKey === meta.slotKey))].sort((first, second) => second.timestamp - first.timestamp));
      } catch {
        setSavedGamesMeta(legacy.sort((first, second) => second.timestamp - first.timestamp));
      }
  }, []);

  useEffect(() => {
    audioRef.current = document.getElementById('backgroundMusic') as HTMLAudioElement;
    if (audioRef.current && BACKGROUND_MUSIC_URL) { // Ensure URL is set before accessing src
        audioRef.current.src = BACKGROUND_MUSIC_URL;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current && playerState) {
      audioRef.current.volume = playerState.backgroundMusicVolume;
      if (playerState.backgroundMusicVolume > 0 && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.warn("Music play failed:", e.message));
      } else if (playerState.backgroundMusicVolume === 0 && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    } else if (audioRef.current && !playerState && !audioRef.current.paused) {
        audioRef.current.pause();
    }
  }, [playerState?.backgroundMusicVolume, playerState?.currentShipId]);

  useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);


  useEffect(() => {
    const phasesRequiringPlayerState = ['playing', 'profileView', 'paused', 'loadGameModal', 'renameShipModal', 'anomalyEventModal', 'settingsModal', 'combatView', 'combatSummary'];

    if (phasesRequiringPlayerState.includes(gamePhase) && !playerState && gamePhase !== 'settingsModal' ) {
      console.warn(`EFFECT: gamePhase is '${gamePhase}' but playerState is missing. Correcting to 'titleScreen'.`);
      if (gamePhase !== 'loadGameModal') setGamePhase('titleScreen');
      return;
    }

    if (playerState && (gamePhase === 'playing' || gamePhase === 'profileView' || gamePhase === 'combatView' || gamePhase === 'combatSummary')) {
        if ((gamePhase === 'playing' || gamePhase === 'combatView') && !currentShip) {
            console.warn(`EFFECT: gamePhase is '${gamePhase}' and playerState exists, but currentShip is missing. Correcting to 'titleScreen'.`);
            setGamePhase('titleScreen');
            return;
        }

      const validViewsForPlaying: GameView[] = ['galaxy', 'planet', 'inventory', 'npcs', 'missions', 'crafting', 'colonies', 'stationDetails', 'shipyard', 'hangar', 'systemDetail', 'diplomacy', 'colonyMarket', 'researchLabView', 'policies'];
      const validViewsForProfile: GameView[] = ['profile', 'skillTree', 'techTree'];
      const validViewsForCombat: GameView[] = ['combat'];


      if (gamePhase === 'playing') {
        if (validViewsForPlaying.includes(currentView)) {
          const viewsRequiringStation: GameView[] = ['stationDetails', 'shipyard', 'colonyMarket', 'researchLabView'];
          const viewsRequiringPlanet: GameView[] = ['planet'];
          const viewRequiringSystemDetail: GameView = 'systemDetail';

          if (viewsRequiringStation.includes(currentView) && !selectedStation && currentView !== 'colonyMarket' && currentView !== 'researchLabView' ) {
            console.warn(`EFFECT: View '${currentView}' requires selectedStation, but it's missing. Resetting to 'galaxy'.`);
            setCurrentView('galaxy');
            setSelectedPlanet(null);
            setSelectedSystemIdForDetailView(null);
          } else if (currentView === 'colonyMarket' && !selectedPlanetaryMarketStationId) {
            console.warn(`EFFECT: View '${currentView}' requires selectedPlanetaryMarketStationId, but it's missing. Resetting to 'galaxy'.`);
            setCurrentView('galaxy');
            setSelectedPlanet(null);
            setSelectedStation(null);
            setSelectedSystemIdForDetailView(null);
          } else if (currentView === 'researchLabView' && !selectedStation) {
            console.warn(`EFFECT: View '${currentView}' requires selectedStation, but it's missing. Resetting to 'galaxy'.`);
            setCurrentView('galaxy');
          }
           else if (viewsRequiringPlanet.includes(currentView) && !selectedPlanet) {
            console.warn(`EFFECT: View '${currentView}' requires selectedPlanet, but it's missing. Resetting to 'galaxy'.`);
            setCurrentView('galaxy');
            setSelectedStation(null);
            setSelectedSystemIdForDetailView(null);
          } else if (currentView === viewRequiringSystemDetail && !selectedSystemIdForDetailView) {
            console.warn(`EFFECT: View '${currentView}' requires selectedSystemIdForDetailView, but it's missing. Resetting to 'galaxy'.`);
            setCurrentView('galaxy');
            setSelectedPlanet(null);
            setSelectedStation(null);
          }
        } else {
          console.warn(`EFFECT: Invalid view '${currentView}' for gamePhase 'playing'. Resetting to 'galaxy'.`);
          setCurrentView('galaxy');
        }
      } else if (gamePhase === 'profileView') {
        if (!validViewsForProfile.includes(currentView)) {
          console.warn(`EFFECT: Invalid view '${currentView}' for gamePhase 'profileView'. Resetting to 'profile'.`);
          setCurrentView('profile');
        }
      } else if (gamePhase === 'combatView') {
        if (!validViewsForCombat.includes(currentView)) {
           console.warn(`EFFECT: Invalid view '${currentView}' for gamePhase 'combatView'. Resetting to 'combat'.`);
           setCurrentView('combat');
        }
      }
    }
  }, [gamePhase, playerState, currentShip, currentView, selectedStation, selectedPlanet, selectedSystemIdForDetailView, selectedPlanetaryMarketStationId]);


  useEffect(() => { fetchAllSavedGamesMeta(); }, [fetchAllSavedGamesMeta]);

  const endCombat = useCallback((playerWon: boolean, playerFled: boolean = false) => {
    setPlayerState(prev => {
        if (!prev || !prev.combatState || !prev.combatState.isActive || !currentShip || !currentShipCalculatedStats) return prev;

        const enemyParticipant = prev.combatState.participants.find(p => !p.isPlayer);
        let summaryData: CombatSummaryData = { type: 'defeat', message: '', enemyName: enemyParticipant?.name };
        let finalCombatLog = [...prev.combatState.combatLog];
        let updatedPlayerState = { ...prev };

        if (playerFled) {
            summaryData = { type: 'fled', message: "Você escapou por pouco!", enemyName: enemyParticipant?.name };
            finalCombatLog.push(`${currentShip.name} conseguiu escapar de ${enemyParticipant?.name || 'inimigo desconhecido'}!`);
            showNotification("Fuga bem-sucedida!");
        } else if (playerWon) {
            const playerCombatStats = prev.combatState.participants.find(p => p.isPlayer);
            if (playerCombatStats) {
                const damagedShipIndex = updatedPlayerState.ownedShips.findIndex(s => s.id === currentShip.id);
                if (damagedShipIndex !== -1) {
                    const shipToUpdate = updatedPlayerState.ownedShips[damagedShipIndex];
                    const updatedPlayerShips = [...updatedPlayerState.ownedShips];
                    updatedPlayerShips[damagedShipIndex] = {
                        ...shipToUpdate,
                        currentHullIntegrity: playerCombatStats.currentHull,
                        currentShieldStrength: playerCombatStats.maxShields, // Restore shields fully on victory
                    };
                    updatedPlayerState.ownedShips = updatedPlayerShips;
                }
            }

            // --- LOOT GENERATION ---
            const loot: Required<CombatSummaryData>['loot'] = {
                credits: 0,
                resources: {},
                modules: [],
            };
            // let cargoUsedByLoot = 0; // Not strictly checking mid-loot generation for now

            // Credits
            const creditsDropped = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
            loot.credits = creditsDropped;
            updatedPlayerState.credits += creditsDropped;

            // Resources (0 to 2 types)
            const numResourceTypesToDrop = Math.floor(Math.random() * 3);
            for (let i = 0; i < numResourceTypesToDrop; i++) {
                const randomResource = INITIAL_RESOURCES[Math.floor(Math.random() * INITIAL_RESOURCES.length)];
                const quantityDropped = Math.floor(Math.random() * (50 - 10 + 1)) + 10;

                if (randomResource) {
                    updatedPlayerState.inventory[randomResource.name] = (updatedPlayerState.inventory[randomResource.name] || 0) + quantityDropped;
                    loot.resources![randomResource.name] = (loot.resources![randomResource.name] || 0) + quantityDropped;
                    // cargoUsedByLoot += quantityDropped * RESOURCE_UNIT_WEIGHT;
                }
            }

            // Modules (10% chance)
            if (Math.random() < 0.10 && FINDABLE_MODULE_IDS_VIA_ANOMALY.length > 0) { // Re-use anomaly module list for simplicity
                const randomModuleId = FINDABLE_MODULE_IDS_VIA_ANOMALY[Math.floor(Math.random() * FINDABLE_MODULE_IDS_VIA_ANOMALY.length)];
                const moduleData = INITIAL_SHIP_MODULES.find(m => m.id === randomModuleId);
                if (moduleData) {
                    const newModuleInstance = { ...moduleData, id: generateIdUtil() }; // ensure unique ID for instance
                    updatedPlayerState.ownedShipModules.push(newModuleInstance);
                    loot.modules!.push(newModuleInstance);
                }
            }

            summaryData = {
                type: 'victory',
                message: "Você destruiu o inimigo!",
                enemyName: enemyParticipant?.name,
                loot: (loot.credits || Object.keys(loot.resources!).length > 0 || loot.modules!.length > 0) ? loot : undefined
            };
            // --- END OF LOOT GENERATION ---

            finalCombatLog.push(`Você VENCEU o combate contra ${enemyParticipant?.name || 'inimigo desconhecido'}!`);
            showNotification("Vitória!");

            // Check cargo after adding loot (this should ideally happen before actually adding if strict limits are enforced)
            if (currentShipCalculatedStats && calculateCurrentCargoUsage(updatedPlayerState.inventory) > currentShipCalculatedStats.totalCargoCapacity) {
                 showNotification("Aviso: Capacidade de carga da nave excedida com o loot coletado!");
            }


        } else { // Player lost
            summaryData = { type: 'defeat', message: "Sua nave foi destruída...", enemyName: enemyParticipant?.name };
            finalCombatLog.push(`Você foi DERROTADO por ${enemyParticipant?.name || 'inimigo desconhecido'}!`);
            showError("DERROTA! Sua nave foi destruída...");
            // Game Over logic handled in handleCloseCombatSummary
        }

        return {
            ...updatedPlayerState,
            combatState: { ...updatedPlayerState.combatState!, isActive: false, combatLog: finalCombatLog }, // Keep log for summary
            combatSummaryData: summaryData
        };
    });
    setGamePhase('combatSummary');
  }, [showNotification, showError, currentShip, currentShipCalculatedStats]);


  const advanceCombatTurn = useCallback(() => {
    setPlayerState(prev => {
        if (!prev || !prev.combatState || !prev.combatState.isActive) return prev;

        let cs = { ...prev.combatState };
        const endedTurnParticipantId = cs.currentTurnParticipantId;

        // Update temporary effects and cooldowns for the participant who just finished their turn
        cs.participants = cs.participants.map(p => {
            if (p.shipId === endedTurnParticipantId) {
                let newTempEffects = p.temporaryEffects;
                if (newTempEffects && newTempEffects.turnsRemaining !== undefined) {
                    newTempEffects.turnsRemaining--;
                    if (newTempEffects.turnsRemaining <= 0) {
                        newTempEffects = undefined; // Clear effect if turns run out
                    }
                }

                let newModuleCooldowns = p.moduleCooldowns ? { ...p.moduleCooldowns } : {};
                let cooldownChanged = false;
                for(const moduleId in newModuleCooldowns){
                    if(newModuleCooldowns[moduleId] > 0) {
                        newModuleCooldowns[moduleId]--;
                        cooldownChanged = true;
                        if(newModuleCooldowns[moduleId] === 0) delete newModuleCooldowns[moduleId]; // Remove cooldown if it reaches 0
                    }
                }
                return { ...p, temporaryEffects: newTempEffects, moduleCooldowns: cooldownChanged ? newModuleCooldowns : p.moduleCooldowns };
            }
            return p;
        });

        const currentTurnIndex = cs.turnOrder.indexOf(cs.currentTurnParticipantId!);
        const nextTurnIndex = (currentTurnIndex + 1) % cs.turnOrder.length;
        const nextParticipantId = cs.turnOrder[nextTurnIndex];

        let newRoundCounter = cs.roundCounter;
        let newCombatLog = [...cs.combatLog];
        if (nextTurnIndex < currentTurnIndex) { // Indicates a new round has started
            newRoundCounter++;
            newCombatLog.push(`--- Rodada ${newRoundCounter} ---`);
        }

        const updatedCombatState = {
            ...cs,
            currentTurnParticipantId: nextParticipantId,
            roundCounter: newRoundCounter,
            combatLog: newCombatLog
        };

        // If it's now the enemy's turn, trigger their action
        const nextParticipantIsEnemy = updatedCombatState.participants.find(p => p.shipId === nextParticipantId)?.isPlayer === false;
        if (nextParticipantIsEnemy) {
            setTimeout(() => handleEnemyTurn(), 1200); // Delay for enemy "thinking"
        }
        return { ...prev, combatState: updatedCombatState };
    });
  }, []); // Empty dependency array as it relies on setPlayerState's callback for prev state

  const handleEnemyTurn = useCallback(() => {
    setPlayerState(prevPlayerState => {
        if (!prevPlayerState || !prevPlayerState.combatState || !prevPlayerState.combatState.isActive) return prevPlayerState;
        let cs = { ...prevPlayerState.combatState };

        let enemyAttackerStats = cs.participants.find(p => p.shipId === cs.currentTurnParticipantId && !p.isPlayer);
        let playerTargetStats = cs.participants.find(p => p.isPlayer);

        if (!enemyAttackerStats || !playerTargetStats) {
          console.error("Erro: Inimigo ou jogador não encontrado nos participantes do combate.");
          setTimeout(() => advanceCombatTurn(), 100); // Advance turn anyway to prevent stall
          return prevPlayerState;
        }

        let combatLogUpdate = "";
        let actionTaken = false;
        let enemyParticipantForUpdate = {...enemyAttackerStats};


        // 1. Attempt Repair (if hull is low and module available/off cooldown)
        const repairModule = enemyParticipantForUpdate.modules.find(m => m?.id === 'sm_utility_repair_small');
        if (repairModule && (!enemyParticipantForUpdate.moduleCooldowns || (enemyParticipantForUpdate.moduleCooldowns?.[repairModule.id] || 0) <= 0) &&
            enemyParticipantForUpdate.currentHull < enemyParticipantForUpdate.maxHull * 0.4 && Math.random() < 0.75) {

            const repairAmount = repairModule.effects.repairAmount || 0;
            const healedAmount = Math.min(repairAmount, enemyParticipantForUpdate.maxHull - enemyParticipantForUpdate.currentHull);
            enemyParticipantForUpdate.currentHull += healedAmount;

            if (!enemyParticipantForUpdate.moduleCooldowns) enemyParticipantForUpdate.moduleCooldowns = {};
            enemyParticipantForUpdate.moduleCooldowns[repairModule.id] = repairModule.effects.cooldownTurns || 1; // Apply cooldown

            combatLogUpdate = `${enemyParticipantForUpdate.name} usa ${repairModule.name}, reparando ${healedAmount} de casco.`;
            actionTaken = true;
        }

        // 2. Attempt Defend (Activate Defense Matrix) if lowish hull and not already buffed, and module available
        if (!actionTaken) {
            const defenseModule = enemyParticipantForUpdate.modules.find(m => m?.id === 'sm_utility_defense_matrix');
            if (defenseModule && (!enemyParticipantForUpdate.moduleCooldowns || (enemyParticipantForUpdate.moduleCooldowns?.[defenseModule.id] || 0) <= 0) &&
                enemyParticipantForUpdate.currentHull < enemyParticipantForUpdate.maxHull * 0.6 && Math.random() < 0.5) {

                enemyParticipantForUpdate.temporaryEffects = {
                    defenseRatingBonus: defenseModule.effects.defenseRatingBuff || 0,
                    turnsRemaining: 1 // Typically 1 turn for enemy AI simplicity
                };
                if (!enemyParticipantForUpdate.moduleCooldowns) enemyParticipantForUpdate.moduleCooldowns = {};
                enemyParticipantForUpdate.moduleCooldowns[defenseModule.id] = defenseModule.effects.cooldownTurns || 1; // Apply cooldown

                combatLogUpdate = `${enemyParticipantForUpdate.name} ativa sua Matriz Defensiva, aumentando a evasão!`;
                actionTaken = true;
            }
        }

        // 3. Default to Attack
        if (!actionTaken) {
            // Using the first weapon found for simplicity
            const enemyWeapon = enemyParticipantForUpdate.modules.find(m => m?.type === 'weapon') || null;
            const weaponEffects = enemyWeapon?.effects || { // Fallback to base stats if no weapon module (unlikely for NPC)
                kineticDamage: enemyParticipantForUpdate.kineticDamage, energyDamage: enemyParticipantForUpdate.energyDamage,
                explosiveDamage: enemyParticipantForUpdate.explosiveDamage, attackPower: enemyParticipantForUpdate.attackPower,
                weaponAccuracyBonus: 0, shieldPenetration: 0, armorPenetrationMultiplier: 1.0,
            };

            let hitChanceBase = 50; // Base hit chance
            const attackerTotalAttack = (weaponEffects.attackPower || 0) + (weaponEffects.weaponAccuracyBonus || 0);
            const targetTotalDefense = playerTargetStats.defenseRating + (playerTargetStats.temporaryEffects?.defenseRatingBonus || 0);
            const denominator = attackerTotalAttack + targetTotalDefense;

            if (denominator > 0) {
                hitChanceBase = (attackerTotalAttack / denominator) * 100;
            } else if (attackerTotalAttack > 0) { // Target has 0 defense, attacker has some attack
                hitChanceBase = 90; // High chance to hit
            } else { // Both 0
                hitChanceBase = 30; // Low chance, "potshot"
            }
            // Enemy AI gets a slight accuracy bonus
            const hitChance = Math.max(5, Math.min(95, hitChanceBase + 20)); // Cap between 5% and 95%

            if (Math.random() * 100 < hitChance) {
                const rawKinetic = weaponEffects.kineticDamage || 0;
                const rawEnergy = weaponEffects.energyDamage || 0;
                const rawExplosive = weaponEffects.explosiveDamage || 0;
                const totalRawDamage = rawKinetic + rawEnergy + rawExplosive;

                const shieldPen = weaponEffects.shieldPenetration || 0;
                const armorPenMulti = weaponEffects.armorPenetrationMultiplier || 1.0;

                let damageIgnoringShields = Math.floor(totalRawDamage * shieldPen);
                let damageToShieldSystem = totalRawDamage - damageIgnoringShields;

                // Apply resistances to damage going to shields
                let effectiveKineticToShield = Math.max(0, rawKinetic * (1 - (playerTargetStats.kineticResistance / 100)));
                let effectiveEnergyToShield = Math.max(0, rawEnergy * (1 - (playerTargetStats.energyResistance / 100)));
                let effectiveExplosiveToShield = Math.max(0, rawExplosive * (1 - (playerTargetStats.explosiveResistance / 100)));

                // If only part of the damage goes to shields (due to shieldPen), scale the resisted damage accordingly
                if (damageToShieldSystem < totalRawDamage && totalRawDamage > 0) {
                    const shieldSystemProportion = damageToShieldSystem / totalRawDamage;
                    effectiveKineticToShield *= shieldSystemProportion;
                    effectiveEnergyToShield *= shieldSystemProportion;
                    effectiveExplosiveToShield *= shieldSystemProportion;
                }

                const totalEffectiveDamageToShields = Math.floor(effectiveKineticToShield + effectiveEnergyToShield + effectiveExplosiveToShield);
                const actualDamageToShields = Math.min(playerTargetStats.currentShields, totalEffectiveDamageToShields);
                playerTargetStats.currentShields -= actualDamageToShields;
                let overflowDamage = Math.max(0, totalEffectiveDamageToShields - actualDamageToShields); // Damage that passed shields

                // Damage that goes directly to hull (overflow + shield-penetrating damage)
                let totalDamageToHullBeforeResistances = overflowDamage + damageIgnoringShields;
                let finalDamageToHull = 0;

                if (totalDamageToHullBeforeResistances > 0) {
                    // Distribute this damage based on original raw damage proportions to apply resistances
                    let kineticToHull = 0, energyToHull = 0, explosiveToHull = 0;
                    if (totalRawDamage > 0) { // Avoid division by zero if raw damage was 0 (e.g. debuff weapon)
                        kineticToHull = (rawKinetic / totalRawDamage) * totalDamageToHullBeforeResistances;
                        energyToHull = (rawEnergy / totalRawDamage) * totalDamageToHullBeforeResistances;
                        explosiveToHull = (rawExplosive / totalRawDamage) * totalDamageToHullBeforeResistances;
                    } else if (totalDamageToHullBeforeResistances > 0 && totalRawDamage === 0) {
                        // If raw damage is 0 but there's still hull damage (e.g. from a special effect not modeled here)
                        // Assume it's kinetic for simplicity or apply a generic resistance
                         kineticToHull = totalDamageToHullBeforeResistances; // Or apply a generic hull damage
                    }


                    const effectiveKineticToHull = Math.max(0, kineticToHull * (1 - (playerTargetStats.kineticResistance / 100)));
                    const effectiveEnergyToHull = Math.max(0, energyToHull * (1 - (playerTargetStats.energyResistance / 100)));
                    const effectiveExplosiveToHull = Math.max(0, explosiveToHull * (1 - (playerTargetStats.explosiveResistance / 100)));

                    finalDamageToHull = Math.floor((effectiveKineticToHull + effectiveEnergyToHull + effectiveExplosiveToHull) * armorPenMulti);
                }


                const actualDamageToHull = Math.min(playerTargetStats.currentHull, finalDamageToHull);
                playerTargetStats.currentHull -= actualDamageToHull;

                combatLogUpdate = `${enemyParticipantForUpdate.name} atinge ${playerTargetStats.name} causando ${actualDamageToShields + actualDamageToHull} de dano (${actualDamageToShields} aos escudos, ${actualDamageToHull} ao casco).`;
                cs.participants = cs.participants.map(p => p.shipId === playerTargetStats!.shipId ? {...playerTargetStats} : (p.shipId === enemyParticipantForUpdate.shipId ? {...enemyParticipantForUpdate} : p));

                if (playerTargetStats.currentHull <= 0) {
                    combatLogUpdate += ` ${playerTargetStats.name} foi destruído!`;
                    cs.combatLog = [...cs.combatLog, combatLogUpdate]; // Add final log before ending
                    endCombat(false); // Player lost
                    return {...prevPlayerState, combatState: cs}; // Return immediately as combat ended
                }
            } else {
                combatLogUpdate = `${enemyParticipantForUpdate.name} ataca ${playerTargetStats.name}, mas erra!`;
            }
        }
        cs.participants = cs.participants.map(p => p.shipId === enemyParticipantForUpdate.shipId ? {...enemyParticipantForUpdate} : p); // ensure enemy updates are saved
        cs.combatLog = [...cs.combatLog, combatLogUpdate];
        setTimeout(() => advanceCombatTurn(), 100); // Advance to next turn after enemy action
        return {...prevPlayerState, combatState: cs};
    });
  }, [advanceCombatTurn, endCombat]);


  const handlePlayerCombatAction = useCallback((action: CombatActionType, actionTarget?: string | { moduleId: string }) => {
    setPlayerState(prevPlayerState => {
        if (!prevPlayerState || !prevPlayerState.combatState || !prevPlayerState.combatState.isActive || !currentShip) return prevPlayerState;
        if (prevPlayerState.combatState.currentTurnParticipantId !== currentShip.id) {
            showError("Não é seu turno!");
            return prevPlayerState;
        }

        let cs = { ...prevPlayerState.combatState };
        let attackerStats = cs.participants.find(p => p.shipId === currentShip.id);
        let targetStats = cs.participants.find(p => p.shipId === cs.enemyShipDetails?.id); // Ensure this is correctly identified

        if (!attackerStats || (action === 'ATTACK_PRIMARY' && !targetStats) ) {
            showError("Participantes do combate não encontrados.");
            return prevPlayerState;
        }

        let combatLogUpdate = "";
        let playerParticipantForUpdate = {...attackerStats}; // Work on a copy

        if (action === 'ATTACK_PRIMARY' && targetStats) {
            const playerWeapon = playerParticipantForUpdate.modules.find(m => m?.type === 'weapon') || null;
            const weaponEffects = playerWeapon?.effects || { // Fallback to base stats if no weapon module
                kineticDamage: playerParticipantForUpdate.kineticDamage, energyDamage: playerParticipantForUpdate.energyDamage,
                explosiveDamage: playerParticipantForUpdate.explosiveDamage, attackPower: playerParticipantForUpdate.attackPower,
                weaponAccuracyBonus: 0, shieldPenetration: 0, armorPenetrationMultiplier: 1.0,
            };

            let hitChanceBase = 50;
            const attackerTotalAttack = (weaponEffects.attackPower || 0) + (weaponEffects.weaponAccuracyBonus || 0);
            const targetTotalDefense = targetStats.defenseRating + (targetStats.temporaryEffects?.defenseRatingBonus || 0);
            const denominator = attackerTotalAttack + targetTotalDefense;

            if (denominator > 0) {
                hitChanceBase = (attackerTotalAttack / denominator) * 100;
            } else if (attackerTotalAttack > 0) {
                hitChanceBase = 90;
            } else {
                 hitChanceBase = 30;
            }
            const hitChance = Math.max(5, Math.min(95, hitChanceBase + 25)); // Player gets a +25 accuracy bonus

            if (Math.random() * 100 < hitChance) {
                const rawKinetic = weaponEffects.kineticDamage || 0;
                const rawEnergy = weaponEffects.energyDamage || 0;
                const rawExplosive = weaponEffects.explosiveDamage || 0;
                const totalRawDamage = rawKinetic + rawEnergy + rawExplosive;

                const shieldPen = weaponEffects.shieldPenetration || 0;
                const armorPenMulti = weaponEffects.armorPenetrationMultiplier || 1.0;

                let damageIgnoringShields = Math.floor(totalRawDamage * shieldPen);
                let damageToShieldSystem = totalRawDamage - damageIgnoringShields;

                let effectiveKineticToShield = Math.max(0, rawKinetic * (1 - (targetStats.kineticResistance / 100)));
                let effectiveEnergyToShield = Math.max(0, rawEnergy * (1 - (targetStats.energyResistance / 100)));
                let effectiveExplosiveToShield = Math.max(0, rawExplosive * (1 - (targetStats.explosiveResistance / 100)));

                if (damageToShieldSystem < totalRawDamage && totalRawDamage > 0) {
                    const shieldSystemProportion = damageToShieldSystem / totalRawDamage;
                    effectiveKineticToShield *= shieldSystemProportion;
                    effectiveEnergyToShield *= shieldSystemProportion;
                    effectiveExplosiveToShield *= shieldSystemProportion;
                }

                const totalEffectiveDamageToShields = Math.floor(effectiveKineticToShield + effectiveEnergyToShield + effectiveExplosiveToShield);
                const actualDamageToShields = Math.min(targetStats.currentShields, totalEffectiveDamageToShields);
                targetStats.currentShields -= actualDamageToShields;
                let overflowDamage = Math.max(0, totalEffectiveDamageToShields - actualDamageToShields);

                let totalDamageToHullBeforeResistances = overflowDamage + damageIgnoringShields;
                let finalDamageToHull = 0;

                if (totalDamageToHullBeforeResistances > 0) {
                    let kineticToHull = 0, energyToHull = 0, explosiveToHull = 0;
                     if (totalRawDamage > 0) {
                        kineticToHull = (rawKinetic / totalRawDamage) * totalDamageToHullBeforeResistances;
                        energyToHull = (rawEnergy / totalRawDamage) * totalDamageToHullBeforeResistances;
                        explosiveToHull = (rawExplosive / totalRawDamage) * totalDamageToHullBeforeResistances;
                    } else if (totalDamageToHullBeforeResistances > 0 && totalRawDamage === 0) {
                         kineticToHull = totalDamageToHullBeforeResistances;
                    }

                    const effectiveKineticToHull = Math.max(0, kineticToHull * (1 - (targetStats.kineticResistance / 100)));
                    const effectiveEnergyToHull = Math.max(0, energyToHull * (1 - (targetStats.energyResistance / 100)));
                    const effectiveExplosiveToHull = Math.max(0, explosiveToHull * (1 - (targetStats.explosiveResistance / 100)));

                    finalDamageToHull = Math.floor((effectiveKineticToHull + effectiveEnergyToHull + effectiveExplosiveToHull) * armorPenMulti);
                }

                const actualDamageToHull = Math.min(targetStats.currentHull, finalDamageToHull);
                targetStats.currentHull -= actualDamageToHull;

                combatLogUpdate = `${playerParticipantForUpdate.name} atinge ${targetStats.name} causando ${actualDamageToShields + actualDamageToHull} de dano (${actualDamageToShields} aos escudos, ${actualDamageToHull} ao casco).`;
                cs.participants = cs.participants.map(p => p.shipId === targetStats!.shipId ? {...targetStats} : (p.shipId === playerParticipantForUpdate.shipId ? {...playerParticipantForUpdate} : p));
                if (targetStats.currentHull <= 0) {
                    combatLogUpdate += ` ${targetStats.name} foi destruído!`;
                    cs.combatLog = [...cs.combatLog, combatLogUpdate];
                    endCombat(true); // Player won
                    return {...prevPlayerState, combatState: cs }; // Return immediately
                }
            } else {
                combatLogUpdate = `${playerParticipantForUpdate.name} ataca ${targetStats.name}, mas erra!`;
            }
        } else if (action === 'DEFEND') {
            const defenseModule = playerParticipantForUpdate.modules.find(m => m?.id === 'sm_utility_defense_matrix');
            // Check if defense matrix module is available and not on cooldown
            if (defenseModule && defenseModule.effects.defenseRatingBuff && (!playerParticipantForUpdate.moduleCooldowns || (playerParticipantForUpdate.moduleCooldowns?.[defenseModule.id] || 0) <= 0) ) {
                playerParticipantForUpdate.temporaryEffects = {
                    defenseRatingBonus: defenseModule.effects.defenseRatingBuff,
                    turnsRemaining: 1 // Buff lasts for 1 turn (enemy's next attack)
                };
                if(!playerParticipantForUpdate.moduleCooldowns) playerParticipantForUpdate.moduleCooldowns = {};
                playerParticipantForUpdate.moduleCooldowns[defenseModule.id] = defenseModule.effects.cooldownTurns || 1;
                combatLogUpdate = `${playerParticipantForUpdate.name} ativa a Matriz Defensiva, aumentando sua evasão!`;
            } else {
                 // Standard defend action if module not available or on cooldown
                 // This could be a smaller, default defense buff or just a log message
                 combatLogUpdate = `${playerParticipantForUpdate.name} assume uma postura defensiva.`;
            }
        } else if (action === 'FLEE') {
            const playerSpeed = playerParticipantForUpdate.speed;
            const enemySpeed = targetStats?.speed || 0; // TargetStats might be undefined if not attacking
            let fleeChance = 40 + (playerSpeed - enemySpeed); // Base flee chance + speed difference
            fleeChance = Math.max(10, Math.min(90, fleeChance)); // Clamp between 10% and 90%

            if (Math.random() * 100 < fleeChance) {
                combatLogUpdate = `${playerParticipantForUpdate.name} conseguiu escapar!`;
                cs.combatLog = [...cs.combatLog, combatLogUpdate];
                endCombat(false, true); // Player fled
                return {...prevPlayerState, combatState: cs }; // Return immediately
            } else {
                combatLogUpdate = `Tentativa de fuga de ${playerParticipantForUpdate.name} falhou!`;
            }
        } else if (action === 'USE_MODULE' && typeof actionTarget === 'object' && actionTarget.moduleId) {
            const moduleId = actionTarget.moduleId;
            const moduleToUse = playerParticipantForUpdate.modules.find(m => m?.id === moduleId);
            if (moduleToUse && moduleToUse.type === 'special_utility') {
                if (playerParticipantForUpdate.moduleCooldowns && playerParticipantForUpdate.moduleCooldowns[moduleId] > 0) {
                    combatLogUpdate = `${moduleToUse.name} está em recarga por mais ${playerParticipantForUpdate.moduleCooldowns[moduleId]} turnos.`;
                } else if (moduleToUse.effects.repairAmount) {
                    const repairAmount = moduleToUse.effects.repairAmount;
                    const healedAmount = Math.min(repairAmount, playerParticipantForUpdate.maxHull - playerParticipantForUpdate.currentHull);
                    playerParticipantForUpdate.currentHull += healedAmount;
                    combatLogUpdate = `${playerParticipantForUpdate.name} usa ${moduleToUse.name}, reparando ${healedAmount} de casco.`;
                    if (moduleToUse.effects.cooldownTurns) {
                        if(!playerParticipantForUpdate.moduleCooldowns) playerParticipantForUpdate.moduleCooldowns = {};
                        playerParticipantForUpdate.moduleCooldowns[moduleId] = moduleToUse.effects.cooldownTurns;
                    }
                } else {
                    combatLogUpdate = `${moduleToUse.name} não pode ser usado desta forma ou não tem efeito definido.`;
                }
            } else {
                 combatLogUpdate = `Módulo ${moduleId} não encontrado ou não é um utilitário especial.`;
            }
        }
        cs.participants = cs.participants.map(p => p.shipId === playerParticipantForUpdate.shipId ? {...playerParticipantForUpdate} : p);
        cs.combatLog = [...cs.combatLog, combatLogUpdate];

        setTimeout(() => advanceCombatTurn(), 100); // Advance turn after player action
        return {...prevPlayerState, combatState: cs };
    });
  }, [currentShip, advanceCombatTurn, showError, endCombat]);

  const handleStartCombat = (enemyShip: Ship) => {
    if (!playerState || !currentShip || !currentShipCalculatedStats) {
        showError("Não é possível iniciar o combate: dados do jogador ou da nave ausentes.");
        return;
    }
    if (playerState.combatState?.isActive) {
        showError("Já está em combate!");
        return;
    }

    setViewBeforeCombat(currentView); // Save current view to return after combat

    const playerStats: CombatParticipantStats = {
        shipId: currentShip.id,
        name: currentShip.name,
        isPlayer: true,
        hullTypeId: currentShip.hullTypeId,
        currentHull: currentShip.currentHullIntegrity ?? currentShipCalculatedStats.totalHullIntegrity,
        maxHull: currentShipCalculatedStats.totalHullIntegrity,
        currentShields: currentShip.currentShieldStrength ?? currentShipCalculatedStats.totalShieldStrength,
        maxShields: currentShipCalculatedStats.totalShieldStrength,
        attackPower: currentShipCalculatedStats.totalAttackPower,
        defenseRating: currentShipCalculatedStats.totalDefenseRating,
        kineticDamage: currentShipCalculatedStats.totalKineticDamage,
        energyDamage: currentShipCalculatedStats.totalEnergyDamage,
        explosiveDamage: currentShipCalculatedStats.totalExplosiveDamage,
        kineticResistance: currentShipCalculatedStats.totalKineticResistance,
        energyResistance: currentShipCalculatedStats.totalEnergyResistance,
        explosiveResistance: currentShipCalculatedStats.totalExplosiveResistance,
        speed: currentShipCalculatedStats.totalSpeed,
        modules: currentShip.modules.map(m => m ? {...m} : null), // Deep copy modules
        moduleCooldowns: playerState.combatState?.participants.find(p=>p.isPlayer)?.moduleCooldowns || {}, // Persist cooldowns if any
    };

    const enemyShipCalculatedStats = calculateShipStats(enemyShip);
    const enemyStats: CombatParticipantStats = {
        shipId: enemyShip.id,
        name: enemyShip.name,
        isPlayer: false,
        hullTypeId: enemyShip.hullTypeId,
        currentHull: enemyShip.currentHullIntegrity ?? enemyShipCalculatedStats.totalHullIntegrity,
        maxHull: enemyShipCalculatedStats.totalHullIntegrity,
        currentShields: enemyShip.currentShieldStrength ?? enemyShipCalculatedStats.totalShieldStrength,
        maxShields: enemyShipCalculatedStats.totalShieldStrength,
        attackPower: enemyShipCalculatedStats.totalAttackPower,
        defenseRating: enemyShipCalculatedStats.totalDefenseRating,
        kineticDamage: enemyShipCalculatedStats.totalKineticDamage,
        energyDamage: enemyShipCalculatedStats.totalEnergyDamage,
        explosiveDamage: enemyShipCalculatedStats.totalExplosiveDamage,
        kineticResistance: enemyShipCalculatedStats.totalKineticResistance,
        energyResistance: enemyShipCalculatedStats.totalEnergyResistance,
        explosiveResistance: enemyShipCalculatedStats.totalExplosiveResistance,
        speed: enemyShipCalculatedStats.totalSpeed,
        modules: enemyShip.modules.map(m => m ? {...m} : null), // Deep copy modules
        moduleCooldowns: {}, // NPCs start with no cooldowns typically
    };

    // Initiative roll: d20 + speed bonus (e.g., speed/10)
    playerStats.initiativeRoll = Math.floor(Math.random() * 20) + 1 + Math.floor(playerStats.speed / 10);
    enemyStats.initiativeRoll = Math.floor(Math.random() * 20) + 1 + Math.floor(enemyStats.speed / 10);

    const participants = [playerStats, enemyStats];
    // Sort by initiative, higher goes first. If tied, player goes first.
    const turnOrder = participants
        .sort((a, b) => (b.initiativeRoll ?? 0) - (a.initiativeRoll ?? 0) || (a.isPlayer ? -1 : 1))
        .map(p => p.shipId);

    const newCombatState: CombatState = {
        isActive: true,
        participants,
        turnOrder,
        currentTurnParticipantId: turnOrder[0],
        combatLog: [`Combate iniciado entre ${playerStats.name} e ${enemyStats.name}!`, `${participants.find(p=>p.shipId === turnOrder[0])?.name} tem a iniciativa.`],
        enemyShipDetails: {...enemyShip}, // Store full enemy ship details
        playerShipStartStats: {...currentShipCalculatedStats}, // Store player ship stats at start
        enemyShipStartStats: {...enemyShipCalculatedStats},   // Store enemy ship stats at start
        roundCounter: 1,
    };

    setPlayerState(prev => prev ? { ...prev, combatState: newCombatState, combatSummaryData: null } : null); // Clear previous summary
    setCurrentView('combat');
    setGamePhase('combatView');
    showNotification(`Combate iniciado com ${enemyShip.name}!`);
};


  const handleCloseCombatSummary = () => {
    setPlayerState(prev => {
        if (!prev || !prev.combatSummaryData) return prev;

        const summaryType = prev.combatSummaryData.type;
        let newGamePhase: GamePhase = 'playing';
        let newCurrentView: GameView = viewBeforeCombat; // Restore view from before combat
        let newPlayerState: PlayerState | null = prev;

        if (summaryType === 'victory' || summaryType === 'fled') {
            newGamePhase = 'playing';
            // currentView remains viewBeforeCombat
        } else if (summaryType === 'defeat') {
            // Game Over: Reset player state, go to title screen
            newPlayerState = null; // This effectively ends the game for this player
            newGamePhase = 'titleScreen';
            newCurrentView = 'galaxy'; // Default view for title screen if needed
        }


        if (newPlayerState) {
            newPlayerState = {
                ...newPlayerState,
                combatState: null, // Clear combat state
                combatSummaryData: null, // Clear summary data
            };
        }

        setGamePhase(newGamePhase);
        setCurrentView(newCurrentView);
        return newPlayerState;
    });
  };

  const processNextUnresolvedEvent = useCallback(() => {
    setActiveColonyEvents(prevActiveEvents => {
        const nextEvent = prevActiveEvents.find(event => event.activeChoices && event.activeChoices.length > 0 && !event.isResolved);
        setUnresolvedColonyEventToShow(nextEvent || null);
        return prevActiveEvents; // Return unchanged list, only setting local state
    });
  }, [setActiveColonyEvents, setUnresolvedColonyEventToShow]);


  useEffect(() => {
    if (gamePhase === 'playing' && playerState && !isFighting) {
      if (playerState.isTraveling && playerState.travelDetails) {
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = window.setInterval(() => {
          gameTickCounterRef.current++;
          setPlayerState(prev => {
            if (!prev || !prev.isTraveling || !prev.travelDetails) return prev;
            if (gameTickCounterRef.current >= prev.travelDetails.arrivalTick) {
              const destId = prev.travelDetails.destinationId;
              const destType = prev.travelDetails.destinationType;
              let destSystemId: string | null = prev.currentSystemId;
              let destName = destId;

              const planetInfo = discoveredPlanets.find(p => p.id === destId);
              const stationInfo = discoveredStations.find(s => s.id === destId);
              const systemInfo = _starSystems.find(s => s.id === destId);


              if (destType === 'planet' && planetInfo) {
                  destSystemId = planetInfo.systemId;
                  destName = prev.knownSystemIds.includes(planetInfo.systemId) ? planetInfo.name : "Planeta Desconhecido";
              } else if (destType === 'station' && stationInfo) {
                  destSystemId = stationInfo.systemId;
                  destName = prev.knownSystemIds.includes(stationInfo.systemId) ? stationInfo.name : "Estação Desconhecida";
              } else if (destType === 'system' && systemInfo) {
                  destSystemId = systemInfo.id;
                  destName = prev.knownSystemIds.includes(systemInfo.id) ? systemInfo.name : "Sistema Desconhecido";
              }

              showNotification(`Chegou a ${destName}!`);

              if (destType === 'planet' && planetInfo) {
                  setSelectedPlanet(planetInfo);
                  setSelectedStation(null);
                  setSelectedSystemIdForDetailView(planetInfo.systemId);
                  setCurrentView('planet');
              } else if (destType === 'station' && stationInfo) {
                  setSelectedStation(stationInfo);
                  setSelectedPlanet(null);
                  setSelectedSystemIdForDetailView(stationInfo.systemId);
                  setCurrentView('stationDetails');
              } else if (destType === 'system' && systemInfo) {
                   setSelectedSystemIdForDetailView(systemInfo.id);
                   setSelectedPlanet(null);
                   setSelectedStation(null);
                   setCurrentView('systemDetail');
              }

              return {
                  ...prev,
                  isTraveling: false,
                  travelDetails: null,
                  currentLocation: (destType === 'planet' || destType === 'station') ? destId : `orbit_${destId}`,
                  currentSystemId: destSystemId,
                  knownSystemIds: [...new Set([...prev.knownSystemIds, ...(destSystemId ? [destSystemId] : [])])],
                  visitedLocationIds: [...new Set([...(prev.visitedLocationIds || []), destId, ...(destSystemId ? [destSystemId] : [])])],
              };
            }
            return prev;
          });
        }, 1000);
      } else { // Not traveling, regular game tick
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = window.setInterval(() => {
          gameTickCounterRef.current++;
          const newActionableEventsForModal: ColonyEvent[] = []; // Temp store for events to show in modal sequentially
          let updatedDiscoveredPlanetsForTick = [...discoveredPlanets]; // Start with a fresh copy for this tick's modifications

          setPlayerState(prevPlayerState => {
            if (!prevPlayerState) return null;
            let mutablePlayerState = { ...prevPlayerState };
            mutablePlayerState.inventory = { ...prevPlayerState.inventory };
            mutablePlayerState.activePolicies = [...prevPlayerState.activePolicies];
            
            const currentShipForTick = mutablePlayerState.ownedShips.find(s => s.id === mutablePlayerState.currentShipId);
            const currentShipStatsForTick = currentShipForTick ? calculateShipStats(currentShipForTick) : null;
            const cargoCapacityForTick = currentShipStatsForTick ? currentShipStatsForTick.totalCargoCapacity : 0;

            let updatedActiveTreaties = [...mutablePlayerState.activeTreaties];
            let researchPointsFromBuildingsThisTick = 0;
            let creditsFromPoliciesThisTick = 0;
            let researchPointsFromPoliciesThisTick = 0;
            let skillPointsFromPoliciesThisTick = 0;
            
            updatedDiscoveredPlanetsForTick = updatedDiscoveredPlanetsForTick.map(colony => {
                let mutableColony = {...colony, buildings: [...colony.buildings]}; // Ensure deep enough copy for buildings if needed
                
                // Initialize/reset advancedConsumption for this tick
                mutableColony.advancedConsumption = {};

                // --- MORALE CALCULATION ---
                if (colony.isColonized && !colony.ownerFactionId) {
                    // Initialize morale if not exists
                    if (mutableColony.colonyMorale === undefined) {
                        mutableColony.colonyMorale = INITIAL_COLONY_MORALE;
                    }

                    let moraleChange = 0;

                    // Building Morale Bonuses
                    colony.buildings.forEach(buildingInstance => {
                        const buildingDef = COLONIAL_BUILDING_DEFINITIONS.find(def => def.id === buildingInstance.definitionId);
                        if (buildingDef && buildingDef.effects.moraleBonusPerTick) {
                            moraleChange += buildingDef.effects.moraleBonusPerTick;
                        }
                    });

                    // Resource Consumption and Morale Impact
                    if (colony.population >= MIN_POP_FOR_ADVANCED_CONSUMPTION) {
                        for (const resourceName in PER_CAPITA_CONSUMPTION_RATES) {
                            const rate = PER_CAPITA_CONSUMPTION_RATES[resourceName];
                            const amountToConsume = Math.ceil(colony.population * rate);
                            if (amountToConsume > 0) {
                                mutableColony.advancedConsumption[resourceName] = amountToConsume;
                                const currentResourceInInventory = mutablePlayerState.inventory[resourceName] || 0;
                                
                                if (currentResourceInInventory >= amountToConsume) {
                                    mutablePlayerState.inventory[resourceName] -= amountToConsume;
                                    // Small morale boost for having resources (surplus vs requirement)
                                    // Since we consume exactly what's needed, we don't have "surplus" in this check yet, 
                                    // but we can assume satisfied demand is good.
                                    moraleChange += MORALE_GAIN_PER_SURPLUS_UNIT * 0.5; 
                                } else {
                                    const shortageAmount = amountToConsume - currentResourceInInventory;
                                    mutablePlayerState.inventory[resourceName] = 0;
                                    showNotification(`Alerta: Falta de ${shortageAmount} ${resourceName} em ${colony.name}! Moral em queda.`);
                                    moraleChange -= shortageAmount * MORALE_LOSS_PER_DEFICIT_UNIT;
                                }
                            }
                        }
                    }

                    // Natural Drift towards Neutral (50)
                    if (mutableColony.colonyMorale > 50) {
                        moraleChange -= MORALE_BASE_CHANGE_TOWARDS_NEUTRAL;
                    } else if (mutableColony.colonyMorale < 50) {
                        moraleChange += MORALE_BASE_CHANGE_TOWARDS_NEUTRAL;
                    }

                    // Apply Morale Change
                    mutableColony.colonyMorale = Math.max(MIN_COLONY_MORALE, Math.min(MAX_COLONY_MORALE, mutableColony.colonyMorale + moraleChange));

                    // --- MORALE EFFECTS ---
                    const moraleMultiplier = getMoraleProductionMultiplier(mutableColony.colonyMorale);

                    // Population Growth Adjustment
                    let growthRate = POPULATION_GROWTH_RATE_PER_TICK;
                    if (mutableColony.colonyMorale >= MORALE_HAPPY_THRESHOLD) {
                        growthRate *= 1.25; // 25% faster growth
                    } else if (mutableColony.colonyMorale <= MORALE_UNHAPPY_THRESHOLD) {
                        growthRate *= 0.5; // 50% slower growth
                    }
                    mutableColony.population += mutableColony.population * growthRate;

                    // Base Production (from planet itself) - Affected by Morale
                    for (const resource in colony.baseProduction) {
                        const amountProduced = Math.floor(colony.baseProduction[resource] * moraleMultiplier);
                        if (calculateCurrentCargoUsage(mutablePlayerState.inventory) + (amountProduced * RESOURCE_UNIT_WEIGHT) <= cargoCapacityForTick) {
                            mutablePlayerState.inventory[resource] = (mutablePlayerState.inventory[resource] || 0) + amountProduced;
                        } 
                    }

                    // Building Effects (Production & Research) - Affected by Morale
                    colony.buildings.forEach(buildingInstance => {
                        const buildingDef = COLONIAL_BUILDING_DEFINITIONS.find(def => def.id === buildingInstance.definitionId);
                        if (buildingDef) {
                            if (buildingDef.effects.researchPointBonusPerTick) {
                                researchPointsFromBuildingsThisTick += Math.floor(buildingDef.effects.researchPointBonusPerTick * moraleMultiplier);
                            }
                            if (buildingDef.effects.resourceProductionBonus) {
                                const { resourceName, amountPerTick } = buildingDef.effects.resourceProductionBonus;
                                const adjustedAmount = Math.floor(amountPerTick * moraleMultiplier);
                                if (calculateCurrentCargoUsage(mutablePlayerState.inventory) + (adjustedAmount * RESOURCE_UNIT_WEIGHT) <= cargoCapacityForTick) {
                                    mutablePlayerState.inventory[resourceName] = (mutablePlayerState.inventory[resourceName] || 0) + adjustedAmount;
                                }
                            }
                        }
                    });
                }
                return mutableColony;
            });
            setDiscoveredPlanets(updatedDiscoveredPlanetsForTick); // Update state with calculated demands

            mutablePlayerState.researchPoints = (mutablePlayerState.researchPoints || 0) + researchPointsFromBuildingsThisTick;

            mutablePlayerState.activePolicies.forEach(activePolicy => {
                const policyDef = POLICY_DEFINITIONS.find(p => p.id === activePolicy.policyId);
                if (policyDef) {
                    if (policyDef.ongoingEffect.flatCreditBonusPerTick) creditsFromPoliciesThisTick += policyDef.ongoingEffect.flatCreditBonusPerTick;
                    if (policyDef.ongoingEffect.flatResearchPointBonusPerTick) researchPointsFromPoliciesThisTick += policyDef.ongoingEffect.flatResearchPointBonusPerTick;
                    if (policyDef.ongoingEffect.resourceProductionPerTick) {
                        policyDef.ongoingEffect.resourceProductionPerTick.forEach(prod => {
                            if (calculateCurrentCargoUsage(mutablePlayerState.inventory) + (prod.amount * RESOURCE_UNIT_WEIGHT) <= cargoCapacityForTick) {
                                mutablePlayerState.inventory[prod.resourceName] = (mutablePlayerState.inventory[prod.resourceName] || 0) + prod.amount;
                            }
                        });
                    }
                    if (policyDef.ongoingEffect.flatSkillPointBonusPerTick) skillPointsFromPoliciesThisTick += policyDef.ongoingEffect.flatSkillPointBonusPerTick;
                }
            });
            mutablePlayerState.credits += creditsFromPoliciesThisTick;
            mutablePlayerState.researchPoints += researchPointsFromPoliciesThisTick;
            policySkillPointCounterRef.current += skillPointsFromPoliciesThisTick;
            if (policySkillPointCounterRef.current >= 1) {
                const wholeSkillPointsGained = Math.floor(policySkillPointCounterRef.current);
                mutablePlayerState.skillPoints += wholeSkillPointsGained;
                policySkillPointCounterRef.current -= wholeSkillPointsGained;
                if (wholeSkillPointsGained > 0) showNotification(`+${wholeSkillPointsGained} Ponto(s) de Habilidade de Políticas!`);
            }

            if (gameTickCounterRef.current % TICKS_FOR_SKILL_POINT_GAIN === 0) mutablePlayerState.skillPoints += SKILL_POINTS_PER_GAIN;
            if (gameTickCounterRef.current % TICKS_FOR_RESEARCH_POINT_GAIN === 0 && researchPointsFromBuildingsThisTick === 0 && researchPointsFromPoliciesThisTick === 0) { 
                 mutablePlayerState.researchPoints += RESEARCH_POINTS_PER_GAIN;
            }

            updatedActiveTreaties = mutablePlayerState.activeTreaties.map(treaty => ({...treaty, durationTicks: treaty.durationTicks - 1})).filter(treaty => treaty.durationTicks > 0);
            if (updatedActiveTreaties.length < mutablePlayerState.activeTreaties.length) showNotification("Um ou mais tratados diplomáticos expiraram.");
            
            if (gameTickCounterRef.current % MARKET_STOCK_REFRESH_INTERVAL_TICKS === 0) {
                setDiscoveredStations(prevStations =>
                    prevStations.map(station => {
                        if (station.marketInventory) {
                            const newMarketInventory: Record<string, MarketListing> = {};
                            for (const resourceName in station.marketInventory) {
                                const listing = station.marketInventory[resourceName];
                                let newQuantity = listing.quantity;
                                if (listing.isProduced) newQuantity = Math.min(MAX_RESOURCE_STOCK_PER_ITEM, listing.quantity + MARKET_STOCK_ADJUSTMENT_AMOUNT);
                                else if (listing.isConsumed) newQuantity = Math.max(MIN_RESOURCE_STOCK_PER_ITEM, listing.quantity - Math.floor(MARKET_STOCK_ADJUSTMENT_AMOUNT / 2));
                                newMarketInventory[resourceName] = { ...listing, quantity: newQuantity };
                            }
                            return { ...station, marketInventory: newMarketInventory };
                        }
                        return station;
                    })
                );
            }

            // --- PREDEFINED COLONY EVENT TRIGGER LOGIC (Synchronous Part) ---
            const playerOwnedColoniesForPredefined = updatedDiscoveredPlanetsForTick.filter(p => p.isColonized && !p.ownerFactionId);
            playerOwnedColoniesForPredefined.forEach(colony => {
                const isLLMAttemptedForThisColony = (playerStateRef.current?.colonyLLMEventAttemptTracker?.[colony.id] === gameTickCounterRef.current);
                if (isLLMAttemptedForThisColony) return; 

                if (Math.random() < COLONY_EVENT_BASE_CHANCE_PER_TICK) {
                    for (const eventDef of COLONY_EVENT_TYPE_DEFINITIONS) {
                        if (Math.random() < eventDef.baseChance) {
                            const newEvent: ColonyEvent = { id: generateIdUtil(), eventTypeId: eventDef.id, planetId: colony.id, title: eventDef.titlePlaceholder.replace('{planetName}', colony.name), description: eventDef.descriptionPlaceholder.replace('{planetName}', colony.name), triggerTick: gameTickCounterRef.current, isResolved: false };
                            let notificationMessageParts: string[] = [`Evento em ${colony.name}: ${newEvent.title}`];
                            if (eventDef.requiresPlayerAction && eventDef.choices) {
                                newEvent.activeChoices = eventDef.choices.map(choice => ({ ...choice }));
                                newActionableEventsForModal.push(newEvent); // Add to temp list for modal showing
                                notificationMessageParts.push("Requer sua atenção!");
                            } else if (eventDef.immediateEffects) {
                                newEvent.isResolved = true;
                                eventDef.immediateEffects.forEach(effect => { 
                                    switch (effect.type) {
                                        case ColonyEventEffectType.RESOURCE_CHANGE:
                                            if (effect.resourceName) {
                                                const currentAmount = mutablePlayerState.inventory[effect.resourceName] || 0;
                                                const changeAmount = effect.amount;
                                                if (changeAmount > 0 && calculateCurrentCargoUsage(mutablePlayerState.inventory) + (changeAmount * RESOURCE_UNIT_WEIGHT) > cargoCapacityForTick) {
                                                    notificationMessageParts.push(`Carga excedida! ${effect.resourceName} (${changeAmount}) não adicionado.`);
                                                } else {
                                                    mutablePlayerState.inventory[effect.resourceName] = Math.max(0, currentAmount + changeAmount);
                                                    if (effect.message) notificationMessageParts.push(effect.message);
                                                    else notificationMessageParts.push(`${effect.resourceName}: ${changeAmount > 0 ? '+' : ''}${changeAmount}`);
                                                }
                                            }
                                            break;
                                        case ColonyEventEffectType.CREDIT_CHANGE:
                                            mutablePlayerState.credits = Math.max(0, mutablePlayerState.credits + effect.amount);
                                            if (effect.message) notificationMessageParts.push(effect.message);
                                            else notificationMessageParts.push(`Créditos: ${effect.amount > 0 ? '+' : ''}${effect.amount}`);
                                            break;
                                        case ColonyEventEffectType.RESEARCH_POINTS_CHANGE:
                                            mutablePlayerState.researchPoints = Math.max(0, mutablePlayerState.researchPoints + effect.amount);
                                            if (effect.message) notificationMessageParts.push(effect.message);
                                            else notificationMessageParts.push(`P&D: ${effect.amount > 0 ? '+' : ''}${effect.amount} RP`);
                                            break;
                                        case ColonyEventEffectType.POPULATION_CHANGE:
                                            {
                                                const planetIndex = updatedDiscoveredPlanetsForTick.findIndex(p => p.id === colony.id);
                                                if (planetIndex !== -1) {
                                                    updatedDiscoveredPlanetsForTick[planetIndex].population = Math.max(0, updatedDiscoveredPlanetsForTick[planetIndex].population + effect.amount);
                                                    if (effect.message) notificationMessageParts.push(effect.message);
                                                    else notificationMessageParts.push(`População: ${effect.amount > 0 ? '+' : ''}${effect.amount}`);
                                                }
                                            }
                                            break;
                                        default: if(effect.message) notificationMessageParts.push(effect.message); break;
                                    }
                                });
                            }
                            showNotification(notificationMessageParts.join(' - '));
                            setActiveColonyEvents(prevEvents => [...prevEvents, newEvent]); // Add to main active events
                            break; 
                        }
                    }
                }
            });
            
            return {...mutablePlayerState, lastTickTime: Date.now(), activeTreaties: updatedActiveTreaties};
          });

          if (newActionableEventsForModal.length > 0) {
            // setActiveColonyEvents was already called inside the loop for predefined events
            if (!unresolvedColonyEventToShow && playerStateRef.current) { // Check against ref for most current
                 processNextUnresolvedEvent(); // Try to show the first one
            }
          }

          // --- ASYNCHRONOUS LLM COLONY EVENT GENERATION ---
          const currentGlobalPlayerState = playerStateRef.current; 
          if (currentGlobalPlayerState) {
            const playerColoniesForLLM = updatedDiscoveredPlanetsForTick.filter(p => p.isColonized && !p.ownerFactionId);
            playerColoniesForLLM.forEach(colony => {
              if (Math.random() < COLONY_EVENT_BASE_CHANCE_PER_TICK) { 
                if (Math.random() < LLM_EVENT_ROLL_CHANCE) { 
                  
                  const wasPredefinedEventAddedThisTick = newActionableEventsForModal.some(e => e.planetId === colony.id) || activeColonyEvents.some(e=>e.planetId === colony.id && e.triggerTick === gameTickCounterRef.current && !e.eventTypeId.startsWith("llm_"));
                  
                  if (wasPredefinedEventAddedThisTick) return; 

                  setPlayerState(prev => prev ? { ...prev, colonyLLMEventAttemptTracker: { ...(prev.colonyLLMEventAttemptTracker || {}), [colony.id]: gameTickCounterRef.current } } : null);

                  console.log(`Attempting LLM event for ${colony.name}`);
                  generateColonyEventDetails(colony.name, colony.biome)
                    .then(llmEventDetails => {
                      const latestPlayerState = playerStateRef.current; 
                      if (!llmEventDetails || !latestPlayerState) return;

                      const newLlmEvent: ColonyEvent = {
                        id: generateIdUtil(),
                        eventTypeId: `llm_event_${generateIdUtil()}`,
                        planetId: colony.id,
                        title: llmEventDetails.title.replace('{planetName}', colony.name),
                        description: llmEventDetails.description.replace('{planetName}', colony.name),
                        triggerTick: gameTickCounterRef.current,
                        isResolved: false,
                      };
                      let notificationMessageParts: string[] = [`Evento (IA) em ${colony.name}: ${newLlmEvent.title}`];

                      if (llmEventDetails.requiresPlayerAction && llmEventDetails.choices) {
                        newLlmEvent.activeChoices = llmEventDetails.choices.map(choice => ({ ...choice }));
                        setActiveColonyEvents(prev => [...prev, newLlmEvent]);
                        // Check unresolvedColonyEventToShow using the ref, as local state might be stale
                        if (!playerStateRef.current?.isTraveling && !unresolvedColonyEventToShow) {
                            setUnresolvedColonyEventToShow(newLlmEvent);
                        }
                        notificationMessageParts.push("Requer sua atenção!");
                        showNotification(notificationMessageParts.join(' - '));
                      } else if (llmEventDetails.immediateEffects) {
                        newLlmEvent.isResolved = true;
                        setPlayerState(prevPs => {
                          if (!prevPs) return null;
                          let mutablePs = { ...prevPs, inventory: { ...prevPs.inventory } };
                          const shipForEffect = mutablePs.ownedShips.find(s => s.id === mutablePs.currentShipId);
                          const currentShipStatsForEffect = shipForEffect ? calculateShipStats(shipForEffect) : null;
                          const cargoCap = currentShipStatsForEffect ? currentShipStatsForEffect.totalCargoCapacity : 0;
                          let mutablePlanetsForLLMEffect = [...discoveredPlanets]; // Use a fresh copy of discoveredPlanets from the outer scope


                          llmEventDetails.immediateEffects!.forEach(effect => {
                            switch (effect.type) {
                              case ColonyEventEffectType.RESOURCE_CHANGE:
                                if (effect.resourceName) {
                                  const currentAmount = mutablePs.inventory[effect.resourceName] || 0;
                                  const changeAmount = effect.amount;
                                  if (changeAmount > 0 && calculateCurrentCargoUsage(mutablePs.inventory) + (changeAmount * RESOURCE_UNIT_WEIGHT) > cargoCap) {
                                    notificationMessageParts.push(`Carga excedida! ${effect.resourceName} (${changeAmount}) não adicionado.`);
                                  } else {
                                    mutablePs.inventory[effect.resourceName] = Math.max(0, currentAmount + changeAmount);
                                    if (effect.message) notificationMessageParts.push(effect.message);
                                    else notificationMessageParts.push(`${effect.resourceName}: ${changeAmount > 0 ? '+' : ''}${changeAmount}`);
                                  }
                                }
                                break;
                              case ColonyEventEffectType.CREDIT_CHANGE:
                                mutablePs.credits = Math.max(0, mutablePs.credits + effect.amount);
                                if (effect.message) notificationMessageParts.push(effect.message);
                                else notificationMessageParts.push(`Créditos: ${effect.amount > 0 ? '+' : ''}${effect.amount}`);
                                break;
                              case ColonyEventEffectType.RESEARCH_POINTS_CHANGE:
                                mutablePs.researchPoints = Math.max(0, mutablePs.researchPoints + effect.amount);
                                 if (effect.message) notificationMessageParts.push(effect.message);
                                else notificationMessageParts.push(`P&D: ${effect.amount > 0 ? '+' : ''}${effect.amount} RP`);
                                break;
                              case ColonyEventEffectType.POPULATION_CHANGE:
                                {
                                    const planetIndex = mutablePlanetsForLLMEffect.findIndex(p => p.id === newLlmEvent.planetId);
                                    if (planetIndex !== -1) {
                                        mutablePlanetsForLLMEffect[planetIndex].population = Math.max(0, mutablePlanetsForLLMEffect[planetIndex].population + effect.amount);
                                        setDiscoveredPlanets(mutablePlanetsForLLMEffect); // Update the main discoveredPlanets state
                                        if (effect.message) notificationMessageParts.push(effect.message);
                                        else notificationMessageParts.push(`População: ${effect.amount > 0 ? '+' : ''}${effect.amount}`);
                                    }
                                }
                                break;
                              default: if(effect.message) notificationMessageParts.push(effect.message); break;
                            }
                          });
                          return mutablePs;
                        });
                        setActiveColonyEvents(prev => [...prev, newLlmEvent]); // Add resolved LLM event to history
                        showNotification(notificationMessageParts.join(' - '));
                      }
                    })
                    .catch(error => console.error(`Error generating/processing LLM colony event for ${colony.name}:`, error));
                }
              }
            });
          }
        }, GAME_TICK_INTERVAL_MS);
      }
    } else { 
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    }
    return () => { if (tickIntervalRef.current) clearInterval(tickIntervalRef.current); };
  }, [gamePhase, playerState, discoveredPlanets, _starSystems, showNotification, isFighting, activeColonyEvents, discoveredStations, unresolvedColonyEventToShow, processNextUnresolvedEvent]);

  const handleOpenSettings = () => {
    setPhaseBeforeSettings(gamePhase);
    setGamePhase('settingsModal');
  };

  const handleBackgroundMusicVolumeChange = (volume: number) => {
    if (playerState) {
        setPlayerState(prev => prev ? {...prev, backgroundMusicVolume: volume} : null);
    }
  };


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (playerState?.isTraveling || loadingMessage || isGeneratingMission || isAnalyzingArtifact || unresolvedColonyEventToShow) {
             if (!isFighting && gamePhase !== 'combatSummary' && !unresolvedColonyEventToShow) return;
        }

        if (unresolvedColonyEventToShow) { // If event modal is open, Esc should close it first
            setUnresolvedColonyEventToShow(null);
            processNextUnresolvedEvent(); // Attempt to show next event if any
            return;
        }
        if (gamePhase === 'combatSummary') {
            handleCloseCombatSummary();
            return;
        }
        if (isFighting) {
            setGamePhase('paused'); // Allow pausing during combat
            return;
        }

        if (gamePhase === 'settingsModal') setGamePhase(phaseBeforeSettings);
        else if (showDeleteConfirmModal.isOpen) setShowDeleteConfirmModal({isOpen: false, slotKeyToDelete: null});
        else if (showRenameShipModal.isOpen) setShowRenameShipModal({isOpen: false, shipId: null, currentName: ''});
        else if (showAnomalyInvestigateModal) setShowAnomalyInvestigateModal(false);
        else if (['systemDetail', 'diplomacy', 'colonyMarket', 'shipyard', 'planet', 'stationDetails', 'researchLabView'].includes(currentView)) {
            if ((currentView === 'colonyMarket' || currentView === 'shipyard' || currentView === 'researchLabView') && selectedStation) {
                setCurrentView('stationDetails');
                setSelectedPlanetaryMarketStationId(null);
            } else if ((currentView === 'planet' || currentView === 'stationDetails') && selectedSystemIdForDetailView) {
                setCurrentView('systemDetail');
                setSelectedPlanet(null);
                setSelectedStation(null);
            } else {
                setCurrentView('galaxy');
                setSelectedSystemIdForDetailView(null);
                setSelectedFactionForDiplomacy(null);
                setSelectedPlanetaryMarketStationId(null);
                setSelectedPlanet(null);
                setSelectedStation(null);
            }
        }
        else if (gamePhase === 'playing') setGamePhase('paused');
        else if (gamePhase === 'paused') setGamePhase(isFighting ? 'combatView' : 'playing'); // Return to combat if paused during combat
        else if (gamePhase === 'profileView') { setGamePhase('playing'); setCurrentView('galaxy');}
        else if (gamePhase === 'loadGameModal') setGamePhase(playerState ? 'paused' : 'titleScreen');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, showDeleteConfirmModal.isOpen, showRenameShipModal.isOpen, showAnomalyInvestigateModal, playerState, phaseBeforeSettings, loadingMessage, currentView, isGeneratingMission, isAnalyzingArtifact, isFighting, selectedStation, selectedSystemIdForDetailView, handleCloseCombatSummary, unresolvedColonyEventToShow, processNextUnresolvedEvent]);

  const startNewGame = async (characterName: string, originId: string) => {
    const origin = CHARACTER_ORIGINS.find(o => o.id === originId);
    if (!origin) {
      showError("Origem inválida selecionada.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Gerando novo universo...");

    const startingShip = createShipFromHull(DEFAULT_PLAYER_SHIP_HULL_ID, DEFAULT_PLAYER_SHIP_ID, "Pioneiro Estelar");
    if (!startingShip) {
        showError("Falha ao criar nave inicial padrão.");
        setIsLoading(false);
        setLoadingMessage(null);
        return;
    }

    const initialReputations = { ...INITIAL_FACTION_REPUTATIONS };
    if (origin.perks.some(p => p.id === 'silverTongue')) {
        ALL_FACTIONS_DATA.forEach(faction => {
            if (initialReputations[faction.id] > REPUTATION_THRESHOLDS[DiplomaticStatus.Hostile]) {
                 initialReputations[faction.id] = Math.min(100, (initialReputations[faction.id] || 0) + 5);
            }
        });
    }


    const newPlayerStateBase: PlayerState = {
      ...INITIAL_PLAYER_STATE_BASE,
      characterName,
      originId,
      activePerks: [...origin.perks],
      credits: (INITIAL_PLAYER_STATE_BASE.credits || 0) + (origin.startingBonus?.credits || 0),
      inventory: {
        ...INITIAL_PLAYER_STATE_BASE.inventory,
        ...(origin.startingBonus?.inventory || {})
      },
      currentLocation: ALL_STATIONS_DATA.find(s => s.systemId === 'sol' && s.stationType !== 'planetary_port')?.id || 'station_alpha_centauri',
      currentSystemId: 'sol',
      knownSystemIds: ['sol'],
      visitedLocationIds: ['sol'],
      surveyedPlanetIds: [],
      ownedShips: [startingShip],
      currentShipId: startingShip.id,
      isTraveling: false,
      travelDetails: null,
      ownedShipModules: (startingShip.modules.filter(m => m !== null) as ShipModule[]).map(m_instance => ({...m_instance})),
      skillPoints: INITIAL_SKILL_POINTS,
      researchPoints: origin.startingBonus?.researchPoints || INITIAL_RESEARCH_POINTS,
      unlockedSkills: [],
      unlockedTechs: [],
      craftedItems: origin.startingBonus?.craftedItems || [],
      backgroundMusicVolume: playerState?.backgroundMusicVolume ?? DEFAULT_BACKGROUND_MUSIC_VOLUME,
      factionReputations: initialReputations,
      activeTreaties: [],
      activePolicies: [], 
      colonyLLMEventAttemptTracker: {}, 
      combatState: null,
      combatSummaryData: null,
      lastTickTime: Date.now(),
    };

    setDiscoveredPlanets(SYSTEM_PLANETS.map(p => ({...p, discoveredResources: p.discoveredResources || [] })));
    setDiscoveredStations(ALL_STATIONS_DATA.map(s => ({...s})));
    setEncounteredNPCs([]);
    setActiveMissions(createFirstAdventure());
    claimedMissionIdsRef.current.clear();
    setSaveStatus('idle');
    _setStarSystems(STAR_SYSTEMS_DATA);
    setActiveColonyEvents([]); 
    setUnresolvedColonyEventToShow(null);
    setSelectedPlanet(null);
    setCurrentView('galaxy');
    setSelectedStation(null);
    setSelectedSystemIdForDetailView(null);
    setSelectedFactionForDiplomacy(null);
    setSelectedPlanetaryMarketStationId(null);
    gameTickCounterRef.current = 0;
    policySkillPointCounterRef.current = 0;
    setPlayerState(newPlayerStateBase);

    setIsLoading(false);
    setLoadingMessage(null);
    setGamePhase('playing');

    if (audioRef.current && newPlayerStateBase.backgroundMusicVolume > 0) {
        audioRef.current.play().catch(e => console.warn("Music play on new game failed:", e.message));
    }
  };


  const handleLoadGame = useCallback(async (slotKey: string) => {
    let savedGameJson: string | null = null;
    try { savedGameJson = JSON.stringify(await loadSavedGame(slotKey)); }
    catch { try { savedGameJson = localStorage.getItem(slotKey); } catch {} }
    if (savedGameJson) {
      try {
        const loadedState = JSON.parse(savedGameJson) as FullGameState;
        _setStarSystems(loadedState.starSystems || STAR_SYSTEMS_DATA);
        loadedState.playerState.visitedLocationIds ??= [loadedState.playerState.currentLocation, loadedState.playerState.currentSystemId || 'sol'];
        loadedState.playerState.surveyedPlanetIds ??= [];
        loadedState.activeMissions ??= [];
        if (!loadedState.activeMissions.some(mission => mission.category === 'adventure')) loadedState.activeMissions.push(...createFirstAdventure());
        claimedMissionIdsRef.current = new Set(loadedState.activeMissions.filter(mission => mission.isCompleted).map(mission => mission.id));
        setSaveStatus('idle');

        const allPossiblePlanets = SYSTEM_PLANETS.map(p => ({...p, buildings: p.buildings || [], discoveredResources: p.discoveredResources || [] }));
        const savedPlanetsMap = new Map(loadedState.discoveredPlanets.map(p => [p.id, {...p, buildings: p.buildings || []}]));
        let finalPlanets = allPossiblePlanets.map(p => savedPlanetsMap.get(p.id) || p);

        if (!loadedState.gameVersion || loadedState.gameVersion < GAME_VERSION) {
           showError(`Save é de uma versão anterior (${loadedState.gameVersion || 'desconhecida'}). A compatibilidade pode ser limitada. Versão atual: ${GAME_VERSION}.`);
        }
        if (!loadedState.playerState.backgroundMusicVolume && loadedState.playerState.backgroundMusicVolume !==0) {
          loadedState.playerState.backgroundMusicVolume = DEFAULT_BACKGROUND_MUSIC_VOLUME;
        }
        if (!loadedState.playerState.factionReputations) {
            loadedState.playerState.factionReputations = { ...INITIAL_FACTION_REPUTATIONS };
        }
        if (!loadedState.playerState.activeTreaties) {
            loadedState.playerState.activeTreaties = [];
        }
        if (!loadedState.playerState.activePolicies) { 
            loadedState.playerState.activePolicies = [];
        }
         if (!loadedState.playerState.colonyLLMEventAttemptTracker) { 
            loadedState.playerState.colonyLLMEventAttemptTracker = {};
        }
        if (loadedState.playerState.researchPoints === undefined) {
            loadedState.playerState.researchPoints = 0;
        }
        if (!loadedState.playerState.combatState) {
            loadedState.playerState.combatState = null;
        }
         if (!loadedState.playerState.combatSummaryData) {
            loadedState.playerState.combatSummaryData = null;
        }
        if (!loadedState.playerState.knownSystemIds || loadedState.playerState.knownSystemIds.length === 0) {
            loadedState.playerState.knownSystemIds = ['sol']; 
        }
        if (!loadedState.activeColonyEvents) { 
            loadedState.activeColonyEvents = [];
        }


        const hydratedStations = (loadedState.discoveredStations || ALL_STATIONS_DATA).map(loadedStation => {
            const baseStationData = ALL_STATIONS_DATA.find(s => s.id === loadedStation.id);
            if (baseStationData?.marketInventory && !loadedStation.marketInventory) { 
                console.log(`Hydrating market inventory for station ${loadedStation.id}`);
                return { ...loadedStation, marketInventory: JSON.parse(JSON.stringify(baseStationData.marketInventory)) };
            }
            if (loadedStation.marketInventory) { 
                const fullMarketInventory: Record<string, MarketListing> = {};
                for (const resourceName in loadedStation.marketInventory) { 
                    const listing = loadedStation.marketInventory[resourceName]; 
                    fullMarketInventory[resourceName] = {
                        quantity: listing.quantity || 0,
                        sellPriceModifier: listing.sellPriceModifier === undefined ? 1.2 : listing.sellPriceModifier,
                        isProduced: listing.isProduced === undefined ? false : listing.isProduced,
                        buyPriceModifier: listing.buyPriceModifier === undefined ? 0.8 : listing.buyPriceModifier,
                        isConsumed: listing.isConsumed === undefined ? false : listing.isConsumed,
                    };
                }
                return { ...loadedStation, marketInventory: fullMarketInventory };
            }
            return loadedStation;
        });


        setPlayerState(loadedState.playerState);
        setDiscoveredPlanets(finalPlanets);
        setDiscoveredStations(hydratedStations);
        setEncounteredNPCs(loadedState.encounteredNPCs || []);
        setActiveMissions(loadedState.activeMissions || []);
        setActiveColonyEvents(loadedState.activeColonyEvents || []); 
        setUnresolvedColonyEventToShow(null); // Clear any showing event modal

        gameTickCounterRef.current = loadedState.gameTickCounter || 0;
        policySkillPointCounterRef.current = 0; // Reset for new load

        const currentLoc = loadedState.playerState.currentLocation;
        const currentSys = loadedState.playerState.currentSystemId;

        const planetToSelect = finalPlanets.find(p => p.id === currentLoc && p.systemId === currentSys);
        const stationToSelect = hydratedStations.find(s => s.id === currentLoc && s.systemId === currentSys);

        let viewToSet = loadedState.lastView || 'galaxy';
        let systemIdForDetail = null;

        if (planetToSelect) {
            setSelectedPlanet(planetToSelect);
            setSelectedStation(null);
            systemIdForDetail = planetToSelect.systemId;
            if (viewToSet === 'planet' || viewToSet === 'galaxy' || !['stationDetails', 'shipyard', 'systemDetail', 'diplomacy', 'colonyMarket', 'researchLabView', 'combat', 'policies'].includes(viewToSet)) {
                 viewToSet = 'planet';
            }
        } else if (stationToSelect) {
            setSelectedStation(stationToSelect);
            setSelectedPlanet(null);
            systemIdForDetail = stationToSelect.systemId;
            if (['stationDetails', 'shipyard', 'galaxy', 'diplomacy', 'colonyMarket', 'researchLabView', 'policies'].includes(viewToSet) || viewToSet !== 'planet' && viewToSet !== 'systemDetail' && viewToSet !== 'combat') {
                viewToSet = 'stationDetails';
            }
        } else {
            setSelectedPlanet(null);
            setSelectedStation(null);
            if (currentSys && (viewToSet === 'systemDetail' || viewToSet === 'galaxy' || viewToSet === 'diplomacy' || viewToSet === 'policies')) {
                systemIdForDetail = currentSys;
                viewToSet = 'systemDetail';
            } else if (['planet', 'stationDetails', 'shipyard', 'systemDetail', 'diplomacy', 'colonyMarket', 'researchLabView', 'combat', 'policies'].includes(viewToSet)) {
                viewToSet = 'galaxy';
            }
        }

        setSelectedSystemIdForDetailView(systemIdForDetail);
        setSelectedFactionForDiplomacy(null);
        setSelectedPlanetaryMarketStationId(null);

        if (viewToSet === 'colonyMarket' && stationToSelect?.marketInventory) {
            setSelectedPlanetaryMarketStationId(stationToSelect.id);
        } else if (viewToSet === 'colonyMarket' || viewToSet === 'researchLabView' || viewToSet === 'combat' || viewToSet === 'policies') {
            viewToSet = stationToSelect ? 'stationDetails' : 'galaxy';
        }


        setCurrentView(viewToSet);
        setGamePhase(loadedState.playerState.combatState?.isActive ? 'combatView' : 'playing');
        if(loadedState.activeColonyEvents && loadedState.activeColonyEvents.length > 0 && !unresolvedColonyEventToShow){
            processNextUnresolvedEvent(); // Attempt to show first pending event
        }
        showNotification("Jogo carregado com sucesso!");

        if (audioRef.current && loadedState.playerState.backgroundMusicVolume > 0) {
            audioRef.current.play().catch(e => console.warn("Music play on load game failed:", e.message));
        }

      } catch(e) {
        console.error("Error loading game:", e);
        showError("Falha ao carregar o jogo. O save pode estar corrompido.");
      }
    } else {
      showError("Nenhum jogo salvo encontrado no slot selecionado.");
    }
  }, [showError, showNotification, processNextUnresolvedEvent, unresolvedColonyEventToShow]);

  const handleSaveGame = useCallback(async (slotKey: string, isQuickSave: boolean = false, silent: boolean = false) => {
      if (saveInFlightRef.current) return;
      if (!playerState || !currentShip) {
        showError("Não é possível salvar: Estado do jogador ou nave não encontrado.");
        return;
      }
      const currentShipName = currentShip?.name || "Nave Desconhecida";
      const gameState: FullGameState = {
        starSystems: _starSystems,
        playerState: {...playerState},
        discoveredPlanets: [...discoveredPlanets],
        discoveredStations: [...discoveredStations],
        encounteredNPCs: [...encounteredNPCs],
        activeMissions: [...activeMissions],
        activeColonyEvents: [...activeColonyEvents], 
        gameVersion: GAME_VERSION,
        lastView: playerState.combatState?.isActive ? viewBeforeCombat : (['colonyMarket', 'researchLabView', 'combat', 'policies'].includes(currentView) ? 'stationDetails' : currentView),
        gameTickCounter: gameTickCounterRef.current,
      };
      saveInFlightRef.current = true;
      setSaveStatus('saving');
      try {
        const newMeta = await storeSavedGame(slotKey, gameState, isQuickSave);
        setSavedGamesMeta(previous => [newMeta, ...previous.filter(meta => meta.slotKey !== slotKey)].sort((first, second) => second.timestamp - first.timestamp));
        setSaveStatus('saved');
        if (!silent) showNotification('Sua aventura foi salva! Você pode continuar neste navegador.');
      } catch {
        setSaveStatus('error');
        if (!silent) showError('Não foi possível salvar. Sua partida continua aberta; tente novamente antes de sair.');
      } finally {
        saveInFlightRef.current = false;
      }
  }, [playerState, _starSystems, discoveredPlanets, discoveredStations, encounteredNPCs, activeMissions, activeColonyEvents, currentView, currentShip, showError, showNotification, viewBeforeCombat]);

  const latestSaveRef = useRef(handleSaveGame);
  useEffect(() => { latestSaveRef.current = handleSaveGame; }, [handleSaveGame]);
  const autoSaveActive = !!playerState && ['playing', 'profileView', 'combatView'].includes(gamePhase);
  const completedMissionCount = activeMissions.filter(mission => mission.isCompleted).length;
  useEffect(() => {
    if (!autoSaveActive) return;
    const save = () => { void latestSaveRef.current(DEFAULT_SAVE_SLOT_KEY, true, true); };
    const initialSave = window.setTimeout(save, 5000);
    const interval = window.setInterval(save, 60000);
    return () => { window.clearTimeout(initialSave); window.clearInterval(interval); };
  }, [autoSaveActive, playerState?.characterName, completedMissionCount]);

  const handleDeleteGame = useCallback(async (slotKey: string) => {
      try {
        await deleteSavedGame(slotKey);
        try { localStorage.removeItem(slotKey); } catch {}
        setSavedGamesMeta(previous => previous.filter(meta => meta.slotKey !== slotKey));
      } catch { showError('Não foi possível excluir a partida. Tente novamente.'); return; }
      setShowDeleteConfirmModal({isOpen: false, slotKeyToDelete: null});
      showNotification("Jogo salvo deletado.");
  }, [showError, showNotification]);

  const handleInitiateDelete = (slotKey: string) => setShowDeleteConfirmModal({isOpen: true, slotKeyToDelete: slotKey});

  const handleOpenSystemInfo = (system: StarSystem) => {
    setSelectedSystemIdForDetailView(system.id);
    setCurrentView('systemDetail');
    setGamePhase('playing');
  };

  const handleScanSystem = (systemToScan: StarSystem) => {
      if (!playerState || !currentShipCalculatedStats) return;
      if (playerState.credits < SCAN_SYSTEM_COST_CREDITS) {
        showError("Créditos insuficientes para escanear sistema.");
        return;
      }

      const currentSystem = _starSystems.find(s => s.id === playerState.currentSystemId);
      if (!currentSystem) {
          showError("Sistema atual desconhecido. Não é possível determinar o alcance.");
          return;
      }
      const dist = calculateDistance(currentSystem.position, systemToScan.position);

      const baseSensorRangeFromSpeed = currentShipCalculatedStats.totalSpeed / 10;
      const dedicatedScannerModule = currentShip?.modules.find(m => m?.type === 'scanner');
      const dedicatedScannerRange = dedicatedScannerModule?.effects?.scanRange || 0;
      const effectiveScannerRange = Math.max(BASE_SCANNER_RANGE_AU, baseSensorRangeFromSpeed + dedicatedScannerRange);

      if (dist > effectiveScannerRange) {
        showNotification(`Sistema ${systemToScan.name} fora do alcance do scanner (${dist.toFixed(1)} Unidades > ${effectiveScannerRange.toFixed(1)} Unidades).`);
        return;
      }

      setPlayerState(prev => prev ? {...prev, credits: prev.credits - SCAN_SYSTEM_COST_CREDITS} : null);
      showNotification(`Escaneando ${systemToScan.name}...`);
      setIsLoading(true);
      setLoadingMessage(`Escaneando sistema ${systemToScan.name}...`);
      setTimeout(() => {
        setPlayerState(prev => prev ? {...prev, knownSystemIds: [...new Set([...prev.knownSystemIds, systemToScan.id])]} : null);
        showNotification(`Sistema ${systemToScan.name} escaneado. Informações disponíveis.`);
        setIsLoading(false);
        setLoadingMessage(null);
      }, 1500);
  };

  const handleInitiateTravel = useCallback((destinationId: string, destinationType: DestinationType) => {
    if (!playerState || !currentShipCalculatedStats || playerState.isTraveling || isFighting) return;

    let destinationSystemId: string | undefined | null = null;
    let destinationName = destinationId;

    const planetInfo = discoveredPlanets.find(p => p.id === destinationId);
    const stationInfo = discoveredStations.find(s => s.id === destinationId);
    const systemInfo = _starSystems.find(s => s.id === destinationId);


    if (destinationType === 'planet' && planetInfo) {
        destinationSystemId = planetInfo.systemId;
        destinationName = playerState.knownSystemIds.includes(planetInfo.systemId) ? planetInfo.name : "Planeta Desconhecido";
    } else if (destinationType === 'station' && stationInfo) {
        destinationSystemId = stationInfo.systemId;
        destinationName = playerState.knownSystemIds.includes(stationInfo.systemId) ? stationInfo.name : "Estação Desconhecida";
    } else if (destinationType === 'system' && systemInfo) {
        destinationSystemId = systemInfo.id;
        destinationName = playerState.knownSystemIds.includes(systemInfo.id) ? systemInfo.name : "Sistema Desconhecido";
    }


    if (!destinationSystemId) {
        showError("Sistema de destino não encontrado.");
        return;
    }

    if ((playerState.currentSystemId === destinationSystemId &&
        (playerState.currentLocation === destinationId && (destinationType === 'planet' || destinationType === 'station'))) ||
        (destinationType === 'system' && playerState.currentSystemId === destinationId)
    ) {
        showNotification("Você já está neste local/sistema.");
        if (currentView === 'systemDetail' && destinationType === 'system' && destinationSystemId) {
             setSelectedSystemIdForDetailView(destinationSystemId);
        } else if (destinationType === 'planet' && planetInfo) {
            setSelectedPlanet(planetInfo);
            setSelectedSystemIdForDetailView(planetInfo.systemId);
            setCurrentView('planet');
        } else if (destinationType === 'station' && stationInfo) {
            setSelectedStation(stationInfo);
            setSelectedSystemIdForDetailView(stationInfo.systemId);
            setCurrentView('stationDetails');
        }
        return;
    }

    if (playerState.credits < TRAVEL_BASE_CREDIT_COST) {
        showError(`Créditos insuficientes para viajar. Custo: ${TRAVEL_BASE_CREDIT_COST} CR`);
        return;
    }

    const departureTick = gameTickCounterRef.current;
    let travelTicksTotal = TRAVEL_TIME_BASE_TICKS_PER_HOP;
    if (destinationSystemId !== playerState.currentSystemId) {
        const currentSys = _starSystems.find(s => s.id === playerState.currentSystemId);
        const destSys = _starSystems.find(s => s.id === destinationSystemId);
        if (currentSys && destSys) {
            const dist = calculateDistance(currentSys.position, destSys.position);
            travelTicksTotal = Math.max(1, Math.floor(dist / 10));
        }
    }
    const speedBonusTicks = currentShipCalculatedStats ? Math.floor(currentShipCalculatedStats.totalSpeed / TRAVEL_TIME_SPEED_DIVISOR) : 0;
    travelTicksTotal = Math.max(1, travelTicksTotal - speedBonusTicks);

    const arrivalTick = departureTick + travelTicksTotal;

    setPlayerState(prev => prev ? {
        ...prev,
        credits: prev.credits - TRAVEL_BASE_CREDIT_COST,
        isTraveling: true,
        travelDetails: {
            destinationId,
            destinationType,
            arrivalTick,
            departureTick,
            travelTicksTotal
        }
    } : null);
    showNotification(`Iniciando viagem para ${destinationName}. Tempo estimado: ${travelTicksTotal} ticks.`);

  }, [playerState, currentShipCalculatedStats, currentView, discoveredPlanets, discoveredStations, _starSystems, showError, showNotification, isFighting]);

  const handleDiscoverPlanet = useCallback(async () => {
    if (discoveredPlanets.length >= MAX_PLANETS_DISCOVERABLE || !playerState || !playerState.currentSystemId) {
        showError("Não é possível descobrir mais planetas ou informações do jogador ausentes.");
        return;
    }

    setIsLoading(true);
    setLoadingMessage("Consultando arquivos estelares para novos planetas...");
    setError(null);
    const details = await generatePlanetDetails();
    if (details) {
      const newPlanet: Planet = {
        id: generateIdUtil(),
        systemId: playerState.currentSystemId,
        name: details.name,
        biome: details.biome,
        description: details.description,
        features: details.features,
        resourcesHint: details.resourcesHint,
        discoveredResources: [],
        imageUrl: getPlanetImageUrl(details.biome, generateIdUtil()),
        isColonized: false,
        population: 0,
        buildings: [],
        baseProduction: {},
        advancedConsumption: {},
        ownerFactionId: null,
        planetaryStationId: null,
      };
      setDiscoveredPlanets(prev => [...prev, newPlanet]);
      showNotification(`Novo planeta (dinâmico) descoberto: ${newPlanet.name}!`);
    } else {
      showError("Falha ao gerar detalhes do planeta dinâmico via LLM. Verifique o console do LM Studio.");
    }
    setIsLoading(false);
    setLoadingMessage(null);
  }, [discoveredPlanets.length, playerState, showError, showNotification]);

  const handleScanPlanetResources = useCallback(async (planet: Planet) => {
    if (!playerState) return;
    if (playerState.currentLocation !== planet.id || playerState.isTraveling) {
      showNotification('Viaje até a órbita deste planeta antes de usar o scanner.');
      return;
    }
    if (playerState.credits < 50) {
      showNotification("Créditos insuficientes para escanear recursos.");
      return;
    }
    setPlayerState(prev => prev ? { ...prev, credits: prev.credits - 50 } : null);
    setIsLoading(true);
    setLoadingMessage(`Escaneando ${planet.name} por recursos...`);

    const resourcesFound: string[] = [];
    planet.resourcesHint.forEach(hint => {
      const potentialResourceName = hint.split(" ").slice(-1)[0].replace(/[.,]/g, '');
      const actualResource = INITIAL_RESOURCES.find(r => r.name.toLowerCase().includes(potentialResourceName.toLowerCase()));

      if (actualResource && Math.random() > 0.3 && !planet.discoveredResources.includes(actualResource.name)) {
        resourcesFound.push(actualResource.name);
      }
    });

    if (resourcesFound.length < 2) {
        INITIAL_RESOURCES.filter(r => r.rarity === 'common').forEach(r => {
            if (resourcesFound.length < 3 && Math.random() > 0.6 && !planet.discoveredResources.includes(r.name) && !resourcesFound.includes(r.name)) {
                resourcesFound.push(r.name);
            }
        });
    }

    if (resourcesFound.length === 0 && planet.resourcesHint.length > 0) {
        const fallbackResourceName = planet.resourcesHint[0].split(" ").slice(-1)[0].replace(/[.,]/g, '');
        const actualFallbackResource = INITIAL_RESOURCES.find(r => r.name.toLowerCase().includes(fallbackResourceName.toLowerCase()));
        if (actualFallbackResource && !planet.discoveredResources.includes(actualFallbackResource.name)) {
           resourcesFound.push(actualFallbackResource.name);
        } else if (INITIAL_RESOURCES.length > 0 && !planet.discoveredResources.includes(INITIAL_RESOURCES[0].name)){
            resourcesFound.push(INITIAL_RESOURCES[0].name);
        }
    }


    setTimeout(() => {
        setPlayerState(previous => previous ? { ...previous, surveyedPlanetIds: [...new Set([...(previous.surveyedPlanetIds || []), planet.id])] } : null);
        setDiscoveredPlanets(prevPlanets => prevPlanets.map(p =>
            p.id === planet.id
            ? { ...p, discoveredResources: [...new Set([...p.discoveredResources, ...resourcesFound])] }
            : p
        ));
        setSelectedPlanet(prevSelected => prevSelected && prevSelected.id === planet.id ?
            { ...prevSelected, discoveredResources: [...new Set([...prevSelected.discoveredResources, ...resourcesFound])] } : prevSelected
        );
        showNotification(`Recursos escaneados em ${planet.name}: ${resourcesFound.join(', ') || 'Nenhum novo recurso significativo encontrado.'}`);
        setIsLoading(false);
        setLoadingMessage(null);
    }, 1500);
  }, [playerState, showNotification]);

  const handleEncounterNPC = useCallback(async () => {
    if (encounteredNPCs.length >= MAX_NPCS_ENCOUNTERABLE || !playerState) {
        showError("Limite de NPCs atingido ou erro de estado.");
        return;
    }

    setIsLoading(true);
    setLoadingMessage("Procurando por sinais de vida inteligentes...");
    const randomRole = NPC_ROLES_LIST[Math.floor(Math.random() * NPC_ROLES_LIST.length)];
    const npcDetails = await generateNpcDetails(randomRole);

    if (npcDetails) {
        const newNpc: NPC = {
            id: generateIdUtil(),
            name: npcDetails.name,
            role: randomRole,
            backstory: npcDetails.backstory,
            dialogueHistory: [],
            currentLocationId: playerState.currentLocation,
        };

        if (randomRole === NPCRole.PIRATE && !newNpc.ship) {
            const pirateHullId = SHIP_HULLS.find(h => h.name.toLowerCase().includes("batedora"))?.id || SHIP_HULLS[1].id; // Default to scout
            let pirateShip = createShipFromHull(pirateHullId, `npc_ship_${newNpc.id}`, `${newNpc.name}'s Raider`);
            if (pirateShip) {
                // Equip with some basic modules for challenge
                const weaponModuleId = 'sm_weapon_laser_light'; // Basic laser
                const weaponModule = INITIAL_SHIP_MODULES.find(m => m.id === weaponModuleId);
                if (weaponModule) {
                    const emptySlotIndex = pirateShip.modules.findIndex(m => m === null);
                    if (emptySlotIndex !== -1) pirateShip.modules[emptySlotIndex] = {...weaponModule};
                    else if (pirateShip.modules.length < pirateShip.maxModuleSlots) pirateShip.modules.push({...weaponModule});
                }
                const shieldModuleId = 'sm_shield_light';
                const shieldModule = INITIAL_SHIP_MODULES.find(m => m.id === shieldModuleId);
                if(shieldModule){
                    const emptySlotIndex = pirateShip.modules.findIndex(m => m === null);
                    if (emptySlotIndex !== -1) pirateShip.modules[emptySlotIndex] = {...shieldModule};
                    else if (pirateShip.modules.length < pirateShip.maxModuleSlots) pirateShip.modules.push({...shieldModule});
                }
                if (Math.random() < 0.3) { // Chance to equip repair module
                    const repairModule = INITIAL_SHIP_MODULES.find(m => m.id === 'sm_utility_repair_small');
                    if (repairModule) {
                        const emptySlotIndex = pirateShip.modules.findIndex(m => m === null);
                        if (emptySlotIndex !== -1) pirateShip.modules[emptySlotIndex] = {...repairModule};
                        else if (pirateShip.modules.length < pirateShip.maxModuleSlots) pirateShip.modules.push({...repairModule});
                    }
                }
                if (Math.random() < 0.25) { // Chance to equip defense matrix
                    const defenseMatrixModule = INITIAL_SHIP_MODULES.find(m => m.id === 'sm_utility_defense_matrix');
                    if (defenseMatrixModule) {
                        const emptySlotIndex = pirateShip.modules.findIndex(m => m === null);
                        if (emptySlotIndex !== -1) pirateShip.modules[emptySlotIndex] = {...defenseMatrixModule};
                        else if (pirateShip.modules.length < pirateShip.maxModuleSlots) pirateShip.modules.push({...defenseMatrixModule});
                    }
                }
                 newNpc.ship = pirateShip;
            }
        }

        setEncounteredNPCs(prev => [...prev, newNpc]); // Add NPC to the list

        if (newNpc.role === NPCRole.PIRATE && newNpc.ship) {
            // This NPC is considered part of the "Sindicato K'Tharr (Piratas)" or similar hostile group implicitly
            handleStartCombat(newNpc.ship);
        } else {
            setSelectedNpc(newNpc);
            setCurrentView('npcs');
            showNotification(`Você encontrou ${newNpc.name}, um(a) ${getTranslatedNpcRole(newNpc.role)}.`);
        }
    } else {
        showError("Falha ao gerar NPC via LLM. Verifique o console do LM Studio.");
    }
    setIsLoading(false);
    setLoadingMessage(null);
  }, [encounteredNPCs.length, playerState, showError, showNotification, handleStartCombat, getTranslatedNpcRole]);


  const handleNpcInteraction = async () => {
    if (!selectedNpc || !npcInteractionMessage.trim() || !playerState) return;

    const newHistoryEntryPlayer = { speaker: 'Player' as const, message: npcInteractionMessage };
    const updatedNpcForUI = {
        ...selectedNpc,
        dialogueHistory: [...selectedNpc.dialogueHistory, newHistoryEntryPlayer]
    };
    setSelectedNpc(updatedNpcForUI);
    setNpcInteractionMessage('');
    setIsLoading(true);

    const responseMessage = await generateNpcDialogue(
        selectedNpc.name,
        selectedNpc.role,
        selectedNpc.backstory,
        newHistoryEntryPlayer.message,
        updatedNpcForUI.dialogueHistory,
        playerState.activePerks
    );

    setIsLoading(false);
    if (responseMessage) {
        const newHistoryEntryNpc = { speaker: 'NPC' as const, message: responseMessage.trim() };
        const finalNpcUpdate = {
            ...updatedNpcForUI,
            dialogueHistory: [...updatedNpcForUI.dialogueHistory, newHistoryEntryNpc]
        };
        setSelectedNpc(finalNpcUpdate);
        setEncounteredNPCs(prev => prev.map(npc => npc.id === finalNpcUpdate.id ? finalNpcUpdate : npc));
    } else {
        showError("NPC não respondeu. Tente novamente ou verifique o console do LM Studio.");
        setSelectedNpc(prev => prev ? {...prev, dialogueHistory: prev.dialogueHistory.slice(0, -1)} : null);
    }
  };

const handleGenerateMission = useCallback(async (factionContextId?: string, useAI = false) => {
    if (isGeneratingMission) {
      showNotification("Geração de missão já está em progresso.");
      return;
    }
    if (activeMissions.filter(m => !m.isCompleted).length >= MAX_MISSIONS_ACTIVE) {
        showNotification("Limite de missões ativas atingido.");
        return;
    }

    if (!factionContextId && !useAI && playerState) {
      const contract = createExplorationContract(playerState, _starSystems, activeMissions);
      if (contract) {
        setActiveMissions(previous => [...previous, contract]);
        showNotification(`Novo contrato: ${contract.title}`);
      } else showNotification('Todas as rotas já têm contratos ativos. Conclua um deles para continuar.');
      return;
    }

    setIsGeneratingMission(true);
    showNotification("Procurando nova missão...");

    try {
        const allItemNames = [...INITIAL_RESOURCES.map(r => r.name), ...CRAFTABLE_ITEMS.map(i => i.name)];
        const allLocationNames = [
            ...discoveredPlanets.map(p => p.name).filter(name => !!name),
            ...discoveredStations.map(s => s.name).filter(name => !!name)
        ];

        const factionContext = factionContextId ? ALL_FACTIONS_DATA.find(f => f.id === factionContextId) : undefined;

        const missionDetails = await generateMission(playerState?.characterName, allItemNames, allLocationNames, factionContext);
        if (missionDetails) {
            const newMission: Mission = {
                id: generateIdUtil(),
                title: missionDetails.title,
                description: missionDetails.description,
                objective: missionDetails.objective,
                objectiveDetails: missionDetails.objectiveDetails,
                rewards: {},
                rewardsString: missionDetails.rewardsString,
                isCompleted: false,
                issuerFactionId: missionDetails.issuerFactionId,
                reputationReward: missionDetails.reputationReward,
                acceptedTick: gameTickCounterRef.current,
            };
            setActiveMissions(prev => [...prev, newMission]);
            showNotification(`Nova missão recebida: ${newMission.title}`);
        } else {
            showError('A IA está indisponível. Use os contratos de exploração para continuar jogando.');
        }
    } catch(e) {
        console.error("Erro inesperado ao gerar missão:", e);
        showError("Ocorreu um erro inesperado ao tentar gerar uma nova missão.");
    } finally {
        setIsGeneratingMission(false);
    }
  }, [activeMissions, playerState, _starSystems, discoveredPlanets, discoveredStations, showError, showNotification, isGeneratingMission]);


  const handleCompleteMission = (missionId: string) => {
    if (!playerState) return;
    const mission = activeMissions.find(m => m.id === missionId && !m.isCompleted);
    if (!mission) {
        showError("Missão não encontrada ou já completa.");
        return;
    }

    if (claimedMissionIdsRef.current.has(missionId)) return;
    if (playerState.isTraveling || playerState.combatState?.isActive) {
      showNotification('Aguarde a viagem ou o combate terminar para receber sua recompensa.');
      return;
    }
    if (mission.category === 'adventure' || mission.category === 'contract') {
      const progress = getMissionProgress(mission, playerState, discoveredPlanets, activeMissions, discoveredStations);
      if (!progress.ready) { showNotification(progress.locked ? 'Conclua o capítulo anterior primeiro.' : 'Seu objetivo ainda não foi concluído.'); return; }
      claimedMissionIdsRef.current.add(missionId);
      setPlayerState(previous => previous ? {
        ...previous, credits: previous.credits + Number(mission.rewards.credits || 0),
        researchPoints: previous.researchPoints + Number(mission.rewards.researchPoints || 0),
        skillPoints: previous.skillPoints + Number(mission.rewards.skillPoints || 0),
      } : null);
      setActiveMissions(previous => previous.map(candidate => candidate.id === missionId ? { ...candidate, isCompleted: true } : candidate));
      showNotification(`Missão concluída: ${mission.title}! ${mission.rewardsString}`, 6000);
      return;
    }

    let objectiveMet = false;
    let itemsToConsumeFromInventory: Record<string, number> = {};
    let itemToConsumeFromCrafted: { id: string; name: string } | null = null;
    const normalizeName = (name: string) => name.trim().toLowerCase();

    if (mission.objectiveDetails) {
        const details = mission.objectiveDetails;
        const quantity = details.targetQuantity;
        const itemNameInput = details.targetItemName ? normalizeName(details.targetItemName) : undefined;
        const locationNameInput = details.targetLocationName ? normalizeName(details.targetLocationName) : undefined;

        switch (details.type) {
            case MissionObjectiveType.DELIVER:
                if (!itemNameInput || !quantity || quantity <= 0 || !locationNameInput) {
                    showError("Detalhes do objetivo (DELIVER) inválidos ou incompletos.");
                    return;
                }
                const gameResourceDel = INITIAL_RESOURCES.find(r => normalizeName(r.name) === itemNameInput);
                const gameCraftedItemDefDel = CRAFTABLE_ITEMS.find(i => normalizeName(i.name) === itemNameInput);
                const itemDefinitionDel = gameResourceDel || gameCraftedItemDefDel;
                const targetPlanetDel = discoveredPlanets.find(p => normalizeName(p.name) === locationNameInput);
                const targetStationDel = discoveredStations.find(s => normalizeName(s.name) === locationNameInput);
                const gameLocationDel = targetPlanetDel || targetStationDel;

                if (!itemDefinitionDel || !gameLocationDel) {
                    showError(`Item '${details.targetItemName}' ou Local '${details.targetLocationName}' não reconhecido.`);
                    return;
                }
                let playerHasItemDel = false;
                if (gameResourceDel) playerHasItemDel = (playerState.inventory[gameResourceDel.name] || 0) >= quantity;
                else if (gameCraftedItemDefDel && quantity === 1) playerHasItemDel = !!playerState.craftedItems.find(ci => normalizeName(ci.name) === itemNameInput);

                if (playerHasItemDel && playerState.currentLocation === gameLocationDel.id) {
                    objectiveMet = true;
                    if (gameResourceDel) itemsToConsumeFromInventory[gameResourceDel.name] = quantity;
                    else if (gameCraftedItemDefDel) itemToConsumeFromCrafted = playerState.craftedItems.find(ci => normalizeName(ci.name) === itemNameInput)!;
                } else {
                     showError(`Não cumpre: Entregar ${quantity}x ${itemDefinitionDel.name} em ${gameLocationDel.name}.`); return;
                }
                break;
            case MissionObjectiveType.SCAN_FOR_FACTION:
                if (!details.targetSystemId || mission.acceptedTick === undefined) {
                     showError("Detalhes do objetivo (SCAN) inválidos ou missão não formalmente aceita."); return;
                }
                let systemMatch = playerState.currentSystemId === details.targetSystemId;
                let planetMatch = !details.targetPlanetId || playerState.currentLocation === details.targetPlanetId;

                objectiveMet = systemMatch && planetMatch;
                if(!objectiveMet) { showError(`Não cumpre: Escanear ${details.targetPlanetId ? `planeta ${details.targetPlanetId} em ` : ''} sistema ${details.targetLocationName || details.targetSystemId}.`); return;}
                break;
            case MissionObjectiveType.TRANSPORT_FOR_FACTION:
                if (!details.destinationStationId || !details.resourceToTransport || !details.targetQuantity) {
                    showError("Detalhes do objetivo (TRANSPORT) inválidos."); return;
                }
                const resourceData = INITIAL_RESOURCES.find(r => r.name === details.resourceToTransport);
                if (!resourceData) { showError(`Recurso de transporte '${details.resourceToTransport}' não encontrado.`); return;}

                if (playerState.currentLocation === details.destinationStationId && (playerState.inventory[resourceData.name] || 0) >= details.targetQuantity) {
                    objectiveMet = true;
                    itemsToConsumeFromInventory[resourceData.name] = details.targetQuantity;
                } else {
                     showError(`Não cumpre: Transportar ${details.targetQuantity}x ${resourceData.name} para ${details.targetLocationName || details.destinationStationId}.`); return;
                }
                break;
            default:
                showError(`Tipo de objetivo '${details.type}' não suportado para conclusão automática.`);
                return;
        }
    } else {
        showError("Missão sem detalhes estruturados. Conclusão automática não suportada para este formato antigo.");
        return;
    }


    if (!objectiveMet) {
         showError("Os requisitos da missão não foram cumpridos.");
         return;
    }

    let newCredits = playerState.credits;
    const newInventory = { ...playerState.inventory };
    let newCraftedItems = [...playerState.craftedItems];
    const newOwnedModules = [...playerState.ownedShipModules];
    let newFactionReputations = { ...playerState.factionReputations };
    let rewardsAppliedText = "Recompensas: ";


    if (mission.reputationReward && mission.reputationReward.factionId && mission.reputationReward.amount) {
        const { factionId, amount } = mission.reputationReward;
        if (newFactionReputations[factionId] !== undefined) {
            newFactionReputations[factionId] = Math.max(-100, Math.min(100, (newFactionReputations[factionId] || 0) + amount));
            const factionName = ALL_FACTIONS_DATA.find(f => f.id === factionId)?.name || factionId;
            rewardsAppliedText += `${amount > 0 ? '+' : ''}${amount} Reputação com ${factionName}. `;
        }
    }


    for (const itemName in itemsToConsumeFromInventory) {
        newInventory[itemName] = (newInventory[itemName] || 0) - itemsToConsumeFromInventory[itemName];
        if (newInventory[itemName] <= 0) delete newInventory[itemName];
    }
    if (itemToConsumeFromCrafted) {
        newCraftedItems = newCraftedItems.filter(ci => ci.id !== itemToConsumeFromCrafted!.id);
    }


    const rewardsStr = mission.rewardsString || "";
    const creditRegex = /(\d+)\s*Créditos/i;
    const creditMatchResult = rewardsStr.match(creditRegex);
    if (creditMatchResult && creditMatchResult[1]) {
        const amount = parseInt(creditMatchResult[1], 10);
        newCredits += amount;
        rewardsAppliedText += `${amount} Créditos. `;
    }

    const itemRewardParts = rewardsStr.split(',').map(s => s.trim()).filter(s => !s.match(creditRegex) && !s.toLowerCase().includes('reputação'));
    itemRewardParts.forEach(rewardPart => {
        const moduleMatch = rewardPart.match(/Módulo:(\S+)/i);
        if (moduleMatch && moduleMatch[1]) {
            const moduleId = moduleMatch[1];
            const moduleData = INITIAL_SHIP_MODULES.find(m => m.id === moduleId);
            if (moduleData) {
                newOwnedModules.push({...moduleData});
                rewardsAppliedText += `Módulo ${moduleData.name}. `;
            }
        } else {
            const resourceMatch = rewardPart.match(/(\d+)\s+(.+)/);
            if (resourceMatch && resourceMatch[1] && resourceMatch[2]) {
                const rewardQuantity = parseInt(resourceMatch[1], 10);
                const rewardItemName = resourceMatch[2].trim();
                const existingResource = INITIAL_RESOURCES.find(r => r.name === rewardItemName);
                const existingCraftable = CRAFTABLE_ITEMS.find(i => i.name === rewardItemName);

                if (existingResource) {
                    newInventory[rewardItemName] = (newInventory[rewardItemName] || 0) + rewardQuantity;
                    rewardsAppliedText += `${rewardQuantity} ${rewardItemName}. `;
                } else if (existingCraftable) {
                    for (let i = 0; i < rewardQuantity; i++) {
                        newCraftedItems.push({ ...existingCraftable, id: generateIdUtil() });
                    }
                    rewardsAppliedText += `${rewardQuantity} ${rewardItemName} (item). `;
                } else {
                    rewardsAppliedText += `Item recompensa desconhecido '${rewardItemName}'. `;
                }
            }
        }
    });

    claimedMissionIdsRef.current.add(missionId);
    setPlayerState(prev => prev ? { ...prev, credits: newCredits, inventory: newInventory, craftedItems: newCraftedItems, ownedShipModules: newOwnedModules, factionReputations: newFactionReputations } : null);
    setActiveMissions(prevMissions => prevMissions.map(m => m.id === missionId ? { ...m, isCompleted: true } : m));
    showNotification(`Missão "${mission.title}" concluída! ${rewardsAppliedText}`);
  };


  const handleCraftItem = (itemToCraft: Item) => {
    if (!playerState) return;
    let canCraft = true;
    let missingResources: string[] = [];
    const currentInventory = { ...playerState.inventory };

    const costMultiplier = playerState.activePerks.some(p => p.id === 'techAdept') && itemToCraft.isTechItem ? 0.9 : 1.0;

    for (const resourceName in itemToCraft.craftingRecipe) {
        const requiredAmount = Math.max(1, Math.floor(itemToCraft.craftingRecipe[resourceName] * costMultiplier));
        if ((currentInventory[resourceName] || 0) < requiredAmount) {
            canCraft = false;
            missingResources.push(`${requiredAmount} ${resourceName}`);
        }
    }

    if (canCraft) {
        for (const resourceName in itemToCraft.craftingRecipe) {
            const requiredAmount = Math.max(1, Math.floor(itemToCraft.craftingRecipe[resourceName] * costMultiplier));
            currentInventory[resourceName] -= requiredAmount;
        }
        const newCraftedItemInstance = { ...itemToCraft, id: generateIdUtil() };
        setPlayerState(prev => prev ? {
            ...prev,
            inventory: currentInventory,
            craftedItems: [...prev.craftedItems, newCraftedItemInstance]
        } : null);
        showNotification(`${itemToCraft.name} fabricado(a) com sucesso!`);
    } else {
        showError(`Recursos insuficientes. Faltam: ${missingResources.join(', ')}.`);
    }
  };

  const handleColonizePlanet = useCallback(async (planetToColonize: Planet) => {
    if (!playerState || !currentShip) return;

    if (planetToColonize.isColonized) {
        showNotification("Este planeta já possui uma colônia.");
        return;
    }

    const colonyHubItemInCraftedList = playerState.craftedItems.find(item => item.type === 'colony_component' && item.name.toLowerCase().includes('módulo de colonização'));
    const colonySupportModuleOnShip = currentShip.modules.find(mod => mod?.id === 'sm_colony_support');

    if (!colonyHubItemInCraftedList && !colonySupportModuleOnShip) {
        showNotification("Você precisa de um 'Módulo de Colonização Planetária (Item)' fabricado OU um 'Módulo de Suporte Colonial' equipado na sua nave para fundar uma colônia.");
        return;
    }
    if (playerState.credits < COLONIZATION_CREDIT_COST) {
        showNotification(`Créditos insuficientes. Custo: ${COLONIZATION_CREDIT_COST} CR.`);
        return;
    }

    setIsLoading(true);
    setLoadingMessage(`Iniciando procedimento de colonização em ${planetToColonize.name}...`);
    const planetDetailsForColony = await generatePlanetDetails(true);

    let updatedPlayerState = { ...playerState, credits: playerState.credits - COLONIZATION_CREDIT_COST };
    let consumedItemIdentifier: string | null = null;
    let newShipModulesArray: (ShipModule | null)[] | null = null;

    if (colonyHubItemInCraftedList) {
        consumedItemIdentifier = colonyHubItemInCraftedList.name;
        updatedPlayerState.craftedItems = playerState.craftedItems.filter(item => item.id !== colonyHubItemInCraftedList.id);
    } else if (colonySupportModuleOnShip && currentShip) {
        consumedItemIdentifier = colonySupportModuleOnShip.name;
        const moduleIndex = currentShip.modules.findIndex(mod => mod?.id === 'sm_colony_support');
        if (moduleIndex > -1) {
            newShipModulesArray = [...currentShip.modules]; 
            newShipModulesArray[moduleIndex] = null; 
            
             const ownedModuleInstanceIndex = updatedPlayerState.ownedShipModules.findIndex(m => m.id === colonySupportModuleOnShip.id);
             if(ownedModuleInstanceIndex > -1) {
                 // This assumes ship modules are unique instances in ownedShipModules.
                 // If they are templates, this logic might need adjustment or remove only one instance
                 updatedPlayerState.ownedShipModules.splice(ownedModuleInstanceIndex, 1);
             }
        }
    }
    setPlayerState(prevPlayerState => {
        if (!prevPlayerState) return null;
        let finalPlayerState = {...updatedPlayerState};
        if(newShipModulesArray && currentShip){
            const updatedShip = {...currentShip, modules: newShipModulesArray};
            finalPlayerState.ownedShips = finalPlayerState.ownedShips.map(s => s.id === currentShip.id ? updatedShip : s);
        }
        return finalPlayerState;
    });
    

    const productionBonus = playerState.activePerks.some(p => p.id === 'efficientEngineer') ? 1.2 : 1.0;
    const colonyBaseProductionWithBonus: Record<string, number> = {};
    for (const res in BASE_PLANET_PRODUCTION) {
        colonyBaseProductionWithBonus[res] = Math.round(BASE_PLANET_PRODUCTION[res] * productionBonus * 10) / 10;
    }

    const colonyNameFromLLM = planetDetailsForColony?.colonyName || `Colônia ${planetToColonize.name}`;
    const colonyFoundingEventFromLLM = planetDetailsForColony?.colonyFoundingEvent || 'O centro administrativo da nova colônia foi estabelecido.';
    const isPlayerColony = true;

    const colonyHubDefinition = COLONIAL_BUILDING_DEFINITIONS.find(b => b.id === 'bldg_colony_hub_t1');
    let newColonyHubInstance: BuildingInstance | undefined = undefined;
    if(colonyHubDefinition) {
      newColonyHubInstance = { instanceId: generateIdUtil(), definitionId: colonyHubDefinition.id };
    }

    const newColony: Planet = {
        ...planetToColonize,
        name: colonyNameFromLLM,
        description: `${planetToColonize.description} ${colonyFoundingEventFromLLM}`,
        isColonized: true,
        population: isPlayerColony ? 100 : 0, 
        buildings: newColonyHubInstance ? [newColonyHubInstance] : [],
        colonyHubId: newColonyHubInstance?.instanceId,
        baseProduction: isPlayerColony ? colonyBaseProductionWithBonus : {},
        ownerFactionId: null, 
        planetaryStationId: null, 
        advancedConsumption: {}, // Initialize advanced consumption
    };

    setDiscoveredPlanets(prevPlanets => prevPlanets.map(p => p.id === newColony.id ? newColony : p));
    setSelectedPlanet(newColony);
    showNotification(`Colônia "${newColony.name}" fundada em ${planetToColonize.name}! ${consumedItemIdentifier ? `(${consumedItemIdentifier} consumido).` : ''} ${colonyFoundingEventFromLLM}`);
    setIsLoading(false);
    setLoadingMessage(null);
  }, [playerState, currentShip, showNotification]);

  const handleUnlockSkill = (skillId: string) => {
    if (!playerState) return;
    const skill = INITIAL_SKILL_TREE.find(s => s.id === skillId);
    if (!skill || playerState.unlockedSkills.includes(skillId)) {
        showError("Habilidade inválida ou já desbloqueada.");
        return;
    }
    if (playerState.skillPoints < skill.cost) {
        showError("Pontos de habilidade insuficientes.");
        return;
    }
    if (skill.prerequisites) {
        for (const prereqId of skill.prerequisites) {
            if (!playerState.unlockedSkills.includes(prereqId)) {
                const prereqSkill = INITIAL_SKILL_TREE.find(s => s.id === prereqId);
                showError(`Pré-requisito não atendido: ${prereqSkill?.name || prereqId}`);
                return;
            }
        }
    }

    setPlayerState(prev => prev ? {
        ...prev,
        skillPoints: prev.skillPoints - skill.cost,
        unlockedSkills: [...prev.unlockedSkills, skillId]
    } : null);
    showNotification(`Habilidade "${skill.name}" desbloqueada!`);
  };

  const handleUnlockTech = (techId: string) => {
    if (!playerState) return;
    const tech = INITIAL_TECH_TREE.find(t => t.id === techId);
    if (!tech || playerState.unlockedTechs.includes(techId)) {
        showError("Tecnologia inválida ou já desbloqueada.");
        return;
    }
    if (playerState.researchPoints < tech.cost) {
        showError("Pontos de pesquisa insuficientes.");
        return;
    }
    if (tech.prerequisites) {
        for (const prereqId of tech.prerequisites) {
            if (!playerState.unlockedTechs.includes(prereqId)) {
                const prereqTech = INITIAL_TECH_TREE.find(t => t.id === prereqId);
                showError(`Pré-requisito tecnológico não atendido: ${prereqTech?.name || prereqId}`);
                return;
            }
        }
    }
    setPlayerState(prev => prev ? {
        ...prev,
        researchPoints: prev.researchPoints - tech.cost,
        unlockedTechs: [...prev.unlockedTechs, techId]
    } : null);
    showNotification(`Tecnologia "${tech.name}" pesquisada!`);
     if (tech.id === 'tech_armor_1' && currentShip) {
        const updatedShip = {
            ...currentShip,
            baseStats: {...currentShip.baseStats, baseHullIntegrity: currentShip.baseStats.baseHullIntegrity * 1.1}
        };
        setPlayerState(prev => prev ? {...prev, ownedShips: prev.ownedShips.map(s => s.id === currentShip.id ? updatedShip : s)} : null);
        showNotification("Integridade do casco da nave ativa aumentada em 10%!");
    }
  };

  const handleScanForAnomalies = () => {
    if (!playerState) return;
    if (playerState.credits < ANOMALY_SCAN_COST_CREDITS) {
        showError(`Créditos insuficientes. Custo: ${ANOMALY_SCAN_COST_CREDITS} CR`);
        return;
    }
    setPlayerState(prev => prev ? { ...prev, credits: prev.credits - ANOMALY_SCAN_COST_CREDITS } : null);
    setIsLoading(true);
    setLoadingMessage("Varrendo o setor por anomalias...");

    setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage(null);
        const findChance = playerState.activePerks.some(p => p.id === 'masterExplorer')
                           ? ANOMALY_FIND_CHANCE + 0.10
                           : ANOMALY_FIND_CHANCE;

        if (Math.random() < findChance) {
            const anomalyTypes: AnomalyEvent['type'][] = ['generic_signal', 'derelict_ship', 'energy_fluctuation'];
            const randomType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
            let description = "Um sinal estranho foi detectado nas proximidades.";
            if (randomType === 'derelict_ship') description = "Sensores indicam destroços de uma nave não identificada à deriva.";
            if (randomType === 'energy_fluctuation') description = "Uma flutuação de energia incomum foi registrada nesta região do espaço.";

            const newAnomaly: AnomalyEvent = { id: generateIdUtil(), type: randomType, description, investigated: false };
            setCurrentAnomalyEvent(newAnomaly);
            setShowAnomalyInvestigateModal(true);
        } else {
            showNotification("Nenhuma anomalia significativa detectada nesta região.");
        }
    }, 2000);
  };

  const handleInvestigateAnomaly = () => {
    if (!currentAnomalyEvent || !playerState) return;

    setShowAnomalyInvestigateModal(false);
    setIsLoading(true);
    setLoadingMessage(`Investigando ${currentAnomalyEvent.description}...`);

    setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage(null);
        let foundSomething = false;
        let notificationMessages: string[] = [];

        // Artifacts
        if (Math.random() < ANOMALY_ARTIFACT_CHANCE && DISCOVERABLE_ARTIFACTS.length > 0) {
            const randomArtifactTemplate = DISCOVERABLE_ARTIFACTS[Math.floor(Math.random() * DISCOVERABLE_ARTIFACTS.length)];
            const newArtifact: Item = { ...randomArtifactTemplate, id: `artifact_${generateIdUtil()}`, isAnalyzed: false };
             setPlayerState(prev => prev ? { ...prev, craftedItems: [...prev.craftedItems, newArtifact] } : null);
            notificationMessages.push(`Artefato recuperado: ${newArtifact.name}!`);
            foundSomething = true;
        }

        // Modules (only if no artifact found, to prevent too much loot)
        if (!foundSomething && Math.random() < ANOMALY_MODULE_CHANCE && FINDABLE_MODULE_IDS_VIA_ANOMALY.length > 0) {
            const randomModuleId = FINDABLE_MODULE_IDS_VIA_ANOMALY[Math.floor(Math.random() * FINDABLE_MODULE_IDS_VIA_ANOMALY.length)];
            const moduleData = INITIAL_SHIP_MODULES.find(m => m.id === randomModuleId);
            if (moduleData) {
                setPlayerState(prev => prev ? { ...prev, ownedShipModules: [...prev.ownedShipModules, {...moduleData, id: generateIdUtil()}] } : null);
                notificationMessages.push(`Módulo encontrado nos destroços: ${moduleData.name}! Adicionado ao hangar.`);
                foundSomething = true;
            }
        }

        // Resources (can be found alongside other things or by itself)
        if (Math.random() < ANOMALY_RESOURCE_CHANCE) {
            const randomResource = INITIAL_RESOURCES[Math.floor(Math.random() * INITIAL_RESOURCES.length)];
            const quantity = ANOMALY_BASE_RESOURCE_REWARD_QUANTITY + Math.floor(Math.random() * 10);
            setPlayerState(prev => {
                if (!prev) return null;
                const newInventory = { ...prev.inventory };
                newInventory[randomResource.name] = (newInventory[randomResource.name] || 0) + quantity;
                return { ...prev, inventory: newInventory };
            });
            notificationMessages.push(`Recursos recuperados: ${quantity} ${randomResource.name}!`);
            foundSomething = true;
        }


        if (!foundSomething && notificationMessages.length === 0) {
            showNotification("A investigação não revelou nada de valor significativo.");
        } else {
            showNotification(notificationMessages.join(' '));
        }
        setCurrentAnomalyEvent(null);
    }, 2000);
  };

  const handleAnalyzeArtifact = (itemId: string) => {
    if (!playerState) return;
    const artifact = playerState.craftedItems.find(item => item.id === itemId && item.type === 'artifact' && !item.isAnalyzed);
    if (!artifact || !artifact.researchPointsYield) {
        showError("Artefato inválido ou já analisado, ou não concede pontos de pesquisa.");
        return;
    }
    if (isAnalyzingArtifact) return;

    setIsAnalyzingArtifact(true);
    showNotification(`Analisando ${artifact.name}...`);

    setTimeout(() => {
        setPlayerState(prev => {
            if (!prev) return null;
            const updatedItems = prev.craftedItems.map(item =>
                item.id === itemId ? { ...item, isAnalyzed: true } : item
            );
            return {
                ...prev,
                researchPoints: (prev.researchPoints || 0) + (artifact.researchPointsYield || 0),
                craftedItems: updatedItems
            };
        });
        showNotification(`${artifact.name} analisado! +${artifact.researchPointsYield} Pontos de Pesquisa.`);
        setIsAnalyzingArtifact(false);
    }, 2500);
  };


  const getEffectiveTradeModifier = useCallback((factionId: string): number => {
    if (!playerState) return 1.0;
    const tradeAgreement = playerState.activeTreaties.find(
        treaty => treaty.factionId === factionId && treaty.type === TreatyType.TradeAgreement
    );
    return tradeAgreement ? (1.0 - TRADE_AGREEMENT_PRICE_MODIFIER) : 1.0;
  }, [playerState]);

  const handleBuyShipHull = (hullId: string) => {
    if (!playerState || !selectedStation) return;
    const hullToBuy = SHIP_HULLS.find(h => h.id === hullId);
    const stationListing = selectedStation.availableShipHullIds.includes(hullId);

    if (!hullToBuy || !stationListing) {
        showError("Casco de nave inválido ou não disponível nesta estação.");
        return;
    }
    const basePriceModifier = selectedStation.shipHullPriceModifier || 1.0;
    const tradeModifier = getEffectiveTradeModifier(selectedStation.faction);
    const finalPrice = Math.floor(hullToBuy.baseCost * basePriceModifier * tradeModifier);


    if (playerState.credits < finalPrice) {
        showError(`Créditos insuficientes. Custo: ${finalPrice} CR.`);
        return;
    }

    const newShipInstanceId = `ship_${generateIdUtil()}`;
    const defaultShipName = `${hullToBuy.name} #${playerState.ownedShips.length + 1}`;
    const newShip = createShipFromHull(hullId, newShipInstanceId, defaultShipName);

    if (newShip) {
        setPlayerState(prev => prev ? {
            ...prev,
            credits: prev.credits - finalPrice,
            ownedShips: [...prev.ownedShips, newShip],
            ownedShipModules: [
                ...prev.ownedShipModules,
                ...(newShip.modules.filter(m => m !== null) as ShipModule[]).map(mod => ({...mod}))
            ]
        } : null);
        showNotification(`Casco "${hullToBuy.name}" comprado por ${finalPrice} CR! Nova nave "${defaultShipName}" adicionada ao seu hangar.`);
    } else {
        showError("Falha ao criar instância da nova nave.");
    }
  };

  const handleSetCurrentShip = (shipId: string) => {
    if (!playerState || !playerState.ownedShips.find(s => s.id === shipId)) {
        showError("Nave inválida selecionada.");
        return;
    }
    setPlayerState(prev => prev ? { ...prev, currentShipId: shipId } : null);
    showNotification(`Nave ativa alterada para ${playerState.ownedShips.find(s => s.id === shipId)?.name}.`);
  };

  const handleOpenRenameShipModal = (shipId: string) => {
    const shipToRename = playerState?.ownedShips.find(s => s.id === shipId);
    if (shipToRename) {
        setShowRenameShipModal({isOpen: true, shipId: shipId, currentName: shipToRename.name});
        setRenameShipInput(shipToRename.name);
    }
  };
  const handleConfirmRenameShip = () => {
    if (playerState && showRenameShipModal.shipId && renameShipInput.trim()) {
        setPlayerState(prev => prev ? {
            ...prev,
            ownedShips: prev.ownedShips.map(s => s.id === showRenameShipModal.shipId ? {...s, name: renameShipInput.trim()} : s)
        } : null);
        setShowRenameShipModal({isOpen: false, shipId: null, currentName: ''});
        showNotification("Nave renomeada!");
    } else {
        showError("Nome inválido para la nave.");
    }
  };

  const handleSellOwnedShipModule = (moduleToSell: ShipModule) => {
    if (!playerState) return;
    const moduleIndex = playerState.ownedShipModules.findIndex(m => m.id === moduleToSell.id);

    if (moduleIndex === -1) {
        showError("Módulo não encontrado no seu hangar.");
        return;
    }
    const sellPrice = Math.floor(moduleToSell.cost * MODULE_SELL_PRICE_MODIFIER);
    const updatedOwnedModules = [...playerState.ownedShipModules];
    updatedOwnedModules.splice(moduleIndex, 1);

    setPlayerState(prev => prev ? {
        ...prev,
        credits: prev.credits + sellPrice,
        ownedShipModules: updatedOwnedModules
    } : null);
    showNotification(`Módulo "${moduleToSell.name}" vendido por ${sellPrice} CR.`);
  };

  const handleBuyShipModule = (moduleId: string) => {
    if (!playerState || !selectedStation) return;
    const moduleData = INITIAL_SHIP_MODULES.find(m => m.id === moduleId);
    if (!moduleData || !selectedStation.availableShipModuleIds.includes(moduleId)) {
        showError("Módulo inválido ou não disponível nesta estação.");
        return;
    }
    const basePriceModifier = selectedStation.shipModulePriceModifier || 1.0;
    const tradeModifier = getEffectiveTradeModifier(selectedStation.faction);
    const finalPrice = Math.floor(moduleData.cost * basePriceModifier * tradeModifier);

    if (playerState.credits < finalPrice) {
        showError(`Créditos insuficientes. Custo: ${finalPrice} CR.`);
        return;
    }

    setPlayerState(prev => prev ? {
        ...prev,
        credits: prev.credits - finalPrice,
        ownedShipModules: [...prev.ownedShipModules, {...moduleData, id: generateIdUtil()}]
    } : null);
    showNotification(`Módulo "${moduleData.name}" comprado por ${finalPrice} CR! Adicionado ao seu hangar.`);
  };

  const handleUnequipModule = (moduleIndex: number) => {
    if (!playerState || !currentShip || !currentShip.modules[moduleIndex]) {
        showError("Nenhum módulo para desequipar ou nave inválida.");
        return;
    }
    const moduleToUnequip = currentShip.modules[moduleIndex]!;
    const newShipModules = [...currentShip.modules];
    newShipModules[moduleIndex] = null;

    const updatedShip = { ...currentShip, modules: newShipModules };

    setPlayerState(prev => prev ? {
        ...prev,
        ownedShips: prev.ownedShips.map(s => s.id === currentShip.id ? updatedShip : s),
        // ownedShipModules: [...prev.ownedShipModules, moduleToUnequip] // Module returns to general hangar pool
    } : null);
    showNotification(`Módulo "${moduleToUnequip.name}" desequipado e movido para o hangar.`);
  };

  const handleEquipModule = (moduleToEquip: ShipModule) => {
    if (!playerState || !currentShip) return;

    const emptySlotIndex = currentShip.modules.findIndex(m => m === null);
    if (emptySlotIndex === -1) {
        showError("Nenhum slot vazio disponível na nave atual.");
        return;
    }
    // Check if module of same type already equipped (limit 1 per type typically, except cargo/weapons)
    const isSpecialType = ['engine', 'shield', 'scanner', 'special_utility'].includes(moduleToEquip.type);
    if (isSpecialType && currentShip.modules.some(m => m?.type === moduleToEquip.type)) {
        showError(`Já existe um módulo do tipo "${moduleToEquip.type}" equipado. Desequipe primeiro.`);
        return;
    }

    const newShipModules = [...currentShip.modules];
    newShipModules[emptySlotIndex] = moduleToEquip;
    const updatedShip = { ...currentShip, modules: newShipModules };

    setPlayerState(prev => prev ? {
        ...prev,
        ownedShips: prev.ownedShips.map(s => s.id === currentShip.id ? updatedShip : s),
        ownedShipModules: prev.ownedShipModules.filter(m => m.id !== moduleToEquip.id)
    } : null);
    showNotification(`Módulo "${moduleToEquip.name}" equipado no slot ${emptySlotIndex + 1}.`);
  };

  const handlePerformDiplomaticAction = (factionId: string, actionId: string) => {
      if (!playerState) return;
      const faction = ALL_FACTIONS_DATA.find(f => f.id === factionId);
      const action = BASIC_DIPLOMATIC_ACTIONS.find(a => a.id === actionId);
      if (!faction || !action) {
          showError("Facção ou ação diplomática inválida.");
          return;
      }
      const currentReputation = playerState.factionReputations[factionId] || 0;
      const currentStatus = getDiplomaticStatus(currentReputation);

      if (action.requiresStatus && !action.requiresStatus.includes(currentStatus)) { showError(`A ação "${action.name}" requer status: ${action.requiresStatus.join('/')}. Seu status é ${currentStatus}.`); return; }
      if (action.unavailableIfStatus && action.unavailableIfStatus.includes(currentStatus)) { showError(`A ação "${action.name}" não está disponível com status ${currentStatus}.`); return; }
      if (action.cost && playerState.credits < action.cost) { showError(`Créditos insuficientes. Custo: ${action.cost} CR.`); return; }
      if (action.requiresNoActiveTreatyOfType) {
          const existingTreaty = playerState.activeTreaties.find(t => t.factionId === factionId && t.type === action.requiresNoActiveTreatyOfType);
          if (existingTreaty) { showError(`Já existe um ${action.requiresNoActiveTreatyOfType} ativo com ${faction.name}.`); return; }
      }


      let newReputation = currentReputation + action.reputationEffect;
      let newStatus = action.setsStatusTo ? action.setsStatusTo : getDiplomaticStatus(newReputation);
      let newTreaties = [...playerState.activeTreaties];

      if (action.breaksExistingTreatyTypes && action.breaksExistingTreatyTypes.length > 0) {
          newTreaties = newTreaties.filter(treaty => !(treaty.factionId === factionId && action.breaksExistingTreatyTypes!.includes(treaty.type)));
          showNotification(`Seus seguintes tratados com ${faction.name} foram quebrados: ${action.breaksExistingTreatyTypes.join(', ')}.`);
      }

      if (action.createsTreaty && action.treatyDurationTicks) {
          newTreaties.push({
              type: action.createsTreaty,
              factionId,
              startTick: gameTickCounterRef.current,
              durationTicks: action.treatyDurationTicks
          });
          showNotification(`${action.createsTreaty} estabelecido com ${faction.name} por ${action.treatyDurationTicks} ticks!`);
      }
      
      setPlayerState(prev => {
          if (!prev) return null;
          const updatedReputations = { ...prev.factionReputations, [factionId]: Math.max(-100, Math.min(100, newReputation)) };
          const finalStatus = action.setsStatusTo ? newStatus : getDiplomaticStatus(updatedReputations[factionId]);
          // Ensure reputation reflects the status if status is forced (e.g. war)
          if (action.setsStatusTo && REPUTATION_THRESHOLDS[finalStatus] !== undefined && updatedReputations[factionId] > REPUTATION_THRESHOLDS[finalStatus] + 10) { // Add buffer
             if (finalStatus === DiplomaticStatus.War && updatedReputations[factionId] > REPUTATION_THRESHOLDS[DiplomaticStatus.Hostile]) {
                updatedReputations[factionId] = REPUTATION_THRESHOLDS[DiplomaticStatus.Hostile] -1; // Set to slightly below hostile threshold
             }
          }

          return {
              ...prev,
              credits: prev.credits - (action.cost || 0),
              factionReputations: updatedReputations,
              activeTreaties: newTreaties
          };
      });
      showNotification(`Ação "${action.name}" realizada com ${faction.name}. Reputação: ${action.reputationEffect > 0 ? '+' : ''}${action.reputationEffect}.`);
      if (action.setsStatusTo) {
        showNotification(`Seu status com ${faction.name} agora é ${action.setsStatusTo}.`);
      }
  };

  const handleBuyResource = (resourceName: string, quantity: number, stationId: string) => {
    if (!playerState || !currentShipCalculatedStats) return;
    const station = discoveredStations.find(s => s.id === stationId);
    if (!station || !station.marketInventory) return;
    const listing = station.marketInventory[resourceName];
    const resourceData = INITIAL_RESOURCES.find(r => r.name === resourceName);
    if (!listing || !resourceData || listing.quantity < quantity) {
        showError("Recurso não disponível ou quantidade insuficiente na estação."); return;
    }

    const tradeModifier = getEffectiveTradeModifier(station.faction);
    const pricePerUnit = Math.floor(resourceData.baseValue * listing.sellPriceModifier * tradeModifier);
    const totalCost = pricePerUnit * quantity;

    if (playerState.credits < totalCost) { showError(`Créditos insuficientes. Custo: ${totalCost} CR.`); return; }
    const cargoSpaceNeeded = quantity * RESOURCE_UNIT_WEIGHT;
    if (currentCargoUsage + cargoSpaceNeeded > currentShipCalculatedStats.totalCargoCapacity) {
        showError("Espaço de carga insuficiente na nave."); return;
    }

    setPlayerState(prev => {
        if (!prev) return null;
        const newInventory = { ...prev.inventory };
        newInventory[resourceName] = (newInventory[resourceName] || 0) + quantity;
        return { ...prev, credits: prev.credits - totalCost, inventory: newInventory };
    });

    setDiscoveredStations(prevStations => prevStations.map(s =>
        s.id === stationId ? {
            ...s,
            marketInventory: {
                ...s.marketInventory,
                [resourceName]: {
                    ...s.marketInventory![resourceName],
                    quantity: s.marketInventory![resourceName].quantity - quantity
                }
            }
        } : s
    ));
    showNotification(`${quantity}x ${resourceName} comprado(s) por ${totalCost} CR.`);
  };

  const handleSellResource = (resourceName: string, quantity: number, stationId: string) => {
    if (!playerState) return;
    const station = discoveredStations.find(s => s.id === stationId);
    if (!station || !station.marketInventory) return;
    const listing = station.marketInventory[resourceName];
    const resourceData = INITIAL_RESOURCES.find(r => r.name === resourceName);

    if (!resourceData || (playerState.inventory[resourceName] || 0) < quantity) {
        showError("Recurso não disponível em seu inventário ou quantidade insuficiente."); return;
    }
    if (!listing || !listing.isConsumed && listing.buyPriceModifier <= 0) {
        showError(`A estação ${station.name} não está comprando ${resourceName}.`); return;
    }
    
    const currentStationStock = listing.quantity;
    if (listing.isConsumed && currentStationStock + quantity > MAX_RESOURCE_STOCK_PER_ITEM) {
      const canBuy = MAX_RESOURCE_STOCK_PER_ITEM - currentStationStock;
      if (canBuy <= 0) {
        showError(`${station.name} já tem estoque máximo de ${resourceName}.`); return;
      }
      showError(`${station.name} só pode comprar mais ${canBuy} de ${resourceName}. Ajuste a quantidade.`); return;
    }


    // Trade agreements usually don't increase player's sell price
    const pricePerUnit = Math.floor(resourceData.baseValue * listing.buyPriceModifier);
    const totalGain = pricePerUnit * quantity;

    setPlayerState(prev => {
        if (!prev) return null;
        const newInventory = { ...prev.inventory };
        newInventory[resourceName] -= quantity;
        if (newInventory[resourceName] <= 0) delete newInventory[resourceName];
        return { ...prev, credits: prev.credits + totalGain, inventory: newInventory };
    });

    setDiscoveredStations(prevStations => prevStations.map(s =>
        s.id === stationId ? {
            ...s,
            marketInventory: {
                ...s.marketInventory,
                [resourceName]: {
                    ...s.marketInventory![resourceName],
                    quantity: s.marketInventory![resourceName].quantity + quantity
                }
            }
        } : s
    ));
    showNotification(`${quantity}x ${resourceName} vendido(s) por ${totalGain} CR.`);
  };

  const handleBuildColonyStructure = (planetId: string, buildingDefinitionId: string) => {
      if(!playerState) return;
      const planet = discoveredPlanets.find(p => p.id === planetId && p.isColonized && !p.ownerFactionId);
      const buildingDef = COLONIAL_BUILDING_DEFINITIONS.find(def => def.id === buildingDefinitionId);

      if (!planet || !buildingDef) { showError("Planeta ou definição de edifício inválidos."); return;}
      if (buildingDef.requiredTech && !playerState.unlockedTechs.includes(buildingDef.requiredTech)) { showError("Tecnologia necessária não pesquisada."); return; }
      if (buildingDef.maxPerPlanet && planet.buildings.filter(b => b.definitionId === buildingDef.id).length >= buildingDef.maxPerPlanet) { showError("Limite máximo deste edifício atingido no planeta."); return; }

      let canAfford = true;
      let missingItemsText = "";
      const currentInventory = { ...playerState.inventory };
      let currentCredits = playerState.credits;

      for(const itemName in buildingDef.cost) {
          const requiredAmount = buildingDef.cost[itemName];
          if (itemName === 'Créditos') {
              if (currentCredits < requiredAmount) { canAfford = false; missingItemsText += `${requiredAmount - currentCredits} Créditos. `; }
          } else {
              if ((currentInventory[itemName] || 0) < requiredAmount) { canAfford = false; missingItemsText += `${requiredAmount - (currentInventory[itemName] || 0)} ${itemName}. `; }
          }
      }

      if (!canAfford) { showError(`Recursos insuficientes: ${missingItemsText}`); return;}

      // Deduct costs
      for(const itemName in buildingDef.cost) {
          const requiredAmount = buildingDef.cost[itemName];
          if (itemName === 'Créditos') currentCredits -= requiredAmount;
          else currentInventory[itemName] -= requiredAmount;
      }

      const newBuildingInstance: BuildingInstance = { instanceId: generateIdUtil(), definitionId: buildingDef.id, operationalStatus: 'active' };
      const updatedPlanet = { ...planet, buildings: [...planet.buildings, newBuildingInstance] };

      setDiscoveredPlanets(prev => prev.map(p => p.id === planetId ? updatedPlanet : p));
      setSelectedPlanet(updatedPlanet);
      setPlayerState(prev => prev ? {...prev, credits: currentCredits, inventory: currentInventory} : null);
      showNotification(`${buildingDef.name} construído em ${planet.name}!`);
  };

  const handleActivatePolicy = (policyId: string) => {
    if (!playerState) return;
    const policyDef = POLICY_DEFINITIONS.find(p => p.id === policyId);
    if (!policyDef) { showError("Política não encontrada."); return; }
    if (playerState.activePolicies.some(ap => ap.policyId === policyId)) { showError("Esta política já está ativa."); return; }
    if (playerState.activePolicies.length >= MAX_ACTIVE_POLICIES) { showError(`Limite de ${MAX_ACTIVE_POLICIES} políticas ativas atingido.`); return; }

    let canAfford = true;
    let costCredits = 0;
    let costResearch = 0;

    if (policyDef.activationCost?.credits) {
        costCredits = policyDef.activationCost.credits;
        if (playerState.credits < costCredits) canAfford = false;
    }
    if (policyDef.activationCost?.researchPoints) {
        costResearch = policyDef.activationCost.researchPoints;
        if (playerState.researchPoints < costResearch) canAfford = false;
    }

    if (!canAfford) { showError("Recursos insuficientes para ativar esta política."); return; }

    const newActivePolicy: ActivePolicy = { policyId, activationTick: gameTickCounterRef.current };
    setPlayerState(prev => prev ? {
        ...prev,
        credits: prev.credits - costCredits,
        researchPoints: prev.researchPoints - costResearch,
        activePolicies: [...prev.activePolicies, newActivePolicy]
    } : null);
    showNotification(`Política "${policyDef.name}" ativada!`);
  };

  const handleDeactivatePolicy = (policyId: string) => {
     if (!playerState) return;
     const policyDef = POLICY_DEFINITIONS.find(p => p.id === policyId);
     if (!policyDef) { showError("Política não encontrada."); return; }
     if (!playerState.activePolicies.some(ap => ap.policyId === policyId)) { showError("Esta política não está ativa."); return; }

     setPlayerState(prev => prev ? {
         ...prev,
         activePolicies: prev.activePolicies.filter(ap => ap.policyId !== policyId)
     } : null);
     showNotification(`Política "${policyDef.name}" desativada.`);
  };
  
  const handleRepairShipAtColony = (planetId: string) => {
    if (!playerState || !currentShip || !currentShipCalculatedStats) {
        showError("Dados do jogador ou da nave ausentes."); return;
    }
    const planet = discoveredPlanets.find(p => p.id === planetId);
    if (!planet || !planet.isColonized || planet.ownerFactionId) {
        showError("Só é possível reparar em colônias próprias com estaleiro."); return;
    }
    if (!planet.buildings.some(b => b.definitionId === 'bldg_shipyard_p1')) {
        showError("Esta colônia não possui um Estaleiro Planetário."); return;
    }

    const hullToRepair = currentShipCalculatedStats.totalHullIntegrity - (currentShip.currentHullIntegrity ?? currentShipCalculatedStats.totalHullIntegrity);
    if (hullToRepair <= 0) { showNotification("A nave já está com o casco no máximo."); return; }

    const costCredits = hullToRepair * REPAIR_COST_PER_HULL_POINT_CREDITS;
    const costResourceQty = parseFloat((hullToRepair * REPAIR_COST_PER_HULL_POINT_TITANIUM).toFixed(2));

    if (playerState.credits < costCredits || (playerState.inventory[REPAIR_RESOURCE_NAME] || 0) < costResourceQty) {
        showError(`Recursos insuficientes para reparo. Necessário: ${costCredits} CR, ${costResourceQty} ${REPAIR_RESOURCE_NAME}.`);
        return;
    }

    setPlayerState(prev => {
        if (!prev || !prev.currentShipId) return prev;
        const updatedShips = prev.ownedShips.map(ship => {
            if (ship.id === prev.currentShipId) {
                const shipStats = calculateShipStats(ship); // Recalculate for safety
                return { ...ship, currentHullIntegrity: shipStats.totalHullIntegrity };
            }
            return ship;
        });
        const newInventory = { ...prev.inventory };
        newInventory[REPAIR_RESOURCE_NAME] = (newInventory[REPAIR_RESOURCE_NAME] || 0) - costResourceQty;
        if (newInventory[REPAIR_RESOURCE_NAME] <= 0) delete newInventory[REPAIR_RESOURCE_NAME];
        
        return { ...prev, credits: prev.credits - costCredits, ownedShips: updatedShips, inventory: newInventory };
    });
    showNotification(`Nave reparada em ${planet.name} por ${costCredits} CR e ${costResourceQty} ${REPAIR_RESOURCE_NAME}.`);
  };

  const handleViewColonyDetails = (planet: Planet) => {
    setSelectedPlanet(planet);
    setCurrentView('planet');
  };

  const handleColonyEventChoice = (eventId: string, choiceId: string) => {
    const event = activeColonyEvents.find(e => e.id === eventId && !e.isResolved);
    if (!event || !event.activeChoices) {
        showError("Evento não encontrado ou já resolvido.");
        setUnresolvedColonyEventToShow(null);
        processNextUnresolvedEvent();
        return;
    }
    const choice = event.activeChoices.find(c => c.id === choiceId);
    if (!choice) {
        showError("Escolha inválida para o evento.");
        return;
    }

    setPlayerState(prevPlayerState => {
        if (!prevPlayerState) return null;
        let mutablePlayerState = { ...prevPlayerState, inventory: { ...prevPlayerState.inventory } };
        let mutableDiscoveredPlanets = [...discoveredPlanets]; // Use a fresh copy from outer scope

        const shipForEffect = mutablePlayerState.ownedShips.find(s => s.id === mutablePlayerState.currentShipId);
        const currentShipStatsForEffect = shipForEffect ? calculateShipStats(shipForEffect) : null;
        const cargoCapacityForEffect = currentShipStatsForEffect ? currentShipStatsForEffect.totalCargoCapacity : 0;
        let notificationMessageParts: string[] = [`Evento em ${event.title}: Escolha "${choice.text}" feita.`];

        choice.effects.forEach(effect => {
            switch (effect.type) {
                case ColonyEventEffectType.RESOURCE_CHANGE:
                    if (effect.resourceName) {
                        const currentAmount = mutablePlayerState.inventory[effect.resourceName] || 0;
                        const changeAmount = effect.amount;
                         if (changeAmount > 0 && calculateCurrentCargoUsage(mutablePlayerState.inventory) + (changeAmount * RESOURCE_UNIT_WEIGHT) > cargoCapacityForEffect) {
                            notificationMessageParts.push(`Carga excedida! ${effect.resourceName} (${changeAmount}) não adicionado.`);
                        } else {
                            mutablePlayerState.inventory[effect.resourceName] = Math.max(0, currentAmount + changeAmount);
                            if (effect.message) notificationMessageParts.push(effect.message);
                            else notificationMessageParts.push(`${effect.resourceName}: ${changeAmount > 0 ? '+' : ''}${changeAmount}`);
                        }
                    }
                    break;
                case ColonyEventEffectType.CREDIT_CHANGE:
                    mutablePlayerState.credits = Math.max(0, mutablePlayerState.credits + effect.amount);
                    if (effect.message) notificationMessageParts.push(effect.message);
                    else notificationMessageParts.push(`Créditos: ${effect.amount > 0 ? '+' : ''}${effect.amount}`);
                    break;
                 case ColonyEventEffectType.RESEARCH_POINTS_CHANGE:
                    mutablePlayerState.researchPoints = Math.max(0, mutablePlayerState.researchPoints + effect.amount);
                    if (effect.message) notificationMessageParts.push(effect.message);
                    else notificationMessageParts.push(`P&D: ${effect.amount > 0 ? '+' : ''}${effect.amount} RP`);
                    break;
                 case ColonyEventEffectType.POPULATION_CHANGE:
                    {
                        const planetIndex = mutableDiscoveredPlanets.findIndex(p => p.id === event.planetId);
                        if (planetIndex !== -1) {
                            mutableDiscoveredPlanets[planetIndex].population = Math.max(0, mutableDiscoveredPlanets[planetIndex].population + effect.amount);
                            setDiscoveredPlanets(mutableDiscoveredPlanets); // Update planets separately as it's not part of playerState directly in this map
                            if (effect.message) notificationMessageParts.push(effect.message);
                            else notificationMessageParts.push(`População: ${effect.amount > 0 ? '+' : ''}${effect.amount}`);
                        }
                    }
                    break;
                default: if(effect.message) notificationMessageParts.push(effect.message); break;
            }
        });
        showNotification(notificationMessageParts.join(' - '));
        return mutablePlayerState;
    });

    setActiveColonyEvents(prevEvents =>
        prevEvents.map(e => (e.id === eventId ? { ...e, isResolved: true, chosenChoiceId: choiceId, activeChoices: [] } : e))
    );
    setUnresolvedColonyEventToShow(null);
    processNextUnresolvedEvent(); // Attempt to show next event
  };



  const handleOpenMission = (mission: Mission) => {
    if (playerState?.isTraveling) return;
    const planet = discoveredPlanets.find(candidate => candidate.id === mission.objectiveDetails?.targetPlanetId);
    if (planet) { setSelectedPlanet(planet); setSelectedSystemIdForDetailView(planet.systemId); setCurrentView('planet'); }
    else if (mission.objectiveDetails?.targetSystemId) {
      setSelectedSystemIdForDetailView(mission.objectiveDetails.targetSystemId);
      setCurrentView('systemDetail');
    } else setCurrentView('galaxy');
    setGamePhase('playing');
  };

  let content: ReactNode;
  if (gamePhase === 'titleScreen') {
    content = <TitleScreen
                onNewGame={() => setGamePhase('characterCreation')}
                onLoadGame={() => setGamePhase('loadGameModal')}
                gameVersion={GAME_VERSION}
                onOpenSettings={handleOpenSettings}
                latestSave={savedGamesMeta[0]}
                onContinue={() => savedGamesMeta[0] && handleLoadGame(savedGamesMeta[0].slotKey)}
             />;
  } else if (gamePhase === 'characterCreation') {
    content = <CharacterCreationScreen
                characterName={characterNameInput}
                onCharacterNameChange={setCharacterNameInput}
                selectedOriginId={selectedOriginId}
                onOriginChange={setSelectedOriginId}
                onStartGame={startNewGame}
                onBack={() => setGamePhase('titleScreen')}
                showError={showError}
              />;
  } else if (playerState && currentShip && currentShipCalculatedStats) {
     const isAtWarWithCurrentStationOwner = selectedStation && playerState.factionReputations[selectedStation.faction] !== undefined &&
        getDiplomaticStatus(playerState.factionReputations[selectedStation.faction]) === DiplomaticStatus.War;

      const isAtWarWithCurrentPlanetOwner = selectedPlanet && selectedPlanet.ownerFactionId &&
        playerState.factionReputations[selectedPlanet.ownerFactionId] !== undefined &&
        getDiplomaticStatus(playerState.factionReputations[selectedPlanet.ownerFactionId]) === DiplomaticStatus.War;

    const gameUi = (
      <GameInterface
        playerState={playerState}
        currentShip={currentShip}
        currentCargoUsage={currentCargoUsage}
        currentShipCalculatedStats={currentShipCalculatedStats}
        currentView={currentView}
        setCurrentView={setCurrentView}
        setGamePhase={setGamePhase}
        gamePhase={gamePhase}
        showNotification={showNotification}
        _starSystems={_starSystems}
        discoveredPlanets={discoveredPlanets}
        discoveredStations={discoveredStations}
        activeColonyEvents={activeColonyEvents}
        activeMissions={activeMissions}
        onOpenMission={handleOpenMission}
        onCompleteMission={handleCompleteMission}
        onSave={() => handleSaveGame(DEFAULT_SAVE_SLOT_KEY, true)}
        saveStatus={saveStatus}
      >
        {currentView === 'galaxy' && <GalaxyView playerState={playerState} starSystems={_starSystems} onOpenSystemInfo={handleOpenSystemInfo} onScanForAnomalies={handleScanForAnomalies} isLoading={isLoading} showNotification={showNotification} onTravelToSystem={handleInitiateTravel} />}
        {currentView === 'planet' && <PlanetView selectedPlanet={selectedPlanet} discoveredPlanets={discoveredPlanets} playerState={playerState} currentShip={currentShip} currentShipCalculatedStats={currentShipCalculatedStats} isLoading={isLoading} onScanResources={handleScanPlanetResources} onTravelToPlanet={planetId => handleInitiateTravel(planetId, 'planet')} onColonize={handleColonizePlanet} COLONIZATION_CREDIT_COST={COLONIZATION_CREDIT_COST} starSystems={_starSystems} onPlanetLoreGenerated={(planetId, newLore) => { setDiscoveredPlanets(prev => prev.map(p => p.id === planetId ? {...p, description: newLore} : p)); if (selectedPlanet?.id === planetId) setSelectedPlanet(prev => prev ? {...prev, description: newLore } : null); }} onSetCurrentView={setCurrentView} onSetSelectedStation={setSelectedStation} isAtWarWithOwningFaction={!!isAtWarWithCurrentPlanetOwner} onBack={() => {const sysId = selectedPlanet?.systemId; setSelectedPlanet(null); setCurrentView('systemDetail'); setSelectedSystemIdForDetailView(sysId || null); }} onBuildStructure={handleBuildColonyStructure} onRepairShipAtColony={handleRepairShipAtColony} />}
        {currentView === 'inventory' && <InventoryView playerState={playerState} currentShipCalculatedStats={currentShipCalculatedStats} currentCargoUsage={currentCargoUsage} />}
        {currentView === 'npcs' && <NpcView selectedNpc={selectedNpc} npcInteractionMessage={npcInteractionMessage} onSetNpcInteractionMessage={setNpcInteractionMessage} onNpcInteract={handleNpcInteraction} onEncounterNpc={handleEncounterNPC} isLoading={isLoading || isGeneratingMission} playerState={playerState} getTranslatedNpcRole={getTranslatedNpcRole} onStartCombat={handleStartCombat} />}
        {currentView === 'missions' && <MissionsView activeMissions={activeMissions} onGenerateMission={handleGenerateMission} onCompleteMission={handleCompleteMission} isLoading={isLoading || isGeneratingMission} playerState={playerState} discoveredPlanets={discoveredPlanets} discoveredStations={discoveredStations} onOpenMission={handleOpenMission} />}
        {currentView === 'crafting' && <CraftingView playerState={playerState} onCraftItem={handleCraftItem} isLoading={isLoading} />}
        {currentView === 'colonies' && <ColoniesView discoveredPlanets={discoveredPlanets} playerState={playerState} onViewColonyDetails={handleViewColonyDetails} />}
        {currentView === 'profile' && gamePhase === 'profileView' && <ProfileView playerState={playerState} onNavigate={setCurrentView} />}
        {currentView === 'skillTree' && gamePhase === 'profileView' && <SkillTreeView playerState={playerState} onUnlockSkill={handleUnlockSkill} onNavigateToProfile={() => setCurrentView('profile')} isLoading={isLoading} />}
        {currentView === 'techTree' && gamePhase === 'profileView' && <TechTreeView playerState={playerState} onUnlockTech={handleUnlockTech} onNavigateToProfile={() => setCurrentView('profile')} isLoading={isLoading}/>}
        {currentView === 'stationDetails' && <StationDetailsView selectedStation={selectedStation} onSetCurrentView={setCurrentView} playerState={playerState} isAtWarWithOwningFaction={!!isAtWarWithCurrentStationOwner} onOpenColonyMarket={(stationId) => { setSelectedPlanetaryMarketStationId(stationId); setCurrentView('colonyMarket'); }} onBack={() => { const sysId = selectedStation?.systemId; setSelectedStation(null); setCurrentView('systemDetail'); setSelectedSystemIdForDetailView(sysId || null); }} onGenerateMission={handleGenerateMission} />}
        {currentView === 'shipyard' && selectedStation && <ShipyardView playerState={playerState} currentShip={currentShip} selectedStation={selectedStation} currentShipCalculatedStats={currentShipCalculatedStats} onUnequipModule={handleUnequipModule} onEquipModule={handleEquipModule} onSellOwnedModule={handleSellOwnedShipModule} onBuyModule={handleBuyShipModule} onBuyHull={handleBuyShipHull} isLoading={isLoading} playerTradeDiscount={getEffectiveTradeModifier(selectedStation.faction)} onBack={() => setCurrentView('stationDetails')} />}
        {currentView === 'hangar' && <HangarView playerState={playerState} onSetCurrentShip={handleSetCurrentShip} onOpenRenameModal={handleOpenRenameShipModal}/>}
        {currentView === 'systemDetail' && <SystemView system={_starSystems.find(s => s.id === selectedSystemIdForDetailView) || null} planetsInSystem={discoveredPlanets.filter(p => p.systemId === selectedSystemIdForDetailView)} stationsInSystem={discoveredStations.filter(s => s.systemId === selectedSystemIdForDetailView)} playerState={playerState} isLoading={isLoading} onSelectPlanet={(planetId) => { const planet = discoveredPlanets.find(p => p.id === planetId); if(planet) {setSelectedPlanet(planet); setCurrentView('planet');} }} onSelectStation={(stationId) => { const station = discoveredStations.find(s => s.id === stationId); if(station) {setSelectedStation(station); setCurrentView('stationDetails');} }} onBackToGalaxy={() => setCurrentView('galaxy')} onScanSystem={handleScanSystem} onTravelToSystem={handleInitiateTravel} />}
        {currentView === 'diplomacy' && <DiplomacyView playerState={playerState} allFactions={ALL_FACTIONS_DATA} getDiplomaticStatus={getDiplomaticStatus} onPerformAction={handlePerformDiplomaticAction} selectedFaction={selectedFactionForDiplomacy} onSelectFaction={setSelectedFactionForDiplomacy} isLoading={isLoading} gameTickCounter={gameTickCounterRef.current} />}
        {currentView === 'colonyMarket' && selectedPlanetaryMarketStationId && <ColonyMarketView playerState={playerState} marketStation={discoveredStations.find(s => s.id === selectedPlanetaryMarketStationId) || null} allResources={INITIAL_RESOURCES} onBuy={handleBuyResource} onSell={handleSellResource} onBack={() => setCurrentView('stationDetails')} playerTradeDiscount={getEffectiveTradeModifier(discoveredStations.find(s => s.id === selectedPlanetaryMarketStationId)?.faction || "")} isLoading={isLoading} />}
        {currentView === 'researchLabView' && selectedStation && <ResearchLabView playerState={playerState} onBack={() => setCurrentView('stationDetails')} isAnalyzingArtifact={isAnalyzingArtifact} onAnalyzeArtifact={handleAnalyzeArtifact} />}
        {currentView === 'policies' && <PolicyView playerState={playerState} onActivatePolicy={handleActivatePolicy} onDeactivatePolicy={handleDeactivatePolicy} isLoading={isLoading} />}
        {/* Combat View is rendered separately below based on combatState.isActive */}
      </GameInterface>
    );
    if (playerState.combatState?.isActive && playerState.combatState.enemyShipDetails && currentShipCalculatedStats) {
        content = <CombatView combatState={playerState.combatState} playerShipStats={currentShipCalculatedStats} onPlayerAction={handlePlayerCombatAction} />;
    } else {
        content = gameUi;
    }
  } else {
    content = (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <LoadingSpinner message="Carregando dados do jogador..." />
        <p className="mt-4 text-sm text-gray-400">Se o carregamento demorar, tente recarregar a página.</p>
      </div>
    );
  }

  return (
    <>
      <audio id="backgroundMusic" loop />
      {content}
      {gamePhase === 'paused' && playerState && (
        <PauseMenuModal
          isOpen={true}
          onClose={() => setGamePhase(playerState.combatState?.isActive ? 'combatView' : 'playing')}
          onReturnToGame={() => setGamePhase(playerState.combatState?.isActive ? 'combatView' : 'playing')}
          onQuickSave={() => handleSaveGame(DEFAULT_SAVE_SLOT_KEY, true)}
          onLoadGame={() => setGamePhase('loadGameModal')}
          onOpenProfile={() => { setGamePhase('profileView'); setCurrentView('profile');}}
          onMainMenu={() => { setGamePhase('titleScreen'); setPlayerState(null); }}
          onOpenSettings={handleOpenSettings}
        />
      )}
      {gamePhase === 'loadGameModal' && (
          <LoadGameModal
            isOpen={true}
            onClose={() => setGamePhase(playerState ? 'paused' : 'titleScreen')}
            savedGamesMeta={savedGamesMeta}
            onLoadGame={(slotKey) => { handleLoadGame(slotKey);}}
            onDeleteGame={handleInitiateDelete}
            onSaveNewSlot={() => handleSaveGame(`${GAME_SAVE_KEY_PREFIX}${new Date().toISOString()}`)}
          />
      )}
      {showDeleteConfirmModal.isOpen && showDeleteConfirmModal.slotKeyToDelete && (
          <DeleteConfirmModal
            isOpen={true}
            onClose={() => setShowDeleteConfirmModal({isOpen: false, slotKeyToDelete: null})}
            onConfirmDelete={() => handleDeleteGame(showDeleteConfirmModal.slotKeyToDelete!)}
          />
      )}
      {showRenameShipModal.isOpen && showRenameShipModal.shipId && (
          <RenameShipModal
            isOpen={true}
            currentName={showRenameShipModal.currentName}
            renameInput={renameShipInput}
            onRenameInputChange={setRenameShipInput}
            onClose={() => setShowRenameShipModal({isOpen: false, shipId: null, currentName:''})}
            onConfirmRename={handleConfirmRenameShip}
           />
      )}
      {showAnomalyInvestigateModal && currentAnomalyEvent && (
          <AnomalyInvestigateModal
            isOpen={true}
            anomalyEvent={currentAnomalyEvent}
            onClose={() => {setShowAnomalyInvestigateModal(false); setCurrentAnomalyEvent(null);}}
            onInvestigate={handleInvestigateAnomaly}
          />
      )}
      {playerState && playerState.isTraveling && playerState.travelDetails && (
          <TravelModal
            isOpen={true}
            travelDetails={playerState.travelDetails}
            gameTick={gameTickCounterRef.current}
            discoveredPlanets={discoveredPlanets}
            discoveredStations={discoveredStations}
            starSystems={_starSystems}
          />
      )}
       {gamePhase === 'settingsModal' && (
          <SettingsModal
            isOpen={true}
            onClose={() => setGamePhase(phaseBeforeSettings)}
            backgroundMusicVolume={playerState?.backgroundMusicVolume ?? DEFAULT_BACKGROUND_MUSIC_VOLUME}
            onBackgroundMusicVolumeChange={handleBackgroundMusicVolumeChange}
            playerStateExists={!!playerState}
          />
       )}
       {playerState?.combatSummaryData && gamePhase === 'combatSummary' && (
          <CombatSummaryModal
            summary={playerState.combatSummaryData}
            onClose={handleCloseCombatSummary}
          />
       )}
       {unresolvedColonyEventToShow && (
            <ColonyEventModal
                event={unresolvedColonyEventToShow}
                onMakeChoice={handleColonyEventChoice}
                onClose={() => {
                    setUnresolvedColonyEventToShow(null);
                    processNextUnresolvedEvent(); // Try to show next event if user dismissed this one
                }}
            />
        )}

      {notification && (
          <div role="alert" aria-live="assertive" className="fixed bottom-10 right-10 glass-panel-heavy bg-emerald-500/10 border-emerald-500/50 text-emerald-300 py-4 px-6 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] text-xs font-display font-bold uppercase tracking-widest z-[100] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></div>
                {notification}
              </div>
          </div>
      )}
      {error && (
           <div role="alert" aria-live="assertive" className="fixed bottom-10 left-10 glass-panel-heavy bg-rose-500/10 border-rose-500/50 text-rose-300 py-4 px-6 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.2)] text-xs font-display font-bold uppercase tracking-widest z-[100] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-rose-500 mr-3 animate-pulse"></div>
                {error}
              </div>
          </div>
      )}
      {(isLoading || loadingMessage) && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[101] animate-in fade-in duration-500">
              <div className="flex flex-col items-center">
                <LoadingSpinner message={loadingMessage || "Sincronizando sistemas..."} size="lg" />
                <div className="mt-8 flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></div>
                </div>
              </div>
          </div>
      )}

    </>
  );
}
export default App; // Added default export

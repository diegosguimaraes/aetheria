
import React, { useEffect, useState } from 'react';
import { Planet, PlayerState, Ship, StarSystem, SpaceStation, FactionInfo, GameView, BuildingInstance, ColonialBuildingDefinition, ShipStats } from '../../types';
import { Icons } from '../../icons'; // Corrected path
import LoadingSpinner from '../LoadingSpinner';
import { PlanetIllustration } from '../AdventureArt';
import AdventureIcon from '../AdventureIcon';
import { FIXED_LORE_PLANET_IDS, PLANET_TYPES, getResourceImagePath, ALL_FACTIONS_DATA, ALL_STATIONS_DATA as GAME_ALL_STATIONS_DATA, COLONIAL_BUILDING_DEFINITIONS, INITIAL_TECH_TREE, REPAIR_COST_PER_HULL_POINT_CREDITS, REPAIR_COST_PER_HULL_POINT_TITANIUM, REPAIR_RESOURCE_NAME } from '../../constants'; // Corrected path
import { generateDynamicPlanetLore } from '../../services/llmService'; // Corrected path
// calculateShipStats is no longer needed directly if currentShipCalculatedStats is passed

interface PlanetViewProps {
  selectedPlanet: Planet | null;
  discoveredPlanets: Planet[];
  playerState: PlayerState | null;
  currentShip: Ship | null;
  currentShipCalculatedStats: ShipStats | null; // Added prop
  isLoading: boolean;
  onScanResources: (planet: Planet) => void;
  onColonize: (planet: Planet) => void;
  COLONIZATION_CREDIT_COST: number;
  starSystems: StarSystem[];
  onPlanetLoreGenerated: (planetId: string, newLore: string) => void;
  onSetCurrentView: (view: GameView) => void;
  onSetSelectedStation: (station: SpaceStation) => void;
  isAtWarWithOwningFaction: boolean;
  onBack: () => void;
  onTravelToPlanet: (planetId: string) => void;
  onBuildStructure: (planetId: string, buildingDefinitionId: string) => void;
  onRepairShipAtColony: (planetId: string) => void;
}

const PlanetView: React.FC<PlanetViewProps> = ({
  selectedPlanet,
  discoveredPlanets, 
  playerState,
  currentShip,
  currentShipCalculatedStats, // Use this prop
  isLoading: appIsLoading,
  onScanResources,
  onColonize,
  COLONIZATION_CREDIT_COST,
  starSystems,
  onPlanetLoreGenerated,
  onSetCurrentView,
  onSetSelectedStation,
  isAtWarWithOwningFaction,
  onBack,
  onTravelToPlanet,
  onBuildStructure,
  onRepairShipAtColony
}) => {
  const [isFetchingLore, setIsFetchingLore] = useState(false);

  useEffect(() => {
    const fetchLore = async () => {
      if (!selectedPlanet || !starSystems || !onPlanetLoreGenerated) return;
      if (FIXED_LORE_PLANET_IDS.includes(selectedPlanet.id)) return;

      const planetTypeDefinition = PLANET_TYPES.find(pt => pt.biome === selectedPlanet.biome);
      const isGenericDescription = planetTypeDefinition?.defaultDesc === selectedPlanet.description;

      if (isGenericDescription && !selectedPlanet.ownerFactionId && !selectedPlanet.isColonized /* Only generate for uncolonized, non-fixed lore planets */) {
        setIsFetchingLore(true);
        const system = starSystems.find(s => s.id === selectedPlanet.systemId);
        const systemName = system?.name || 'Sistema Desconhecido';
        const newLore = await generateDynamicPlanetLore(selectedPlanet.name, selectedPlanet.biome, systemName);
        if (newLore) {
          onPlanetLoreGenerated(selectedPlanet.id, newLore);
        }
        setIsFetchingLore(false);
      }
    };

    if (selectedPlanet) {
        fetchLore();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanet?.id, selectedPlanet?.description, selectedPlanet?.ownerFactionId, selectedPlanet?.isColonized]);


  if (!selectedPlanet || !playerState) return <div className="p-4 text-center text-gray-400">Nenhum planeta selecionado ou dados do jogador ausentes. Volte para a galáxia.</div>;

  const planetData = selectedPlanet;
  const isNpcColonized = planetData.isColonized && !!planetData.ownerFactionId;
  const isPlayerColony = planetData.isColonized && !planetData.ownerFactionId;
  const owningFactionDetails = isNpcColonized ? ALL_FACTIONS_DATA.find(f => f.id === planetData.ownerFactionId) : null;

  const canPlayerColonizeThisPlanet = !planetData.isColonized &&
                                (playerState.craftedItems.some(item => item.type === 'colony_component' && item.name.toLowerCase().includes('módulo de colonização')) ||
                                 currentShip?.modules.some(mod => mod?.id === 'sm_colony_support'));

  const allResourcesDiscovered = planetData.resourcesHint.every(hint => {
    const resourceNameFromHint = (hint.split(" ").slice(-1)[0] || hint.split(" ")[0] || "").replace(/[.,]/g, '');
    return planetData.discoveredResources.some(dr => dr.toLowerCase().includes(resourceNameFromHint.toLowerCase()));
  }) && planetData.resourcesHint.length > 0;

  const hasShipyard = isPlayerColony && planetData.buildings.some(b => b.definitionId === 'bldg_shipyard_p1');
  const shipIsDamaged = currentShip && currentShipCalculatedStats && (currentShip.currentHullIntegrity ?? currentShipCalculatedStats.totalHullIntegrity) < currentShipCalculatedStats.totalHullIntegrity;
  
  let repairCostCredits = 0;
  let repairCostResourceQty = 0;
  let canAffordRepair = false;

  if (shipIsDamaged && currentShip && currentShipCalculatedStats) {
    const hullToRepair = currentShipCalculatedStats.totalHullIntegrity - (currentShip.currentHullIntegrity ?? currentShipCalculatedStats.totalHullIntegrity);
    repairCostCredits = hullToRepair * REPAIR_COST_PER_HULL_POINT_CREDITS;
    repairCostResourceQty = parseFloat((hullToRepair * REPAIR_COST_PER_HULL_POINT_TITANIUM).toFixed(2)); // Ensure it's a number
    canAffordRepair = playerState.credits >= repairCostCredits && (playerState.inventory[REPAIR_RESOURCE_NAME] || 0) >= repairCostResourceQty;
  }


  const handleInteractWithNpcColony = () => {
    if (planetData.planetaryStationId) {
      const station = GAME_ALL_STATIONS_DATA.find(s => s.id === planetData.planetaryStationId);
      if (station) {
        onSetSelectedStation(station);
        onSetCurrentView('stationDetails');
      } else {
        console.error(`Estação planetária ${planetData.planetaryStationId} não encontrada para o planeta ${planetData.name}`);
      }
    }
  };

  const getBuildingIconComponent = (iconName?: string): React.ReactNode => {
    if (!iconName) return <div className="w-5 h-5 mr-2"><Icons.Colony /></div>; // Default icon
    const IconComponent = (Icons as any)[iconName]; // Type assertion to access Icons by string key
    return IconComponent ? <div className="w-5 h-5 mr-2"><IconComponent /></div> : <div className="w-5 h-5 mr-2"><Icons.Colony /></div>;
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-1 md:p-6 h-full">
      <div className="glass-panel p-4 md:p-8 rounded-2xl shadow-2xl text-slate-200 relative border-sky-500/10 overflow-hidden min-h-full mb-4">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        <button
            onClick={onBack}
            className="btn-scifi absolute top-6 left-6 py-2 px-4 text-xs z-10 border-slate-700 text-slate-400 hover:text-sky-400"
            aria-label="Voltar"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            VOLTAR
        </button>

        <div className="text-center pt-12 md:pt-0 mb-6 md:mb-8">
          <span className="text-[8px] md:text-[10px] font-technical uppercase text-sky-500 tracking-[0.3em] block mb-1 md:mb-2">Relatório Planetário</span>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-sky-400 tracking-tight glow-text-cyan uppercase italic">{planetData.name}</h2>
          <div className="h-0.5 w-16 md:w-24 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent mx-auto mt-3 md:mt-4"></div>
        </div>

        {playerState.currentLocation !== planetData.id && <div className="planet-travel-prompt"><p>Você está vendo o atlas deste mundo. Viaje até sua órbita para escanear os recursos.</p><button className="adventure-button primary" onClick={() => onTravelToPlanet(planetData.id)} disabled={playerState.isTraveling || appIsLoading}><AdventureIcon name="hangar" /> Viajar até {planetData.name}<AdventureIcon name="arrow" /></button></div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-10">
            <div className="space-y-4 md:space-y-6">
                <div className="relative group overflow-hidden rounded-xl md:rounded-2xl border border-sky-500/20 shadow-2xl">
                  <div className="planet-art-frame"><PlanetIllustration biome={planetData.biome} className="planet-portrait" ring={/gasoso/i.test(planetData.biome)} /></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-sky-500/30 px-3 py-1.5 rounded-lg">
                      <span className="text-[10px] text-sky-400 font-technical uppercase block leading-none mb-1">Bioma</span>
                      <span className="text-sm font-display font-bold text-white tracking-wide">{planetData.biome}</span>
                    </div>
                    {isNpcColonized && owningFactionDetails && (
                      <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-lg text-right">
                        <span className="text-[10px] text-amber-500 font-technical uppercase block leading-none mb-1">Soberania</span>
                        <span className="text-sm font-display font-bold text-amber-300 tracking-wide">{owningFactionDetails.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-xl border-slate-700/50">
                  <h3 className="text-xs font-technical uppercase text-sky-500 tracking-widest mb-3 flex items-center">
                    <div className="w-4 h-4 mr-2"><Icons.Ship /></div> Dados de Exploração
                  </h3>
                  {isFetchingLore ? (
                      <div className="flex items-center text-slate-500 italic py-4 justify-center bg-slate-900/30 rounded-lg">
                          <LoadingSpinner size="sm" />
                          <span className="ml-3 text-xs font-technical">Sincronizando crônicas do setor...</span>
                      </div>
                  ) : (
                      <p className="text-sm text-slate-300 leading-relaxed italic opacity-90 border-l-2 border-sky-500/20 pl-4 py-2">
                        "{planetData.description}"
                      </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {planetData.features.map(feature => (
                      <span key={feature} className="text-[9px] font-technical uppercase tracking-tighter px-2 py-1 bg-slate-800/60 rounded border border-slate-700/50 text-slate-400">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
            </div>

            <div className="space-y-8">
                <section>
                    <h3 className="text-xs font-display font-bold text-sky-300 mb-4 uppercase tracking-widest border-b border-sky-500/10 pb-2">Manifesto de Recursos</h3>
                    {planetData.discoveredResources.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {planetData.discoveredResources.map(res => {
                                const imagePath = getResourceImagePath(res);
                                return (
                                    <div key={res} className="flex items-center p-3 bg-slate-900/40 rounded-xl border border-slate-800 hover:border-sky-500/30 transition-all group">
                                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mr-3 group-hover:bg-slate-700 transition-colors">
                                          {imagePath && <img src={imagePath} alt={res} className="w-6 h-6 object-contain animate-pulse-slow" />}
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">{res}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-center">
                          <p className="text-xs text-slate-500 italic mb-4">Nenhum recurso específico mapeado. Assinaturas parciais detectadas: {planetData.resourcesHint.join('; ')}</p>
                        </div>
                    )}
                     {(!allResourcesDiscovered || !(playerState.surveyedPlanetIds || []).includes(planetData.id)) && planetData.resourcesHint.length > 0 && (
                        <button
                            onClick={() => onScanResources(planetData)}
                            className="w-full btn-scifi py-3 text-xs bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/30 flex items-center justify-center mt-4"
                            disabled={appIsLoading || playerState.isTraveling || playerState.currentLocation !== planetData.id}
                        >
                            <div className="w-4 h-4 mr-2"><Icons.ScanSystem /></div> ESCANEAR RECURSOS (50 CR)
                        </button>
                    )}
                </section>

                <section className="glass-panel p-6 rounded-2xl border-sky-500/10">
                    <h3 className="text-xs font-display font-bold text-sky-300 mb-5 uppercase tracking-widest flex justify-between items-center">
                      <span>Status da Colônia</span>
                      {planetData.isColonized ? (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-tighter animate-pulse text-xs">Ativa</span>
                      ) : (
                        <span className="text-[9px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full border border-slate-500/20 uppercase tracking-tighter">Inabitada</span>
                      )}
                    </h3>
                    {planetData.isColonized ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                              <div>
                                <span className="text-[10px] text-slate-500 font-technical uppercase block leading-none mb-1">Censo Populacional</span>
                                <span className="text-xl font-display font-bold text-slate-200">{planetData.population.toLocaleString()} <span className="text-xs text-slate-500 ml-1">Hab</span></span>
                              </div>
                            </div>
                            
                            {isPlayerColony && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 font-technical uppercase tracking-tight">Moral Estrutural</span>
                                        <span className={`text-xs font-technical font-bold ${
                                            (planetData.colonyMorale || 50) >= 80 ? 'text-emerald-400' : 
                                            (planetData.colonyMorale || 50) <= 30 ? 'text-rose-400' : 'text-amber-400'
                                        }`}>
                                            {Math.round(planetData.colonyMorale || 50)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-900/60 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.5)] ${
                                                (planetData.colonyMorale || 50) >= 80 ? 'bg-emerald-500 shadow-emerald-500/20' : 
                                                (planetData.colonyMorale || 50) <= 30 ? 'bg-rose-500 shadow-rose-500/20' : 'bg-amber-500 shadow-amber-500/20'
                                            }`}
                                            style={{ width: `${planetData.colonyMorale || 50}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div>
                              <p className="text-[10px] text-slate-500 font-technical uppercase tracking-tight mb-3">Rendimento Operacional</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(planetData.baseProduction).map(([res, amount]: [string, number]) => {
                                    const imagePath = getResourceImagePath(res);
                                    return (
                                        <div key={res} className="flex items-center justify-between p-2 bg-slate-900/30 rounded-lg border border-slate-800/50">
                                          <div className="flex items-center">
                                            {imagePath && <img src={imagePath} alt={res} className="w-4 h-4 mr-2 object-contain" />}
                                            <span className="text-[11px] text-slate-400">{res}</span>
                                          </div>
                                          <span className="text-[11px] font-technical text-sky-400">+{amount}</span>
                                        </div>
                                    );
                                })}
                              </div>
                            </div>

                             {hasShipyard && currentShip && currentShipCalculatedStats && (
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <h4 className="text-[10px] font-display font-bold text-emerald-400 mb-3 uppercase tracking-widest">Protocolos de Estaleiro</h4>
                                    <div className="bg-slate-950/40 p-4 rounded-xl border border-emerald-500/10">
                                      <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] text-slate-400 leading-tight">Integridade da Nave: <span className="text-slate-200 block mt-0.5">{currentShip.name}</span></span>
                                        <span className="text-xs font-technical text-emerald-400">{currentShip.currentHullIntegrity?.toLocaleString() || currentShipCalculatedStats.totalHullIntegrity.toLocaleString()} / {currentShipCalculatedStats.totalHullIntegrity.toLocaleString()}</span>
                                      </div>
                                      
                                      {shipIsDamaged && (
                                          <div className="space-y-3 bg-slate-900/60 p-3 rounded-lg">
                                              <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Cálculo de Reparo</p>
                                              <div className="flex justify-between items-center">
                                                <span className="text-[11px] text-slate-300 flex items-center"><div className="w-3 h-3 mr-2 text-sky-400"><Icons.Credits /></div> Créditos</span>
                                                <span className="text-[11px] text-slate-100">{repairCostCredits.toLocaleString()}</span>
                                              </div>
                                              <div className="flex justify-between items-center">
                                                <span className="text-[11px] text-slate-300 flex items-center flex-1">
                                                  {getResourceImagePath(REPAIR_RESOURCE_NAME) && <img src={getResourceImagePath(REPAIR_RESOURCE_NAME)} alt={REPAIR_RESOURCE_NAME} className="w-3 h-3 mr-2" />}
                                                  {REPAIR_RESOURCE_NAME}
                                                </span>
                                                <span className="text-[11px] text-slate-100">{repairCostResourceQty.toLocaleString()}</span>
                                              </div>
                                              <button
                                                  onClick={() => onRepairShipAtColony(planetData.id)}
                                                  className="w-full btn-scifi py-2.5 text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30"
                                                  disabled={appIsLoading || playerState.isTraveling || !canAffordRepair}
                                                  title={!canAffordRepair ? 'Recursos ou créditos insuficientes para reparo.' : `Reparar ${currentShip.name}`}
                                              >
                                                  INICIAR REPARO
                                              </button>
                                          </div>
                                      )}
                                      {!shipIsDamaged && <p className="text-[10px] text-emerald-500 italic text-center p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">Sistemas de casco operando em 100%.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center bg-slate-900/30 rounded-2xl border border-slate-800">
                           <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                             <Icons.Colony />
                           </div>
                           <p className="text-xs text-slate-500 italic px-6">Setor desabitado. Nenhuma assinatura biológica ou mecânica detectada em larga escala.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>

        {isPlayerColony && (
            <div className="mt-10 pt-8 border-t border-sky-500/10">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center mr-4 border border-teal-500/20">
                    <Icons.Colony />
                  </div>
                  <div>
                    <span className="text-[10px] font-technical uppercase text-teal-500 tracking-[0.2em] block mb-0.5">Módulo de Administração</span>
                    <h3 className="text-3xl font-display font-bold text-teal-400 tracking-tight">Gerenciar Colônia</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-teal-500/10 pb-3 mb-2">
                          <h4 className="text-xs font-display font-bold text-teal-300 uppercase tracking-widest">Estruturas Ativas</h4>
                          <span className="text-[10px] font-technical text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase">{planetData.buildings.length} Unidades</span>
                        </div>
                        
                        {planetData.buildings.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-3">
                                {planetData.buildings.map(bInst => {
                                    const bDef = COLONIAL_BUILDING_DEFINITIONS.find(def => def.id === bInst.definitionId);
                                    if (!bDef) return null;

                                    return (
                                        <div key={bInst.instanceId} className="group p-4 bg-slate-900/40 rounded-xl border border-slate-800 hover:border-teal-500/30 transition-all">
                                            <div className="flex items-start">
                                              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mr-4 group-hover:bg-teal-500/10 transition-colors text-teal-400">
                                                {getBuildingIconComponent(bDef.icon)}
                                              </div>
                                              <div className="flex-1">
                                                <h5 className="text-sm font-display font-bold text-slate-200 uppercase tracking-wide">{bDef.name}</h5>
                                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{bDef.description}</p>
                                                {bDef.effectDescription && (
                                                  <div className="mt-3 flex items-center text-[10px] text-teal-400 font-technical">
                                                    <span className="opacity-50 mr-2 uppercase">Protocolo:</span>
                                                    {bDef.effectDescription}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                          <div className="bg-slate-950/40 p-10 rounded-2xl border border-dashed border-slate-800 text-center opacity-60">
                            <p className="text-xs text-slate-500 italic">Central de comando vazia. Inicie a construção de módulos fundamentais.</p>
                          </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-rose-500/10 pb-3 mb-2">
                          <h4 className="text-xs font-display font-bold text-amber-300 uppercase tracking-widest">Projetos de Expansão</h4>
                          <span className="text-[10px] font-technical text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase">Esquemas Disponíveis</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-3">
                            {COLONIAL_BUILDING_DEFINITIONS.filter(bDef => bDef.id !== 'bldg_colony_hub_t1').map(bDef => {
                                const currentCount = planetData.buildings.filter(b => b.definitionId === bDef.id).length;
                                const canBuildMax = bDef.maxPerPlanet ? currentCount < bDef.maxPerPlanet : true;
                                const hasTech = bDef.requiredTech ? playerState.unlockedTechs.includes(bDef.requiredTech) : true;
                                let hasResources = true;
                                let missingResourcesText = "";

                                const creditCost = bDef.cost['Créditos'] || 0;
                                if (playerState.credits < creditCost) {
                                    hasResources = false;
                                    missingResourcesText += `Faltam ${creditCost - playerState.credits} Créditos. `;
                                }
                                for (const resourceName in bDef.cost) {
                                    if (resourceName === 'Créditos') continue;
                                    const required = bDef.cost[resourceName];
                                    if ((playerState.inventory[resourceName] || 0) < required) {
                                        hasResources = false;
                                        missingResourcesText += `Faltam ${required - (playerState.inventory[resourceName] || 0)} ${resourceName}. `;
                                    }
                                }
                                const techNode = bDef.requiredTech ? INITIAL_TECH_TREE.find(t=>t.id === bDef.requiredTech) : null;
                                
                                return (
                                    <div key={bDef.id} className={`p-5 bg-slate-950/60 rounded-2xl border transition-all ${!hasTech ? 'opacity-50 grayscale' : 'hover:border-amber-500/20'} ${canBuildMax && hasTech && hasResources ? 'border-slate-800' : 'border-red-500/10'}`}>
                                        <div className="flex items-start mb-4">
                                          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mr-4 text-amber-500 border border-slate-800 group-hover:border-amber-500/30">
                                            {getBuildingIconComponent(bDef.icon)}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                              <h5 className="text-base font-display font-bold text-slate-100 uppercase tracking-wide">{bDef.name}</h5>
                                              {bDef.maxPerPlanet !== undefined && (
                                                <span className="text-[9px] font-technical text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 uppercase">
                                                  Limite {currentCount}/{bDef.maxPerPlanet}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{bDef.description}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                          <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                                            <span className="text-[9px] text-slate-500 font-technical uppercase block mb-1">Custo Estrutural</span>
                                            <div className="flex flex-wrap gap-2">
                                              {Object.entries(bDef.cost).map(([k,v]) => (
                                                <span key={k} className={`text-[10px] font-technical ${playerState.credits >= (k === 'Créditos' ? v : 0) ? 'text-slate-300' : 'text-rose-400'}`}>
                                                  {k}: {v}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                                            <span className="text-[9px] text-slate-500 font-technical uppercase block mb-1">Tecnologia</span>
                                            <span className={`text-[10px] font-display font-medium ${hasTech ? 'text-emerald-400' : 'text-rose-400'}`}>
                                              {bDef.requiredTech ? (techNode?.name || bDef.requiredTech) : 'Nenhuma'}
                                            </span>
                                          </div>
                                        </div>

                                        <button
                                            onClick={() => onBuildStructure(planetData.id, bDef.id)}
                                            className="w-full btn-scifi py-3 text-xs bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/30 disabled:opacity-30 uppercase tracking-widest"
                                            disabled={appIsLoading || playerState?.isTraveling || !canBuildMax || !hasTech || !hasResources}
                                            title={!canBuildMax ? `Limite atingido.` : !hasTech ? 'Bloqueado por Tecnologia.' : !hasResources ? `Recursos insuficientes.` : 'AUTORIZAR CONSTRUÇÃO'}
                                        >
                                            AUTORIZAR CONSTRUÇÃO
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {isAtWarWithOwningFaction && isNpcColonized && (
             <div className="my-8 p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-200 flex items-center animate-pulse">
                <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mr-5 text-rose-500 border border-rose-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.34c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-display font-bold uppercase tracking-widest mb-1">Interação Bloqueada: Estado de Guerra</h4>
                  <p className="text-xs opacity-70">Você está em conflito direto com {owningFactionDetails?.name || 'esta facção'}. Acesso planetário revogado.</p>
                </div>
            </div>
        )}

        <div className="mt-10 flex flex-col items-center">
          {!planetData.isColonized && (
              <button
                  onClick={() => onColonize(planetData)}
                  className="w-full max-w-xl btn-scifi btn-scifi-primary py-5 text-base tracking-[0.2em]"
                  disabled={appIsLoading || !canPlayerColonizeThisPlanet || (playerState && playerState.credits < COLONIZATION_CREDIT_COST) || playerState?.isTraveling}
                  title={!canPlayerColonizeThisPlanet ? "Requer Módulo de Colonização/Suporte Colonial" : (playerState && playerState.credits < COLONIZATION_CREDIT_COST) ? `Requer ${COLONIZATION_CREDIT_COST} CR` : ""}
              >
                  FUNDAR NOVA COLÔNIA ({COLONIZATION_CREDIT_COST} CR)
              </button>
          )}

          {isNpcColonized && planetData.planetaryStationId && (
            <button
                  onClick={handleInteractWithNpcColony}
                  className={`w-full max-w-xl btn-scifi py-5 text-base tracking-[0.2em] bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/30 hover:text-purple-100 flex items-center justify-center
                              ${isAtWarWithOwningFaction || appIsLoading || playerState?.isTraveling ? 'opacity-30 cursor-not-allowed' : ''}`}
                  disabled={isAtWarWithOwningFaction || appIsLoading || playerState?.isTraveling}
                  title={isAtWarWithOwningFaction ? "Acesso negado devido à guerra" : ""}
              >
                  <div className="w-5 h-5 mr-3"><Icons.Trade /></div> INTERAGIR COM COLÔNIA ESTRANGEIRA
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanetView;

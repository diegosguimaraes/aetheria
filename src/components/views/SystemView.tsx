
import React from 'react';
import { StarSystem, Planet, SpaceStation, PlayerState, DestinationType } from '../../types';
import { Icons } from '../../icons'; // Corrected path
import LoadingSpinner from '../LoadingSpinner';
import { PlanetIllustration } from '../AdventureArt';
import { SCAN_SYSTEM_COST_CREDITS, TRAVEL_BASE_CREDIT_COST, FACTION_COLORS } from '../../constants'; // Corrected path

interface SystemViewProps {
  system: StarSystem | null;
  planetsInSystem: Planet[];
  stationsInSystem: SpaceStation[];
  playerState: PlayerState | null;
  isLoading: boolean;
  onSelectPlanet: (planetId: string) => void;
  onSelectStation: (stationId: string) => void;
  onBackToGalaxy: () => void;
  onScanSystem: (system: StarSystem) => void;
  onTravelToSystem: (destinationId: string, destinationType: DestinationType) => void;
}

const SystemView: React.FC<SystemViewProps> = ({
  system,
  planetsInSystem,
  stationsInSystem,
  playerState,
  isLoading,
  onSelectPlanet,
  onSelectStation,
  onBackToGalaxy,
  onScanSystem,
  onTravelToSystem,
}) => {
  if (isLoading && !system) {
    return <div className="p-4 text-center"><LoadingSpinner message="Carregando dados do sistema..." /></div>;
  }
  if (!system || !playerState) {
    return <div className="p-4 text-center text-gray-400">Sistema não encontrado ou dados do jogador indisponíveis.</div>;
  }

  const isKnown = playerState.knownSystemIds.includes(system.id);
  const systemDisplayName = isKnown ? system.name : "Sistema Desconhecido";
  const factionColorClass = FACTION_COLORS[system.faction] || FACTION_COLORS["Unclaimed"];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-1 md:p-6 h-full">
      <div className="p-4 md:p-8 glass-panel rounded-2xl md:rounded-3xl shadow-xl text-gray-200 min-h-full flex flex-col border-sky-500/10 relative backdrop-blur-xl mb-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

      {/* System Header */}
      <div className="mb-4 md:mb-8 pb-3 md:pb-6 border-b border-slate-700/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-6">
            <div className="space-y-1 md:space-y-4">
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                  <h2 className="text-2xl md:text-5xl font-display font-black text-white italic tracking-tighter uppercase">{systemDisplayName}</h2>
                  {isKnown && (
                    <div className={`px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[7px] md:text-[10px] font-technical uppercase tracking-widest border ${factionColorClass.split(' ')[3].replace('text-', 'border-').replace('text-', 'text-')} bg-slate-900/60`}>
                        {system.faction}
                    </div>
                  )}
                </div>
                {isKnown ? (
                    <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed line-clamp-2 md:line-clamp-none">{system.description}</p>
                ) : (
                    <p className="text-[10px] md:text-sm text-amber-500/80 italic font-technical uppercase tracking-widest glow-text-yellow animate-pulse">Requer escaneamento tático</p>
                )}
            </div>
            <button
                onClick={onBackToGalaxy}
                className="group btn-scifi py-2 md:py-3 px-4 md:px-6 text-[8px] md:text-[10px] uppercase tracking-widest flex items-center bg-slate-900/60 border-slate-700 hover:border-sky-500/50"
            >
                <Icons.Mission className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 transition-transform group-hover:-translate-x-1" />
                RETORNAR
            </button>
        </div>
      </div>

      {/* System Actions */}
      <div className="mb-4 md:mb-8 flex flex-wrap gap-2 md:gap-4 items-center">
        {!isKnown && (
          <button
            onClick={() => onScanSystem(system)}
            className="group btn-scifi-primary py-2 md:py-4 px-4 md:px-8 text-[9px] md:text-xs flex items-center shadow-xl shadow-sky-500/20 disabled:scale-100 disabled:opacity-50"
            disabled={isLoading || playerState.isTraveling || playerState.credits < SCAN_SYSTEM_COST_CREDITS}
          >
            <div className="w-3.5 h-3.5 md:w-5 md:h-5 mr-2 md:mr-3 group-hover:rotate-90 transition-transform duration-500"><Icons.ScanSystem /></div>
            Escanear <span className="ml-1 md:ml-3 opacity-60 font-mono">({SCAN_SYSTEM_COST_CREDITS} CR)</span>
          </button>
        )}
        {playerState.currentSystemId !== system.id && (
          <button
            onClick={() => onTravelToSystem(system.id, 'system')}
            className="group btn-scifi-primary py-2 md:py-4 px-4 md:px-8 text-[9px] md:text-xs flex items-center shadow-xl shadow-teal-500/20 bg-teal-500/20 border-teal-500/40 text-teal-400 hover:bg-teal-500 hover:text-slate-900 disabled:scale-100 disabled:opacity-50"
            disabled={isLoading || playerState.isTraveling || playerState.credits < TRAVEL_BASE_CREDIT_COST}
          >
            <div className="w-3.5 h-3.5 md:w-5 md:h-5 mr-2 md:mr-3 group-hover:translate-x-1 transition-transform"><Icons.Travel /></div>
            Saltar <span className="ml-1 md:ml-3 opacity-60 font-mono">({TRAVEL_BASE_CREDIT_COST} CR)</span>
          </button>
        )}
        {playerState.currentSystemId === system.id && (
            <div className="px-4 py-2 md:px-6 md:py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl md:rounded-2xl flex items-center">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500 mr-2 md:mr-3 animate-pulse"></div>
              <span className="text-[8px] md:text-[10px] font-technical uppercase tracking-widest text-emerald-500">Local Ativo</span>
            </div>
        )}
      </div>

      {/* Celestial Bodies */}
      <h3 className="text-sm font-display font-bold text-white uppercase tracking-[0.3em] mb-6 flex items-center">
        <div className="w-2 h-2 bg-sky-500 mr-3"></div>
        Corpos Celestes Identificados
      </h3>
      
      {isKnown ? (
        (planetsInSystem.length > 0 || stationsInSystem.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {planetsInSystem.map(planet => {
              return (
                <button
                  key={planet.id}
                  onClick={() => onSelectPlanet(planet.id)}
                  className="group relative h-64 bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-sky-500/50 hover:bg-slate-900/60 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center"
                  disabled={playerState.isTraveling || isLoading}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <PlanetIllustration className="w-36 h-36 mb-4 relative z-10 transition-transform duration-500 group-hover:scale-105" biome={planet.biome} ring={/gasoso/i.test(planet.biome)} />
                  
                  <div className="relative z-10">
                    <span className="block text-lg font-display font-black text-white uppercase tracking-tight group-hover:text-sky-400 transition-colors italic">{planet.name}</span>
                    <span className="block text-[8px] font-technical text-slate-500 uppercase tracking-[0.3em] mt-1">{planet.biome}</span>
                  </div>
                  
                  <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <span className="text-[9px] font-technical text-sky-400 uppercase tracking-widest border border-sky-500/30 px-3 py-1 rounded-full bg-sky-500/5">Acessar Órbita</span>
                  </div>
                </button>
              );
            })}
            {stationsInSystem.map(station => {
              return (
                <button
                  key={station.id}
                  onClick={() => onSelectStation(station.id)}
                  className="group relative h-64 bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-purple-500/50 hover:bg-slate-900/60 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center"
                  disabled={playerState.isTraveling || isLoading}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div
                    className="w-32 h-32 rounded-2xl mb-6 relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 bg-cover bg-center shadow-[0_0_30px_rgba(var(--color-purple-500),0.1)] border border-white/5"
                    style={{ backgroundImage: `url(${station.imageUrl})` }}
                  >
                     <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-slate-950/40 to-transparent"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <span className="block text-lg font-display font-black text-white uppercase tracking-tight group-hover:text-purple-400 transition-colors italic">{station.name}</span>
                    <span className="block text-[8px] font-technical text-slate-500 uppercase tracking-[0.3em] mt-1">Estação {station.stationType}</span>
                  </div>

                  <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <span className="text-[9px] font-technical text-purple-400 uppercase tracking-widest border border-purple-500/30 px-3 py-1 rounded-full bg-purple-500/5">Atracar</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-700 bg-slate-950/20 rounded-3xl border-2 border-dashed border-slate-900">
            <Icons.Star className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-xs font-technical uppercase tracking-widest italic leading-relaxed text-center max-w-sm">Este setor parece desabitado. Nenhuma assinatura biológica ou civil detectada.</p>
          </div>
        )
      ) : (
         <div className="flex-grow flex flex-col items-center justify-center text-slate-700 bg-slate-950/40 rounded-3xl border border-slate-900 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]"></div>
            <div className="w-20 h-20 mb-6 opacity-20 border-4 border-slate-800 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="text-sm font-technical uppercase tracking-[0.3em] text-sky-500/60 mb-2">Aguardando Escaneamento</p>
            <p className="text-[10px] font-technical uppercase tracking-widest text-slate-500 max-w-xs text-center leading-relaxed">Inicie a varredura tática para identificar corpos celestes e recursos no sistema local.</p>
         </div>
      )}
    </div>
  </div>
);
};

export default SystemView;

import React, { ReactNode } from 'react';
import { PlayerState, Ship, ShipStats, GameView, GamePhase, StarSystem, Planet, SpaceStation, ColonyEvent, Mission } from '../types';
import AdventureIcon, { AdventureIconName } from './AdventureIcon';
import { ShipIllustration } from './AdventureArt';
import { getMissionProgress } from '../adventure';

interface GameInterfaceProps {
  playerState: PlayerState;
  currentShip: Ship | null;
  currentCargoUsage: number;
  currentShipCalculatedStats: ShipStats;
  currentView: GameView;
  setCurrentView: (view: GameView) => void;
  setGamePhase: (phase: GamePhase) => void;
  gamePhase: GamePhase;
  showNotification: (message: string, duration?: number) => void;
  _starSystems: StarSystem[];
  discoveredPlanets: Planet[];
  discoveredStations: SpaceStation[];
  activeColonyEvents: ColonyEvent[];
  activeMissions: Mission[];
  onOpenMission: (mission: Mission) => void;
  onCompleteMission: (missionId: string) => void;
  onSave: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  children: ReactNode;
}

const navigation: { view: GameView; label: string; icon: AdventureIconName }[] = [
  { view: 'galaxy', label: 'Explorar', icon: 'galaxy' }, { view: 'missions', label: 'Diário de missões', icon: 'missions' },
  { view: 'inventory', label: 'Inventário', icon: 'inventory' }, { view: 'hangar', label: 'Minha nave', icon: 'hangar' },
  { view: 'crafting', label: 'Oficina', icon: 'crafting' }, { view: 'colonies', label: 'Colônias', icon: 'colonies' },
  { view: 'npcs', label: 'Personagens', icon: 'npcs' }, { view: 'diplomacy', label: 'Diplomacia', icon: 'diplomacy' },
  { view: 'policies', label: 'Políticas', icon: 'policies' }, { view: 'profile', label: 'Explorador', icon: 'profile' },
];

export default function GameInterface(props: GameInterfaceProps) {
  const { playerState: player, currentShip: ship, currentShipCalculatedStats: stats, currentView, activeMissions: missions } = props;
  const system = props._starSystems.find(candidate => candidate.id === player.currentSystemId);
  const location = props.discoveredPlanets.find(candidate => candidate.id === player.currentLocation) || props.discoveredStations.find(candidate => candidate.id === player.currentLocation);
  const adventure = missions.filter(mission => mission.category === 'adventure');
  const nextMission = adventure.find(mission => !mission.isCompleted) || missions.find(mission => !mission.isCompleted);
  const completed = adventure.filter(mission => mission.isCompleted).length;
  const progress = nextMission ? getMissionProgress(nextMission, player, props.discoveredPlanets, missions) : null;
  const busy = player.isTraveling || !!player.combatState?.isActive;
  const healthPercent = stats.totalHullIntegrity > 0 ? Math.max(0, Math.min(100, Math.round((ship?.currentHullIntegrity ?? stats.totalHullIntegrity) / stats.totalHullIntegrity * 100))) : 0;
  const shieldPercent = stats.totalShieldStrength > 0 ? Math.max(0, Math.min(100, Math.round((ship?.currentShieldStrength ?? stats.totalShieldStrength) / stats.totalShieldStrength * 100))) : 0;
  const changeView = (view: GameView) => {
    if (busy) { props.showNotification('Aguarde a viagem ou o combate terminar.'); return; }
    props.setCurrentView(view);
    props.setGamePhase(view === 'profile' ? 'profileView' : 'playing');
  };
  return <div className="adventure-shell">
    <aside className="adventure-sidebar">
      <div className="aetheria-brand"><img src="/favicon.svg" alt="" /><span>AETHERIA<small>UM UNIVERSO DE HISTÓRIAS</small></span></div>
      <div className="sidebar-label">SEU UNIVERSO</div>
      <nav aria-label="Navegação do jogo">{navigation.map(item => <button key={item.view} data-testid={`nav-${item.view}`} className={`adventure-nav ${currentView === item.view ? 'active' : ''}`} aria-current={currentView === item.view ? 'page' : undefined} onClick={() => changeView(item.view)} disabled={busy}>
        <span className={`nav-icon nav-icon-${item.icon}`}><AdventureIcon name={item.icon} /></span><span>{item.label}</span>
        {item.view === 'missions' && missions.some(mission => !mission.isCompleted && getMissionProgress(mission, player, props.discoveredPlanets, missions).ready) && <span className="nav-badge">!</span>}
        {item.view === 'colonies' && props.activeColonyEvents.some(event => !event.isResolved) && <span className="nav-badge">!</span>}
      </button>)}</nav>
      <div className="sidebar-footer"><span className="explorer-avatar">{player.characterName.slice(0, 1).toUpperCase()}</span><div><strong>{player.characterName}</strong><small>Explorador da fronteira</small></div><button aria-label="Abrir menu de pausa" onClick={() => props.setGamePhase('paused')} disabled={busy}><AdventureIcon name="menu" /></button></div>
    </aside>
    <section className="adventure-workspace">
      <header className="adventure-topbar"><div className="location-breadcrumb"><span className="status-dot" /><span>{system?.name || 'Espaço desconhecido'}</span><span className="breadcrumb-divider">/</span><strong>{location?.name || 'Em órbita'}</strong></div>
        <div className="resource-pills"><span title="Créditos"><AdventureIcon name="credits" /><strong>{Math.floor(player.credits).toLocaleString('pt-BR')}</strong><small>CR</small></span><span title="Pontos de pesquisa"><AdventureIcon name="research" /><strong>{Math.floor(player.researchPoints)}</strong><small>PC</small></span><button className={`save-indicator ${props.saveStatus}`} onClick={props.onSave} disabled={props.saveStatus === 'saving'} title="Salva esta partida no Netlify, vinculada a este navegador"><AdventureIcon name="save" /><span>{props.saveStatus === 'saving' ? 'Salvando…' : props.saveStatus === 'saved' ? 'Salvo' : props.saveStatus === 'error' ? 'Tentar salvar' : 'Salvar'}</span></button></div>
      </header>
      <div className="adventure-content"><main className="adventure-view">{props.children}</main><aside className="adventure-rail" aria-label="Sua expedição">
        <section className="quest-panel"><div className="rail-heading"><span className="eyebrow">SUA PRIMEIRA EXPEDIÇÃO</span><AdventureIcon name="missions" /></div>
          <div className="quest-chapters">{adventure.map((mission, index) => <span key={mission.id} className={mission.isCompleted ? 'done' : nextMission?.id === mission.id ? 'current' : ''} title={mission.title}>{mission.isCompleted ? <AdventureIcon name="check" /> : String(index + 1).padStart(2, '0')}</span>)}</div>
          {nextMission ? <><span className="quest-kicker">{nextMission.category === 'adventure' ? `CAPÍTULO ${completed + 1} DE ${adventure.length}` : 'CONTRATO DE EXPLORAÇÃO'}</span><h2>{nextMission.title}</h2><p>{nextMission.objective}</p>
            {progress?.ready ? <button className="adventure-button primary" disabled={busy} onClick={() => props.onCompleteMission(nextMission.id)}><AdventureIcon name="check" /> Receber recompensa</button> : <button className="adventure-button secondary" disabled={busy} onClick={() => props.onOpenMission(nextMission)}>Mostrar meu objetivo <AdventureIcon name="arrow" /></button>}
            <div className="quest-reward"><AdventureIcon name="spark" /><span>{nextMission.rewardsString}</span></div>
          </> : <><h2>A fronteira é sua.</h2><p>Primeira expedição concluída! Novas rotas e contratos esperam no diário de missões.</p><button className="adventure-button secondary" disabled={busy} onClick={() => changeView('missions')}>Buscar uma aventura <AdventureIcon name="arrow" /></button></>}
        </section>
        <section className="ship-panel"><div className="rail-heading"><span className="eyebrow">SUA COMPANHEIRA DE VIAGEM</span><AdventureIcon name="hangar" /></div><ShipIllustration className="ship-portrait" /><h3>{ship?.name || 'Sua nave'}</h3><span className="ship-description">Exploradora · pronta para descobrir</span>
          <div className="ship-meter"><span>Integridade <strong>{healthPercent}%</strong></span><meter min="0" max="100" value={healthPercent} aria-label="Integridade da nave" /></div>
          <div className="ship-meter shield"><span>Escudo <strong>{shieldPercent}%</strong></span><meter min="0" max="100" value={shieldPercent} aria-label="Escudo da nave" /></div>
          <div className="ship-cargo"><AdventureIcon name="inventory" /><span>Carga</span><strong>{Math.round(props.currentCargoUsage)} / {stats.totalCargoCapacity}</strong></div>
        </section>
        <section className="explorer-note"><span>UMA DICA DA LIRA</span><p>Visitar é só o começo. Escaneie planetas, siga os sinais e lembre-se de salvar antes de sair.</p><small>Salvamento automático a cada minuto, enquanto você joga. Partidas vinculadas a este navegador.</small></section>
      </aside></div>
    </section>
  </div>;
}

import React, { useState } from 'react';
import { Mission, PlayerState, Planet, SpaceStation } from '../../types';
import AdventureIcon from '../AdventureIcon';
import { getMissionProgress } from '../../adventure';

interface MissionsViewProps {
  activeMissions: Mission[];
  onGenerateMission: (factionContextId?: string, useAI?: boolean) => void;
  onCompleteMission: (missionId: string) => void;
  onOpenMission: (mission: Mission) => void;
  isLoading: boolean;
  playerState: PlayerState | null;
  discoveredPlanets: Planet[];
  discoveredStations: SpaceStation[];
}

export default function MissionsView({ activeMissions: missions, onGenerateMission, onCompleteMission, onOpenMission, isLoading, playerState: player, discoveredPlanets, discoveredStations }: MissionsViewProps) {
  const [tab, setTab] = useState<'active' | 'completed'>('active');
  if (!player) return null;
  const active = missions.filter(mission => !mission.isCompleted);
  const completed = missions.filter(mission => mission.isCompleted);
  const visible = tab === 'active' ? active : completed;
  const busy = isLoading || player.isTraveling || !!player.combatState?.isActive;
  return <div className="mission-page">
    <header className="page-heading"><div><span className="eyebrow">CADA MISSÃO, UM NOVO CAPÍTULO</span><h1>Seu diário de bordo</h1><p>Pequenos passos. Grandes descobertas. Recompensas de verdade.</p></div></header>
    <section className="mission-banner"><AdventureIcon name="missions" /><div><h2>A Liga dos Exploradores precisa de você.</h2><p>Receba um contrato de viagem instantâneo. Sem esperar pela IA.</p></div><button className="adventure-button primary" disabled={busy} onClick={() => onGenerateMission()}>Novo contrato <AdventureIcon name="arrow" /></button></section>
    <div className="mission-toolbar"><div className="segmented-control"><button aria-pressed={tab === 'active'} onClick={() => setTab('active')}>Em andamento <span>{active.length}</span></button><button aria-pressed={tab === 'completed'} onClick={() => setTab('completed')}>Concluídas <span>{completed.length}</span></button></div><button className="text-button" disabled={busy} onClick={() => onGenerateMission(undefined, true)}>{isLoading ? 'Criando história…' : 'Criar história com IA (opcional)'}</button></div>
    <div className="mission-grid">{visible.map(mission => {
      const progress = getMissionProgress(mission, player, discoveredPlanets, missions, discoveredStations);
      return <article className={`mission-card ${mission.isCompleted ? 'completed' : ''} ${progress.locked ? 'locked' : ''}`} key={mission.id}>
        <div className="mission-card-top"><span className={`mission-emblem ${mission.category === 'adventure' ? 'story' : ''}`}><AdventureIcon name={mission.isCompleted ? 'check' : mission.category === 'adventure' ? 'spark' : 'galaxy'} /></span><span className="eyebrow">{mission.category === 'adventure' ? 'PRIMEIRA EXPEDIÇÃO' : 'CONTRATO'}<small>{mission.isCompleted ? 'CONCLUÍDA' : progress.locked ? 'PRÓXIMO CAPÍTULO' : progress.ready ? 'RECOMPENSA DISPONÍVEL' : 'EM ANDAMENTO'}</small></span></div>
        <h2>{mission.title}</h2><p>{mission.description}</p>
        <div className="mission-objective"><AdventureIcon name="scan" /><span>{mission.objective}</span></div>
        <div className="mission-progress"><span>{mission.isCompleted ? 'Objetivo concluído' : progress.locked ? 'Conclua o capítulo anterior' : progress.ready ? 'Pronto para entregar!' : 'Continue sua exploração'}</span><div role="progressbar" aria-label={`Progresso: ${mission.title}`} aria-valuenow={mission.isCompleted ? 100 : progress.percent} aria-valuemin={0} aria-valuemax={100}><i style={{ transform: `scaleX(${mission.isCompleted ? 1 : progress.percent / 100})` }} /></div></div>
        <div className="mission-card-footer"><span className="mission-reward"><AdventureIcon name="credits" />{mission.rewardsString || 'Recompensa especial'}</span>{!mission.isCompleted && <button className={`adventure-button ${progress.ready ? 'primary' : 'secondary'}`} disabled={busy || progress.locked} onClick={() => progress.ready ? onCompleteMission(mission.id) : onOpenMission(mission)}>{progress.ready ? 'Receber recompensa' : progress.locked ? 'Em breve' : 'Ver objetivo'}<AdventureIcon name={progress.ready ? 'check' : 'arrow'} /></button>}</div>
      </article>;
    })}</div>
    {visible.length === 0 && <div className="mission-empty"><AdventureIcon name="galaxy" /><h2>{tab === 'completed' ? 'Sua história está começando.' : 'Um universo de novas possibilidades.'}</h2><p>{tab === 'completed' ? 'Conclua sua primeira missão para registrar uma descoberta aqui.' : 'Receba um contrato e parta para uma nova estrela.'}</p>{tab === 'active' && <button className="adventure-button primary" disabled={busy} onClick={() => onGenerateMission()}>Encontrar uma aventura</button>}</div>}
  </div>;
}

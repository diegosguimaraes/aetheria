import React, { useMemo, useState } from 'react';
import { PlayerState, StarSystem, DestinationType } from '../../types';
import { ANOMALY_SCAN_COST_CREDITS } from '../../constants';
import AdventureIcon from '../AdventureIcon';
import { PlanetIllustration } from '../AdventureArt';

interface GalaxyViewProps {
  playerState: PlayerState | null;
  starSystems: StarSystem[];
  onOpenSystemInfo: (system: StarSystem) => void;
  onScanForAnomalies: () => void;
  isLoading: boolean;
  showNotification: (message: string) => void;
  onTravelToSystem: (destinationId: string, destinationType: DestinationType) => void;
}

export default function GalaxyView({ playerState: player, starSystems: systems, onOpenSystemInfo, onScanForAnomalies, isLoading, onTravelToSystem }: GalaxyViewProps) {
  const [selection, setSelection] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'known' | 'nearby'>('all');
  const [mapMode, setMapMode] = useState(true);
  const current = systems.find(system => system.id === player?.currentSystemId);
  const selected = systems.find(system => system.id === selection) || current;
  const closest = useMemo(() => [...systems].filter(system => system.id !== current?.id).sort((first, second) => {
    const distance = (system: StarSystem) => current ? Math.hypot(system.position.x - current.position.x, system.position.y - current.position.y) : 0;
    return distance(first) - distance(second);
  }).slice(0, 5), [systems, current]);
  const visible = systems.filter(system => (!query || system.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))) &&
    (filter === 'all' || filter === 'known' && player?.knownSystemIds.includes(system.id) || filter === 'nearby' && closest.includes(system)));
  const layout = useMemo(() => {
    const xs = systems.map(system => system.position.x);
    const ys = systems.map(system => system.position.y);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const width = Math.max(...xs) - minX || 1, height = Math.max(...ys) - minY || 1;
    return new Map(systems.map(system => [system.id, { x: 8 + (system.position.x - minX) / width * 84, y: 12 + (system.position.y - minY) / height * 74 }]));
  }, [systems]);
  if (!player || !selected) return <div className="adventure-empty">Preparando seu atlas estelar…</div>;
  const busy = isLoading || player.isTraveling;
  const isCurrent = selected.id === current?.id;
  const isKnown = player.knownSystemIds.includes(selected.id);
  const selectedPosition = layout.get(selected.id), currentPosition = current && layout.get(current.id);
  return <div className="exploration-page">
    <header className="page-heading"><div><span className="eyebrow">O UNIVERSO NÃO VAI SE EXPLORAR SOZINHO</span><h1>Para onde vamos?</h1><p>Escolha uma estrela. Encontre sua próxima história.</p></div><span className="atlas-count"><AdventureIcon name="galaxy" /><strong>{player.knownSystemIds.length}</strong> / {systems.length} sistemas conhecidos</span></header>
    <section className="atlas-panel">
      <div className="atlas-toolbar"><div className="segmented-control" aria-label="Filtrar sistemas">{([{ key: 'all', text: 'Todos' }, { key: 'known', text: 'Conhecidos' }, { key: 'nearby', text: 'Próximos' }] as const).map(item => <button key={item.key} aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>{item.text}</button>)}</div><div className="atlas-tools"><label className="atlas-search"><AdventureIcon name="scan" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar uma estrela…" aria-label="Buscar sistema" /></label><button className="view-toggle" onClick={() => setMapMode(!mapMode)} aria-label={mapMode ? 'Mostrar lista de sistemas' : 'Mostrar mapa de sistemas'} title={mapMode ? 'Ver lista' : 'Ver mapa'}><AdventureIcon name={mapMode ? 'inventory' : 'galaxy'} /></button></div></div>
      {mapMode ? <div className="illustrated-map" aria-label="Mapa interativo da galáxia">
        <div className="map-orbit orbit-one" /><div className="map-orbit orbit-two" /><div className="map-orbit orbit-three" />
        <div className="map-label map-label-top">ATLAS DA FRONTEIRA</div><div className="map-label map-label-bottom">CADA PONTO, UMA POSSIBILIDADE.</div>
        {currentPosition && selectedPosition && !isCurrent && <svg className="map-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={currentPosition.x} y1={currentPosition.y} x2={selectedPosition.x} y2={selectedPosition.y} /></svg>}
        {visible.map((system, index) => {
          const position = layout.get(system.id)!;
          const known = player.knownSystemIds.includes(system.id);
          return <button key={system.id} className={`map-system ${system.id === current?.id ? 'current' : ''} ${system.id === selected.id ? 'selected' : ''} ${known ? 'known' : ''}`} style={{ left: `${position.x}%`, top: `${position.y}%`, '--star-color': ['#f0c996', '#94d4cb', '#c0b3e3', '#e7a8a0'][index % 4] } as React.CSSProperties} aria-label={`${system.name}${system.id === current?.id ? ', você está aqui' : ''}${known ? ', conhecido' : ', não escaneado'}`} aria-pressed={system.id === selected.id} onClick={() => setSelection(system.id)}><span className="star-halo"><span className="star-core" /></span><span className="star-label">{system.name}</span>{system.id === current?.id && <small>VOCÊ ESTÁ AQUI</small>}</button>;
        })}
        {visible.length === 0 && <div className="adventure-empty">Nenhuma estrela encontrada. Tente outro nome ou filtro.</div>}
      </div> : <div className="system-list">{visible.map(system => <button key={system.id} onClick={() => setSelection(system.id)} className={system.id === selected.id ? 'selected' : ''}><AdventureIcon name="galaxy" /><div><strong>{system.name}</strong><span>{system.id === player.currentSystemId ? 'Você está aqui' : player.knownSystemIds.includes(system.id) ? 'Sistema conhecido' : 'Ainda não escaneado'}</span></div><AdventureIcon name="arrow" /></button>)}{visible.length === 0 && <div className="adventure-empty">Nenhum sistema encontrado.</div>}</div>}
      <div className="map-legend"><span><i className="legend-current" /> Sua localização</span><span><i className="legend-known" /> Conhecido</span><span><i /> Não escaneado</span><small>Toque em uma estrela para traçar sua rota</small></div>
    </section>
    <section className="destination-card"><PlanetIllustration className="destination-art" biome={selected.securityLevel === 'lawless' ? 'deserto' : 'continental'} ring={selected.iconType === 'capital'} /><div className="destination-copy"><span className="eyebrow">{isCurrent ? 'SEU PONTO DE PARTIDA' : 'PRÓXIMA PARADA?'}</span><h2>{selected.name}<span className={`security-tag ${selected.securityLevel === 'lawless' || selected.securityLevel === 'low' ? 'danger' : ''}`}>{selected.securityLevel === 'high' ? 'Zona segura' : selected.securityLevel === 'lawless' ? 'Sem patrulha' : selected.securityLevel === 'low' ? 'Risco elevado' : 'Fronteira'}</span></h2><p>{isKnown ? selected.description : 'Uma estrela ainda não escaneada. Viaje até ela para revelar seus planetas e estações.'}</p><div className="destination-facts"><span>{isKnown ? `${selected.planetsInSystem.length} planetas` : 'Mundos desconhecidos'}</span><span>{isKnown ? `${selected.stationsInSystem.length} estações` : 'Rota inexplorada'}</span></div></div><div className="destination-actions"><button className="adventure-button primary" disabled={busy} onClick={() => isCurrent ? onOpenSystemInfo(selected) : onTravelToSystem(selected.id, 'system')}>{isCurrent ? 'Explorar este sistema' : 'Traçar viagem'}<AdventureIcon name="arrow" /></button>{!isCurrent && <button className="text-button" disabled={busy} onClick={() => onOpenSystemInfo(selected)}>Ver detalhes do sistema</button>}</div></section>
    <button className="signal-card" onClick={onScanForAnomalies} disabled={busy || player.credits < ANOMALY_SCAN_COST_CREDITS}><span className="signal-icon"><AdventureIcon name="scan" /></span><div><strong>E se houver algo lá fora?</strong><span>Busque sinais, artefatos e naves esquecidas. Scanner: {ANOMALY_SCAN_COST_CREDITS} CR.</span></div><span className="signal-action">Investigar sinais <AdventureIcon name="arrow" /></span></button>
  </div>;
}

import React from 'react';
import AdventureIcon from '../AdventureIcon';
import { SavedGameMeta } from '../../types';

interface TitleScreenProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  gameVersion: string;
  onOpenSettings: () => void;
  latestSave?: SavedGameMeta;
  onContinue: () => void;
}

export default function TitleScreen({ onNewGame, onLoadGame, onOpenSettings, latestSave, onContinue }: TitleScreenProps) {
  return <main className="landing-screen">
    <img className="landing-art" src="/assets/illustrations/frontier.svg" alt="Planeta verde com anéis, estrelas e uma nave explorando a fronteira espacial" />
    <div className="landing-shade" />
    <header className="landing-header">
      <a href="#" className="aetheria-brand" aria-label="Aetheria, início"><img src="/favicon.svg" alt="" /><span>AETHERIA<small>DESPERTE O INFINITO</small></span></a>
      <button className="quiet-button" onClick={onOpenSettings}><AdventureIcon name="policies" /> Configurações</button>
    </header>
    <section className="landing-copy">
      <span className="eyebrow"><span className="status-dot" /> SEU PRÓXIMO GRANDE PEQUENO UNIVERSO</span>
      <h1>Há um universo<br />de histórias<br /><em>esperando por você.</em></h1>
      <p>Uma nave. Mil possibilidades. Descubra mundos, siga sinais misteriosos e encontre seu lugar entre as estrelas.</p>
      <div className="landing-actions">
        <button className="adventure-button primary" onClick={latestSave ? onContinue : onNewGame}><AdventureIcon name="hangar" />{latestSave ? 'Continuar aventura' : 'Começar minha aventura'}<AdventureIcon name="arrow" /></button>
        {latestSave && <span className="continue-caption">Retomar com {latestSave.characterName}</span>}
        <div className="landing-secondary">{latestSave && <button onClick={onNewGame}>Nova aventura</button>}<button onClick={onLoadGame}><AdventureIcon name="save" /> Minhas partidas</button></div>
      </div>
      <div className="landing-features"><span><AdventureIcon name="galaxy" /> Explore no seu ritmo</span><span><AdventureIcon name="missions" /> Histórias para descobrir</span><span><AdventureIcon name="spark" /> Evolua sua nave</span></div>
    </section>
    <div className="landing-caption"><span className="orbit-stamp"><AdventureIcon name="galaxy" /></span><div><span>DIÁRIO DE BORDO · 001</span><strong>Toda grande jornada começa<br />com uma dose de curiosidade.</strong></div></div>
    <footer className="landing-footer"><span>UMA AVENTURA ESPACIAL NO SEU NAVEGADOR</span><span>Explore. Descubra. Faça história.</span></footer>
  </main>;
}

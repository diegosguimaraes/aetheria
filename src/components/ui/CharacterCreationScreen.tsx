import React from 'react';
import { CHARACTER_ORIGINS } from '../../constants';
import AdventureIcon from '../AdventureIcon';
import { ShipIllustration } from '../AdventureArt';

interface CharacterCreationScreenProps {
  characterName: string;
  onCharacterNameChange: (name: string) => void;
  selectedOriginId: string;
  onOriginChange: (id: string) => void;
  onStartGame: (name: string, originId: string) => void;
  onBack: () => void;
  showError: (message: string) => void;
}

export default function CharacterCreationScreen(props: CharacterCreationScreenProps) {
  const origin = CHARACTER_ORIGINS.find(candidate => candidate.id === props.selectedOriginId);
  const valid = !!props.characterName.trim() && !!origin;
  return <main className="creation-screen"><header className="landing-header"><div className="aetheria-brand"><img src="/favicon.svg" alt="" /><span>AETHERIA<small>DESPERTE O INFINITO</small></span></div><button className="quiet-button" onClick={props.onBack}>Voltar ao início</button></header>
    <div className="creation-layout"><section className="creation-form"><span className="eyebrow">ANTES DE CONTARMOS SUA HISTÓRIA…</span><h1>Quem está<br />no comando?</h1><p>Escolha seu nome e sua origem. O resto da aventura é uma página em branco.</p>
      <form onSubmit={event => { event.preventDefault(); if (valid) props.onStartGame(props.characterName.trim(), props.selectedOriginId); else props.showError('Escolha seu nome e sua origem para começar.'); }}>
        <label htmlFor="characterName">Como podemos chamar você?</label><input id="characterName" autoFocus maxLength={40} value={props.characterName} onChange={event => props.onCharacterNameChange(event.target.value)} placeholder="Seu nome de explorador" autoComplete="nickname" required />
        <label htmlFor="characterOrigin">De onde vem sua história?</label><select id="characterOrigin" value={props.selectedOriginId} onChange={event => props.onOriginChange(event.target.value)}>{CHARACTER_ORIGINS.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select>
        {origin && <div className="origin-card"><strong>{origin.name}</strong><p>{origin.description}</p><div className="origin-perks">{origin.perks.map(perk => <span key={perk.id}><AdventureIcon name="spark" />{perk.name}</span>)}</div></div>}
        <button className="adventure-button primary" disabled={!valid} type="submit">Começar a explorar <AdventureIcon name="arrow" /></button>
      </form>
    </section><aside className="creation-welcome"><span className="eyebrow">SUA PRIMEIRA COMPANHEIRA</span><ShipIllustration className="creation-ship" /><h2>Conheça a Pioneiro Estelar.</h2><p>Não é a maior nave da galáxia. Mas tem tudo o que você precisa para começar uma grande história.</p><div className="welcome-steps"><span><i>01</i> Visite seu primeiro planeta</span><span><i>02</i> Faça uma descoberta</span><span><i>03</i> Vá além do horizonte</span></div><small>A comandante Lira acompanha seus primeiros passos.<br />Você pode explorar e cumprir contratos sem depender da IA.</small></aside></div>
  </main>;
}

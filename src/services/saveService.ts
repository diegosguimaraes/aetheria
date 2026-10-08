import { FullGameState, SavedGameMeta } from '../types';

async function requestSave<T>(slotKey?: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/.netlify/functions/game-saves${slotKey ? `?slotKey=${encodeURIComponent(slotKey)}` : ''}`, {
    ...options, credentials: 'same-origin', signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Não foi possível acessar o salvamento. Tente novamente.');
  return response.json();
}

export const listSavedGames = () => requestSave<SavedGameMeta[]>();
export const loadSavedGame = (slotKey: string) => requestSave<FullGameState>(slotKey);
export const storeSavedGame = (slotKey: string, state: FullGameState, isQuickSave: boolean) => requestSave<SavedGameMeta>(slotKey, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state, isQuickSave }),
});
export const deleteSavedGame = (slotKey: string) => requestSave(slotKey, { method: 'DELETE' });

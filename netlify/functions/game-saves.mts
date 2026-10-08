import { createHash, randomBytes } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { getDatabase } from '../../db/index.js';
import { gameSaves } from '../../db/schema.js';
import type { FullGameState, SavedGameMeta } from '../../src/types.js';

export default async (request: Request) => {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return Response.json({ error: 'Origem inválida.' }, { status: 403 });
  if (!['GET', 'PUT', 'DELETE'].includes(request.method)) return Response.json({ error: 'Método inválido.' }, { status: 405, headers: { Allow: 'GET, PUT, DELETE' } });

  const cookieValue = request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith('aetheria_guest='))?.slice('aetheria_guest='.length);
  const existingSession = cookieValue && /^[a-f0-9]{64}$/.test(cookieValue) ? cookieValue : null;
  const session = existingSession || randomBytes(32).toString('hex');
  const ownerHash = createHash('sha256').update(session).digest('hex');
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  if (!existingSession) headers.set('Set-Cookie', `aetheria_guest=${session}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${url.protocol === 'https:' ? '; Secure' : ''}`);
  const respond = (body: unknown, status = 200) => Response.json(body, { status, headers });
  const slotKey = url.searchParams.get('slotKey');
  if (slotKey && (slotKey.length > 150 || !/^[\w.:-]+$/.test(slotKey))) return respond({ error: 'Slot inválido.' }, 400);
  if (request.method !== 'GET' && !slotKey) return respond({ error: 'Slot obrigatório.' }, 400);

  try {
    const db = getDatabase();
    const ownerCondition = eq(gameSaves.ownerHash, ownerHash);
    if (request.method === 'GET') {
      if (slotKey) {
        const [save] = await db.select({ state: gameSaves.state }).from(gameSaves).where(and(ownerCondition, eq(gameSaves.slotKey, slotKey))).limit(1);
        return save ? respond(save.state) : respond({ error: 'Partida não encontrada.' }, 404);
      }
      const saves = await db.select({ metadata: gameSaves.metadata }).from(gameSaves).where(ownerCondition).orderBy(desc(gameSaves.updatedAt));
      return respond(saves.map(save => save.metadata));
    }
    if (request.method === 'DELETE') {
      await db.delete(gameSaves).where(and(ownerCondition, eq(gameSaves.slotKey, slotKey!)));
      return respond({ deleted: true });
    }
    if (Number(request.headers.get('content-length')) > 2000000) return respond({ error: 'Partida muito grande.' }, 413);
    const body = await request.text();
    if (body.length > 2000000) return respond({ error: 'Partida muito grande.' }, 413);
    let parsed: { state?: FullGameState; isQuickSave?: boolean };
    try { parsed = JSON.parse(body); } catch { return respond({ error: 'Partida inválida.' }, 400); }
    const state = parsed?.state;
    if (!state?.playerState || typeof state.playerState.characterName !== 'string' || !state.playerState.characterName.trim() ||
        state.playerState.characterName.length > 100 || !Array.isArray(state.playerState.ownedShips) ||
        !Array.isArray(state.discoveredPlanets) || !Array.isArray(state.activeMissions) ||
        !Array.isArray(state.discoveredStations) || !Array.isArray(state.encounteredNPCs) || !Array.isArray(state.activeColonyEvents)) {
      return respond({ error: 'Partida inválida.' }, 400);
    }
    const existingSlots = await db.select({ slotKey: gameSaves.slotKey }).from(gameSaves).where(ownerCondition);
    if (existingSlots.length >= 30 && !existingSlots.some(save => save.slotKey === slotKey)) return respond({ error: 'Limite de 30 partidas. Exclua um registro antigo.' }, 409);
    const timestamp = Date.now();
    const metadata: SavedGameMeta = {
      slotKey: slotKey!, timestamp, saveDate: new Date(timestamp).toLocaleString('pt-BR'),
      characterName: state.playerState.characterName,
      currentShipName: state.playerState.ownedShips.find(ship => ship.id === state.playerState.currentShipId)?.name || 'Nave',
      isQuickSave: parsed.isQuickSave === true,
    };
    await db.insert(gameSaves).values({ ownerHash, slotKey: slotKey!, state, metadata }).onConflictDoUpdate({
      target: [gameSaves.ownerHash, gameSaves.slotKey], set: { state, metadata, updatedAt: new Date(timestamp) },
    });
    return respond(metadata);
  } catch {
    return respond({ error: 'Salvamento indisponível. Sua partida continua aberta; tente novamente.' }, 503);
  }
};

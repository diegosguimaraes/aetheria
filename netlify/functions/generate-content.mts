import { GoogleGenAI } from '@google/genai';

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Método não permitido.' }, {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }

  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: 'Origem não permitida.' }, { status: 403 });
  }

  let payload: unknown;
  try {
    const body = await request.text();
    if (body.length > 24000) {
      return Response.json({ error: 'Solicitação muito grande.' }, { status: 413 });
    }
    payload = JSON.parse(body);
  } catch {
    return Response.json({ error: 'Solicitação inválida.' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object' ||
      !('prompt' in payload) || typeof payload.prompt !== 'string' ||
      !payload.prompt.trim() || payload.prompt.length > 20000 ||
      !('expectJson' in payload) || typeof payload.expectJson !== 'boolean') {
    return Response.json({ error: 'Solicitação inválida.' }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: payload.prompt,
      config: {
        responseMimeType: payload.expectJson ? 'application/json' : 'text/plain',
        maxOutputTokens: 4096,
        httpOptions: { timeout: 25000 },
      },
    });

    if (!response.text?.trim()) {
      return Response.json({ error: 'Nenhum conteúdo foi gerado.' }, { status: 502 });
    }

    return Response.json({ content: response.text }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ error: 'Geração de conteúdo indisponível. Tente novamente.' }, {
      status: 503,
    });
  }
};

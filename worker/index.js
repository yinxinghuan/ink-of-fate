const SESSION_ID = '4f8329f2-0988-4e86-861e-f464deddc1c0';

/** Frontend-only session handler used by the AlterU self-hosted deployer. */
export async function handleApi(request) {
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname.endsWith('/api/health')) {
    return Response.json({
      ok: true,
      game: 'ink-of-fate',
      sessionId: SESSION_ID,
      mode: 'frontend-only',
    });
  }
  return new Response('Not Found', { status: 404 });
}

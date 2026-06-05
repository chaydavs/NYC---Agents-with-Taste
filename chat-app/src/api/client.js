// Frontend API client. Consumes the /api/chat SSE stream and the /api/compare JSON.

// Parse a Server-Sent Events stream from fetch, dispatching each event.
async function consumeSSE(response, handlers) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Events are separated by a blank line.
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      const evLine = part.split('\n').find((l) => l.startsWith('event:'));
      const dataLine = part.split('\n').find((l) => l.startsWith('data:'));
      if (!evLine || !dataLine) continue;
      const event = evLine.slice(6).trim();
      let data = {};
      try {
        data = JSON.parse(dataLine.slice(5).trim());
      } catch {
        /* ignore malformed */
      }
      handlers[event]?.(data);
    }
  }
}

export async function streamChat({ payload, onDelta, onResult, onError }) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => '');
      onError?.(detail || `request failed (${res.status})`);
      return;
    }
    await consumeSSE(res, {
      delta: (d) => onDelta?.(d.text || ''),
      result: (d) => onResult?.(d),
      error: (d) => onError?.(d.message || 'agent error'),
      done: () => {},
    });
  } catch (err) {
    onError?.(err?.message || 'network error');
  }
}

export async function compare(payload) {
  const res = await fetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`compare failed (${res.status})`);
  return res.json();
}

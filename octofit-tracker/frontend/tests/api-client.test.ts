import { afterEach, describe, expect, it, vi } from 'vitest';
import { getJson } from '../src/api/client.js';

describe('shared API client errors', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preserves API error details in the thrown error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message: 'Unavailable' }), { status: 503 })));

    await expect(getJson('/api/activities')).rejects.toThrow('Request failed with 503: Unavailable');
  });
});

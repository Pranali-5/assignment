// Lightweight media-core runtime implementation
// - zero-React, zero-DOM, TypeScript-only
let _config = null;
let _consoleEvents = false;
const DEFAULT_PER_PAGE = 15;
const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes
const DEFAULT_MAX_CACHE_ENTRIES = 200;
const cache = new Map();
const inFlight = new Map();
function ensureConfig() {
    if (!_config)
        throw new Error('media-core: not initialized. Call init(config) first.');
    return _config;
}
function buildHeaders(apiKey) {
    return {
        Authorization: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };
}
async function fetchJson(url) {
    const cfg = ensureConfig();
    const key = `fetch:${url}`;
    const now = Date.now();
    // cache lookup
    const ttl = cfg.cacheTTLMs ?? DEFAULT_CACHE_TTL_MS;
    const maxEntries = cfg.maxCacheEntries ?? DEFAULT_MAX_CACHE_ENTRIES;
    const cached = cache.get(key);
    if (cached && now - cached.ts < ttl) {
        return cached.value;
    }
    // dedupe in-flight
    const inflight = inFlight.get(key);
    if (inflight)
        return inflight;
    const p = fetch(url, { headers: buildHeaders(cfg.apiKey) }).then(async (res) => {
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            const err = new Error(`media-core: HTTP ${res.status} ${res.statusText} ${text}`);
            throw err;
        }
        const json = await res.json();
        // insert into cache
        cache.set(key, { ts: Date.now(), value: json });
        // trim cache if needed
        if (cache.size > maxEntries) {
            // simple LRU-ish eviction: remove oldest ts
            let oldestKey = null;
            let oldestTs = Infinity;
            for (const [k, v] of cache.entries()) {
                if (v.ts < oldestTs) {
                    oldestTs = v.ts;
                    oldestKey = k;
                }
            }
            if (oldestKey)
                cache.delete(oldestKey);
        }
        return json;
    }).finally(() => {
        inFlight.delete(key);
    });
    inFlight.set(key, p);
    return p;
}
// Event emitter
const emitter = new Map();
function emit(event, payload) {
    if (_consoleEvents) {
        // safe console
        try {
            // eslint-disable-next-line no-console
            console.log(`[media-core] event: ${event}`, payload);
        }
        catch (e) { }
    }
    const set = emitter.get(event);
    if (set) {
        for (const fn of Array.from(set)) {
            try {
                fn(payload);
            }
            catch (err) {
                // swallow handler errors
                // eslint-disable-next-line no-console
                console.error('[media-core] event handler error', err);
            }
        }
    }
}
export function init(config) {
    _config = { ...config };
    _consoleEvents = !!config.enableConsoleEvents;
}
export async function search(query, opts) {
    const cfg = ensureConfig();
    const page = opts?.page ?? 1;
    const per_page = opts?.per_page ?? cfg.defaultPerPage ?? DEFAULT_PER_PAGE;
    // Determine whether to hit photos or videos endpoint
    const resource = opts?.resource_type ?? 'all';
    const q = encodeURIComponent(query || '');
    if (resource === 'video') {
        const url = `https://api.pexels.com/videos/search?query=${q}&page=${page}&per_page=${per_page}`;
        const json = await fetchJson(url);
        return json;
    }
    // photo or all -> call photo endpoint
    const url = `https://api.pexels.com/v1/search?query=${q}&page=${page}&per_page=${per_page}`;
    const json = await fetchJson(url);
    return json;
}
export async function curated(opts) {
    const cfg = ensureConfig();
    const page = opts?.page ?? 1;
    const per_page = opts?.per_page ?? cfg.defaultPerPage ?? DEFAULT_PER_PAGE;
    const url = `https://api.pexels.com/v1/curated?page=${page}&per_page=${per_page}`;
    const json = await fetchJson(url);
    return json;
}
export async function getById(id, opts) {
    const cfg = ensureConfig();
    if (opts.resource_type === 'video') {
        // pexels single video endpoint
        const url = `https://api.pexels.com/videos/videos/${id}`;
        const json = await fetchJson(url);
        const video = (json && json.video) ? json.video : json;
        // emit a view event
        try {
            emit('view', { id, resource_type: 'video', url: video?.url || '', source: 'detail' });
        }
        catch { }
        return video;
    }
    // default to photo
    const url = `https://api.pexels.com/v1/photos/${id}`;
    const photo = await fetchJson(url);
    try {
        emit('view', { id, resource_type: 'photo', url: photo?.src?.original || '', source: 'detail' });
    }
    catch { }
    return photo;
}
export function on(event, listener) {
    let set = emitter.get(event);
    if (!set) {
        set = new Set();
        emitter.set(event, set);
    }
    set.add(listener);
}
export function off(event, listener) {
    const set = emitter.get(event);
    if (set)
        set.delete(listener);
}
export function subscribe(event, listener) {
    on(event, listener);
}
export function unsubscribe(event, listener) {
    off(event, listener);
}
export function enableConsoleEvents() {
    _consoleEvents = true;
}
export function disableConsoleEvents() {
    _consoleEvents = false;
}
export function clearCache() {
    cache.clear();
}
export default {
    init,
    search,
    curated,
    getById,
    on,
    off,
    subscribe,
    unsubscribe,
    enableConsoleEvents,
    disableConsoleEvents,
    clearCache,
};
//# sourceMappingURL=index.js.map
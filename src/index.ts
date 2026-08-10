// Lightweight media-core runtime implementation
// - zero-React, zero-DOM, TypeScript-only

let _config: MediaCoreConfig | null = null;
let _consoleEvents = false;

const DEFAULT_PER_PAGE = 15;
const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes
const DEFAULT_MAX_CACHE_ENTRIES = 200;

const cache = new Map<string, { ts: number; value: any }>();
const inFlight = new Map<string, Promise<any>>();

function ensureConfig(): NonNullable<MediaCoreConfig> {
  if (!_config) throw new Error('media-core: not initialized. Call init(config) first.');
  return _config;
}

function buildHeaders(apiKey: string) {
  return {
    Authorization: apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function fetchJson(url: string): Promise<any> {
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
  if (inflight) return inflight;

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
      let oldestKey: string | null = null;
      let oldestTs = Infinity;
      for (const [k, v] of cache.entries()) {
        if (v.ts < oldestTs) {
          oldestTs = v.ts;
          oldestKey = k;
        }
      }
      if (oldestKey) cache.delete(oldestKey);
    }
    return json;
  }).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, p);
  return p;
}

// Event emitter
const emitter = new Map<MediaCoreEventName, Set<Function>>();

type AnyHandler = (payload: any) => void;

function emit<E extends MediaCoreEventName>(event: E, payload: MediaCoreEventPayloads[E]) {
  if (_consoleEvents) {
    // safe console
    try {
      // eslint-disable-next-line no-console
      console.log(`[media-core] event: ${event}`, payload);
    } catch (e) {}
  }
  const set = emitter.get(event) as Set<AnyHandler> | undefined;
  if (set) {
    for (const fn of Array.from(set)) {
      try {
        fn(payload);
      } catch (err) {
        // swallow handler errors
        // eslint-disable-next-line no-console
        console.error('[media-core] event handler error', err);
      }
    }
  }
}

export type ResourceType = 'photo' | 'video';
export type SearchResourceType = ResourceType | 'all';

export interface MediaCoreConfig {
  apiKey: string;
  defaultPerPage?: number;
  enableConsoleEvents?: boolean;
  cacheTTLMs?: number;
  maxCacheEntries?: number;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
}

export interface PhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PhotoSrc;
  liked: boolean;
  alt: string;
}

export interface PexelsVideoUser {
  id: number;
  name: string;
  url: string;
}

export interface PexelsVideoFile {
  id: number;
  quality: 'sd' | 'hd' | 'hls' | string;
  file_type: string;
  width: number;
  height: number;
  fps?: number;
  link: string;
}

export interface PexelsVideoPicture {
  id: number;
  nr: number;
  picture: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string;
  user: PexelsVideoUser;
  video_files: PexelsVideoFile[];
  video_pictures: PexelsVideoPicture[];
}

export interface PhotoSearchResponse extends PaginationMeta {
  photos: PexelsPhoto[];
}

export interface VideoSearchResponse extends PaginationMeta {
  videos: PexelsVideo[];
}

export interface MixedSearchResponse extends PaginationMeta {
  photos?: PexelsPhoto[];
  videos?: PexelsVideo[];
}

export type SearchResponse =
  | PhotoSearchResponse
  | VideoSearchResponse
  | MixedSearchResponse;

export interface SearchOptions {
  page?: number;
  per_page?: number;
  locale?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  size?: 'small' | 'medium' | 'large' | 'original';
  color?: string;
  resource_type?: SearchResourceType;
  min_width?: number;
  min_height?: number;
  min_duration?: number;
  max_duration?: number;
}

export interface CuratedOptions {
  page?: number;
  per_page?: number;
  locale?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  size?: 'small' | 'medium' | 'large' | 'original';
}

export interface GetByIdOptions {
  resource_type: ResourceType;
}

export type MediaCoreEventName = 'download' | 'view';

export interface MediaCoreEventPayloads {
  download: {
    id: number;
    resource_type: ResourceType;
    url: string;
    source: 'search' | 'curated' | 'detail';
  };
  view: {
    id: number;
    resource_type: ResourceType;
    url: string;
    source: 'search' | 'curated' | 'detail';
  };
}

export type MediaCoreEventHandler<E extends MediaCoreEventName> = (
  payload: MediaCoreEventPayloads[E],
) => void;

export interface MediaCoreEmitter {
  on<E extends MediaCoreEventName>(
    event: E,
    listener: MediaCoreEventHandler<E>,
  ): void;
  off<E extends MediaCoreEventName>(
    event: E,
    listener: MediaCoreEventHandler<E>,
  ): void;
  subscribe<E extends MediaCoreEventName>(
    event: E,
    listener: MediaCoreEventHandler<E>,
  ): void;
  unsubscribe<E extends MediaCoreEventName>(
    event: E,
    listener: MediaCoreEventHandler<E>,
  ): void;
  enableConsoleEvents(): void;
  disableConsoleEvents(): void;
}

export interface MediaCoreClient {
  init(config: MediaCoreConfig): void;
  search(query: string, opts?: SearchOptions): Promise<SearchResponse>;
  curated(opts?: CuratedOptions): Promise<PhotoSearchResponse>;
  getById(id: number, opts: GetByIdOptions): Promise<PexelsPhoto | PexelsVideo>;
  on<E extends MediaCoreEventName>(
    event: E,
    listener: MediaCoreEventHandler<E>,
  ): void;
  off<E extends MediaCoreEventName>(
    event: E,
    listener: MediaCoreEventHandler<E>,
  ): void;
  subscribe<E extends MediaCoreEventName>(
    event: E,
    listener: MediaCoreEventHandler<E>,
  ): void;
  unsubscribe<E extends MediaCoreEventName>(
    event: E,
    listener: MediaCoreEventHandler<E>,
  ): void;
  enableConsoleEvents(): void;
  disableConsoleEvents(): void;
  clearCache(): void;
}

export function init(config: MediaCoreConfig): void {
  _config = { ...config };
  _consoleEvents = !!config.enableConsoleEvents;
}

export async function search(
  query: string,
  opts?: SearchOptions,
): Promise<SearchResponse> {
  const cfg = ensureConfig();
  const page = opts?.page ?? 1;
  const per_page = opts?.per_page ?? cfg.defaultPerPage ?? DEFAULT_PER_PAGE;

  // Determine whether to hit photos or videos endpoint
  const resource = opts?.resource_type ?? 'all';
  const q = encodeURIComponent(query || '');

  if (resource === 'video') {
    const url = `https://api.pexels.com/videos/search?query=${q}&page=${page}&per_page=${per_page}`;
    const json = await fetchJson(url) as VideoSearchResponse;
    return json;
  }

  // photo or all -> call photo endpoint
  const url = `https://api.pexels.com/v1/search?query=${q}&page=${page}&per_page=${per_page}`;
  const json = await fetchJson(url) as PhotoSearchResponse;
  return json;
}

export async function curated(opts?: CuratedOptions): Promise<PhotoSearchResponse> {
  const cfg = ensureConfig();
  const page = opts?.page ?? 1;
  const per_page = opts?.per_page ?? cfg.defaultPerPage ?? DEFAULT_PER_PAGE;
  const url = `https://api.pexels.com/v1/curated?page=${page}&per_page=${per_page}`;
  const json = await fetchJson(url) as PhotoSearchResponse;
  return json;
}

export async function getById(
  id: number,
  opts: GetByIdOptions,
): Promise<PexelsPhoto | PexelsVideo> {
  const cfg = ensureConfig();
  if (opts.resource_type === 'video') {
    // pexels single video endpoint
    const url = `https://api.pexels.com/videos/videos/${id}`;
    const json = await fetchJson(url) as { video: PexelsVideo };
    const video = (json && json.video) ? json.video : (json as unknown as PexelsVideo);
    // emit a view event
    try { emit('view', { id, resource_type: 'video', url: video?.url || '', source: 'detail' }); } catch {}
    return video as PexelsVideo;
  }
  // default to photo
  const url = `https://api.pexels.com/v1/photos/${id}`;
  const photo = await fetchJson(url) as PexelsPhoto;
  try { emit('view', { id, resource_type: 'photo', url: (photo as PexelsPhoto)?.src?.original || '', source: 'detail' }); } catch {}
  return photo;
}

export function on<E extends MediaCoreEventName>(
  event: E,
  listener: MediaCoreEventHandler<E>,
): void {
  let set = emitter.get(event);
  if (!set) {
    set = new Set();
    emitter.set(event, set);
  }
  set.add(listener as AnyHandler);
}

export function off<E extends MediaCoreEventName>(
  event: E,
  listener: MediaCoreEventHandler<E>,
): void {
  const set = emitter.get(event);
  if (set) set.delete(listener as AnyHandler);
}

export function subscribe<E extends MediaCoreEventName>(
  event: E,
  listener: MediaCoreEventHandler<E>,
): void {
  on(event, listener);
}

export function unsubscribe<E extends MediaCoreEventName>(
  event: E,
  listener: MediaCoreEventHandler<E>,
): void {
  off(event, listener);
}

export function enableConsoleEvents(): void {
  _consoleEvents = true;
}

export function disableConsoleEvents(): void {
  _consoleEvents = false;
}

export function clearCache(): void {
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

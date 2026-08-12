import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import * as core from '@media-sdk/media-core';
import type {
  CuratedOptions,
  GetByIdOptions,
  MediaCoreClient,
  MediaCoreConfig,
  MediaCoreEventHandler,
  MediaCoreEventName,
  PhotoSearchResponse,
  PexelsPhoto,
  PexelsVideo,
  SearchOptions,
  SearchResponse,
} from '@media-sdk/media-core';

export interface MediaReactProviderProps {
  config: MediaCoreConfig;
  children: ReactNode;
  enableConsoleEvents?: boolean;
  cacheTTLMs?: number;
  maxCacheEntries?: number;
}

const ClientContext = createContext<{ client: MediaCoreClient } | null>(null);

export function MediaReactProvider({ config, children, enableConsoleEvents }: MediaReactProviderProps): ReactElement {
  const cfg = useMemo(() => ({ ...config }), [config]);
  const initializedRef = useRef(false);

  if (!cfg?.apiKey) throw new Error('MediaReactProvider: config.apiKey required');

  if (!initializedRef.current) {
    core.init(cfg as MediaCoreConfig);
    initializedRef.current = true;
  }

  useEffect(() => {
    if (enableConsoleEvents) {
      core.enableConsoleEvents();
    }
    return () => {
      core.disableConsoleEvents();
    };
  }, [enableConsoleEvents]);

  const value = useMemo(() => ({ client: (core as unknown) as MediaCoreClient }), []);
  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export interface MediaClientContextValue {
  client: MediaCoreClient;
}

export interface UseMediaClientReturn {
  client: MediaCoreClient;
}

export function useMediaClient(): UseMediaClientReturn {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useMediaClient must be used inside MediaReactProvider');
  return { client: ctx.client };
}

export interface MediaSearchState {
  query: string;
  options: SearchOptions;
  page: number;
  per_page: number;
  data: SearchResponse | null;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
}

export interface MediaSearchControls {
  search(query: string, options?: SearchOptions): Promise<void>;
  loadPage(page: number): Promise<void>;
  loadMore(): Promise<void>;
  setOptions(options: SearchOptions): void;
  refresh(): Promise<void>;
}

export interface UseMediaSearchReturn {
  state: MediaSearchState;
  controls: MediaSearchControls;
}

export interface UseMediaSearchOptions {
  initialQuery?: string;
  initialOptions?: SearchOptions;
  initialPage?: number;
  initialPerPage?: number;
}

export function useMediaSearch(options?: UseMediaSearchOptions): UseMediaSearchReturn {
  const { client } = useMediaClient();
  const [state, setState] = useState<MediaSearchState>({
    query: options?.initialQuery ?? '',
    options: options?.initialOptions ?? {},
    page: options?.initialPage ?? 1,
    per_page: options?.initialPerPage ?? 15,
    data: null,
    isLoading: false,
    error: null,
    hasMore: false,
  });

  const latest = useRef({ query: state.query, options: state.options, page: state.page });

  async function doSearch(q: string, opts?: SearchOptions, page = 1) {
    const normalizedQuery = (q ?? '').trim();
    const effectiveQuery = normalizedQuery || latest.current.query || 'nature';

    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await client.search(effectiveQuery, { ...opts, page });
      setState((s) => ({
        ...s,
        query: effectiveQuery,
        options: opts ?? s.options,
        page,
        data: res,
        isLoading: false,
        error: null,
        hasMore: (res as any).next_page ? true : false,
      }));
      latest.current = { query: effectiveQuery, options: opts ?? latest.current.options, page };
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false, error: err }));
    }
  }

  useEffect(() => {
    // initial fetch if initialQuery provided
    if (options?.initialQuery) {
      doSearch(options.initialQuery, options?.initialOptions, options.initialPage ?? 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const controls: MediaSearchControls = {
    async search(q: string, opts?: SearchOptions) {
      const nextQuery = (q ?? '').trim() || 'nature';
      latest.current = { query: nextQuery, options: opts ?? {}, page: 1 };
      await doSearch(nextQuery, opts, 1);
    },
    async loadPage(page: number) {
      const q = latest.current.query || 'nature';
      const opts = latest.current.options;
      await doSearch(q, opts, page);
    },
    async loadMore() {
      const next = state.page + 1;
      await controls.loadPage(next);
    },
    setOptions(opts: SearchOptions) {
      latest.current.options = opts;
      setState((s) => ({ ...s, options: opts }));
    },
    async refresh() {
      await doSearch(latest.current.query, latest.current.options, latest.current.page);
    },
  };

  return { state, controls };
}

export interface MediaCuratedState {
  options: CuratedOptions;
  page: number;
  per_page: number;
  data: PhotoSearchResponse | null;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
}

export interface MediaCuratedControls {
  loadPage(page: number): Promise<void>;
  loadMore(): Promise<void>;
  setOptions(options: CuratedOptions): void;
  refresh(): Promise<void>;
}

export interface UseMediaCuratedReturn {
  state: MediaCuratedState;
  controls: MediaCuratedControls;
}

export interface UseMediaCuratedOptions {
  initialOptions?: CuratedOptions;
  initialPage?: number;
  initialPerPage?: number;
}

export function useMediaCurated(options?: UseMediaCuratedOptions): UseMediaCuratedReturn {
  const { client } = useMediaClient();
  const [state, setState] = useState<MediaCuratedState>({
    options: options?.initialOptions ?? {},
    page: options?.initialPage ?? 1,
    per_page: options?.initialPerPage ?? 15,
    data: null,
    isLoading: false,
    error: null,
    hasMore: false,
  });

  async function loadPage(page: number) {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await client.curated({ ...state.options, page });
      setState((s) => ({ ...s, page, data: res, isLoading: false, hasMore: !!res.next_page }));
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false, error: err }));
    }
  }

  useEffect(() => {
    // initial load
    loadPage(state.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const controls: MediaCuratedControls = {
    async loadPage(page: number) {
      await loadPage(page);
    },
    async loadMore() {
      await loadPage(state.page + 1);
    },
    setOptions(opts: CuratedOptions) {
      setState((s) => ({ ...s, options: opts }));
    },
    async refresh() {
      await loadPage(state.page);
    },
  };

  return { state, controls };
}

export interface MediaItemState<TItem> {
  item: TItem | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseMediaItemReturn<TItem> {
  state: MediaItemState<TItem>;
  fetchItem(id: number, opts: GetByIdOptions): Promise<void>;
}

export function useMediaItem(id: number | null, opts: GetByIdOptions): UseMediaItemReturn<PexelsPhoto | PexelsVideo> {
  const { client } = useMediaClient();
  const [state, setState] = useState<MediaItemState<PexelsPhoto | PexelsVideo>>({ item: null, isLoading: false, error: null });

  async function fetchItem(idToFetch: number, options: GetByIdOptions) {
    setState({ item: null, isLoading: true, error: null });
    try {
      const item = await client.getById(idToFetch, options);
      setState({ item, isLoading: false, error: null });
    } catch (err: any) {
      setState({ item: null, isLoading: false, error: err });
    }
  }

  useEffect(() => {
    if (id != null) {
      void fetchItem(id, opts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { state, fetchItem };
}

export interface UseMediaEventsReturn {
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
  isConsoleEventsEnabled: boolean;
}

export function useMediaEvents(): UseMediaEventsReturn {
  const [enabled, setEnabled] = useState(false);

  function on<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>) {
    core.on(event, listener);
  }
  function off<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>) {
    core.off(event, listener);
  }
  function subscribe<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>) {
    core.subscribe(event, listener);
  }
  function unsubscribe<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>) {
    core.unsubscribe(event, listener);
  }
  function enableConsoleEvents() {
    core.enableConsoleEvents();
    setEnabled(true);
  }
  function disableConsoleEvents() {
    core.disableConsoleEvents();
    setEnabled(false);
  }

  return { on, off, subscribe, unsubscribe, enableConsoleEvents, disableConsoleEvents, isConsoleEventsEnabled: enabled };
}

export type MediaSearchHookShape = typeof useMediaSearch;
export type MediaCuratedHookShape = typeof useMediaCurated;
export type MediaItemHookShape = typeof useMediaItem;
export type MediaEventsHookShape = typeof useMediaEvents;

export default {
  MediaReactProvider,
  useMediaClient,
  useMediaSearch,
  useMediaCurated,
  useMediaItem,
  useMediaEvents,
};

import type { ReactElement, ReactNode } from 'react';
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
} from './index';

export interface MediaReactProviderProps {
  config: MediaCoreConfig;
  children: ReactNode;
  enableConsoleEvents?: boolean;
  cacheTTLMs?: number;
  maxCacheEntries?: number;
}

export function MediaReactProvider(
  props: MediaReactProviderProps,
): ReactElement {
  throw new Error('media-react API design only');
}

export interface MediaClientContextValue {
  client: MediaCoreClient;
}

export interface UseMediaClientReturn {
  client: MediaCoreClient;
}

export function useMediaClient(): UseMediaClientReturn {
  throw new Error('media-react API design only');
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

export function useMediaSearch(
  options?: UseMediaSearchOptions,
): UseMediaSearchReturn {
  throw new Error('media-react API design only');
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

export function useMediaCurated(
  options?: UseMediaCuratedOptions,
): UseMediaCuratedReturn {
  throw new Error('media-react API design only');
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

export function useMediaItem(
  id: number | null,
  opts: GetByIdOptions,
): UseMediaItemReturn<PexelsPhoto | PexelsVideo> {
  throw new Error('media-react API design only');
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
  throw new Error('media-react API design only');
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

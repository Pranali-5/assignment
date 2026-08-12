export type {
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

export { init, search, curated, getById, on, off, subscribe, unsubscribe, enableConsoleEvents, disableConsoleEvents, clearCache } from '@media-sdk/media-core';

export const MediaReactProvider = () => null;
export const useMediaClient = () => ({ client: {} as any });
export const useMediaSearch = () => ({ state: { data: null, isLoading: false, error: null, hasMore: false, query: '', options: {}, page: 1, per_page: 15 }, controls: { search: async () => { }, loadPage: async () => { }, loadMore: async () => { }, setOptions: () => { }, refresh: async () => { } } });
export const useMediaCurated = () => ({ state: { data: null, isLoading: false, error: null, hasMore: false, options: {}, page: 1, per_page: 15 }, controls: { loadPage: async () => { }, loadMore: async () => { }, setOptions: () => { }, refresh: async () => { } } });
export const useMediaItem = () => ({ state: { item: null, isLoading: false, error: null }, fetchItem: async () => { } });
export const useMediaEvents = () => ({ on: () => { }, off: () => { }, subscribe: () => { }, unsubscribe: () => { }, enableConsoleEvents: () => { }, disableConsoleEvents: () => { }, isConsoleEventsEnabled: false });

export default {
  MediaReactProvider,
  useMediaClient,
  useMediaSearch,
  useMediaCurated,
  useMediaItem,
  useMediaEvents,
};

// This package is intended to remain zero-React/DOM/RN and zero runtime imports
// beyond plain TypeScript and any minimal network helpers the implementation may use.

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
  throw new Error('media-core API design only');
}

export function search(
  query: string,
  opts?: SearchOptions,
): Promise<SearchResponse> {
  throw new Error('media-core API design only');
}

export function curated(opts?: CuratedOptions): Promise<PhotoSearchResponse> {
  throw new Error('media-core API design only');
}

export function getById(
  id: number,
  opts: GetByIdOptions,
): Promise<PexelsPhoto | PexelsVideo> {
  throw new Error('media-core API design only');
}

export function on<E extends MediaCoreEventName>(
  event: E,
  listener: MediaCoreEventHandler<E>,
): void {
  throw new Error('media-core API design only');
}

export function off<E extends MediaCoreEventName>(
  event: E,
  listener: MediaCoreEventHandler<E>,
): void {
  throw new Error('media-core API design only');
}

export function subscribe<E extends MediaCoreEventName>(
  event: E,
  listener: MediaCoreEventHandler<E>,
): void {
  throw new Error('media-core API design only');
}

export function unsubscribe<E extends MediaCoreEventName>(
  event: E,
  listener: MediaCoreEventHandler<E>,
): void {
  throw new Error('media-core API design only');
}

export function enableConsoleEvents(): void {
  throw new Error('media-core API design only');
}

export function disableConsoleEvents(): void {
  throw new Error('media-core API design only');
}

export function clearCache(): void {
  throw new Error('media-core API design only');
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

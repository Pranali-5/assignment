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
export type SearchResponse = PhotoSearchResponse | VideoSearchResponse | MixedSearchResponse;
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
export type MediaCoreEventHandler<E extends MediaCoreEventName> = (payload: MediaCoreEventPayloads[E]) => void;
export interface MediaCoreEmitter {
    on<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
    off<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
    subscribe<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
    unsubscribe<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
    enableConsoleEvents(): void;
    disableConsoleEvents(): void;
}
export interface MediaCoreClient {
    init(config: MediaCoreConfig): void;
    search(query: string, opts?: SearchOptions): Promise<SearchResponse>;
    curated(opts?: CuratedOptions): Promise<PhotoSearchResponse>;
    getById(id: number, opts: GetByIdOptions): Promise<PexelsPhoto | PexelsVideo>;
    on<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
    off<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
    subscribe<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
    unsubscribe<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
    enableConsoleEvents(): void;
    disableConsoleEvents(): void;
    clearCache(): void;
}
export declare function init(config: MediaCoreConfig): void;
export declare function search(query: string, opts?: SearchOptions): Promise<SearchResponse>;
export declare function curated(opts?: CuratedOptions): Promise<PhotoSearchResponse>;
export declare function getById(id: number, opts: GetByIdOptions): Promise<PexelsPhoto | PexelsVideo>;
export declare function on<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
export declare function off<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
export declare function subscribe<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
export declare function unsubscribe<E extends MediaCoreEventName>(event: E, listener: MediaCoreEventHandler<E>): void;
export declare function enableConsoleEvents(): void;
export declare function disableConsoleEvents(): void;
export declare function clearCache(): void;
declare const _default: {
    init: typeof init;
    search: typeof search;
    curated: typeof curated;
    getById: typeof getById;
    on: typeof on;
    off: typeof off;
    subscribe: typeof subscribe;
    unsubscribe: typeof unsubscribe;
    enableConsoleEvents: typeof enableConsoleEvents;
    disableConsoleEvents: typeof disableConsoleEvents;
    clearCache: typeof clearCache;
};
export default _default;
//# sourceMappingURL=index.d.ts.map
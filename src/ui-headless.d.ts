import type { RefCallback } from 'react';
export type HeadlessPropGetter<P extends object = {}> = (props?: P) => P & Record<string, unknown>;
export interface UseGridOptions<TItem> {
    items: TItem[];
    itemToKey?: (item: TItem, index: number) => string | number;
    defaultHighlightedIndex?: number;
    defaultSelectedIndex?: number;
    loopNavigation?: boolean;
    orientation?: 'horizontal' | 'vertical';
    selectionMode?: 'single' | 'none';
    onHighlightedIndexChange?: (index: number | null) => void;
    onSelect?: (item: TItem, index: number) => void;
}
export interface GridState {
    highlightedIndex: number | null;
    selectedIndex: number | null;
    isFocused: boolean;
    isKeyboardNavigating: boolean;
    itemCount: number;
}
export interface UseGridReturn<TItem> {
    state: GridState;
    getRootProps: HeadlessPropGetter<{
        role?: string;
        tabIndex?: number;
        'aria-label'?: string;
        onKeyDown?: (event: KeyboardEvent) => void;
        onFocus?: () => void;
        onBlur?: () => void;
    }>;
    getItemProps: HeadlessPropGetter<{
        index: number;
        item: TItem;
        ref?: RefCallback<HTMLElement>;
        role?: string;
        tabIndex?: number;
        'aria-selected'?: boolean;
        'data-index'?: number;
        onClick?: () => void;
        onMouseEnter?: () => void;
    }>;
    getItemWrapperProps: HeadlessPropGetter<{
        index: number;
        item: TItem;
        role?: string;
        'data-index'?: number;
    }>;
}
export interface LightboxOptions<TItem> {
    items: TItem[];
    itemToKey?: (item: TItem, index: number) => string | number;
    defaultIndex?: number;
    isOpen?: boolean;
    closeOnEscape?: boolean;
    trapFocus?: boolean;
    loop?: boolean;
    onOpen?: (index: number) => void;
    onClose?: () => void;
    onIndexChange?: (index: number) => void;
}
export interface LightboxState {
    isOpen: boolean;
    currentIndex: number;
    isAnimating: boolean;
    isPointerActive: boolean;
}
export interface UseLightboxReturn<TItem> {
    state: LightboxState;
    getRootProps: HeadlessPropGetter<{
        role?: string;
        'aria-modal'?: boolean;
        tabIndex?: number;
        onKeyDown?: (event: KeyboardEvent) => void;
        onClick?: () => void;
    }>;
    getTriggerProps: HeadlessPropGetter<{
        index?: number;
        item?: TItem;
        onClick?: () => void;
        'aria-haspopup'?: string;
        'aria-controls'?: string;
    }>;
    getBackdropProps: HeadlessPropGetter<{
        role?: string;
        onClick?: () => void;
        tabIndex?: number;
    }>;
    getViewportProps: HeadlessPropGetter<{
        role?: string;
        tabIndex?: number;
        onKeyDown?: (event: KeyboardEvent) => void;
        onWheel?: (event: WheelEvent) => void;
    }>;
    getSlideProps: HeadlessPropGetter<{
        index: number;
        item: TItem;
        ref?: RefCallback<HTMLElement>;
        role?: string;
        tabIndex?: number;
        'aria-hidden'?: boolean;
        'data-index'?: number;
    }>;
    getPrevButtonProps: HeadlessPropGetter<{
        onClick?: () => void;
        'aria-label'?: string;
        disabled?: boolean;
    }>;
    getNextButtonProps: HeadlessPropGetter<{
        onClick?: () => void;
        'aria-label'?: string;
        disabled?: boolean;
    }>;
    getCloseButtonProps: HeadlessPropGetter<{
        onClick?: () => void;
        'aria-label'?: string;
    }>;
}
export interface ReelSwiperOptions<TItem> {
    items: TItem[];
    itemToKey?: (item: TItem, index: number) => string | number;
    defaultIndex?: number;
    loop?: boolean;
    snapAlignment?: 'start' | 'center' | 'end';
    snap?: boolean;
    onIndexChange?: (index: number) => void;
    onVisibleRangeChange?: (range: {
        start: number;
        end: number;
    }) => void;
    useIntersectionObserver?: boolean;
}
export interface ReelSwiperState {
    currentIndex: number;
    isDragging: boolean;
    isKeyboardNavigating: boolean;
    visibleRange: {
        start: number;
        end: number;
    };
}
export interface UseReelSwiperReturn<TItem> {
    state: ReelSwiperState;
    getRootProps: HeadlessPropGetter<{
        role?: string;
        tabIndex?: number;
        onWheel?: (event: WheelEvent) => void;
        onKeyDown?: (event: KeyboardEvent) => void;
    }>;
    getTrackProps: HeadlessPropGetter<{
        role?: string;
        ref?: RefCallback<HTMLElement>;
        style?: Record<string, string | number>;
        onScroll?: (event: Event) => void;
        onKeyDown?: (event: KeyboardEvent) => void;
    }>;
    getSlideProps: HeadlessPropGetter<{
        index: number;
        item: TItem;
        ref?: RefCallback<HTMLElement>;
        role?: string;
        tabIndex?: number;
        'aria-roledescription'?: string;
        'aria-current'?: boolean;
        'data-index'?: number;
    }>;
    getPrevButtonProps: HeadlessPropGetter<{
        onClick?: () => void;
        'aria-label'?: string;
        disabled?: boolean;
    }>;
    getNextButtonProps: HeadlessPropGetter<{
        onClick?: () => void;
        'aria-label'?: string;
        disabled?: boolean;
    }>;
    getPaginationProps: HeadlessPropGetter<{
        role?: string;
        'aria-label'?: string;
    }>;
    getSlideIndicatorProps: HeadlessPropGetter<{
        index: number;
        onClick?: () => void;
        'aria-label'?: string;
        'aria-current'?: boolean;
    }>;
}
export declare function mergeProps<T extends Record<string, any>>(hookProps: T, userProps?: T): T;
export declare function useGrid<TItem>(options: UseGridOptions<TItem>): UseGridReturn<TItem>;
export declare function useLightbox<TItem>(options: LightboxOptions<TItem>): UseLightboxReturn<TItem>;
export declare function useReelSwiper<TItem>(options: ReelSwiperOptions<TItem>): UseReelSwiperReturn<TItem>;
//# sourceMappingURL=ui-headless.d.ts.map
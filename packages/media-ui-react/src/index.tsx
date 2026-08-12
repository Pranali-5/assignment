import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    'aria-haspopup'?: boolean | 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree' | 'true' | 'false' | string;
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
  onVisibleRangeChange?: (range: { start: number; end: number }) => void;
  useIntersectionObserver?: boolean;
}

export interface ReelSwiperState {
  currentIndex: number;
  isDragging: boolean;
  isKeyboardNavigating: boolean;
  visibleRange: { start: number; end: number };
}

export interface UseReelSwiperReturn<TItem> {
  state: ReelSwiperState;
  getRootProps: HeadlessPropGetter<{
    role?: string;
    'aria-label'?: string;
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

// minimal prop merge utility
export function mergeProps<T extends Record<string, any>>(hookProps: T, userProps: T = {} as T): T {
  const out = { ...hookProps, ...userProps } as Record<string, any>;
  ['onClick', 'onKeyDown', 'onScroll', 'onFocus', 'onBlur', 'onMouseEnter'].forEach((k) => {
    const hk = (hookProps as any)[k];
    const uk = (userProps as any)[k];
    if (hk || uk) {
      out[k] = function mergedHandler(e: any) {
        hk?.(e);
        uk?.(e);
      };
    }
  });
  return out as T;
}

export function useGrid<TItem>(options: UseGridOptions<TItem>): UseGridReturn<TItem> {
  const { items, itemToKey, defaultHighlightedIndex, defaultSelectedIndex, selectionMode } = options;
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(defaultHighlightedIndex ?? null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(defaultSelectedIndex ?? null);
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);

  const state: GridState = {
    highlightedIndex,
    selectedIndex,
    isFocused,
    isKeyboardNavigating,
    itemCount: items.length,
  };

  const getRootProps: UseGridReturn<TItem>['getRootProps'] = (props = {}) => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setIsKeyboardNavigating(true);
        setHighlightedIndex((i) => {
          const next = i == null ? 0 : Math.min(items.length - 1, i + 1);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        setIsKeyboardNavigating(true);
        setHighlightedIndex((i) => {
          const prev = i == null ? 0 : Math.max(0, i - 1);
          return prev;
        });
      }
    };
    return mergeProps({
      role: props.role ?? 'grid',
      tabIndex: props.tabIndex ?? 0,
      'aria-label': props['aria-label'] ?? 'Grid',
      onKeyDown,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
    } as any, props as any) as any;
  };

  const getItemProps: UseGridReturn<TItem>['getItemProps'] = (props = {} as any) => {
    const { index } = props;
    const tabIndex = highlightedIndex === index ? 0 : -1;
    const ariaSelected = selectionMode === 'single' ? selectedIndex === index : undefined;
    const onClick = () => {
      if (selectionMode === 'single') setSelectedIndex(index);
      options.onSelect?.(items[index], index);
    };
    const onMouseEnter = () => setHighlightedIndex(index);
    return mergeProps({
      role: props.role ?? 'gridcell',
      tabIndex,
      'aria-selected': ariaSelected,
      'data-index': index,
      onClick,
      onMouseEnter,
    } as any, props as any) as any;
  };

  const getItemWrapperProps: UseGridReturn<TItem>['getItemWrapperProps'] = (props = {} as any) => {
    const index = props.index ?? -1;
    return mergeProps({ role: props.role ?? 'presentation', 'data-index': index } as any, props as any) as any;
  };

  return { state, getRootProps, getItemProps, getItemWrapperProps };
}

export function useLightbox<TItem>(options: LightboxOptions<TItem>): UseLightboxReturn<TItem> {
  const { items, defaultIndex = 0 } = options;
  const [isOpen, setIsOpen] = useState<boolean>(!!options.isOpen);
  const [currentIndex, setCurrentIndex] = useState<number>(defaultIndex);

  const open = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    options.onOpen?.(index);
  };
  const close = () => {
    setIsOpen(false);
    options.onClose?.();
  };
  const next = () => setCurrentIndex((i) => Math.min(items.length - 1, i + 1));
  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));

  const state: LightboxState = { isOpen, currentIndex, isAnimating: false, isPointerActive: false };

  const getRootProps = (props = {} as any) => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    return mergeProps({ role: props.role ?? 'dialog', 'aria-modal': true, tabIndex: 0, onKeyDown } as any, props as any) as any;
  };

  const getTriggerProps = (props = {} as any) => {
    const onClick = () => {
      const index = props.index ?? 0;
      open(index);
    };
    return mergeProps({ 'aria-haspopup': 'dialog', onClick } as any, props as any) as any;
  };

  const getBackdropProps = (props = {} as any) => mergeProps({ role: props.role ?? 'presentation', onClick: close, tabIndex: props.tabIndex ?? -1 } as any, props as any) as any;

  const getViewportProps = (props = {} as any) => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    return mergeProps({ role: props.role ?? 'region', tabIndex: 0, onKeyDown } as any, props as any) as any;
  };

  const getSlideProps = (props = {} as any) => {
    const index = props.index as number;
    return mergeProps({ 'aria-hidden': currentIndex !== index, 'data-index': index } as any, props as any) as any;
  };

  const getPrevButtonProps = (props = {} as any) => mergeProps({ onClick: prev, 'aria-label': props['aria-label'] ?? 'Previous', disabled: currentIndex <= 0 } as any, props as any) as any;
  const getNextButtonProps = (props = {} as any) => mergeProps({ onClick: next, 'aria-label': props['aria-label'] ?? 'Next', disabled: currentIndex >= items.length - 1 } as any, props as any);
  const getCloseButtonProps = (props = {} as any) => mergeProps({ onClick: close, 'aria-label': props['aria-label'] ?? 'Close' } as any, props as any);

  return {
    state,
    getRootProps,
    getTriggerProps,
    getBackdropProps,
    getViewportProps,
    getSlideProps,
    getPrevButtonProps,
    getNextButtonProps,
    getCloseButtonProps,
  };
}

export function useReelSwiper<TItem>(options: ReelSwiperOptions<TItem>): UseReelSwiperReturn<TItem> & { scrollTo: (index: number, behavior?: ScrollBehavior) => void } {
  const { items, defaultIndex = 0, snap = true, snapAlignment = 'center', onIndexChange, onVisibleRangeChange } = options;
  const [currentIndex, setCurrentIndex] = useState<number>(defaultIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
  const trackRef = useRef<HTMLElement | null>(null);
  const slideRefs = useRef<Record<number, HTMLElement | null>>({});

  const updateVisibleRange = useCallback((index: number) => {
    const start = Math.max(0, index - 1);
    const end = Math.min(items.length - 1, index + 1);
    const nextRange = { start, end };
    onVisibleRangeChange?.(nextRange);
    return nextRange;
  }, [items.length, onVisibleRangeChange]);

  const scrollTo = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const safeIndex = Math.max(0, Math.min(items.length - 1, index));
    setCurrentIndex(safeIndex);
    updateVisibleRange(safeIndex);
    const target = slideRefs.current[safeIndex];
    if (target && trackRef.current) {
      target.scrollIntoView({ behavior, block: 'nearest' });
    }
  }, [items.length, updateVisibleRange]);

  const state: ReelSwiperState = {
    currentIndex,
    isDragging,
    isKeyboardNavigating,
    visibleRange: updateVisibleRange(currentIndex),
  };

  useEffect(() => {
    const safeIndex = Math.max(0, Math.min(items.length - 1, currentIndex));
    if (safeIndex !== currentIndex) {
      setCurrentIndex(safeIndex);
    }
  }, [items.length, currentIndex]);

  useEffect(() => {
    onIndexChange?.(currentIndex);
  }, [currentIndex, onIndexChange]);

  const getRootProps = (props = {} as any) => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setIsKeyboardNavigating(true);
        scrollTo(Math.min(items.length - 1, currentIndex + 1));
      }
      if (e.key === 'ArrowUp') {
        setIsKeyboardNavigating(true);
        scrollTo(Math.max(0, currentIndex - 1));
      }
    };
    return mergeProps({ role: props.role ?? 'region', tabIndex: 0, onKeyDown } as any, props as any) as any;
  };

  const getTrackProps = (props = {} as any) => {
    const style = { overflowY: 'auto', scrollSnapType: snap ? 'y mandatory' : undefined, ...props.style } as any;
    const onScroll = (e: Event) => {
      if (!trackRef.current) return;
      const track = trackRef.current;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      for (const [index, node] of Object.entries(slideRefs.current)) {
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        const distance = Math.abs(rect.top - track.getBoundingClientRect().top);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = Number(index);
        }
      }
      if (closestIndex !== currentIndex) {
        setCurrentIndex(closestIndex);
      }
      const range = updateVisibleRange(closestIndex);
      if (props.onScroll) {
        props.onScroll(e as any);
      }
      if (props.onVisibleRangeChange) {
        props.onVisibleRangeChange(range);
      }
    };
    return mergeProps({
      role: props.role ?? 'list',
      ref: (node: HTMLElement | null) => {
        trackRef.current = node;
        if (typeof props.ref === 'function') props.ref(node);
      },
      style,
      onScroll,
    } as any, props as any) as any;
  };

  const getSlideProps = (props = {} as any) => {
    const index = props.index as number;
    const style = { scrollSnapAlign: snapAlignment, ...props.style } as any;
    return mergeProps({
      role: props.role ?? 'listitem',
      'aria-current': currentIndex === index ? true : undefined,
      'data-index': index,
      style,
      ref: (node: HTMLElement | null) => {
        slideRefs.current[index] = node;
        if (typeof props.ref === 'function') props.ref(node);
      },
    } as any, props as any) as any;
  };

  const getPrevButtonProps = (props = {} as any) => mergeProps({ onClick: () => scrollTo(Math.max(0, currentIndex - 1)), 'aria-label': 'Previous', disabled: currentIndex <= 0 } as any, props as any) as any;
  const getNextButtonProps = (props = {} as any) => mergeProps({ onClick: () => scrollTo(Math.min(items.length - 1, currentIndex + 1)), 'aria-label': 'Next', disabled: currentIndex >= items.length - 1 } as any, props as any) as any;

  const getPaginationProps = (props = {} as any) => mergeProps({ role: props.role ?? 'navigation', 'aria-label': props['aria-label'] ?? 'Pagination' } as any, props as any) as any;
  const getSlideIndicatorProps = (props = {} as any) => mergeProps({ 'aria-current': currentIndex === props.index } as any, props as any) as any;

  return {
    state,
    getRootProps,
    getTrackProps,
    getSlideProps,
    getPrevButtonProps,
    getNextButtonProps,
    getPaginationProps,
    getSlideIndicatorProps,
    scrollTo,
  } as UseReelSwiperReturn<TItem> & { scrollTo: (index: number, behavior?: ScrollBehavior) => void };
}

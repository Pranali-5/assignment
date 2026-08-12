import { useState } from 'react';
// minimal prop merge utility
export function mergeProps(hookProps, userProps = {}) {
    const out = { ...hookProps, ...userProps };
    ['onClick', 'onKeyDown', 'onScroll', 'onFocus', 'onBlur', 'onMouseEnter'].forEach((k) => {
        const hk = hookProps[k];
        const uk = userProps[k];
        if (hk || uk) {
            out[k] = function mergedHandler(e) {
                hk?.(e);
                uk?.(e);
            };
        }
    });
    return out;
}
export function useGrid(options) {
    const { items, itemToKey, defaultHighlightedIndex, defaultSelectedIndex, selectionMode } = options;
    const [highlightedIndex, setHighlightedIndex] = useState(defaultHighlightedIndex ?? null);
    const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex ?? null);
    const [isFocused, setIsFocused] = useState(false);
    const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
    const state = {
        highlightedIndex,
        selectedIndex,
        isFocused,
        isKeyboardNavigating,
        itemCount: items.length,
    };
    const getRootProps = (props = {}) => {
        const onKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                setIsKeyboardNavigating(true);
                setHighlightedIndex((i) => {
                    const next = i == null ? 0 : Math.min(items.length - 1, i + 1);
                    return next;
                });
            }
            else if (e.key === 'ArrowUp') {
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
        }, props);
    };
    const getItemProps = (props = {}) => {
        const { index } = props;
        const tabIndex = highlightedIndex === index ? 0 : -1;
        const ariaSelected = selectionMode === 'single' ? selectedIndex === index : undefined;
        const onClick = () => {
            if (selectionMode === 'single')
                setSelectedIndex(index);
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
        }, props);
    };
    const getItemWrapperProps = (props = {}) => {
        const index = props.index ?? -1;
        return mergeProps({ role: props.role ?? 'presentation', 'data-index': index }, props);
    };
    return { state, getRootProps, getItemProps, getItemWrapperProps };
}
export function useLightbox(options) {
    const { items, defaultIndex = 0 } = options;
    const [isOpen, setIsOpen] = useState(!!options.isOpen);
    const [currentIndex, setCurrentIndex] = useState(defaultIndex);
    const open = (index) => {
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
    const state = { isOpen, currentIndex, isAnimating: false, isPointerActive: false };
    const getRootProps = (props = {}) => {
        const onKeyDown = (e) => {
            if (!isOpen)
                return;
            if (e.key === 'Escape')
                close();
            if (e.key === 'ArrowRight')
                next();
            if (e.key === 'ArrowLeft')
                prev();
        };
        return mergeProps({ role: props.role ?? 'dialog', 'aria-modal': true, tabIndex: 0, onKeyDown }, props);
    };
    const getTriggerProps = (props = {}) => {
        const onClick = () => {
            const index = props.index ?? 0;
            open(index);
        };
        return mergeProps({ 'aria-haspopup': 'dialog', onClick }, props);
    };
    const getBackdropProps = (props = {}) => mergeProps({ role: props.role ?? 'presentation', onClick: close, tabIndex: props.tabIndex ?? -1 }, props);
    const getViewportProps = (props = {}) => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape')
                close();
        };
        return mergeProps({ role: props.role ?? 'region', tabIndex: 0, onKeyDown }, props);
    };
    const getSlideProps = (props = {}) => {
        const index = props.index;
        return mergeProps({ 'aria-hidden': currentIndex !== index, 'data-index': index }, props);
    };
    const getPrevButtonProps = (props = {}) => mergeProps({ onClick: prev, 'aria-label': props['aria-label'] ?? 'Previous', disabled: currentIndex <= 0 }, props);
    const getNextButtonProps = (props = {}) => mergeProps({ onClick: next, 'aria-label': props['aria-label'] ?? 'Next', disabled: currentIndex >= items.length - 1 }, props);
    const getCloseButtonProps = (props = {}) => mergeProps({ onClick: close, 'aria-label': props['aria-label'] ?? 'Close' }, props);
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
export function useReelSwiper(options) {
    const { items, defaultIndex = 0, snap = true, snapAlignment = 'center' } = options;
    const [currentIndex, setCurrentIndex] = useState(defaultIndex);
    const [isDragging, setIsDragging] = useState(false);
    const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
    const state = { currentIndex, isDragging, isKeyboardNavigating, visibleRange: { start: 0, end: Math.min(items.length - 1, 3) } };
    const getRootProps = (props = {}) => {
        const onKeyDown = (e) => {
            if (e.key === 'ArrowDown')
                setCurrentIndex((i) => Math.min(items.length - 1, i + 1));
            if (e.key === 'ArrowUp')
                setCurrentIndex((i) => Math.max(0, i - 1));
        };
        return mergeProps({ role: props.role ?? 'region', tabIndex: 0, onKeyDown }, props);
    };
    const getTrackProps = (props = {}) => {
        const style = { overflowY: 'auto', scrollSnapType: snap ? 'y mandatory' : undefined, ...props.style };
        const onScroll = (e) => {
            // naive: compute nearest child index by scrollTop in consumer layout; keep minimal
        };
        return mergeProps({ role: props.role ?? 'list', style, onScroll }, props);
    };
    const getSlideProps = (props = {}) => {
        const index = props.index;
        const style = { scrollSnapAlign: snapAlignment };
        return mergeProps({ role: props.role ?? 'listitem', 'aria-current': currentIndex === index ? true : undefined, 'data-index': index, style }, props);
    };
    const getPrevButtonProps = (props = {}) => mergeProps({ onClick: () => setCurrentIndex((i) => Math.max(0, i - 1)), 'aria-label': 'Previous', disabled: currentIndex <= 0 }, props);
    const getNextButtonProps = (props = {}) => mergeProps({ onClick: () => setCurrentIndex((i) => Math.min(items.length - 1, i + 1)), 'aria-label': 'Next', disabled: currentIndex >= items.length - 1 }, props);
    const getPaginationProps = (props = {}) => mergeProps({ role: props.role ?? 'navigation', 'aria-label': props['aria-label'] ?? 'Pagination' }, props);
    const getSlideIndicatorProps = (props = {}) => mergeProps({ 'aria-current': currentIndex === props.index }, props);
    return {
        state,
        getRootProps,
        getTrackProps,
        getSlideProps,
        getPrevButtonProps,
        getNextButtonProps,
        getPaginationProps,
        getSlideIndicatorProps,
        // expose scrollTo for future usage
        scrollTo: (index) => setCurrentIndex(Math.max(0, Math.min(items.length - 1, index))),
    };
}
//# sourceMappingURL=ui-headless.js.map
Title: media-sdk Skill — Using the headless components (prop-getters, styling contract, a11y)

Purpose
- Instruct an AI agent exactly how to consume the headless UI hooks in packages/media-ui-react.
- Provide precise rules for prop-getters, ref wiring, ARIA, scroll-snap, IntersectionObserver config for ReelSwiper, and how to merge consumer handlers with prop-getter handlers.

Assumptions the agent MUST accept
- The headless API exports exactly:
  - useGrid<TItem>(options: UseGridOptions<TItem>): UseGridReturn<TItem>
    - getRootProps, getItemProps, getItemWrapperProps, state
  - useLightbox<TItem>(options: LightboxOptions<TItem>): UseLightboxReturn<TItem>
    - getRootProps, getTriggerProps, getBackdropProps, getViewportProps, getSlideProps, getPrevButtonProps, getNextButtonProps, getCloseButtonProps, state
  - useReelSwiper<TItem>(options: ReelSwiperOptions<TItem>): UseReelSwiperReturn<TItem>
    - getRootProps, getTrackProps, getSlideProps, getPrevButtonProps, getNextButtonProps, getPaginationProps, getSlideIndicatorProps, state, scrollTo(index)
- The consumer organizes DOM; hooks only provide wiring.

Concrete DOs (what agent must generate)
1) Always attach refs the hook returns
- Example (Grid):

    const { state, getRootProps, getItemProps } = useGrid({ items, itemToKey: i => i.id });
    return (
      <div {...getRootProps({ role: 'grid', 'aria-label': 'Results' })}>
        {items.map((item, i) => (
          <div key={item.id} {...getItemProps({ index: i, item, role: 'gridcell', ref: el => itemRefs.current[i] = el })}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    );

- The agent must not ignore ref wiring; it is required for IO/focus management.

2) Prop-getters must be merged (do not overwrite)
- If consumer supplies handlers or attributes, merge them with the hook’s returned props.
- Example utility pattern agent must produce in generated code:

    function mergeProps<T extends object>(a: T, b: T): T {
      // simple merge that concatenates handlers and preserves consumer props
      return { ...a, ...b, onClick: (e) => { a.onClick?.(e); b.onClick?.(e); } } as T;
    }

    // usage:
    const rootProps = getRootProps({ onKeyDown: consumerOnKeyDown, role: 'list' });
    return <div {...mergeProps(rootProps, { className: 'my-track' })}>...</div>;

- Do NOT replace the hook props with consumer props; always merge.

3) Grid specifics
- The hook owns highlightedIndex, selectedIndex, keyboard navigation state.
- Agent must render tabIndex per-item according to state.highlightedIndex:
  - tabIndex = state.highlightedIndex === i ? 0 : -1
- ARIA:
  - If role 'grid' then item role == 'gridcell'
  - If selectionMode === 'single', set aria-selected on items when selected
- Keyboard:
  - Hook supplies onKeyDown via getRootProps; consumer should not attach another handler that blocks default navigation unless merging (see mergeProps).

4) Lightbox specifics
- Triggers:
  - Use getTriggerProps for openers. Must pass index and item in call.
- Modal:
  - getRootProps must be applied to the modal root. If trapFocus option enabled, ensure focus trap is implemented (agent must produce code that focuses viewport on open and restores focus on close).
- Keyboard:
  - getViewportProps will include onKeyDown (arrow left/right, Esc). Consumer should not re-implement these handlers unmerged.
- Accessibility:
  - Set role='dialog' and aria-modal='true' on root.
  - Each slide should have aria-hidden=true when not active (use getSlideProps to produce this).
- Focus restoration:
  - Save the previously focused element before opening and restore focus on close.

5) ReelSwiper specifics (vertical snap paging + active detection)
- Track CSS contract (agent must produce the CSS or inline style guidance, not hard-coded visual styles):
  - track element MUST have:
    - overflowY: 'auto'
    - scrollSnapType: 'y mandatory' (or 'y proximity' if desired)
  - slide elements MUST have:
    - scrollSnapAlign: one of 'start' | 'center' | 'end' matching options.snapAlignment
- Hook wiring:
  - Agent must call reel.getTrackProps({ ref: trackRef, onScroll: consumerHandlerIfAny, style: { overflowY: 'auto', scrollSnapType: 'y mandatory' } })
  - For each slide call reel.getSlideProps({ index: i, ref: el => slideRefs[i]=el, style: { scrollSnapAlign: 'center' } })
- Active-index exposure:
  - Use reel.state.currentIndex for aria/current and visual active state:

    <div {...getSlideProps(...)} aria-current={reel.state.currentIndex === i ? 'true' : undefined}>

- IntersectionObserver specifics the agent must implement or rely on the hook for:
  - IO root: the track element
  - rootMargin: '-40% 0px -40% 0px' (center band)
  - thresholds: [0, 0.25, 0.5, 0.75, 1]
  - If the agent cannot use IO directly (e.g., polyfill), it must not re-implement different thresholds — use these constants in any custom IO.
- scroll end behavior:
  - Prefer using CSS scroll-snap where possible. If you must programmatically snap on scroll end, call reel.scrollTo(index, { behavior: 'smooth' }).
  - Do not assume uniform slide heights; use distance-from-center tie-breaker for active selection.

6) Merging handlers & composition
- The agent must not replace prop-getter handlers. If the consumer needs own handler, produce merged handler code:

    const trackProps = reel.getTrackProps({ onScroll: (e) => { /* merged */ } });
    <div {...mergeProps(trackProps, { 'data-test': 'reel-track' })} />

- For React Native stubs, do the same conceptually: pass onViewableItemsChanged callback through the prop-getter.

7) Accessibility rules (must be in generated code)
- Grid:
  - role grid/list + item role gridcell/listitem accordingly
  - keyboard navigation via getRootProps provided handler
- Lightbox:
  - role dialog or region with aria-modal=true
  - Close button with aria-label='Close'
  - Add aria-live region for current slide announcements (use reel.state.currentIndex)
- Reel:
  - Apply aria-current on active slide
  - Provide visibleRange from reel.state.visibleRange to compute "progress" aria attributes if desired

8) Tests the agent must generate
- Interaction tests:
  - Grid keyboard: simulate ArrowDown / ArrowUp and assert highlightedIndex changes (using getItemProps tabIndex).
  - Lightbox focus trap: open -> assert focus inside modal -> Esc -> assert previous focus restored.
  - Reel active detection: simulate IO entries or scroll events and assert reel.state.currentIndex changes accordingly.

Concrete DON’Ts (forbidden patterns)
- DO NOT import or reference media-core or media-react in any file under packages/media-ui-react.
- DO NOT bake in CSS styles that determine layout; only inline minimal styles to satisfy scroll-snap mechanics (overflow, scrollSnapType, scrollSnapAlign). Prefer that agents place visual styles in consumer code or Storybook examples.
- DO NOT implement active detection by reading global window scroll if the hook supports attaching to a track ref. Use the hook’s prop-getters and refs.

“If tempted to do X, do Y instead” (guardrails)
- Temptation: "I’ll attach scroll handler and compute active index purely from scrollTop."
  - Do instead: attach getTrackProps and getSlideProps refs, let the hook/hook’s IO determine active index; if you need programmatic snapping call scrollTo.
- Temptation: "I’ll set scroll-snap on track but forget per-slide scrollSnapAlign."
  - Do instead: ensure each slide has scrollSnapAlign set to match snapAlignment.
- Temptation: "I’ll compute intersection thresholds ad-hoc."
  - Do instead: use rootMargin '-40% 0px -40% 0px' and thresholds [0,0.25,0.5,0.75,1].

File path conventions agent must follow (exact)
- packages/media-ui-react/src/headless/useGrid.tsx
- packages/media-ui-react/src/headless/useLightbox.tsx
- packages/media-ui-react/src/headless/useReelSwiper.tsx
- Example consumer stories: packages/media-ui-react/stories/Grid.stories.tsx, ReelSwiper.stories.tsx, Lightbox.stories.tsx

Example minimal patterns the agent must output (exact)
- Merging props:

    // packages/media-ui-react/src/utils/mergeProps.ts
    export function mergeProps<T extends Record<string, any>>(hookProps: T, userProps: T): T {
      const out = { ...hookProps, ...userProps };
      // merge event handlers specifically if exist
      ['onClick','onKeyDown','onScroll','onFocus','onBlur'].forEach((k) => {
        const hk = hookProps[k];
        const uk = userProps[k];
        if (hk || uk) {
          out[k] = (e: any) => { hk?.(e); uk?.(e); };
        }
      });
      return out as T;
    }

- Reel track example:

    const reel = useReelSwiper({ items, snap: true, snapAlignment: 'center' });
    return (
      <div {...reel.getRootProps()}>
        <div {...reel.getTrackProps({ ref: trackRef, style: { overflowY: 'auto', scrollSnapType: 'y mandatory' } })}>
          {items.map((it, i) => (
            <div {...reel.getSlideProps({ index: i, item: it, ref: el => slides[i] = el, style: { scrollSnapAlign: 'center' } })}>
              {renderItem(it)}
            </div>
          ))}
        </div>
      </div>
    );

End.

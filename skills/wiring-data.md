Title: media-sdk Skill — Wiring data (Provider, auth, hooks, events)

Purpose
- Teach an AI coding agent exactly how to wire media-core into a React app using the media-react wrapper.
- Enforce one correct pattern: app → media-react → media-core.
- Force use of wrapper hooks and provider; forbid direct media-core imports inside UI or component code.

Scope (what the agent may produce)
- MediaReactProvider usage and implementation at packages/media-react
- Container components that use: useMediaClient, useMediaSearch, useMediaCurated, useMediaItem, useMediaEvents
- Mapping from Pexels types to small UI shapes (UIItem)
- Tests for provider initialization, hook flows, and event subscribe/unsubscribe

Assumptions the agent MUST accept
- The repository exposes media-core index exports exactly as:
  - init(config: MediaCoreConfig)
  - search(query: SearchOptions?), curated(opts), getById(id, opts)
  - on/off or subscribe/unsubscribe for events
  - clearCache()
- The React wrapper exports exactly:
  - MediaReactProvider(props: MediaReactProviderProps)
  - useMediaClient(): { client: MediaCoreClient }
  - useMediaSearch(options?): { state, controls }
  - useMediaCurated(options?)
  - useMediaItem(id|null, opts)
  - useMediaEvents(): { on, off, subscribe, unsubscribe, enableConsoleEvents, disableConsoleEvents, isConsoleEventsEnabled }

Concrete DOs (what agent must generate)
1) Provider (packages/media-react/src/MediaReactProvider.tsx)
- Create one provider component and only one place that calls media-core.init:
  - Use effect on mount to call client.init(config)
  - Example snippet (agent must output exactly this pattern):

    // packages/media-react/src/MediaReactProvider.tsx
    import React, { useEffect, useMemo } from 'react';
    import { init as coreInit } from 'media-core';
    import type { MediaCoreConfig } from 'media-core';
    export function MediaReactProvider({ config, children, ...rest }: MediaReactProviderProps) {
      const cfg = useMemo(() => ({ ...config }), [config]);
      useEffect(() => {
        if (!cfg?.apiKey) throw new Error('MediaReactProvider: config.apiKey required');
        coreInit(cfg);
      }, [cfg]);
      return <ClientContext.Provider value={/* client wrapper */}>{children}</ClientContext.Provider>;
    }

- Do not call coreInit at module import time.
- Validate apiKey presence and throw early with a clear message.

2) useMediaClient (packages/media-react/src/hooks/useMediaClient.ts)
- Provide raw client for advanced use cases, but warn in code comments: "Prefer useMediaSearch/useMediaCurated/useMediaItem for regular usage."
- Example:

    const { client } = useMediaClient();
    // client.search / client.curated / client.getById are available

3) useMediaSearch (consumption pattern)
- Return shape exactly as:
  - state: { query, options, page, per_page, data, isLoading, error, hasMore }
  - controls: { search(query, options?), loadPage(page), loadMore(), setOptions(options), refresh() }
- Implementations must:
  - Delegate fetching to client.search()
  - Update isLoading and error in consistent way
  - Use core.clearCache() only when consumer calls clearCache/refresh explicitly
- Example container usage:

    const { state, controls } = useMediaSearch({ initialQuery: 'mountains', initialOptions: { per_page: 30 } });
    if (state.isLoading) return <Spinner />;
    if (state.error) return <ErrorBox error={state.error} />;

    <Grid items={state.data ? mapToUi(state.data) : []} onLoadMore={controls.loadMore} />

4) useMediaCurated
- Same contract as useMediaSearch but uses client.curated().
- Use when you want curated photos feed; keep same controls for pagination.

5) useMediaItem
- Return shape: { state: { item, isLoading, error }, fetchItem(id, opts) }
- Always handle loading/error; do not return raw promise to UI without isLoading state.

6) useMediaEvents (subscribe/unsubscribe)
- Agent MUST use this hook for app-level subscriptions and MUST unsubscribe in cleanup:
  - Example usage pattern in components:

    function ViewTracker() {
      const events = useMediaEvents();
      useEffect(() => {
        const onView = (payload) => analytics.track('media.view', payload);
        events.on('view', onView);
        return () => events.off('view', onView);
      }, [events]);
      return null;
    }

- Do not call media-core.on in components. useMediaEvents is the required API surface.

7) Mapping Pexels -> UI item (must be small)
- Always map Pexels types to a minimal shape before passing to UI components:

    type UIItem = { id: number | string; src: string; alt?: string; width?: number; height?: number; type?: 'photo'|'video' };

    function mapPexelsToUI(photo: PexelsPhoto): UIItem {
      return { id: photo.id, src: photo.src.medium || photo.src.large, alt: photo.alt || `Photo by ${photo.photographer}`, width: photo.width, height: photo.height, type: 'photo' };
    }

- Do not pass entire PexelsPhoto into headless UI hooks/components.

8) Caching & refresh patterns
- To force fresh network fetch:
  - Either call controls.refresh() (hook-level) OR client.clearCache() before calling search again
- Do not try to reconcile provider-level cache manually; use core API.

9) Error handling & retries
- Expose error via state; provide refresh() control.
- Retry policy should be explicit in code if required — do not silently retry forever.

10) Tests agent must generate
- Provider test: mount provider with a mock client, assert init called once, assert useMediaClient returns client.
- Hook tests: mock client.search to resolve/reject, assert state transitions (loading -> data/error).
- Events test: subscribe via useMediaEvents, simulate client emit, assert handler invoked and cleanup unsubscribes.

Concrete DON’Ts (forbidden patterns)
- DO NOT import 'media-core' directly in any package under packages/media-ui-react or packages/media-ui-native.
- DO NOT call media-core.init anywhere except inside the Provider implementation (packages/media-react).
- DO NOT use global state or attach event listeners at module import time — always set up subscriptions inside useEffect and cleanup in return.
- DO NOT pass Pexels types as-is into headless UI hooks.

“If tempted to do X, do Y instead” (guardrails)
- Temptation: "Direct import of media-core in components for types".
  - Instead: map types inside wrapper (media-react) into UIItem and export mapping helper from packages/media-react/src/mappers.
- Temptation: "Call client.search directly inside many components".
  - Instead: create/use useMediaSearch to centralize loading/pagination.
- Temptation: "Attach event listeners without cleanup".
  - Instead: always return cleanup from useEffect and call off/unsubscribe.

File path conventions agent must follow (exact)
- Provider: packages/media-react/src/MediaReactProvider.tsx
- Hooks: packages/media-react/src/hooks/{useMediaClient,useMediaSearch,useMediaCurated,useMediaItem,useMediaEvents}.ts
- Mapper helpers: packages/media-react/src/mappers/pexelsToUi.ts
- Tests: packages/media-react/tests/

CI enforcement suggestions (agent should add to generated repo)
- Add a unit test that verifies provider init and events cleanup.
- Add an ESLint import rule to forbid direct imports of 'media-core' in packages/media-ui-react and media-ui-native (see playbook B10).

End of wiring-data skill.

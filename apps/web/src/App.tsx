import React, { useMemo, useState } from 'react';
import { MediaReactProvider, useMediaSearch } from '@media-sdk/media-react';
import { useGrid, useLightbox } from '@media-sdk/media-ui-react';

function ResultsGrid() {
  const { state, controls } = useMediaSearch();
  const photos = (state.data && (state.data as any).photos) || [];

  const items = useMemo(
    () =>
      photos.map((p: any) => ({
        id: p.id,
        src: p.src?.medium || p.src?.large || p.src?.original,
        alt: p.alt || `Photo by ${p.photographer}`,
        width: p.width,
        height: p.height,
        type: 'photo',
      })),
    [photos],
  );

  const grid = useGrid({ items, itemToKey: (it) => it.id, selectionMode: 'single' });
  const lightbox = useLightbox({ items, defaultIndex: 0 });

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => controls.loadMore()} disabled={!state.hasMore || state.isLoading}>
          Load more
        </button>
        <button onClick={() => controls.refresh()} style={{ marginLeft: 8 }}>
          Refresh
        </button>
      </div>

      {state.isLoading && <div>Loading...</div>}
      {state.error && <div style={{ color: 'red' }}>Error: {String(state.error)}</div>}

      <div {...grid.getRootProps({ role: 'grid', 'aria-label': 'Search results' })} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
        {items.map((item: any, i: number) => (
          <div key={item.id} {...grid.getItemWrapperProps({ index: i, item })}>
            <div {...grid.getItemProps({ index: i, item, role: 'gridcell' })}>
              <div {...lightbox.getTriggerProps({ index: i, item })} style={{ cursor: 'pointer' }}>
                <img src={item.src} alt={item.alt} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 4 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox UI (very minimal) */}
      {lightbox.state.isOpen && (
        <div {...lightbox.getRootProps({ role: 'dialog' })} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div {...lightbox.getBackdropProps()} style={{ position: 'absolute', inset: 0 }} />
          <div {...lightbox.getViewportProps()} style={{ position: 'relative', width: '80%', maxWidth: 1000 }}>
            <button {...lightbox.getCloseButtonProps()} style={{ position: 'absolute', right: 8, top: 8 }}>Close</button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button {...lightbox.getPrevButtonProps()} style={{ marginRight: 8 }}>Prev</button>
              <div style={{ maxWidth: '80%', maxHeight: '80vh' }}>
                <img src={items[lightbox.state.currentIndex]?.src} alt={items[lightbox.state.currentIndex]?.alt} style={{ width: '100%', height: 'auto', borderRadius: 6 }} />
              </div>
              <button {...lightbox.getNextButtonProps()} style={{ marginLeft: 8 }}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY || '';
  const [query, setQuery] = useState('');

  return (
    <MediaReactProvider config={{ apiKey }}>
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1>media-sdk example app</h1>
        <p>Search Pexels and view results in a headless grid + lightbox.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search photos (e.g., mountains)" style={{ flex: 1, padding: '8px 10px' }} />
          <SearchButton query={query} />
        </div>

        <ResultsGrid />
      </div>
    </MediaReactProvider>
  );
}

function SearchButton({ query }: { query: string }) {
  const { controls } = useMediaSearch();
  return (
    <button onClick={() => controls.search(query || 'nature')}>Search</button>
  );
}

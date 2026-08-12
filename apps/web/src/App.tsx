import React, { useMemo, useState } from 'react';
import { MediaReactProvider, useMediaCurated, useMediaSearch } from '@media-sdk/media-react';
import { useGrid, useLightbox, useReelSwiper } from '@media-sdk/media-ui-react';

function CuratedReel() {
  const { state } = useMediaCurated({ initialPage: 1, initialPerPage: 8 });
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

  const reel = useReelSwiper({ items, defaultIndex: 0, loop: true, snap: true, snapAlignment: 'center' });

  if (!items.length) return null;

  const reelRootProps = reel.getRootProps({ role: 'region', 'aria-label': 'Trending media reel' }) as any;
  const reelTrackProps = reel.getTrackProps({ role: 'list' }) as any;

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8ea0ff', fontWeight: 700 }}>Curated picks</div>
          <h2 style={{ margin: '8px 0 0', fontSize: 28, lineHeight: 1.2, color: '#f5f7ff' }}>Trending reel</h2>
        </div>
        <div style={{ padding: '8px 12px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, color: '#dfe6ff', background: 'rgba(255,255,255,0.04)', fontSize: 12 }}>Live now</div>
      </div>

      <div {...reelRootProps} style={{ overflow: 'hidden', borderRadius: 24, background: 'linear-gradient(145deg, rgba(20,27,47,0.92), rgba(11,15,27,0.82))', boxShadow: '0 24px 80px rgba(18, 24, 46, 0.45)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div {...reelTrackProps} style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '18px 18px 22px', scrollBehavior: 'smooth', scrollbarWidth: 'none' }}>
          {items.map((item: any, index: number) => (
            <div key={item.id} {...(reel.getSlideProps({ index, item }) as any)} style={{ flex: '0 0 220px', minWidth: 220, position: 'relative' }}>
              <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 14px 32px rgba(6, 10, 24, 0.38)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={item.src} alt={item.alt} style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.68))' }} />
                <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, zIndex: 1 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#dfe6ff', opacity: 0.8 }}>Featured</div>
                  <div style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginTop: 4 }}>{item.alt}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultsGrid({ state, controls }: { state: ReturnType<typeof useMediaSearch>['state']; controls: ReturnType<typeof useMediaSearch>['controls'] }) {
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

  const grid = useGrid({ items, itemToKey: (it: any) => it.id, selectionMode: 'single' });
  const lightbox = useLightbox({ items, defaultIndex: 0 });
  const gridRootProps = grid.getRootProps({ role: 'grid', 'aria-label': 'Search results' }) as any;
  const lightboxRootProps = lightbox.getRootProps({ role: 'dialog' }) as any;
  const lightboxViewportProps = lightbox.getViewportProps() as any;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <button onClick={() => controls.loadMore()} disabled={!state.hasMore || state.isLoading} style={{ background: 'linear-gradient(135deg, #7c8cff, #8ef1d4)', color: '#06121a', border: 'none', borderRadius: 999, padding: '10px 16px', fontWeight: 700, cursor: state.hasMore && !state.isLoading ? 'pointer' : 'not-allowed', opacity: state.hasMore && !state.isLoading ? 1 : 0.5 }}>
          Load more
        </button>
        <button onClick={() => controls.refresh()} style={{ background: 'rgba(255,255,255,0.06)', color: '#edf3ff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '10px 16px', fontWeight: 600, cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {state.isLoading && <div style={{ marginBottom: 12, color: '#dfe6ff' }}>Loading premium visuals...</div>}
      {state.error && <div style={{ marginBottom: 12, color: '#ff9caa' }}>Error: {String(state.error)}</div>}

      <div {...gridRootProps} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {items.map((item: any, i: number) => (
          <div key={item.id} {...(grid.getItemWrapperProps({ index: i, item }) as any)}>
            <div {...(grid.getItemProps({ index: i, item, role: 'gridcell' }) as any)} style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(17, 24, 39, 0.72)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 32px rgba(8, 12, 22, 0.28)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', }}>
              <div {...(lightbox.getTriggerProps({ index: i, item }) as any)} style={{ cursor: 'pointer' }}>
                <img src={item.src} alt={item.alt} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '10px 12px 14px', color: '#eaf2ff' }}>
                  <div style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Editorial</div>
                  <div style={{ fontWeight: 600, marginTop: 6 }}>{item.alt}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightbox.state.isOpen && (
        <div {...lightboxRootProps} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div {...(lightbox.getBackdropProps() as any)} style={{ position: 'absolute', inset: 0 }} />
          <div {...lightboxViewportProps} style={{ position: 'relative', width: '82%', maxWidth: 1000, borderRadius: 24, background: 'rgba(8,10,18,0.9)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
            <button {...(lightbox.getCloseButtonProps() as any)} style={{ position: 'absolute', right: 12, top: 12, zIndex: 2, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: '8px 12px', cursor: 'pointer' }}>Close</button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '42px 56px 28px', gap: 18 }}>
              <button {...(lightbox.getPrevButtonProps() as any)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 999, width: 44, height: 44, cursor: 'pointer' }}>←</button>
              <div style={{ maxWidth: '80%', maxHeight: '80vh' }}>
                <img src={items[lightbox.state.currentIndex]?.src} alt={items[lightbox.state.currentIndex]?.alt} style={{ width: '100%', height: 'auto', borderRadius: 18, display: 'block' }} />
              </div>
              <button {...(lightbox.getNextButtonProps() as any)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 999, width: 44, height: 44, cursor: 'pointer' }}>→</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY || '';

  if (!apiKey) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif', background: '#07111d', color: '#edf3ff', padding: 24 }}>
        <div style={{ maxWidth: 540, textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
          <h2 style={{ marginTop: 0 }}>Missing Pexels API key</h2>
          <p style={{ marginBottom: 0, color: '#dfe6ff' }}>Set VITE_PEXELS_API_KEY in apps/web/.env to load the curated reel and search results.</p>
        </div>
      </div>
    );
  }

  return (
    <MediaReactProvider config={{ apiKey }}>
      <AppContent />
    </MediaReactProvider>
  );
}

function AppContent() {
  const [query, setQuery] = useState('');
  const { state, controls } = useMediaSearch({ initialQuery: 'nature', initialPage: 1, initialPerPage: 12 });

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(120,136,255,0.22), transparent 32%), linear-gradient(180deg, #070b15 0%, #101827 100%)', color: '#edf3ff', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px 64px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8ea0ff', fontWeight: 700 }}>Media Atlas</div>
            <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(2.25rem, 4vw, 4rem)', lineHeight: 1.08 }}>Premium visual discovery</h1>
          </div>
          <div style={{ padding: '10px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#dfe6ff' }}>Curated stories • Search-driven</div>
        </header>

        <CuratedReel />

        <section style={{ marginTop: 10, marginBottom: 28, background: 'rgba(12,17,28,0.72)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(8, 12, 22, 0.35)' }}>
          <div style={{ display: 'flex', gap: 12, padding: 18, flexWrap: 'wrap' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search premium visuals, ideas, moods..."
              style={{
                flex: 1,
                minWidth: 220,
                padding: '16px 18px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(15, 21, 32, 0.9)',
                color: '#edf3ff',
                fontSize: 16,
                outline: 'none',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
              }}
            />
            <SearchButton query={query} onSearch={() => controls.search(query || 'nature')} />
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: 30, color: '#f5f7ff' }}>Search results</h2>
            <div style={{ color: '#a7b7d8', fontSize: 14 }}>Fresh inspiration for every mood</div>
          </div>
          <ResultsGrid state={state} controls={controls} />
        </section>
      </div>
    </div>
  );
}

function SearchButton({ query, onSearch }: { query: string; onSearch: () => void }) {
  return (
    <button
      onClick={() => onSearch()}
      style={{
        border: 'none',
        borderRadius: 16,
        background: 'linear-gradient(135deg, #7d8eff 0%, #9ae7d9 100%)',
        color: '#07141d',
        fontWeight: 800,
        padding: '0 22px',
        minHeight: 54,
        minWidth: 138,
        cursor: 'pointer',
        boxShadow: '0 18px 30px rgba(110, 131, 255, 0.35)',
      }}
    >
      {query ? 'Search' : 'Explore'}
    </button>
  );
}

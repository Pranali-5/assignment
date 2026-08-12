import React, { useMemo, useState } from 'react';
import { MediaReactProvider, useMediaCurated, useMediaSearch } from '@media-sdk/media-react';
import { useGrid, useLightbox, useReelSwiper } from '@media-sdk/media-ui-react';

function CuratedReel() {
  const { state } = useMediaCurated({ initialPage: 1, initialPerPage: 6 });
  const photos = (state.data && (state.data as any).photos) || [];

  const items = useMemo(
    () =>
      photos.map((p: any) => ({
        id: p.id,
        src: p.src?.medium || p.src?.large || p.src?.original,
        alt: p.alt || `Photo by ${p.photographer}`,
        type: 'photo',
      })),
    [photos],
  );

  const reel = useReelSwiper({ items, defaultIndex: 0, snap: true, snapAlignment: 'center' });

  if (!items.length) return null;

  const reelRootProps = reel.getRootProps({ role: 'region', 'aria-label': 'Curated media reel' }) as any;
  const reelTrackProps = reel.getTrackProps({ role: 'list' }) as any;

  return (
    <div {...reelRootProps} style={{ border: '1px solid #dfe3ee', borderRadius: 12, background: '#f7f8fb', padding: 12, marginBottom: 24 }}>
      <div {...reelTrackProps} style={{ overflowY: 'auto', height: 240, scrollSnapType: 'y mandatory', paddingRight: 6 }}>
        {items.map((item: any, index: number) => (
          <div key={item.id} {...(reel.getSlideProps({ index, item, style: { scrollSnapAlign: 'center', marginBottom: 12 } }) as any)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #e6e8ef', borderRadius: 10, padding: 10 }}>
            <img src={item.src} alt={item.alt} style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: '#54627a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Curated</div>
              <div style={{ fontWeight: 600, color: '#1b2434', marginTop: 4 }}>{item.alt}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
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
        type: 'photo',
      })),
    [photos],
  );

  const grid = useGrid({ items, itemToKey: (it: any) => it.id, selectionMode: 'single' });
  const lightbox = useLightbox({ items, defaultIndex: 0 });
  const gridRootProps = grid.getRootProps({ role: 'grid', 'aria-label': 'Search results' }) as any;
  const lightboxRootProps = lightbox.getRootProps({ role: 'dialog' }) as any;
  const lightboxViewportProps = lightbox.getViewportProps() as any;

  React.useEffect(() => {
    if (!state.hasMore || state.isLoading) return;

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.body.offsetHeight;
      if (scrollPosition >= pageHeight - 260) {
        void controls.loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [state.hasMore, state.isLoading, controls]);

  return (
    <div style={{ border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: 18, background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.06)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => controls.loadMore()} disabled={!state.hasMore || state.isLoading} style={{ border: '1px solid #dfe3ee', borderRadius: 10, background: '#fff', color: '#1b2434', padding: '10px 14px', fontWeight: 700, cursor: state.hasMore && !state.isLoading ? 'pointer' : 'not-allowed', boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)' }}>
          {state.isLoading ? 'Loading...' : 'Load more'}
        </button>
        <button onClick={() => controls.refresh()} style={{ border: '1px solid #dfe3ee', borderRadius: 10, background: '#f3f5f9', color: '#1b2434', padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {state.isLoading && <div style={{ marginBottom: 12, color: '#475569', fontWeight: 600 }}>Loading more content…</div>}
      {state.error && <div style={{ marginBottom: 12, color: '#a52d2d' }}>Error: {String(state.error)}</div>}

      <div {...gridRootProps} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, maxHeight: 560, minHeight: 560, overflowY: 'auto', paddingRight: 6, scrollbarWidth: 'thin' }}>
        {items.map((item: any, i: number) => (
          <div key={item.id} {...(grid.getItemWrapperProps({ index: i, item }) as any)}>
            <div {...(grid.getItemProps({ index: i, item, role: 'gridcell' }) as any)} style={{ border: '1px solid #e6e8ef', borderRadius: 14, background: '#fff', overflow: 'hidden', boxShadow: '0 10px 22px rgba(15, 23, 42, 0.04)' }}>
              <div {...(lightbox.getTriggerProps({ index: i, item }) as any)} style={{ cursor: 'pointer' }}>
                <img src={item.src} alt={item.alt} style={{ display: 'block', width: '100%', height: 180, objectFit: 'cover' }} />
                <div style={{ padding: '10px 12px', fontWeight: 600, color: '#1f2937' }}>{item.alt}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightbox.state.isOpen && (
        <div {...lightboxRootProps} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div {...(lightbox.getBackdropProps() as any)} style={{ position: 'absolute', inset: 0 }} />
          <div {...lightboxViewportProps} style={{ position: 'relative', width: '70%', maxWidth: 760, background: '#ffffff', borderRadius: 12, overflow: 'hidden', border: '1px solid #dfe3ee' }}>
            <button {...(lightbox.getCloseButtonProps() as any)} style={{ position: 'absolute', right: 12, top: 12, zIndex: 2, border: '1px solid #dfe3ee', borderRadius: 999, background: '#fff', padding: '6px 10px', cursor: 'pointer' }}>Close</button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '34px 16px 18px' }}>
              <button {...(lightbox.getPrevButtonProps() as any)} style={{ border: '1px solid #dfe3ee', borderRadius: 999, width: 34, height: 34, background: '#fff', cursor: 'pointer' }}>←</button>
              <img src={items[lightbox.state.currentIndex]?.src} alt={items[lightbox.state.currentIndex]?.alt} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
              <button {...(lightbox.getNextButtonProps() as any)} style={{ border: '1px solid #dfe3ee', borderRadius: 999, width: 34, height: 34, background: '#fff', cursor: 'pointer' }}>→</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoReel({ state, controls }: { state: ReturnType<typeof useMediaSearch>['state']; controls: ReturnType<typeof useMediaSearch>['controls'] }) {
  const items = useMemo(() => {
    const videos = (state.data && (state.data as any).videos) || [];
    return videos.map((video: any) => ({
      id: video.id,
      title: video.user?.name || video.url,
      src: video.image,
      type: 'video',
      videoUrl: video.video_files?.find((file: any) => file.quality === 'hd' || file.quality === 'sd')?.link || video.url,
    }));
  }, [state.data]);

  const reel = useReelSwiper({ items, defaultIndex: 0, snap: true, snapAlignment: 'center' });

  if (!items.length) return null;

  const handleVerticalScroll = () => {
    if (!state.hasMore || state.isLoading) return;
    const currentTrack = document.querySelector('[data-video-reel-track="true"]') as HTMLElement | null;
    if (!currentTrack) return;
    const nearBottom = currentTrack.scrollTop + currentTrack.clientHeight >= currentTrack.scrollHeight - 220;
    if (nearBottom) {
      void controls.loadMore();
    }
  };

  const reelRootProps = reel.getRootProps({ role: 'region', 'aria-label': 'Video reel' }) as any;
  const reelTrackProps = reel.getTrackProps({ role: 'list', 'data-video-reel-track': true, onScroll: handleVerticalScroll }) as any;

  return (
    <div style={{ border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: 18, background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.06)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: '#1b2434' }}>Videos</div>
        {state.isLoading && <div style={{ color: '#475569', fontWeight: 600 }}>Loading…</div>}
      </div>
      <div {...reelRootProps} style={{ border: '1px solid #dfe3ee', borderRadius: 14, background: '#f7f8fb', padding: 12 }}>
        <div {...reelTrackProps} style={{ overflowY: 'auto', height: 560, minHeight: 560, scrollSnapType: 'y mandatory', paddingRight: 6 }}>
          {items.map((item: any, index: number) => (
            <div key={item.id} {...(reel.getSlideProps({ index, item, style: { scrollSnapAlign: 'center', marginBottom: 12 } }) as any)} style={{ minHeight: 250, border: '1px solid #e6e8ef', borderRadius: 14, overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 22px rgba(15, 23, 42, 0.04)' }}>
              <img src={item.src} alt={item.title} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: '#54627a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Video</div>
                <div style={{ fontWeight: 700, color: '#1b2434', marginTop: 4 }}>{item.title}</div>
                {item.videoUrl && (
                  <a href={item.videoUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10, color: '#1d4ed8', textDecoration: 'none', fontWeight: 600 }}>Open video</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY || '';

  if (!apiKey) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f7fb', color: '#1b2434', padding: 24 }}>
        <div style={{ maxWidth: 540, textAlign: 'center', background: '#fff', border: '1px solid #dfe3ee', borderRadius: 12, padding: 32 }}>
          <h2 style={{ marginTop: 0 }}>Missing Pexels API key</h2>
          <p style={{ marginBottom: 0 }}>Set VITE_PEXELS_API_KEY in apps/web/.env to load the media feed.</p>
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
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const imageSearch = useMediaSearch({ initialQuery: 'nature', initialPage: 1, initialPerPage: 12 });
  const videoSearch = useMediaSearch({ initialQuery: 'nature', initialPage: 1, initialPerPage: 5, initialOptions: { resource_type: 'video' } });

  const runSearch = () => {
    const nextQuery = query || 'nature';
    void imageSearch.controls.search(nextQuery);
    void videoSearch.controls.search(nextQuery, { resource_type: 'video' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #eef4ff 0%, #f5f7fb 52%, #eef2f7 100%)', color: '#1b2434', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px 56px' }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 3vw, 3rem)', letterSpacing: '-0.04em', fontWeight: 800 }}>Media SDK demo</h1>
        </header>

        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 16, padding: 12, boxShadow: '0 14px 30px rgba(15,23,42,0.05)' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search images or videos"
              style={{ flex: 1, minWidth: 220, padding: '14px 16px', border: '1px solid #dfe3ee', borderRadius: 12, fontSize: 16, background: '#fff', outline: 'none', boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)' }}
            />
            <button
              onClick={runSearch}
              style={{ border: 'none', borderRadius: 12, background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: '#fff', padding: '14px 20px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 14px 28px rgba(17,24,39,0.18)' }}
            >
              Search
            </button>
          </div>
        </section>

        <div style={{ display: 'flex', gap: 12, marginBottom: 18, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 14, padding: 8, width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('images')}
            style={{ borderRadius: 10, border: activeTab === 'images' ? '1px solid #111827' : '1px solid transparent', background: activeTab === 'images' ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' : 'transparent', color: activeTab === 'images' ? '#fff' : '#1b2434', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', boxShadow: activeTab === 'images' ? '0 10px 20px rgba(17,24,39,0.18)' : 'none' }}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            style={{ borderRadius: 10, border: activeTab === 'videos' ? '1px solid #111827' : '1px solid transparent', background: activeTab === 'videos' ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' : 'transparent', color: activeTab === 'videos' ? '#fff' : '#1b2434', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', boxShadow: activeTab === 'videos' ? '0 10px 20px rgba(17,24,39,0.18)' : 'none' }}
          >
            Videos
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          <section style={{ display: activeTab === 'images' ? 'block' : 'none' }}>
            <ResultsGrid state={imageSearch.state} controls={imageSearch.controls} />
          </section>

          <section style={{ display: activeTab === 'videos' ? 'block' : 'none' }}>
            <VideoReel state={videoSearch.state} controls={videoSearch.controls} />
          </section>
        </div>
      </div>
    </div>
  );
}

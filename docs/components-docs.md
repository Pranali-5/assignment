# media-ui-react Components Docs

## Headless pattern

`media-ui-react` is intentionally independent from the media SDK. It receives plain data items and callbacks, then exposes hook-based prop-getters to let the consumer decide the markup and styling.

## `useGrid`

Use this for a lightweight grid layout with keyboard navigation support.

```tsx
import { useGrid } from '@media-sdk/media-ui-react';

const data = [
  { id: 1, src: '/a.jpg', alt: 'A' },
  { id: 2, src: '/b.jpg', alt: 'B' },
];

function GridDemo() {
  const grid = useGrid({
    items: data,
    itemToKey: (item) => item.id,
    selectionMode: 'single',
  });

  return (
    <div {...grid.getRootProps({ role: 'grid', 'aria-label': 'Results' })}>
      {data.map((item, index) => (
        <div key={item.id} {...grid.getItemProps({ index, item, role: 'gridcell' })}>
          <img src={item.src} alt={item.alt} />
        </div>
      ))}
    </div>
  );
}
```

## `useLightbox`

Use this for popover or modal media preview behavior.

```tsx
import { useLightbox } from '@media-sdk/media-ui-react';

function LightboxDemo() {
  const lightbox = useLightbox({ items: data, defaultIndex: 0 });

  return (
    <>
      <button {...lightbox.getTriggerProps({ index: 0, item: data[0] })}>Open</button>

      {lightbox.state.isOpen && (
        <div {...lightbox.getRootProps({ role: 'dialog', 'aria-modal': 'true' })}>
          <button {...lightbox.getCloseButtonProps()}>Close</button>
          <button {...lightbox.getPrevButtonProps()}>Prev</button>
          <button {...lightbox.getNextButtonProps()}>Next</button>
        </div>
      )}
    </>
  );
}
```

## `useReelSwiper`

Use this for vertical reel-style sliding content. The hook exposes prop getters for the track and slides and supports active index state.

```tsx
import { useReelSwiper } from '@media-sdk/media-ui-react';

function ReelDemo() {
  const reel = useReelSwiper({
    items: data,
    defaultIndex: 0,
    snap: true,
    snapAlignment: 'center',
  });

  return (
    <div {...reel.getRootProps()}>
      <div
        {...reel.getTrackProps({
          style: {
            overflowY: 'auto',
            scrollSnapType: 'y mandatory',
          },
        })}
      >
        {data.map((item, index) => (
          <div
            key={item.id}
            {...reel.getSlideProps({
              index,
              item,
              style: { scrollSnapAlign: 'center' },
            })}
          >
            <img src={item.src} alt={item.alt} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Styling contract

The hooks intentionally do not ship UI styles. The consumer supplies the markup, CSS, and visual treatment. Only the minimal scroll-snap and interactive props are provided by the headless hooks.

## Accessibility

- Grid items should use `role="gridcell"` or list equivalents.
- Lightbox root should include `role="dialog"` and `aria-modal="true"`.
- Reel slides should expose `aria-current` for the active item when appropriate.
- Keyboard support is wired through the hooks and merged with consumer handlers.

---
layout: default
title: SDK Documentation
permalink: /sdk/
---

# SDK Documentation

## Purpose

`media-core` is the framework-agnostic, zero-UI SDK for Pexels data access. It is the only package in the repo that speaks directly to the Pexels API.

## Public API

### `init(config)`

Initializes the SDK with the app API key.

```ts
import { init } from '@media-sdk/media-core';

init({
  apiKey: 'your_pexels_api_key',
  defaultPerPage: 15,
});
```

### `search(query, options?)`

Searches Pexels photos or videos by a text query.

```ts
import { search } from '@media-sdk/media-core';

const result = await search('mountains', {
  page: 1,
  per_page: 12,
  resource_type: 'all',
});
```

### `curated(options?)`

Fetches the curated/trending photo feed.

```ts
import { curated } from '@media-sdk/media-core';

const result = await curated({ page: 1, per_page: 8 });
```

### `getById(id, options)`

Fetches a single resource by ID.

```ts
import { getById } from '@media-sdk/media-core';

const photo = await getById(12345, { resource_type: 'photo' });
```

## Events

`media-core` emits `view` and `download` events via a lightweight event emitter.

```ts
import { on, off } from '@media-sdk/media-core';

const handleView = (payload) => {
  console.log('media viewed', payload);
};

on('view', handleView);
// ...

off('view', handleView);
```

## Error handling

The SDK throws structured errors when the API call fails, including HTTP status and response text. The wrapper layer converts these into hook state updates.

## Caching

The SDK uses in-memory request caching and request de-duping to avoid duplicate fetches over short intervals.

## Notes

- No React imports or DOM code are used in this package.
- Authentication is isolated inside initialization and request headers.
- The implementation is portable and can be reused by other UI stacks or CLIs.

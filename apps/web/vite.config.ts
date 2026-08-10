import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@root-src': path.resolve(__dirname, '..', '..', 'src'),
    },
  },
  // allow Vite to access files outside the project root during dev/build
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..', '..')],
    },
  },
});

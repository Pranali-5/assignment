import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@root-src': path.resolve(__dirname, '..', '..', 'src'),
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
    },
  },
  // allow Vite to access files outside the project root during dev/build
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..', '..')],
    },
  },
});

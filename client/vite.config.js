import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'filter-admin-from-public-entry',
      transformIndexHtml(html) {
        // Strip Admin CSS from the public entry HTML so it is loaded strictly on-demand when visiting /admin
        return html.replace(/<link[^>]+rel="stylesheet"[^>]+page-admin-[^>]+>\s*/g, '');
      }
    }
  ],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'gsap',
      'three',
      'framer-motion',
      'lenis',
      'dompurify',
      'marked'
    ]
  },
  esbuild: {
    drop: ['console', 'debugger']
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    reportCompressedSize: false,
    assetsInlineLimit: 4096,
    modulePreload: {
      resolveDependencies(filename, deps, { hostId, hostType }) {
        if (hostType === 'html') {
          return deps.filter((dep) => {
            return !dep.includes('Admin') && !dep.includes('page-admin') && !dep.includes('vendor-markdown');
          });
        }
        return deps;
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom') || id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/gsap')) {
            return 'vendor-gsap';
          }
          if (id.includes('node_modules/lenis')) {
            return 'vendor-lenis';
          }
          if (id.includes('node_modules/marked') || id.includes('node_modules/dompurify')) {
            return 'vendor-markdown';
          }
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:6000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:6000',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: true,
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:6000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:6000',
        changeOrigin: true
      }
    }
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
        ],
      },
    }),
    mode === 'analyze' && visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    open: true, // Automatically open browser
    strictPort: true, // Fail if port is in use
    cors: true,
    
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
    
    // Enable watch for rapid development
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  
  preview: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production', // Enable sourcemaps in development
    minify: mode === 'production' ? 'terser' : false,
    
    // Chunk optimization
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@mui/material', 
            '@mui/icons-material', 
            '@emotion/react', 
            '@emotion/styled'
          ],
          'chart-vendor': ['recharts'],
          'utils-vendor': [
            'axios', 
            'react-dropzone', 
            'react-hot-toast',
            'framer-motion',
            'lucide-react'
          ],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Build optimization
    target: 'esnext',
    modulePreload: {
      polyfill: false, // Modern browsers support modulepreload
    },
    cssCodeSplit: true,
    reportCompressedSize: false, // Disable gzip size reporting
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
  },
  
  // Esbuild options for minification
  esbuild: mode === 'production' ? {
    drop: ['console', 'debugger'],
  } : undefined,

  // CSS optimization
  css: {
    devSourcemap: true, // Enable sourcemaps for CSS in development
    modules: {
      localsConvention: 'camelCase',
    },
  },
  
  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'import.meta.env.MODE': JSON.stringify(mode),
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'axios',
      'framer-motion',
    ],
    exclude: ['@babel/runtime'],
    force: false,
  },
  
  // Experimental features
  experimental: {
    renderBuiltUrl(filename: string) {
      return filename;
    },
  },
}));
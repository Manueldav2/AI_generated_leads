import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@styles': path.resolve(__dirname, './styles')
        }
      },
      css: {
        modules: {
          localsConvention: 'camelCase',
          scopeBehaviour: 'local',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
          hashPrefix: 'prefix'
        }
      },
      build: {
        cssCodeSplit: true,
        sourcemap: true,
        rollupOptions: {
          output: {
            assetFileNames: (assetInfo) => {
              let extType = assetInfo.name.split('.')[1];
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                extType = 'img';
              } else if (extType === 'css') {
                extType = 'css';
              }
              return `assets/${extType}/[name]-[hash][extname]`;
            },
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
          }
        }
      },
      server: {
        watch: {
          usePolling: true
        },
        host: true,
        port: 5173,
        fs: {
          strict: true,
          allow: ['..']
        }
      }
    };
});

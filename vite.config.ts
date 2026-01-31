
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Fallback values for development if env is missing
    const supabaseUrl = env.SUPABASE_URL || 'https://xgoyheiziovmknjsumuf.supabase.co';
    const supabaseKey = env.SUPABASE_ANON_KEY || 'sb_publishable_gWAHUcUWl9hLksslA-4lyg_7vRYrVYD';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

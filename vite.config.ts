import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',  // Ensure base is set for Vercel
  
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  
  build: {
    outDir: 'dist',  // Ensure build output goes to 'dist' directory
    sourcemap: true,  // Help with debugging
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ✅ ONE MERGED SERVER BLOCK
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/supabase-proxy': {
        target: 'https://tnwmnsdfdjbeifqssxuu.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase-proxy/, '')
      }
    }
  }
}));
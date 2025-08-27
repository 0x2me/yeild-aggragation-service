import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy all API requests to backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Proxy health endpoint
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Special handling for refresh endpoint with auth
      '/admin/refresh': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace('/admin/refresh', '/api/refresh'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add the refresh key header for admin refresh endpoint
            if (req.url?.includes('/admin/refresh')) {
              proxyReq.setHeader('X-Refresh-Key', process.env.REFRESH_KEY || 'dev-refresh-key-change-in-production');
            }
          });
        },
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

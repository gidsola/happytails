import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from "rollup-plugin-visualizer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SERVER_PORT = 5000;
// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(),
  visualizer({ open: true }) // Automatically opens the map after build
  ],
  build: {
    emptyOutDir: true, // This clears the dist folder before every build
    rollupOptions: {
      input: {
        // Define ALL HTML files here
        main: resolve(__dirname, 'index.html'), // Assuming index.html is in frontend/

        // Add all other pages here (e.g., about: resolve(__dirname, 'about.html'))
      },
      // SHARED CHUNKS LOGIC:
      output: {
        manualChunks(id) {
          // Put all node_modules (React, Lucide, etc.) into a 'vendor' chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Group shared UI components (like Navbar, Footer) into one chunk
          if (id.includes('Components/Navbar') || id.includes('Components/Footer')) {
            return 'shared-ui';
          }

        }
      }
    },
  },
  server: {
    proxy: {
      // Proxy requests starting with '/api' to the backend server
      '/api': {
        target: `http://localhost:${SERVER_PORT}`,
        // for backend to correctly interpret the host and protocol
        changeOrigin: true,
      },

    },
  },
})

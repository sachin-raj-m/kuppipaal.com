import react from '@vitejs/plugin-react';
import envCompatible from 'vite-plugin-env-compatible';

// https://vitejs.dev/config/
export default {
  plugins: [
    react(),
    envCompatible(),
  ],
};

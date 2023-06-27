// vite.config.js
import { defineConfig } from 'vite';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

export default defineConfig({ port: 3000 });

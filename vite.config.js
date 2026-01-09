/**
 * VITE.CONFIG.JS - Konfiguration für Vite Build-Tool
 * 
 * Vite ist ein modernes Build-Tool für Frontend-Entwicklung.
 * Diese Konfiguration definiert:
 * - Verwendete Plugins (React)
 * - Development Server-Einstellungen
 * - API-Proxy für Backend-Kommunikation
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    // Plugins: React-Plugin für JSX-Unterstützung
    plugins: [react()],

    // Development Server Konfiguration
    server: {
        port: 3000,  // Frontend läuft auf Port 3000

        /**
         * WICHTIG: Proxy-Konfiguration für Backend-API
         * 
         * Problem: Browser erlauben keine direkten Anfragen von
         * http://localhost:3000 (Frontend) an http://localhost:8080 (Backend)
         * wegen CORS (Cross-Origin Resource Sharing)
         * 
         * Lösung: Vite leitet alle /api-Anfragen automatisch an das Backend weiter
         * 
         * Beispiel:
         * - Frontend macht Request an: http://localhost:3000/api/users
         * - Vite leitet weiter an: http://localhost:8080/api/users
         * - Antwort kommt zurück zum Frontend
         * 
         * So wird CORS umgangen, da der Browser denkt, alles kommt von Port 3000
         */
        proxy: {
            '/api': {
                target: 'http://localhost:8080',  // Backend-Server-Adresse
                changeOrigin: true                 // Origin-Header ändern für CORS
            }
        }
    }
})
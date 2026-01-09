/**
 * MAIN.JSX - Einstiegspunkt der React-Anwendung
 * 
 * Diese Datei ist der zentrale Einstiegspunkt, der:
 * - Die React-Anwendung initialisiert
 * - Das Material-UI Theme bereitstellt
 * - Die Haupt-App-Komponente rendert
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'

// Grundlegendes Theme für Material-UI erstellen
// Wird später in App.jsx durch ein detaillierteres Theme überschrieben
const theme = createTheme({
    palette: {
        mode: 'light', // Heller Modus für die Anwendung
    },
})

// React-App in das DOM-Element mit der ID 'root' rendern
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* ThemeProvider stellt das Theme für alle MUI-Komponenten bereit */}
        <ThemeProvider theme={theme}>
            {/* CssBaseline normalisiert CSS über verschiedene Browser hinweg */}
            <CssBaseline />
            {/* Hauptkomponente der Anwendung */}
            <App />
        </ThemeProvider>
    </React.StrictMode>
)
/**
 * APP.JSX - Hauptkomponente der Anwendung
 * 
 * Diese Komponente definiert:
 * - Das komplette Material-UI Theme (Farben, Typografie, Komponenten-Styles)
 * - Das Layout mit AppBar (Kopfzeile) und Container
 * - Die Struktur der gesamten Anwendung
 */

import React from 'react'
import { Container, Typography, Box, AppBar, Toolbar, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { People as PeopleIcon } from '@mui/icons-material'
import Benutzerliste from './components/Benutzerliste'

/**
 * Benutzerdefiniertes Material-UI Theme
 * Definiert das komplette Erscheinungsbild der Anwendung
 */
const theme = createTheme({
    // Farbpalette der Anwendung
    palette: {
        primary: {
            main: '#4169E1',    // Royal Blue - Hauptfarbe der Anwendung
            light: '#6A8FE1',   // Hellere Variante für Hover-Effekte
            dark: '#2E4CB8',    // Dunklere Variante für aktive Zustände
        },
        secondary: {
            main: '#00BCD4',    // Cyan - Sekundärfarbe für Akzente
            light: '#4DD0E1',   // Helle Variante
        },
        background: {
            default: '#F5F7FA', // Hintergrundfarbe der gesamten Seite
            paper: '#FFFFFF',   // Hintergrund für Cards und Paper-Komponenten
        },
        success: {
            main: '#4CAF50',    // Grün für Erfolgsm eldungen
        },
        error: {
            main: '#F44336',    // Rot für Fehlermeldungen und Lösch-Aktionen
        },
    },
    // Typografie-Einstellungen
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',  // Standard-Schriftart
        h1: {
            fontWeight: 600,           // Fettgedruckt für Überschriften
            letterSpacing: '-0.5px',   // Leicht engerer Buchstabenabstand
        },
        h3: {
            fontWeight: 600,           // Fettgedruckt
        },
        button: {
            textTransform: 'none',     // WICHTIG: Buttons ohne Großbuchstaben
            fontWeight: 500,           // Mittlere Schriftstärke
        },
    },
    // Grundlegende Formgestaltung
    shape: {
        borderRadius: 8,  // Standard-Abrundung für alle Komponenten (8px)
    },
    /**
     * Komponentenspezifische Style-Überschreibungen
     * Hier werden Standard-Styles von Material-UI-Komponenten angepasst
     */
    components: {
        // AppBar (Kopfzeile) Styling
        MuiAppBar: {
            styleOverrides: {
                root: {
                    // Weicher Schatten für die Kopfzeile
                    boxShadow: '0 2px 8px rgba(65, 105, 225, 0.15)',
                },
            },
        },
        // Button Styling
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,           // Abgerundete Ecken
                    textTransform: 'none',     // Normaler Text (nicht GROSSBUCHSTABEN)
                    fontWeight: 500,           // Mittlere Schriftstärke
                    padding: '8px 16px',       // Innenabstand
                },
                contained: {
                    // Schatten für gefüllte Buttons
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                },
            },
        },
        // Card-Komponenten Styling
        MuiCard: {
            styleOverrides: {
                root: {
                    // Dezenter Schatten für Cards
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        // Tabellenkopf Styling
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#F5F7FA',
                    // Styling für Tabellenkopf-Zellen
                    '& .MuiTableCell-head': {
                        backgroundColor: '#4169E1',  // Royal Blue Hintergrund
                        color: '#FFFFFF',            // Weiße Schrift
                        fontWeight: 600,             // Fettgedruckt
                    },
                },
            },
        },
    },
})

/**
 * App-Hauptkomponente
 * Rendert das komplette Layout der Anwendung
 */
function App() {
    return (
        <ThemeProvider theme={theme}>
            {/* CssBaseline: Normalisiert CSS über verschiedene Browser */}
            <CssBaseline />

            {/* Hauptcontainer: Flexbox-Layout für Kopfzeile und Inhalt */}
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                {/* AppBar: Sticky Kopfzeile mit Gradient-Hintergrund */}
                <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #4169E1 0%, #2E4CB8 100%)' }}>
                    <Toolbar>
                        {/* Icon: Menschen-Symbol für Benutzerverwaltung */}
                        <PeopleIcon sx={{ mr: 2, fontSize: 28 }} />

                        {/* Titel der Anwendung */}
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '0.5px' }}>
                            Benutzerverwaltung
                        </Typography>
                    </Toolbar>
                </AppBar>

                {/* Hauptinhalt-Container: Extra breit (xl) mit Padding */}
                <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
                    {/* Benutzerliste-Komponente: Zeigt die Tabelle mit allen Benutzern */}
                    <Benutzerliste />
                </Container>
            </Box>
        </ThemeProvider>
    )
}

export default App
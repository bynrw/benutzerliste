/**
 * BENUTZERDETAIL.JSX - Detail-Ansicht für einzelnen Benutzer
 * 
 * Diese Komponente zeigt alle Details eines Benutzers an:
 * - Persönliche Daten (Vorname, Nachname, Username, Email, Telefon)
 * - Organisationen mit zugehörigen Rollen
 * - Status (Aktiv/Gelöscht)
 * 
 * Die Komponente wird in einem Modal (Dialog) angezeigt und
 * erhält die Benutzerdaten als Prop von der Benutzerliste.
 */

import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Divider,
    Chip,
    TextField,
    Paper,
} from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Business as BusinessIcon } from '@mui/icons-material';

/**
 * BenutzerDetail-Komponente
 * @param {Object} user - Benutzerobjekt mit allen Details
 */
const BenutzerDetail = ({ user }) => {
    // Fallback, falls keine Benutzerdaten vorhanden sind
    if (!user) {
        return <Typography>Keine Benutzerdaten verfügbar</Typography>;
    }

    return (
        <Box sx={{ pt: 0 }}>
            {/* Grid-Layout für responsive Anordnung der Felder */}
            <Grid container spacing={3}>

                {/* ===== PERSÖNLICHE DATEN ===== */}
                <Grid item xs={12}>
                    {/* Überschrift mit Icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PersonIcon sx={{ color: '#4169E1', fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4169E1' }}>
                            Persönliche Daten
                        </Typography>
                    </Box>
                </Grid>

                {/* Vorname - 50% Breite auf Desktop (sm), volle Breite auf Mobil (xs) */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Vorname"
                        value={user.firstname || user.firstName || ''}  // Unterstützt verschiedene Feldnamen
                        InputProps={{ readOnly: true }}  // Nur-Lesen-Modus
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F5F7FA',  // Heller Hintergrund für Nur-Lesen-Felder
                            },
                        }}
                    />
                </Grid>

                {/* Nachname - 50% Breite auf Desktop */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Nachname"
                        value={user.lastname || user.lastName || ''}  // Unterstützt verschiedene Feldnamen
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F5F7FA',
                            },
                        }}
                    />
                </Grid>

                {/* Benutzername - Volle Breite mit @-Symbol */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Benutzername"
                        value={user.username || ''}
                        InputProps={{
                            readOnly: true,
                            // @-Symbol vor dem Benutzernamen anzeigen
                            startAdornment: <Typography sx={{ mr: 1, color: '#999' }}>@</Typography>
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F5F7FA',
                            },
                        }}
                    />
                </Grid>

                {/* Email - 50% Breite, blaue Schrift */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Email"
                        value={user.mail || user.email || ''}  // Unterstützt verschiedene Feldnamen
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F5F7FA',
                            },
                            '& .MuiOutlinedInput-input': {
                                color: '#4169E1',  // Email in Royal Blue hervorheben
                            },
                        }}
                    />
                </Grid>

                {/* Telefon - 50% Breite */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Telefon"
                        value={user.phone || ''}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F5F7FA',
                            },
                        }}
                    />
                </Grid>

                {/* ===== ORGANISATIONEN & ROLLEN ===== */}
                {/* Nur anzeigen, wenn Benutzer Organisationen hat */}
                {user.organisations && user.organisations.length > 0 && (
                    <>
                        <Grid item xs={12}>
                            {/* Trennlinie */}
                            <Divider sx={{ my: 2 }} />

                            {/* Überschrift mit Icon */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <BusinessIcon sx={{ color: '#4169E1', fontSize: 24 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4169E1' }}>
                                    Organisationen & Rollen
                                </Typography>
                            </Box>
                        </Grid>

                        {/* 
                            Durch alle Organisationen iterieren
                            Ein Benutzer kann mehrere Organisationen angehören,
                            und jede Organisation kann mehrere Rollen enthalten
                        */}
                        {user.organisations.map((org, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={12}>
                                    {/* Paper-Card für jede Organisation */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            border: '2px solid #4169E1',  // Blaue Umrandung
                                            borderRadius: 1.5,
                                            backgroundColor: '#F5F7FA',
                                            transition: 'all 0.3s ease',  // Sanfte Übergänge für Hover
                                            '&:hover': {
                                                backgroundColor: '#E8EEF7',  // Hellere Farbe bei Hover
                                                borderColor: '#2E4CB8',      // Dunklere Border bei Hover
                                            },
                                        }}
                                    >
                                        {/* Organisationsname */}
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#4169E1', mb: 1.5 }}>
                                            {org.orgName || 'Ohne Organisation'}
                                        </Typography>

                                        {/* 
                                            Rollen als Chips (farbige Badges) anzeigen
                                            Prüfen, ob Rollen vorhanden sind
                                        */}
                                        {org.roles && org.roles.length > 0 ? (
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                {/* Durch alle Rollen iterieren */}
                                                {org.roles.map((role, roleIndex) => (
                                                    <Chip
                                                        key={roleIndex}
                                                        label={role.roleName}  // Rollenname anzeigen
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#4169E1',  // Royal Blue
                                                            color: '#FFFFFF',            // Weiße Schrift
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            // Fallback, falls keine Rollen zugewiesen sind
                                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                                Keine Rollen zugewiesen
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            </React.Fragment>
                        ))}
                    </>
                )}

                {/* ===== STATUS-INFORMATION ===== */}
                {/* Nur anzeigen, wenn das 'deleted'-Feld vorhanden ist */}
                {user.deleted !== undefined && (
                    <>
                        <Grid item xs={12}>
                            {/* Trennlinie */}
                            <Divider sx={{ my: 2 }} />

                            {/* Überschrift */}
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4169E1', mb: 2 }}>
                                Status
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            {/* 
                                Status-Chip: Zeigt an, ob Benutzer aktiv oder gelöscht ist
                                - Grün für aktiv
                                - Rot für gelöscht
                            */}
                            <Chip
                                label={user.deleted ? 'Gelöscht' : 'Aktiv'}
                                color={user.deleted ? 'error' : 'success'}  // Rot für gelöscht, Grün für aktiv
                                variant="filled"
                                sx={{ fontWeight: 600, fontSize: 13 }}
                            />
                        </Grid>
                    </>
                )}

            </Grid>
        </Box>
    );
};

export default BenutzerDetail;
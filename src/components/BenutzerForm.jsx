/**
 * BENUTZERFORM.JSX - Formular zum Erstellen und Bearbeiten von Benutzern
 * 
 * Diese Komponente bietet:
 * - Formular für alle Benutzerfelder (Vorname, Nachname, Email, etc.)
 * - Validierung der Eingaben
 * - Erstellen neuer Benutzer
 * - Bearbeiten bestehender Benutzer
 * - Fehlerbehandlung und Erfolgsmeldungen
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Box,
    Alert,
    CircularProgress,
    Typography,
    Divider
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Business as BusinessIcon,
    Badge as BadgeIcon
} from '@mui/icons-material';
import userService from '../services/userService';

/**
 * BenutzerForm-Komponente
 * @param {boolean} open - Ob das Formular-Dialog geöffnet ist
 * @param {Function} onClose - Callback wenn Dialog geschlossen wird
 * @param {Function} onSuccess - Callback wenn Benutzer erfolgreich gespeichert wurde
 * @param {Object} editUser - Benutzer-Objekt zum Bearbeiten (null für neuen Benutzer)
 */
const BenutzerForm = ({ open, onClose, onSuccess, editUser = null }) => {
    // ========== STATE-VERWALTUNG ==========

    // Formular-Daten
    const [formData, setFormData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        mail: '',
        phone: '',
        organisation: '',
        role: ''
    });

    // Validierungsfehler für einzelne Felder
    const [errors, setErrors] = useState({});

    // Ladezustand während API-Anfrage
    const [loading, setLoading] = useState(false);

    // Allgemeine Fehlermeldung
    const [error, setError] = useState(null);

    // Erfolgsmeldung
    const [success, setSuccess] = useState(false);

    // ========== LIFECYCLE ==========

    /**
     * Wenn editUser sich ändert, Formular mit Benutzerdaten befüllen
     */
    useEffect(() => {
        if (editUser) {
            // Organisation und Rolle aus dem ersten Eintrag extrahieren, falls vorhanden
            const firstOrg = editUser.organisations && editUser.organisations.length > 0
                ? editUser.organisations[0]
                : null;

            setFormData({
                userUid: editUser.userUid || '',
                username: editUser.username || '',
                firstname: editUser.firstname || editUser.firstName || '',
                lastname: editUser.lastname || editUser.lastName || '',
                mail: editUser.mail || editUser.email || '',
                phone: editUser.phone || '',
                organisation: firstOrg?.orgName || '',
                role: firstOrg?.roles && firstOrg.roles.length > 0 ? firstOrg.roles[0].roleName : ''
            });
        } else {
            // Formular zurücksetzen für neuen Benutzer
            setFormData({
                username: '',
                firstname: '',
                lastname: '',
                mail: '',
                phone: '',
                organisation: '',
                role: ''
            });
        }
        setErrors({});
        setError(null);
        setSuccess(false);
    }, [editUser, open]);

    // ========== EVENT HANDLER ==========

    /**
     * Behandelt Änderungen in Eingabefeldern
     */
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Fehler für dieses Feld zurücksetzen
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    /**
     * Validiert das Formular
     * @returns {boolean} true wenn valide, false wenn Fehler vorhanden
     */
    const validateForm = () => {
        const newErrors = {};

        // Username ist Pflichtfeld
        if (!formData.username || formData.username.trim() === '') {
            newErrors.username = 'Benutzername ist erforderlich';
        }

        // Vorname ist Pflichtfeld
        if (!formData.firstname || formData.firstname.trim() === '') {
            newErrors.firstname = 'Vorname ist erforderlich';
        }

        // Nachname ist Pflichtfeld
        if (!formData.lastname || formData.lastname.trim() === '') {
            newErrors.lastname = 'Nachname ist erforderlich';
        }

        // Email-Validierung
        if (!formData.mail || formData.mail.trim() === '') {
            newErrors.mail = 'E-Mail ist erforderlich';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) {
            newErrors.mail = 'Ungültige E-Mail-Adresse';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Behandelt das Absenden des Formulars
     */
    const handleSubmit = async () => {
        // Validierung durchführen
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Entscheiden ob Create oder Update
            if (editUser && editUser.userUid) {
                // Update bestehender Benutzer
                await userService.updateUser(formData);
            } else {
                // Neuen Benutzer erstellen
                await userService.createUser(formData);
            }

            setSuccess(true);

            // Nach erfolgreicher Speicherung Callback aufrufen und Dialog schließen
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 1000);
        } catch (err) {
            console.error('Fehler beim Speichern:', err);
            setError(
                err.response?.data?.message ||
                'Fehler beim Speichern des Benutzers. Bitte versuchen Sie es erneut.'
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Schließt den Dialog und setzt alle Zustände zurück
     */
    const handleClose = () => {
        setFormData({
            username: '',
            firstname: '',
            lastname: '',
            mail: '',
            phone: '',
            organisation: '',
            role: ''
        });
        setErrors({});
        setError(null);
        setSuccess(false);
        onClose();
    };

    // ========== RENDER ==========

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            {/* Dialog-Titel */}
            <DialogTitle sx={{
                backgroundColor: '#4169E1',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '1.25rem'
            }}>
                <PersonIcon />
                {editUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
            </DialogTitle>

            {/* Dialog-Inhalt */}
            <DialogContent sx={{ mt: 2 }}>
                {/* Erfolgsmeldung */}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Benutzer wurde erfolgreich gespeichert!
                    </Alert>
                )}

                {/* Fehlermeldung */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Formular-Grid */}
                <Grid container spacing={2}>
                    {/* Benutzername */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            name="username"
                            label="Benutzername"
                            value={formData.username}
                            onChange={handleChange}
                            error={!!errors.username}
                            helperText={errors.username}
                            disabled={loading || !!editUser} // Beim Bearbeiten nicht änderbar
                            InputProps={{
                                startAdornment: (
                                    <Typography sx={{ mr: 1, color: '#999' }}>@</Typography>
                                )
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonIcon sx={{ color: '#4169E1', fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ color: '#4169E1', fontWeight: 600 }}>
                                Persönliche Daten
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Vorname */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            required
                            name="firstname"
                            label="Vorname"
                            value={formData.firstname}
                            onChange={handleChange}
                            error={!!errors.firstname}
                            helperText={errors.firstname}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Nachname */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            required
                            name="lastname"
                            label="Nachname"
                            value={formData.lastname}
                            onChange={handleChange}
                            error={!!errors.lastname}
                            helperText={errors.lastname}
                            disabled={loading}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <EmailIcon sx={{ color: '#4169E1', fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ color: '#4169E1', fontWeight: 600 }}>
                                Kontaktdaten
                            </Typography>
                        </Box>
                    </Grid>

                    {/* E-Mail */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            name="mail"
                            label="E-Mail"
                            type="email"
                            value={formData.mail}
                            onChange={handleChange}
                            error={!!errors.mail}
                            helperText={errors.mail}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <EmailIcon sx={{ mr: 1, color: '#999', fontSize: 20 }} />
                                )
                            }}
                        />
                    </Grid>

                    {/* Telefon (optional) */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="phone"
                            label="Telefon (optional)"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <PhoneIcon sx={{ mr: 1, color: '#999', fontSize: 20 }} />
                                )
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <BusinessIcon sx={{ color: '#4169E1', fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ color: '#4169E1', fontWeight: 600 }}>
                                Organisation & Rolle
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Organisation */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            name="organisation"
                            label="Organisation"
                            value={formData.organisation}
                            onChange={handleChange}
                            disabled={loading}
                            SelectProps={{
                                native: true,
                            }}
                            InputProps={{
                                startAdornment: (
                                    <BusinessIcon sx={{ mr: 1, color: '#999', fontSize: 20 }} />
                                )
                            }}
                        >
                            <option value="">-- Bitte wählen --</option>
                            <option value="IT.NRW">IT.NRW</option>
                            <option value="Land NRW Fachbereich 1">Land NRW Fachbereich 1</option>
                            <option value="Stadt Musterstadt">Stadt Musterstadt</option>
                            <option value="Private Geo Firma GmbH">Private Geo Firma GmbH</option>
                            <option value="Test Unternehmen GmbH">Test Unternehmen GmbH</option>
                        </TextField>
                    </Grid>

                    {/* Rolle */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            name="role"
                            label="Rolle"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={loading}
                            SelectProps={{
                                native: true,
                            }}
                            InputProps={{
                                startAdornment: (
                                    <BadgeIcon sx={{ mr: 1, color: '#999', fontSize: 20 }} />
                                )
                            }}
                        >
                            <option value="">-- Bitte wählen --</option>
                            <option value="ADMIN">Admin</option>
                            <option value="USER">User</option>
                            <option value="VIEWER">Viewer</option>
                        </TextField>
                    </Grid>
                </Grid>
            </DialogContent>

            {/* Dialog-Aktionen */}
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    startIcon={<CloseIcon />}
                    sx={{ color: '#666' }}
                >
                    Abbrechen
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                    {loading ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BenutzerForm;

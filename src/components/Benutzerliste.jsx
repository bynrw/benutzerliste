/**
 * BENUTZERLISTE.JSX - Haupt-Tabellen-Komponente
 * 
 * Diese Komponente verwaltet:
 * - Anzeige aller Benutzer in einer Tabelle
 * - Suchfunktion nach Name/Email/Benutzername
 * - Filterung nach Organisationen
 * - Anzeige von Benutzerdetails in einem Modal
 * - Löschen von Benutzern mit Bestätigungsdialog
 * - Kommunikation mit dem Backend über userService
 */

import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Box,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    InputAdornment,
    Tooltip,
    Chip,
    Typography
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Search as SearchIcon, Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import userService from '../services/userService';
import BenutzerDetail from './BenutzerDetail';
import BenutzerForm from './BenutzerForm';

const Benutzerliste = () => {
    // ========== STATE-VERWALTUNG ==========

    // Benutzerdaten aus dem Backend
    const [users, setUsers] = useState([]);

    // Ladezustand während API-Anfragen
    const [loading, setLoading] = useState(false);

    // Fehlermeldungen für API-Fehler
    const [error, setError] = useState(null);

    // Suchbegriff für Name/Email-Suche
    const [searchTerm, setSearchTerm] = useState('');

    // Ausgewählte Organisation für Filterung
    const [organisationFilter, setOrganisationFilter] = useState('');

    // Aktuell ausgewählter Benutzer für Detailansicht
    const [selectedUser, setSelectedUser] = useState(null);

    // Status des Detail-Dialogs (offen/geschlossen)
    const [detailOpen, setDetailOpen] = useState(false);

    // Status des Lösch-Bestätigungsdialogs
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // ID des zu löschenden Benutzers
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // Liste aller verfügbaren Organisationen (für Filter-Dropdown)
    const [organisations, setOrganisations] = useState([]);

    // Status des Formular-Dialogs (offen/geschlossen)
    const [formOpen, setFormOpen] = useState(false);

    // Benutzer für Bearbeitung (null = neuer Benutzer erstellen)
    const [editingUser, setEditingUser] = useState(null);

    // ========== LIFECYCLE & INITIALISIERUNG ==========

    /**
     * useEffect: Wird beim ersten Laden der Komponente ausgeführt
     * - Lädt alle Benutzer vom Backend
     * - Extrahiert die verfügbaren Organisationen
     */
    useEffect(() => {
        fetchUsers();              // Benutzer vom Backend laden
        extractOrganisations();    // Organisationen aus Benutzern extrahieren
    }, []); // Leeres Array [] bedeutet: nur einmal beim Komponentenstart ausführen

    // ========== API-KOMMUNIKATION ==========

    /**
     * Benutzer vom Backend laden
     * @param {Object} params - Optionale Suchparameter für die API
     * 
     * Diese Funktion:
     * 1. Setzt den Ladezustand
     * 2. Ruft die API über userService auf
     * 3. Verarbeitet verschiedene Antwortformate (HAL, Array, Content)
     * 4. Extrahiert und speichert die Benutzerdaten
     * 5. Extrahiert die Organisationen für den Filter
     */
    const fetchUsers = async (params = {}) => {
        setLoading(true);   // Ladeanimation anzeigen
        setError(null);     // Vorherige Fehler löschen

        try {
            // API-Aufruf über userService
            const response = await userService.getUsers(params);
            console.log('API Response:', response);

            // ===== Verschiedene API-Antwortformate verarbeiten =====
            // Das Backend kann Daten in verschiedenen Formaten zurückgeben:
            let userList = [];

            // Format 1: HAL-Format (Spring Data REST Standard)
            if (response._embedded && response._embedded.users) {
                userList = response._embedded.users;
            }
            // Format 2: Direktes Array
            else if (Array.isArray(response)) {
                userList = response;
            }
            // Format 3: Paginated Response mit 'content'-Array
            else if (response.content && Array.isArray(response.content)) {
                userList = response.content;
            }

            console.log('Extracted users:', userList);
            // Sicherstellen, dass wir ein Array haben
            setUsers(Array.isArray(userList) ? userList : []);

            // ===== Organisationen extrahieren =====
            // Nach dem Laden der Benutzer alle einzigartigen Organisationen sammeln
            if (Array.isArray(userList) && userList.length > 0) {
                const orgSet = new Set();  // Set verhindert Duplikate

                userList.forEach(user => {
                    // Jeder Benutzer kann mehrere Organisationen haben
                    if (user.organisations && Array.isArray(user.organisations)) {
                        user.organisations.forEach(org => {
                            if (org.orgName) {
                                orgSet.add(org.orgName);  // Organisation hinzufügen
                            }
                        });
                    }
                });

                // Set in Array umwandeln und alphabetisch sortieren
                setOrganisations(Array.from(orgSet).sort());
            }
        } catch (err) {
            // Fehlerbehandlung
            setError('Fehler beim Laden der Benutzer');
            console.error('Error details:', err.response?.data || err.message);
        } finally {
            // Ladezustand beenden (egal ob Erfolg oder Fehler)
            setLoading(false);
        }
    };

    /**
     * Organisationen aus geladenen Benutzern extrahieren
     * 
     * Diese Hilfsfunktion wird nach dem Laden der Benutzer aufgerufen,
     * um alle einzigartigen Organisationen zu sammeln.
     * 
     * Hinweis: setTimeout mit 0ms stellt sicher, dass die Benutzer
     * bereits im State sind, bevor wir sie verarbeiten.
     */
    const extractOrganisations = () => {
        setTimeout(() => {
            const orgSet = new Set();  // Set für einzigartige Werte

            users.forEach(user => {
                // Durch alle Organisationen des Benutzers iterieren
                if (user.organisations && Array.isArray(user.organisations)) {
                    user.organisations.forEach(org => {
                        if (org.orgName) {
                            orgSet.add(org.orgName);  // Zur Liste hinzufügen
                        }
                    });
                }
            });

            // Als sortiertes Array speichern
            setOrganisations(Array.from(orgSet).sort());
        }, 0);
    };

    // ========== SUCH- UND FILTER-FUNKTIONEN ==========

    /**
     * Handler für Name/Email/Benutzername-Suche
     * @param {Event} e - Input-Change-Event
     * 
     * Wird bei jeder Eingabe im Suchfeld aufgerufen und
     * wendet die Filter auf die Benutzerliste an.
     */
    const handleNameSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);                          // Suchbegriff speichern
        applyFilters(value, organisationFilter);       // Filter anwenden
    };

    /**
     * Handler für Organisations-Filter
     * @param {Event} e - Select-Change-Event
     * 
     * Wird aufgerufen, wenn eine Organisation im Dropdown ausgewählt wird.
     */
    const handleOrganisationFilter = (e) => {
        const value = e.target.value;
        setOrganisationFilter(value);          // Ausgewählte Organisation speichern
        applyFilters(searchTerm, value);       // Filter anwenden
    };

    /**
     * Beide Filter gleichzeitig anwenden
     * @param {string} nameFilter - Suchbegriff für Name/Email/Username
     * @param {string} orgFilter - Ausgewählte Organisation
     * 
     * Diese Funktion kombiniert beide Filter:
     * 1. Suche nach Name/Email/Username (Case-insensitive)
     * 2. Filterung nach Organisation
     * 
     * WICHTIG: Filter werden CLIENT-SEITIG angewendet!
     * Das bedeutet, die Filterung findet im Browser statt,
     * nicht auf dem Server. Bei großen Datenmengen könnte
     * eine Server-seitige Filterung effizienter sein.
     */
    const applyFilters = (nameFilter, orgFilter) => {
        // Wenn keine Filter aktiv sind, alle Benutzer neu laden
        if (!nameFilter && !orgFilter) {
            fetchUsers();
            return;
        }

        // Kopie der Benutzerliste für Filterung
        let filtered = users;

        // ===== Name/Email/Username-Filter =====
        if (nameFilter) {
            const searchLower = nameFilter.toLowerCase();  // Kleinbuchstaben für Case-Insensitive-Suche

            filtered = filtered.filter(user =>
                // Suche in verschiedenen Feldern (Vorname, Nachname, Username, Email)
                (user.firstname && user.firstname.toLowerCase().includes(searchLower)) ||
                (user.lastname && user.lastname.toLowerCase().includes(searchLower)) ||
                (user.username && user.username.toLowerCase().includes(searchLower)) ||
                (user.mail && user.mail.toLowerCase().includes(searchLower))
            );
        }

        // ===== Organisations-Filter =====
        if (orgFilter) {
            filtered = filtered.filter(user =>
                // Prüfen, ob Benutzer zur ausgewählten Organisation gehört
                user.organisations &&
                user.organisations.some(org => org.orgName === orgFilter)
            );
        }

        // Gefilterte Liste im State speichern
        setUsers(filtered);
    };

    // ========== DETAIL-ANSICHT FUNKTIONEN ==========

    /**
     * Benutzerdetails in Modal anzeigen
     * @param {string} userId - UUID des anzuzeigenden Benutzers
     * 
     * Diese Funktion:
     * 1. Lädt vollständige Benutzerdaten vom Backend
     * 2. Öffnet das Detail-Modal
     * 3. Zeigt die Daten in der BenutzerDetail-Komponente an
     */
    const handleViewDetails = async (userId) => {
        try {
            // Vollständige Benutzerdaten vom Backend abrufen
            const response = await userService.getUserById(userId);

            // HAL-Format auspacken, falls nötig
            const userData = response.content || response;

            // Benutzer speichern und Modal öffnen
            setSelectedUser(userData);
            setDetailOpen(true);
        } catch (err) {
            // Fehlerbehandlung
            setError('Fehler beim Laden der Benutzerdetails');
        }
    };

    /**
     * Detail-Modal schließen und State zurücksetzen
     */
    const handleCloseDetail = () => {
        setDetailOpen(false);      // Modal schließen
        setSelectedUser(null);     // Ausgewählten Benutzer zurücksetzen
    };

    // ========== LÖSCH-FUNKTIONEN ==========

    /**
     * Lösch-Bestätigungsdialog öffnen
     * @param {string} userId - UUID des zu löschenden Benutzers
     * 
     * Öffnet einen Bestätigungsdialog, bevor der Benutzer
     * tatsächlich gelöscht wird (Best Practice: Sicherheitsabfrage)
     */
    const handleOpenDeleteDialog = (userId) => {
        setDeleteTargetId(userId);      // Benutzer-ID speichern
        setDeleteDialogOpen(true);      // Bestätigungsdialog öffnen
    };

    /**
     * Lösch-Bestätigungsdialog schließen ohne zu löschen
     */
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);  // Dialog schließen
        setDeleteTargetId(null);     // ID zurücksetzen
    };

    /**
     * Benutzer endgültig löschen (nach Bestätigung)
     * 
     * Diese Funktion:
     * 1. Sendet DELETE-Request an Backend
     * 2. Entfernt Benutzer aus der lokalen Liste (UI-Update)
     * 3. Schließt den Bestätigungsdialog
     * 4. Zeigt Fehlermeldung bei Problemen
     */
    const handleConfirmDelete = async () => {
        try {
            // API-Aufruf zum Löschen
            await userService.deleteUser(deleteTargetId);

            // Benutzer aus der lokalen Liste entfernen (sofortiges UI-Update)
            setUsers(users.filter(user => user.userUid !== deleteTargetId));

            // Dialog schließen
            handleCloseDeleteDialog();

            // Vorherige Fehler löschen
            setError(null);
        } catch (err) {
            // Fehlerbehandlung
            setError('Fehler beim Löschen des Benutzers');
            console.error(err);
        }
    };

    // ========== CREATE/EDIT-FUNKTIONEN ==========

    /**
     * Formular zum Erstellen eines neuen Benutzers öffnen
     */
    const handleOpenCreateForm = () => {
        setEditingUser(null);  // Kein Benutzer = Create-Modus
        setFormOpen(true);     // Formular öffnen
    };

    /**
     * Formular zum Bearbeiten eines Benutzers öffnen
     * @param {Object} user - Zu bearbeitender Benutzer
     */
    const handleOpenEditForm = (user) => {
        setEditingUser(user);  // Benutzer setzen = Edit-Modus
        setFormOpen(true);     // Formular öffnen
    };

    /**
     * Formular schließen und State zurücksetzen
     */
    const handleCloseForm = () => {
        setFormOpen(false);    // Formular schließen
        setEditingUser(null);  // Benutzer zurücksetzen
    };

    /**
     * Nach erfolgreichem Speichern: Benutzerliste neu laden
     */
    const handleFormSuccess = () => {
        fetchUsers();  // Benutzerliste neu laden
        handleCloseForm();
    };

    if (loading && users.length === 0) {
        return <CircularProgress />;
    }

    return (
        <>
            {/* Filter Card mit "Neuer Benutzer"-Button */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Card sx={{ flex: 1, p: 3, background: 'linear-gradient(135deg, #F5F7FA 0%, #FFFFFF 100%)', borderLeft: '4px solid #4169E1' }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Benutzer suchen"
                            placeholder="Name, Email, Benutzername..."
                            value={searchTerm}
                            onChange={handleNameSearch}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#4169E1', mr: 1 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <Tooltip title="Filter löschen">
                                            <Button
                                                size="small"
                                                onClick={() => handleNameSearch({ target: { value: '' } })}
                                                sx={{ minWidth: 'auto', p: 0 }}
                                            >
                                                <CloseIcon sx={{ fontSize: 18 }} />
                                            </Button>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#4169E1',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#4169E1',
                                        boxShadow: '0 0 0 3px rgba(65, 105, 225, 0.1)',
                                    },
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            select
                            label="Nach Organisation filtern"
                            value={organisationFilter}
                            onChange={handleOrganisationFilter}
                            variant="outlined"
                            size="small"
                            SelectProps={{
                                native: true,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#4169E1',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#4169E1',
                                        boxShadow: '0 0 0 3px rgba(65, 105, 225, 0.1)',
                                    },
                                },
                            }}
                        >
                            <option value="">Alle Organisationen</option>
                            {organisations.map((org) => (
                                <option key={org} value={org}>
                                    {org}
                                </option>
                            ))}
                        </TextField>
                    </Box>
                </Card>

                {/* Button "Neuer Benutzer" */}
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateForm}
                        sx={{
                            height: '100%',
                            minHeight: 56,
                            px: 3,
                            background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #45A049 0%, #388E3C 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Neuer Benutzer
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: 1 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            {loading && users.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#4169E1' }} />
                </Box>
            ) : (
                <TableContainer
                    component={Paper}
                    sx={{
                        boxShadow: '0 4px 12px rgba(65, 105, 225, 0.12)',
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    <Table sx={{ minWidth: 750 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#4169E1' }}>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Benutzername</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Vorname</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Nachname</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Email</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Organisation</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Rolle</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Aktionen</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#9E9E9E' }}>
                                        <Box sx={{ fontSize: 14 }}>Keine Benutzer gefunden</Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user, index) => {
                                    // Get first organization and its first role
                                    const firstOrg = user.organisations && user.organisations.length > 0 ? user.organisations[0] : null;
                                    const orgName = firstOrg ? firstOrg.orgName : '-';
                                    const firstRole = firstOrg && firstOrg.roles && firstOrg.roles.length > 0 ? firstOrg.roles[0].roleName : '-';

                                    return (
                                        <TableRow
                                            key={user.userUid}
                                            hover
                                            sx={{
                                                backgroundColor: index % 2 === 0 ? '#F5F7FA' : '#FFFFFF',
                                                '&:hover': {
                                                    backgroundColor: '#E8EEF7',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 600, color: '#4169E1' }}>@{user.username || '-'}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{user.firstname || user.firstName || '-'}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{user.lastname || user.lastName || '-'}</TableCell>
                                            <TableCell sx={{ color: '#4169E1', fontSize: 13 }}>{user.mail || user.email || '-'}</TableCell>
                                            <TableCell sx={{ fontSize: 13 }}>{orgName}</TableCell>
                                            <TableCell>
                                                {firstRole !== '-' && (
                                                    <Chip
                                                        label={firstRole}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#4169E1',
                                                            color: '#FFFFFF',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                )}
                                                {firstRole === '-' && (
                                                    <Typography variant="body2" sx={{ color: '#9E9E9E' }}>-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Details anzeigen">
                                                        <Button
                                                            size="small"
                                                            startIcon={<VisibilityIcon />}
                                                            onClick={() => handleViewDetails(user.userUid)}
                                                            variant="outlined"
                                                            sx={{
                                                                color: '#4169E1',
                                                                borderColor: '#4169E1',
                                                                '&:hover': {
                                                                    backgroundColor: '#E8EEF7',
                                                                    borderColor: '#2E4CB8',
                                                                },
                                                            }}
                                                        >
                                                            Details
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Benutzer bearbeiten">
                                                        <Button
                                                            size="small"
                                                            startIcon={<EditIcon />}
                                                            onClick={() => handleOpenEditForm(user)}
                                                            variant="outlined"
                                                            sx={{
                                                                color: '#FF9800',
                                                                borderColor: '#FF9800',
                                                                '&:hover': {
                                                                    backgroundColor: '#FFF3E0',
                                                                    borderColor: '#F57C00',
                                                                },
                                                            }}
                                                        >
                                                            Bearbeiten
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Benutzer löschen">
                                                        <Button
                                                            size="small"
                                                            startIcon={<DeleteIcon />}
                                                            color="error"
                                                            variant="outlined"
                                                            onClick={() => handleOpenDeleteDialog(user.userUid)}
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: '#FFEBEE',
                                                                },
                                                            }}
                                                        >
                                                            Löschen
                                                        </Button>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Detail View Modal */}
            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ background: 'linear-gradient(135deg, #4169E1 0%, #2E4CB8 100%)', color: '#FFFFFF', fontWeight: 700 }}>
                    Benutzerdetails
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedUser && <BenutzerDetail user={selectedUser} />}
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #E0E0E0', p: 2 }}>
                    <Button onClick={handleCloseDetail} sx={{ color: '#666' }}>
                        Schließen
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle sx={{ fontWeight: 700, color: '#D32F2F' }}>
                    Benutzer löschen?
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={{ color: '#666' }}>
                        Abbrechen
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)' }}>
                        Löschen
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Formular für Create/Edit */}
            <BenutzerForm
                open={formOpen}
                onClose={handleCloseForm}
                onSuccess={handleFormSuccess}
                editUser={editingUser}
            />
        </>
    );
};

export default Benutzerliste;

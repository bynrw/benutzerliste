/**
 * USER SERVICE - API-Kommunikationsschicht
 * 
 * Diese Datei verwaltet alle HTTP-Anfragen zum Backend:
 * - CRUD-Operationen für Benutzer (Create, Read, Update, Delete)
 * - Axios-Konfiguration mit CORS-Unterstützung
 * - Fehlerbehandlung für API-Aufrufe
 */

import axios from 'axios';

// Basis-URL des Spring Boot Backend-Servers
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Konfigurierte Axios-Instanz für API-Anfragen
 * - baseURL: Automatisches Voranstellen der API-URL bei allen Anfragen
 * - headers: JSON-Content-Type für Request und Response
 * - withCredentials: Ermöglicht das Senden von Cookies für CORS-Anfragen
 */
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',  // Daten als JSON senden
        'Accept': 'application/json'          // JSON-Antworten erwarten
    },
    withCredentials: true  // Wichtig für Cross-Origin-Requests mit Authentifizierung
});

/**
 * UserService-Objekt mit allen API-Methoden für Benutzerverwaltung
 */
const userService = {
    /**
     * Alle Benutzer abrufen mit optionalen Suchparametern
     * @param {Object} searchParams - Optional: Filter-Parameter für die Suche
     * @returns {Promise} Promise mit Benutzerdaten vom Server
     */
    getUsers: async (searchParams = {}) => {
        try {
            // GET-Request an /api/users mit optionalen Query-Parametern
            const response = await axiosInstance.get('/users', {
                params: searchParams  // z.B. ?name=Max&organisation=IT
            });
            return response.data;  // Gibt die Benutzerliste zurück
        } catch (error) {
            console.error('Fehler beim Abrufen der Benutzer:', error);
            throw error;  // Fehler wird an aufrufende Komponente weitergegeben
        }
    },

    /**
     * Einzelnen Benutzer anhand der UUID abrufen
     * @param {string} userUid - Eindeutige Benutzer-ID (UUID)
     * @returns {Promise} Promise mit Benutzerdetails
     */
    getUserById: async (userUid) => {
        try {
            // GET-Request an /api/users/{userUid}
            const response = await axiosInstance.get(`/users/${userUid}`);
            return response.data;  // Gibt detaillierte Benutzerdaten zurück
        } catch (error) {
            console.error(`Fehler beim Abrufen von Benutzer ${userUid}:`, error);
            throw error;
        }
    },

    /**
     * Neuen Benutzer erstellen
     * @param {Object} userData - Benutzerdaten (firstname, lastname, email, etc.)
     * @returns {Promise} Promise mit dem erstellten Benutzer
     */
    createUser: async (userData) => {
        try {
            console.log('Sending POST request to /users with data:', userData);
            // POST-Request an /api/users mit Benutzerdaten im Body
            const response = await axiosInstance.post('/users', userData);
            console.log('Create user response:', response);
            return response.data;  // Gibt den neu erstellten Benutzer zurück
        } catch (error) {
            console.error('Fehler beim Erstellen des Benutzers:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            throw error;
        }
    },

    /**
     * Bestehenden Benutzer aktualisieren
     * @param {Object} userData - Aktualisierte Benutzerdaten (muss userUid enthalten)
     * @returns {Promise} Promise mit dem aktualisierten Benutzer
     */
    updateUser: async (userData) => {
        try {
            // PUT-Request an /api/users mit vollständigen Benutzerdaten
            const response = await axiosInstance.put('/users', userData);
            return response.data;  // Gibt den aktualisierten Benutzer zurück
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Benutzers:', error);
            throw error;
        }
    },

    /**
     * Benutzer löschen
     * @param {string} userUid - UUID des zu löschenden Benutzers
     * @returns {Promise} Promise mit Bestätigung des Löschvorgangs
     */
    deleteUser: async (userUid) => {
        try {
            // DELETE-Request an /api/users/{userUid}
            const response = await axiosInstance.delete(`/users/${userUid}`);
            return response.data;  // Gibt Bestätigung zurück
        } catch (error) {
            console.error(`Fehler beim Löschen von Benutzer ${userUid}:`, error);
            throw error;
        }
    }
};

export default userService;

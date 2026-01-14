/**
 * BlueMindsAPI Service Provider
 * Comprehensive handler for Authentication, Therapy Sessions, and Game Analytics.
 * @author Neuro-BlueMinds Team
 * @version 2.2.0
 */

const KOYEB_URL = 'https://crude-sailfish-blueminds-65b642e8.koyeb.app/api'; 
const LOCAL_URL = 'http://localhost:8000/api';

class BlueMindsAPI {
  constructor() {
    /** @type {string} Dynamic Base URL selection */
    //this.baseURL = window.location.hostname.includes('github.io') ? KOYEB_URL : LOCAL_URL;
    this.baseURL = KOYEB_URL ;
    /** @type {Object|null} Session User Data */
    this.currentUser = this._loadUser();
    
    /** @type {string|null} JWT Security Token */
    this.token = localStorage.getItem('blueminds_token');
  }

  /**
   * Internal helper to generate authorized headers.
   * @private
   */
  _getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // ========================================================================
  // AUTHENTICATION MODULE
  // ========================================================================

  async register(name, age, email, country, password, confirmPassword) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age: parseInt(age), email, country, password, confirmPassword })
    });
    return this._handleAuthResponse(response);
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return this._handleAuthResponse(response);
  }

  async loginWithGoogle(googleCredential) {
    const response = await fetch(`${this.baseURL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleCredential })
    });
    return this._handleAuthResponse(response);
  }

  /**
   * Core logic to process authentication responses and persist session.
   * @private
   */
  async _handleAuthResponse(response) {
    const data = await response.json();
    
    // Improved error handling: capture backend error messages precisely
    if (!response.ok) {
      const errorMsg = data.error || `Error ${response.status}: Authentication Failed`;
      throw new Error(errorMsg);
    }

    this.currentUser = data.user;
    this.token = data.token;
    
    // Persist session to LocalStorage
    localStorage.setItem('blueminds_current_user', JSON.stringify(data.user));
    localStorage.setItem('blueminds_token', data.token);
    
    return data;
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.clear();
    window.location.href = '/login.html';
  }

  // ========================================================================
  // GAME PROGRESS MODULE
  // ========================================================================

  async getGameProgress(userId) {
    try {
      const response = await fetch(`${this.baseURL}/progress/${userId}`, {
        headers: this._getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch progress');
      return await response.json();
    } catch (error) {
      console.error('[API Error]:', error);
      return [];
    }
  }

  async getGameProgressById(userId, gameId) {
    try {
      const response = await fetch(`${this.baseURL}/progress/${userId}/${gameId}`, {
        headers: this._getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch specific game progress');
      return await response.json();
    } catch (error) {
      console.error('[API Error]:', error);
      return null;
    }
  }

  async updateGameProgress(userId, gameId, gameTitle, score, level, maxLevel, completionPercentage, timePlayed = 0) {
    const response = await fetch(`${this.baseURL}/progress/update`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({
        userId, gameId, gameTitle,
        score: parseInt(score),
        level: parseInt(level),
        maxLevel: parseInt(maxLevel),
        completionPercentage: parseFloat(completionPercentage),
        timePlayed: parseInt(timePlayed)
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update progress');
    return data;
  }

  // ========================================================================
  // THERAPY SESSIONS MODULE
  // ========================================================================

  async saveTherapySession(userId, gameId, duration, performance, notes = '') {
    const response = await fetch(`${this.baseURL}/therapy-session`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({
        userId, gameId,
        duration: parseInt(duration),
        performance, notes
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to save therapy session');
    return data;
  }

  async getTherapySessions(userId) {
    try {
      const response = await fetch(`${this.baseURL}/therapy-sessions/${userId}`, {
        headers: this._getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch therapy sessions');
      return await response.json();
    } catch (error) {
      console.error('[API Error]:', error);
      return [];
    }
  }

  // ========================================================================
  // ANALYTICS & SYSTEM
  // ========================================================================

  async getUserStats(userId) {
    try {
      const response = await fetch(`${this.baseURL}/stats/${userId}`, {
        headers: this._getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return await response.json();
    } catch (error) {
      console.error('[API Error]:', error);
      return { totalGamesStarted: 0, totalGamesSessions: 0, totalTimeSpent: 0, averageCompletion: 0, maxCompletion: 0 };
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch { return false; }
  }

  getCurrentUser() { return this.currentUser; }

  _loadUser() {
    const stored = localStorage.getItem('blueminds_current_user');
    return stored ? JSON.parse(stored) : null;
  }
}

const api = new BlueMindsAPI();
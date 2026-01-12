// api.js
// Este archivo maneja todas las llamadas a la API del servidor

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'http://tu-ip-servidor:3000/api' 
  : 'http://localhost:3000/api';

// Configurar la URL del servidor (cambiar según sea necesario)
const SERVER_URL = 'http://192.168.1.14 :3000'; // Cambiar a la IP de tu servidor por el momento es la lap

class BlueMindsAPI {
  constructor() {
    this.baseURL = `${SERVER_URL}/api`;
    this.currentUser = this.loadUser();
  }

  // ==================== AUTENTICACIÓN ====================

  async register(name, age, email, country, password, confirmPassword) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          age: parseInt(age),
          email,
          country,
          password,
          confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      // Guardar usuario en localStorage
      this.currentUser = data.user;
      localStorage.setItem('blueminds_current_user', JSON.stringify(data.user));
      localStorage.setItem('blueminds_token', JSON.stringify(data.user.id));

      return data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar usuario en localStorage
      this.currentUser = data.user;
      localStorage.setItem('blueminds_current_user', JSON.stringify(data.user));
      localStorage.setItem('blueminds_token', JSON.stringify(data.user.id));

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('blueminds_current_user');
    localStorage.removeItem('blueminds_token');
  }

  getCurrentUser() {
    return this.currentUser;
  }

  loadUser() {
    const stored = localStorage.getItem('blueminds_current_user');
    return stored ? JSON.parse(stored) : null;
  }

  // ==================== PROGRESO EN JUEGOS ====================

  async getGameProgress(userId) {
    try {
      const response = await fetch(`${this.baseURL}/progress/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener progreso');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener progreso:', error);
      return [];
    }
  }

  async getGameProgressById(userId, gameId) {
    try {
      const response = await fetch(`${this.baseURL}/progress/${userId}/${gameId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener progreso del juego');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener progreso del juego:', error);
      return null;
    }
  }

  async updateGameProgress(userId, gameId, gameTitle, score, level, maxLevel, completionPercentage, timePlayed = 0) {
    try {
      const response = await fetch(`${this.baseURL}/progress/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          gameId,
          gameTitle,
          score: parseInt(score),
          level: parseInt(level),
          maxLevel: parseInt(maxLevel),
          completionPercentage: parseFloat(completionPercentage),
          timePlayed: parseInt(timePlayed)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar progreso');
      }

      return data;
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
      throw error;
    }
  }

  // ==================== SESIONES DE TERAPIA ====================

  async saveTherapySession(userId, gameId, duration, performance, notes = '') {
    try {
      const response = await fetch(`${this.baseURL}/therapy-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          gameId,
          duration: parseInt(duration),
          performance,
          notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar sesión');
      }

      return data;
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      throw error;
    }
  }

  async getTherapySessions(userId) {
    try {
      const response = await fetch(`${this.baseURL}/therapy-sessions/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener sesiones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      return [];
    }
  }

  // ==================== ESTADÍSTICAS ====================

  async getUserStats(userId) {
    try {
      const response = await fetch(`${this.baseURL}/stats/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        totalGamesStarted: 0,
        totalGamesSessions: 0,
        totalTimeSpent: 0,
        averageCompletion: 0,
        maxCompletion: 0
      };
    }
  }

  // ==================== HEALTH CHECK ====================

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET'
      });

      return response.ok;
    } catch (error) {
      console.error('Servidor no disponible:', error);
      return false;
    }
  }
}

// Crear instancia global
const api = new BlueMindsAPI();
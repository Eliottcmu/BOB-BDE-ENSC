// services/auth.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const loginUser = async (credentials) => {
    try {
        // Assurez-vous que ces champs correspondent à ceux attendus par le backend
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            name: credentials.name,
            password: credentials.password
        });

        const { token, user } = response.data;

        if (!token || !user) {
            throw new Error('Réponse invalide du serveur');
        }

        // Stockage des informations d'authentification
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        }));

        return user;
    } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
            // Erreur avec réponse du serveur
            throw new Error(error.response.data || 'Identifiants invalides');
        } else if (error.request) {
            // Erreur sans réponse du serveur
            throw new Error('Le serveur ne répond pas. Veuillez réessayer plus tard.');
        } else {
            // Autre type d'erreur
            throw new Error('Une erreur est survenue lors de la connexion');
        }
    }
};

// Création d'une instance axios avec intercepteur pour les tokens
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expiré ou invalide
            logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const isAdmin = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.isAdmin === true;
    } catch {
        return false;
    }
};

export const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

export default axiosInstance;
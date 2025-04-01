import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:5000/api';

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            name: credentials.name,
            password: credentials.password
        });

        const { token, user } = response.data;

        if (!token || !user) {
            throw new Error('Réponse invalide du serveur');
        }

        // Stockage du token et des informations utilisateur dans les cookies
        Cookies.set('token', token, { expires: 7, sameSite: 'Lax' });

        Cookies.set('user', JSON.stringify({ id: user.id, isAdmin: user.isAdmin }), { expires: 7 });

        return user;
    } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
            throw new Error(error.response.data || 'Identifiants invalides');
        } else if (error.request) {
            throw new Error('Le serveur ne répond pas. Veuillez réessayer plus tard.');
        } else {
            throw new Error('Une erreur est survenue lors de la connexion');
        }
    }
};

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    config => {
        const token = Cookies.get('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
        if (error.response?.status === 401) {
            // En cas d'erreur d'authentification, déconnecter et rediriger
            logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
};

export const isAuthenticated = () => {
    return !!Cookies.get('token');
};

export const isAdmin = () => {
    try {
        const userCookie = Cookies.get('user');
        if (!userCookie) return false;
        const user = JSON.parse(userCookie);
        return user?.isAdmin === true;
    } catch {
        return false;
    }
};

export const getCurrentUser = () => {
    try {
        const userCookie = Cookies.get('user');
        if (!userCookie) return null;
        return JSON.parse(userCookie);
    } catch {
        return null;
    }
};

export default axiosInstance;

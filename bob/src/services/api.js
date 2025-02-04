// import axios from 'axios';
import axiosInstance from './auth';

const BASE_URL = 'http://localhost:5000/api';

export const getUsers = async () => {
    try {
        const response = await axiosInstance.get('/users');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        throw error;
    }
};
export const getUser = async (userId) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        throw error;
    }
};

export const getBeers = async () => {
    try {
        const response = await axiosInstance.get('/stock');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des bières :', error);
        throw error;
    }
};

export const postBeer = async (beer) => {
    try {
        const response = await axiosInstance.post('/stock', beer);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la bière :', error);
        throw error;
    }
};


export const postUser = async (user) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/users`, user);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        throw error;
    }
}

export const putUser = async (userId, updatedUser) => {
    try {
        const response = await axiosInstance.put(`${BASE_URL}/users/${userId}`, updatedUser);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la modification de l\'utilisateur :', error);
        throw error;
    }
}

export const deleteUser = async (userId) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        throw error;
    }
}

export const putBeer = async (beerId, updatedBeer) => {
    try {
        const response = await axiosInstance.put(`${BASE_URL}/stock/${beerId}`, updatedBeer);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la modification de la bière :', error);
        throw error;
    }
}

export const deleteBeer = async (beerId) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/stock/${beerId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de la bière :', error);
        throw error;
    }
}

// Récupérer toutes les ventes
export const getVentes = async () => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/ventes`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des ventes :', error);
        throw error;
    }
};

// Créer une nouvelle vente
export const postVentes = async (vente) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/ventes`, vente);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la vente :', error);
        throw error;
    }
};
//delete one vente avec l'id
export const deleteVente = async (venteId) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/ventes/${venteId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de la vente :', error);
        throw error;
    }
};

// Delete all ventes
export const deleteAllVentes = async () => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/ventes`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de toutes les ventes :', error);
        throw error;
    }
};

export const getLeaderboard = async (limit = 10) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/scores/leaderboard?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du classement :', error);
        throw error;
    }
};

export const getUserScores = async (userId) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/scores/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des scores de l\'utilisateur :', error);
        throw error;
    }
};

export const getUserHighestScore = async (userId) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/scores/user/${userId}/highest`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du meilleur score de l\'utilisateur :', error);
        throw error;
    }
};

export const postScore = async (score) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/scores`, score);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du score :', error);
        throw error;
    }
};

export const getIsAdmin = async () => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/auth/isadmin`);
        return response.data.isAdmin;
    } catch (error) {
        console.error('Erreur lors de la récupération du statut admin :', error);
        throw error;
    }
};
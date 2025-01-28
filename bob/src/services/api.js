import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const getUsers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/users`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        throw error;
    }
};

export const getBeers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/stock`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des bières :', error);
        throw error;
    }
}

export const postBeer = async (beer) => {
    try {
        const response = await axios.post(`${BASE_URL}/stock`, beer);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la bière :', error);
        throw error;
    }
}


export const postUser = async (user) => {
    try {
        const response = await axios.post(`${BASE_URL}/users`, user);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        throw error;
    }
}

export const putUser = async (userId, updatedUser) => {
    try {
        const response = await axios.put(`${BASE_URL}/users/${userId}`, updatedUser);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la modification de l\'utilisateur :', error);
        throw error;
    }
}

export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        throw error;
    }
}

export const putBeer = async (beerId, updatedBeer) => {
    try {
        const response = await axios.put(`${BASE_URL}/stock/${beerId}`, updatedBeer);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la modification de la bière :', error);
        throw error;
    }
}

export const deleteBeer = async (beerId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/stock/${beerId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de la bière :', error);
        throw error;
    }
}

// Récupérer toutes les ventes
export const getVentes = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/ventes`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des ventes :', error);
        throw error;
    }
};

// Créer une nouvelle vente
export const postVentes = async (vente) => {
    try {
        const response = await axios.post(`${BASE_URL}/ventes`, vente);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la vente :', error);
        throw error;
    }
};
//delete one vente avec l'id
export const deleteVente = async (venteId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/ventes/${venteId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de la vente :', error);
        throw error;
    }
};

// Delete all ventes
export const deleteAllVentes = async () => {
    try {
        const response = await axios.delete(`${BASE_URL}/ventes`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de toutes les ventes :', error);
        throw error;
    }
};
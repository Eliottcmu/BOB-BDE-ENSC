// import axios from 'axios';
import axiosInstance from './auth';

const BASE_URL = 'http://localhost:5000/api';


//si besoin de test : 
// axiosInstance.interceptors.request.use(config => {
//     console.log('Request Config:', {
//         method: config.method,
//         url: config.url,
//         data: config.data
//     });
//     return config;
// }, error => {
//     return Promise.reject(error);
// });
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.error('Full Error Response:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });
        return Promise.reject(error);
    }
);

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

export const getProducts = async () => {
    try {
        const response = await axiosInstance.get('/stock');
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const postProduct = async (product) => {
    try {
        // Ensure all required fields are present
        const validatedProduct = {
            name: product.name,
            price: Number(product.price),
            quantity: Number(product.quantity),
            type: product.type
        };

        console.log('Sending Product:', validatedProduct);

        const response = await axiosInstance.post('/stock', validatedProduct);
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error.response?.data || error.message);
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

export const putProduct = async (productId, updatedProduct) => {
    try {
        const response = await axiosInstance.put(`/stock/${productId}`, updatedProduct);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deleteProduct = async (productId) => {
    try {
        const response = await axiosInstance.delete(`/stock/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

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

export const getIsAdmin = async () => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/auth/isadmin`);
        return response.data.isAdmin;
    } catch (error) {
        console.error('Erreur lors de la récupération du statut admin :', error);
        throw error;
    }
};
export const getRestocks = async () => {
    try {
        const response = await axiosInstance.get('/restocks');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des réapprovisionnements :', error);
        throw error;
    }
};

export const postRestock = async (restock) => {
    try {
        const response = await axiosInstance.post('/restocks', restock);
        return response.data;
    } catch (error) {
        console.error('Erreur serveur lors de la création du restock :', error);
        throw error;
    }
};

export const deleteRestock = async (id) => {
    try {
        const response = await axiosInstance.delete(`/restocks/${id}`);
        return response.data; // ou response.status si vous n'attendez pas de payload
    } catch (error) {
        console.error('Erreur serveur lors de la suppression du restock :', error);
        throw error;
    }
};

export const deleteAllRestocks = async () => {
    try {
        const response = await axiosInstance.delete('/restocks');
        return response.data;
    } catch (error) {
        console.error('Erreur serveur lors de la suppression de tous les restocks :', error);
        throw error;
    }
};
export default axiosInstance;
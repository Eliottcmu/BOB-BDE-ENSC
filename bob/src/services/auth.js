import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const loginUser = async (credentials) => {
    try {
        const response = await axios.get(`${BASE_URL}/users`);
        const users = response.data;
        const user = users.find(u =>
            u.name === credentials.username &&
            u.password === credentials.password
        );

        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.isAdmin) {
            throw new Error('Accès non autorisé');
        }

        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            name: user.name,
            isAdmin: user.isAdmin
        }));

        return user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('user');
};

export const isAuthenticated = () => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    try {
        const userData = JSON.parse(user);
        return userData.isAdmin === true;
    } catch {
        return false;
    }
};
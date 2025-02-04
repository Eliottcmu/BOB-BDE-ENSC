import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/auth';
import { getIsAdmin } from '../../services/api';

export const ProtectedRoute = ({ children, requireAdmin }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIsAdmin = async () => {
            try {
                const adminStatus = await getIsAdmin();
                setIsAdmin(adminStatus);
            } catch (error) {
                console.error('Erreur lors de la récupération du statut admin', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated()) {
            fetchIsAdmin();
        } else {
            setLoading(false);
        }
    }, []);

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return <div>Chargement...</div>;
    }

    // Si la route requiert un accès admin et que l'utilisateur n'est pas admin, redirigez vers /profile
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/profile" replace />;
    }

    return children;
};

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/auth';
import { getIsAdmin } from '../../services/api';
import NoAccess from '../NoAccess/noAccess';

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
        // Redirection "manuelle" pour éviter les erreurs de sécurité liées à `replaceState`
        window.location.href = '/login';
        return null; // Important : retourner null après une redirection
    }


    if (loading) {
        return <div>Chargement...</div>;
    }

    // If route requires admin and user is not admin, show NoAccess component
    if (requireAdmin && !isAdmin) {
        return <NoAccess />;
    }

    return children;
};
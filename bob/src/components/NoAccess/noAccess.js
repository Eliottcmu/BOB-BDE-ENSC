import React from 'react';
import { useNavigate } from 'react-router-dom';

const NoAccess = () => {
    const navigate = useNavigate();

    return (
        <div className="no-access-page flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
            <p className="mb-6">Vous n'avez pas les accréditations nécessaires pour accéder à cette page.</p>
            <button
                onClick={() => navigate('/profile')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Retour au profil
            </button>
        </div>
    );
};

export default NoAccess;
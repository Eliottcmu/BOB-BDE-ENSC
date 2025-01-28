import React from 'react';
import './Loader.css';

const Loader = ({ message = "Chargement des données..." }) => {
    return (
        <div className="loading-container" role="status" aria-live="polite">
            <img
                src="/BOB.png"
                alt="Chargement"
                className="loader-logo"
                aria-hidden="true"
            />
            <span className="loading-text">{message}</span>
        </div>
    );
};

export default Loader;
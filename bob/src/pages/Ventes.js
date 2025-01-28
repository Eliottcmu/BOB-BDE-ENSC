import React, { useState, useEffect } from 'react';
import { getBeers, putBeer, postVentes } from '../services/api';
import Loader from '../components/Loader/Loader';
import './Ventes.css';

const Ventes = ({ setPage }) => {
    const [beers, setBeers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setPage('Ventes');
        loadBeers();
    }, [setPage]);

    const loadBeers = async () => {
        try {
            const data = await getBeers();
            setBeers(data);
            setLoading(false);
        } catch (err) {
            setError('Erreur lors du chargement des bières');
            setLoading(false);
        }
    };

    const handleSell = async (beer) => {
        if (beer.quantity <= 0) {
            alert('Plus de stock disponible pour cette bière !');
            return;
        }

        try {
            const updatedBeer = {
                ...beer,
                quantity: beer.quantity - 1
            };

            await putBeer(beer.id, updatedBeer);

            const vente = {
                date: new Date(),
                idProduit: beer.id,
                quantite: 1,
                montant: beer.price,
                name: beer.name,
            };

            await postVentes(vente);
            loadBeers();
        } catch (err) {
            setError('Erreur lors de la vente');
        }
    };

    if (loading) {
        return <Loader message="Chargement des bières..." />;
    }

    if (error) {
        return (
            <div className="error-message" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="ventes-container">
            <header className="header" role="banner">
                <div className="header-content">
                    <h1 tabIndex="0">Ventes</h1>
                </div>
            </header>

            <main className="main-content" role="main">
                <div className="beer-grid">
                    {beers.map((beer) => (
                        <div
                            key={beer.id}
                            className="beer-card"
                            tabIndex="0"
                            role="article"
                            aria-label={`${beer.name} - Prix: ${beer.price}€ - Stock: ${beer.quantity}`}
                        >
                            <h2>{beer.name}</h2>
                            <div className="beer-info">
                                <p>Prix: {beer.price.toFixed(2)} €</p>
                                <p>
                                    Stock: <span className={beer.quantity <= 5 ? 'low-stock' : ''}>
                                        {beer.quantity}
                                    </span>
                                    {beer.quantity <= 5 && (
                                        <span className="sr-only"> - Stock faible</span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => handleSell(beer)}
                                disabled={beer.quantity <= 0}
                                className={`sell-button ${beer.quantity <= 0 ? 'disabled' : ''}`}
                                aria-disabled={beer.quantity <= 0}
                            >
                                {beer.quantity <= 0 ? 'Rupture de stock' : 'Vendre'}
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="footer" role="contentinfo">
                <p>
                    All Rights Reserved - BDE ENSC ©
                    <span className="sr-only">Bureau des étudiants ENSC</span>
                </p>
            </footer>
        </div>
    );
};

export default Ventes;
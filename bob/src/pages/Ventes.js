import React, { useState, useEffect } from 'react';
import { getProducts, putProduct, postVentes } from '../services/api';
import Loader from '../components/Loader/Loader';
import './Ventes.css';

const Ventes = ({ setPage }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setPage('Ventes');
        loadProducts();
    }, [setPage]);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
            setLoading(false);
        } catch (err) {
            setError('Erreur lors du chargement des bières');
            setLoading(false);
        }
    };

    const handleSell = async (product) => {
        if (product.quantity <= 0) {
            alert('Plus de stock disponible pour cette bière !');
            return;
        }

        try {
            const updatedProduct = {
                ...product,
                quantity: product.quantity - 1
            };

            await putProduct(product.id, updatedProduct);

            const vente = {
                date: new Date(),
                idProduit: product.id,
                quantite: 1,
                montant: product.price,
                name: product.name,
            };

            await postVentes(vente);
            loadProducts();
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
                <div className="product-grid">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="product-card"
                            tabIndex="0"
                            role="article"
                            aria-label={`${product.name} - Prix: ${product.price}€ - Stock: ${product.quantity}`}
                        >
                            <h2>{product.name}</h2>
                            <div className="product-info">
                                <p>Prix: {product.price.toFixed(2)} €</p>
                                <p>
                                    Stock: <span className={product.quantity <= 5 ? 'low-stock' : ''}>
                                        {product.quantity}
                                    </span>
                                    {product.quantity <= 5 && (
                                        <span className="sr-only"> - Stock faible</span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => handleSell(product)}
                                disabled={product.quantity <= 0}
                                className={`sell-button ${product.quantity <= 0 ? 'disabled' : ''}`}
                                aria-disabled={product.quantity <= 0}
                            >
                                {product.quantity <= 0 ? 'Rupture de stock' : 'Vendre'}
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
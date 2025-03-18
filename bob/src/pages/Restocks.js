import React, { useState, useEffect } from 'react';
import {
    getRestocks,
    getProducts,
    deleteAllRestocks
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader/Loader';
import './Restocks.css';

const Restocks = ({ setPage }) => {
    const navigate = useNavigate();
    const [restocks, setRestocks] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        navigate('/restocks');
        loadData();
    }, [setPage]);

    const loadData = async () => {
        try {
            const [restockData, productData] = await Promise.all([
                getRestocks(),
                getProducts()
            ]);
            setRestocks(Array.isArray(restockData) ? restockData : []);
            setProducts(Array.isArray(productData) ? productData : []);
        } catch (err) {
            setError('Erreur lors du chargement des données de restocks');
        } finally {
            setLoading(false);
        }
    };

    // Récupère le nom du produit
    const getProductInfo = (idProduit) => {
        const product = products.find((prod) => prod.id === idProduit);
        return product ? product.name : 'Produit inconnu';
    };

    // Suppression de l'historique complet
    const handleDeleteAll = async () => {
        if (!window.confirm('Voulez-vous vraiment supprimer TOUT l’historique ?')) {
            return; // Annulation
        }
        try {
            await deleteAllRestocks();
            setRestocks([]); // On vide la liste localement
        } catch (err) {
            setError('Erreur lors de la suppression de tous les restocks');
        }
    };

    if (loading) {
        return <Loader message="Chargement des restocks..." />;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="restocks-container">
            <header>
                <h1>Historique des réapprovisionnements</h1>
            </header>

            <main>
                <div className="button-group">
                    {/* Bouton retour vers Stock */}
                    <button
                        className="back-button"
                        onClick={() => navigate('/stock')}
                    >
                        Retour
                    </button>
                    {/* Suppression de tout l'historique */}
                    <button
                        className="delete-all-button"
                        onClick={handleDeleteAll}
                    >
                        Supprimer tout l'historique
                    </button>
                </div>
                {restocks.length === 0 ? (
                    <p className="no-restocks">Aucun réapprovisionnement enregistré.</p>
                ) : (
                    <div className="table-container">
                        <table className="restocks-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Produit</th>
                                    <th>Quantité ajoutée</th>
                                    <th>Coût total</th>
                                    <th>Fournisseur</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restocks.map((restock) => {
                                    // Format JJ/MM/AAAA
                                    const dateString = new Date(restock.date).toLocaleDateString(
                                        'fr-FR',
                                        {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        }
                                    );
                                    const productName = getProductInfo(restock.idProduit);

                                    return (
                                        <tr key={restock.id}>
                                            <td data-label="Date">{dateString}</td>
                                            <td data-label="Produit">{productName}</td>
                                            <td data-label="Quantité ajoutée">
                                                {restock.quantiteAjoutee}
                                            </td>
                                            <td data-label="Coût total">{restock.coutTotal} €</td>
                                            <td data-label="Fournisseur">{restock.fournisseur}</td>
                                            <td data-label="Note">{restock.note || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Restocks;

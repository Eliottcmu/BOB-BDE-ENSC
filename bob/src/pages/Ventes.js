import React, { useState, useEffect } from 'react';
import { getProducts, putProduct, postVentes } from '../services/api';
import Loader from '../components/Loader/Loader';
import './Ventes.css';

const Ventes = ({ setPage }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState(null);

    const productTypes = ['Biere', 'Vin', 'Gouter', 'Miam'];

    useEffect(() => {
        setPage('Ventes');
        loadProducts();
    }, [setPage]);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            setError('Erreur lors du chargement des produits');
            setLoading(false);
        }
    };

    const handleSell = async (product) => {
        if (product.quantity <= 0) {
            alert('Plus de stock disponible pour ce produit !');
            return;
        }

        try {
            const updatedProduct = { ...product, quantity: product.quantity - 1 };
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

    if (loading) return <Loader message="Chargement des produits..." />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="ventes-container">
            <header className="header">
                <h1>Ventes</h1>
                <div className="filter-buttons">
                    {productTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={selectedType === type ? 'active' : ''}
                        >
                            {type}
                        </button>
                    ))}
                    <button onClick={() => setSelectedType(null)}>Tout afficher</button>
                </div>
            </header>

            <main>
                {productTypes.map((type) => {
                    if (selectedType && selectedType !== type) return null;
                    const filteredProducts = products.filter((product) => product.type === type);
                    if (filteredProducts.length === 0) return null;

                    return (
                        <div key={type} className={`product-group ${type.toLowerCase()}`}>
                            <h2>{type}</h2>
                            <div className="products-grid">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="product-card">
                                        <h3>{product.name}</h3>
                                        <p>Prix : {product.price.toFixed(2)} €</p>
                                        <p>Quantité : {product.quantity}</p>
                                        <button
                                            onClick={() => handleSell(product)}
                                            disabled={product.quantity <= 0}
                                            className="sell-button"
                                        >
                                            {product.quantity <= 0 ? 'Rupture de stock' : 'Vendre'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
};

export default Ventes;

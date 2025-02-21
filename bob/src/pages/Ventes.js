import React, { useState, useEffect } from 'react';
import { getProducts, putProduct, postVentes } from '../services/api';
import Loader from '../components/Loader/Loader';
import './Ventes.css';

const Ventes = ({ setPage }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState(null);

    // State to hold the product being sold and to toggle the dialog
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    // Opens the payment dialog for the chosen product
    const openPaymentDialog = (product) => {
        if (product.quantity <= 0) {
            alert('Plus de stock disponible pour ce produit !');
            return;
        }
        setSelectedProduct(product);
        setIsDialogOpen(true);
    };

    // Handles the final sale process based on the chosen payment method
    const handlePaymentSelection = async (paymentMethod) => {
        if (!selectedProduct) return;

        try {
            // Decrease product quantity
            const updatedProduct = { ...selectedProduct, quantity: selectedProduct.quantity - 1 };
            await putProduct(selectedProduct.id, updatedProduct);

            // Map payment method to typeReglement: 'cash' for cash, 'lydia' for QR code
            const typeReglement = paymentMethod === 'cash' ? 'cash' : 'lydia';

            const vente = {
                date: new Date(),
                idProduit: selectedProduct.id,
                quantite: 1,
                montant: selectedProduct.price,
                name: selectedProduct.name,
                typeReglement: typeReglement
            };
            await postVentes(vente);
            loadProducts();
        } catch (err) {
            setError('Erreur lors de la vente');
        } finally {
            // Close the dialog and clear the selected product
            setIsDialogOpen(false);
            setSelectedProduct(null);
        }
    };

    if (loading) return <Loader message="Chargement des produits..." />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="ventes-container">
            <header className="header">
                <h1>Ventes</h1>

            </header>

            <main>
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
                                            onClick={() => openPaymentDialog(product)}
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

            {/* Modal Dialog for Payment Method Selection */}
            {isDialogOpen && (
                <div className="modalOverlayStyle">
                    <div className='modalStyle'>
                        <h2>Choisissez le mode de paiement</h2>
                        <button onClick={() => handlePaymentSelection('cash')}>Cash</button>
                        <button onClick={() => handlePaymentSelection('qrcode')}>QR Code</button>
                        <button
                            onClick={() => {
                                setIsDialogOpen(false);
                                setSelectedProduct(null);
                            }}
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default Ventes;

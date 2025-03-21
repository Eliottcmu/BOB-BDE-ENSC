import React, { useState, useEffect } from 'react';
import { getProducts, putProduct, postVentes } from '../services/api';
import Loader from '../components/Loader/Loader';
import './Ventes.css';

const Ventes = ({ setPage }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [cart, setCart] = useState([]);

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

    // Ajoute un produit au panier si le stock le permet
    const addToCart = (product) => {
        // Vérifier le nombre déjà ajouté dans le panier pour ce produit
        const cartItem = cart.find(item => item.id === product.id);
        const quantityInCart = cartItem ? cartItem.quantity : 0;
        if (quantityInCart < product.quantity) {
            if (cartItem) {
                setCart(cart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                ));
            } else {
                setCart([...cart, { ...product, quantity: 1 }]);
            }
        } else {
            alert('Plus de stock disponible pour ce produit !');
        }
    };

    // Calcul du total du panier
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Ouvre la validation du panier pour choisir le mode de paiement
    const handleCartValidation = () => {
        if (cart.length === 0) {
            alert("Le panier est vide !");
            return;
        }
        setIsDialogOpen(true);
    };

    // Gestion du paiement pour tous les produits du panier
    const handlePaymentSelection = async (paymentMethod) => {
        try {
            // Traiter chaque produit du panier
            for (const item of cart) {
                // Récupérer le produit dans la liste pour connaître le stock actuel
                const productToUpdate = products.find(prod => prod.id === item.id);
                if (productToUpdate) {
                    const newQuantity = productToUpdate.quantity - item.quantity;
                    await putProduct(item.id, { ...productToUpdate, quantity: newQuantity });
                    const vente = {
                        date: new Date(),
                        idProduit: item.id,
                        quantite: item.quantity,
                        montant: item.price * item.quantity,
                        name: item.name,
                        typeReglement: paymentMethod === 'cash' ? 'cash' : 'lydia'
                    };
                    await postVentes(vente);
                }
            }
            loadProducts();
        } catch (err) {
            setError('Erreur lors de la vente');
        } finally {
            setIsDialogOpen(false);
            setCart([]); // Réinitialiser le panier après la vente
        }
    };

    if (loading) return <Loader message="Chargement des produits..." />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="ventes-container">
            <header className="header">
                <h1>Ventes</h1>
                <div className="cart-summary">
                    <span>Total du panier: {cartTotal.toFixed(2)}€</span>
                    <button onClick={handleCartValidation}>Valider le panier</button>
                </div>
                {/* Bouton pour vider le panier */}
                {cart.length > 0 && (
                    <div className="clear-cart">
                        <button onClick={() => setCart([])}>Vider le panier</button>
                    </div>
                )}
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
                                    <div
                                        key={product.id}
                                        className="product-card"
                                        onClick={() => addToCart(product)}
                                    >
                                        <img
                                        // src={`../../public/${product.name}.png`}
                                        // alt={product.name}
                                        // className="product-image"
                                        />

                                        <h3>{product.name}</h3>
                                        <h2>{product.price.toFixed(2)}€</h2>
                                        <p>Stock : {product.quantity}</p>
                                        {cart.find(item => item.id === product.id) && (
                                            <p>
                                                Panier : {cart.find(item => item.id === product.id).quantity}
                                            </p>
                                        )}
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

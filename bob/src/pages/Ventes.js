import React, { useState, useEffect } from 'react';
import { getProducts, putProduct, postVentes } from '../services/api';
import Loader from '../components/Loader/Loader';
import './Ventes.css';

const Ventes = ({ setPage }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [cart, setCart] = useState([]);

    // Types de produit
    const productTypes = ['Biere', 'Vin', 'Gouter', 'Miam', 'Soft'];

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

    // Ajoute un produit au panier (vérification du stock)
    const addToCart = (product) => {
        const cartItem = cart.find(item => item.id === product.id);
        const productFromList = products.find(prod => prod.id === product.id);
        const quantityInCart = cartItem ? cartItem.quantity : 0;
        if (quantityInCart < productFromList.quantity) {
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

    // Augmente la quantité d'un article dans le panier
    const increaseCartItem = (item) => {
        const productFromList = products.find(prod => prod.id === item.id);
        if (item.quantity < productFromList.quantity) {
            setCart(cart.map(cartItem =>
                cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            ));
        } else {
            alert('Plus de stock disponible pour ce produit !');
        }
    };

    // Diminue la quantité d'un article ; si la quantité devient 0, supprime l'article
    const decreaseCartItem = (item) => {
        if (item.quantity > 1) {
            setCart(cart.map(cartItem =>
                cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
            ));
        } else {
            setCart(cart.filter(cartItem => cartItem.id !== item.id));
        }
    };

    // Supprime un article du panier
    const removeCartItem = (item) => {
        setCart(cart.filter(cartItem => cartItem.id !== item.id));
    };

    // Calcul du total du panier
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Ouvre le modal de validation du panier (choix du mode de paiement)
    const handleCartValidation = () => {
        if (cart.length === 0) {
            alert("Le panier est vide !");
            return;
        }
        setIsDialogOpen(true);
    };

    // Traitement du paiement pour chaque article du panier
    const handlePaymentSelection = async (paymentMethod) => {
        try {
            // Traitement des articles du panier
            for (const item of cart) {
                const productToUpdate = products.find(prod => prod.id === item.id);
                if (productToUpdate) {
                    // Si le paiement est "offert", on met à jour la quantité en stock mais sans affecter la trésorerie
                    const newQuantity = productToUpdate.quantity - item.quantity;
                    await putProduct(item.id, { ...productToUpdate, quantity: newQuantity });

                    const vente = {
                        date: new Date(),
                        idProduit: item.id,
                        quantite: item.quantity,
                        montant: 0,  // Montant à 0 pour un produit offert
                        name: item.name,
                        typeReglement: 'offert'  // Indiquer le type de règlement comme "offert"
                    };
                    await postVentes(vente);
                }
            }

            // Recharge les produits et réinitialise le panier
            loadProducts();
        } catch (err) {
            setError('Erreur lors de la vente');
        } finally {
            setIsDialogOpen(false);
            setCart([]);  // Réinitialise le panier après la vente
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
                            className={selectedType === type ? 'active' : type.toLowerCase()}
                        >
                            {type}
                        </button>
                    ))}
                    <button onClick={() => setSelectedType(null)}>Tout afficher</button>
                </div>
                <div className="products-grid">
                    {products
                        .filter(product => !selectedType || product.type === selectedType)
                        .map(product => (
                            <div
                                key={product.id}
                                className={`product-card ${product.type.toLowerCase()}`}
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
                                    <p>Panier : {cart.find(item => item.id === product.id).quantity}</p>
                                )}
                            </div>
                        ))
                    }
                </div>
            </main>

            {/* Panier fixé en bas (affiché uniquement s'il contient des articles) */}
            {cart.length > 0 && (
                <div className="cart fixed-cart">
                    <div className="cart-summary">
                        <span>Total du panier: {cartTotal.toFixed(2)}€</span>
                        <button onClick={handleCartValidation}>Valider le panier</button>
                    </div>
                    <div className="cart-actions">
                        <button onClick={() => setIsCartModalOpen(true)} className="btn-modify">
                            Modifier le panier
                        </button>
                        <button onClick={() => setCart([])} className="btn-clear">
                            Vider le panier
                        </button>
                    </div>
                </div>
            )}

            {/* Modal pour modifier le panier */}
            {isCartModalOpen && (
                <div className="modalOverlayStyle">
                    <div className="modalStyle">
                        <h2>Modifier le panier</h2>
                        <div className="cart-items">
                            {cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <span className="cart-item-name">{item.name}</span>
                                    <div className="cart-item-controls">
                                        <button onClick={() => decreaseCartItem(item)} className="btn-decrease">-</button>
                                        <span className="cart-item-quantity">{item.quantity}</span>
                                        <button onClick={() => increaseCartItem(item)} className="btn-increase">+</button>
                                        <button onClick={() => removeCartItem(item)} className="btn-remove">Supprimer</button>
                                    </div>
                                    <span className="cart-item-total">{(item.price * item.quantity).toFixed(2)}€</span>
                                </div>
                            ))}
                        </div>
                        <div className="modal-buttons">
                            <button onClick={() => setIsCartModalOpen(false)}>Enregistrer</button>
                            <button onClick={() => setIsCartModalOpen(false)}>Annuler</button>
                            <button onClick={() => setIsCartModalOpen(false)}>Offrir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de validation du paiement */}
            {isDialogOpen && (
                <div className="modalOverlayStyle">
                    <div className="modalStyle">
                        <h2>Choisissez le mode de paiement</h2>
                        <button onClick={() => handlePaymentSelection('cash')}>Cash</button>
                        <button onClick={() => handlePaymentSelection('qrcode')}>QR Code</button>
                        <button onClick={() => handlePaymentSelection('offert')}>Offrir</button>

                        <button onClick={() => setIsDialogOpen(false)}>Annuler</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ventes;

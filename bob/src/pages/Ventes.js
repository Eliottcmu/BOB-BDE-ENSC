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

    // Pour la réduction globale (optionnel)
    const [discount, setDiscount] = useState({
        type: '',  // "", "pourcentage" ou "montant"
        value: 0
    });

    // Simulez un flag d’admin (pour l’exemple)
    const isAdmin = true;

    // Liste des promotions (formules). Par défaut, on a la "Formule Gouter"
    const [promotions, setPromotions] = useState([
        {
            name: 'Formule Gouter',
            // Vérifie si on peut former au moins 1 combo Gouter+Soft
            condition: (cartItems) => {
                const gouterCount = cartItems.reduce((count, item) => {
                    return item.type === 'Gouter' ? count + item.quantity : count;
                }, 0);
                const softCount = cartItems.reduce((count, item) => {
                    return item.type === 'Soft' ? count + item.quantity : count;
                }, 0);
                return (gouterCount > 0 && softCount > 0);
            },
            // Applique la promotion: 1 Gouter + 1 Soft => 2€ (au lieu de leurs prix cumulés).
            applyPromotion: (cartItems) => {
                // On fait une copie pour le calcul
                const updatedCart = JSON.parse(JSON.stringify(cartItems));
                let gouterCount = 0;
                let softCount = 0;

                updatedCart.forEach(item => {
                    if (item.type === 'Gouter') gouterCount += item.quantity;
                    if (item.type === 'Soft') softCount += item.quantity;
                });

                // Nombre de combos Gouter+Soft possible
                const totalCombos = Math.min(gouterCount, softCount);

                return {
                    updatedCart,
                    totalCombos
                };
            }
        }
    ]);

    // Permettre à un admin d’ajouter une nouvelle formule
    const [newFormula, setNewFormula] = useState({
        name: '',
        conditionText: '',
        applyText: ''
    });

    const handleAddNewFormula = () => {
        // Exemple simplifié
        const newPromotion = {
            name: newFormula.name,
            condition: (cartItems) => {
                if (newFormula.conditionText === 'Vin>=2') {
                    const vinCount = cartItems.reduce((count, item) => {
                        return item.type === 'Vin' ? count + item.quantity : count;
                    }, 0);
                    return vinCount >= 2;
                }
                return false;
            },
            applyPromotion: (cartItems) => {
                const updatedCart = JSON.parse(JSON.stringify(cartItems));
                let discountAmount = 0;
                updatedCart.forEach(item => {
                    if (item.type === 'Vin') {
                        discountAmount += item.quantity * 1;
                    }
                });
                return {
                    updatedCart,
                    discount: discountAmount
                };
            }
        };

        setPromotions([...promotions, newPromotion]);
        setNewFormula({ name: '', conditionText: '', applyText: '' });
    };

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

    /**
     * Calcule le total du panier avec prise en compte des formules et de la réduction,
     * et renvoie un objet détaillé :
     *  {
     *    totalFinal,
     *    totalDiscount,
     *    promotionsApplied: [ { name, discount, combosUsed }, ... ]
     *  }
     */
    const calculateCartTotalWithPromotions = () => {
        // 1) Total brut
        let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // On suit le total des remises + la liste des promos appliquées
        let totalDiscount = 0;
        let promotionsApplied = [];

        // 2) Appliquer les formules
        promotions.forEach((promo) => {
            if (promo.condition(cart)) {
                const result = promo.applyPromotion(cart);

                // Si c’est la formule Gouter
                if (promo.name === 'Formule Gouter') {
                    const { updatedCart, totalCombos } = result;
                    if (totalCombos > 0) {
                        // Tri + décrémentation seulement sur la copie (updatedCart)
                        const allGouter = updatedCart
                            .filter(it => it.type === 'Gouter')
                            .sort((a, b) => a.price - b.price);
                        const allSoft = updatedCart
                            .filter(it => it.type === 'Soft')
                            .sort((a, b) => a.price - b.price);

                        let combosLeft = totalCombos;
                        let comboDiscount = 0;
                        let iGouter = 0;
                        let iSoft = 0;

                        while (combosLeft > 0 && iGouter < allGouter.length && iSoft < allSoft.length) {
                            while (iGouter < allGouter.length && allGouter[iGouter].quantity === 0) {
                                iGouter++;
                            }
                            while (iSoft < allSoft.length && allSoft[iSoft].quantity === 0) {
                                iSoft++;
                            }
                            if (iGouter >= allGouter.length || iSoft >= allSoft.length) break;

                            const cheapestGouter = allGouter[iGouter];
                            const cheapestSoft = allSoft[iSoft];
                            const normalPrice = cheapestGouter.price + cheapestSoft.price;

                            comboDiscount += (normalPrice - 2);

                            // On décrémente dans la copie
                            cheapestGouter.quantity -= 1;
                            cheapestSoft.quantity -= 1;

                            combosLeft--;
                        }

                        totalDiscount += comboDiscount;

                        // On log la promo appliquée
                        promotionsApplied.push({
                            name: 'Formule Gouter',
                            combosUsed: totalCombos,
                            discount: comboDiscount
                        });
                    }
                }

                // Sinon, c’est potentiellement une autre promo
                else if (result.discount) {
                    totalDiscount += result.discount;
                    promotionsApplied.push({
                        name: promo.name,
                        discount: result.discount
                    });
                }
            }
        });

        let totalAfterPromotions = subtotal - totalDiscount;

        // 3) Appliquer la réduction globale (optionnel)
        let globalDiscount = 0;
        if (discount.type === 'pourcentage' && discount.value > 0) {
            const before = totalAfterPromotions;
            totalAfterPromotions *= (1 - (discount.value / 100));
            globalDiscount = before - totalAfterPromotions;

            promotionsApplied.push({
                name: `Réduction ${discount.value}%`,
                discount: globalDiscount
            });
        } else if (discount.type === 'montant' && discount.value > 0) {
            globalDiscount = discount.value;
            totalAfterPromotions -= globalDiscount;

            promotionsApplied.push({
                name: `Réduction -${globalDiscount}€`,
                discount: globalDiscount
            });
        }

        totalDiscount += globalDiscount;

        // On évite un total négatif
        totalAfterPromotions = Math.max(0, totalAfterPromotions);

        return {
            totalFinal: totalAfterPromotions,
            totalDiscount,
            promotionsApplied
        };
    };

    // Validation du panier
    const handleCartValidation = () => {
        if (cart.length === 0) {
            alert("Le panier est vide !");
            return;
        }
        setIsDialogOpen(true);
    };

    // Gestion du paiement
    const handlePaymentSelection = async (paymentMethod) => {
        try {
            // On récupère TOUTES les infos calculées
            const {
                totalFinal,
                totalDiscount,
                promotionsApplied
            } = calculateCartTotalWithPromotions();

            // Mise à jour du stock & enregistrement des ventes
            for (const item of cart) {
                const productToUpdate = products.find(prod => prod.id === item.id);
                if (!productToUpdate) continue;

                const newQuantity = productToUpdate.quantity - item.quantity;
                await putProduct(item.id, { ...productToUpdate, quantity: newQuantity });

                // Ex de ventilation simplifiée : on ne modifie pas le "montant" par article,
                // mais on enregistre tout de même promotionsApplied pour savoir
                // ce qui s'est passé sur la commande.
                // Si vous voulez ventiler, calculez le ratio pour chaque item.

                const vente = {
                    date: new Date(),
                    idProduit: item.id,
                    quantite: item.quantity,
                    montant: paymentMethod === 'offert'
                        ? 0
                        : (item.price * item.quantity),
                    name: item.name,
                    typeReglement: paymentMethod,

                    // Ajout : on stocke la liste des promos appliquées globalement
                    promotionsUsed: promotionsApplied,
                    // Ex : vous pourriez aussi stocker totalFinal et totalDiscount 
                    // dans un enregistrement de commande global.                    
                };

                await postVentes(vente);
            }

            // On pourrait aussi enregistrer un "résumé commande" (non présenté ici).

            loadProducts();
        } catch (err) {
            setError('Erreur lors de la vente');
        } finally {
            setIsDialogOpen(false);
            setCart([]);
        }
    };

    // Affichage
    if (loading) {
        return <Loader message="Chargement des produits..." />;
    }
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    // On calcule pour afficher en bas
    const { totalFinal } = calculateCartTotalWithPromotions();

    return (
        <div className="ventes-container">
            <header className="header">
                <h1>Ventes</h1>
            </header>
            <main>
                <div className="filter-buttons">
                    {['Biere', 'Vin', 'Gouter', 'Miam', 'Soft'].map((type) => (
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

                {/* Exemple de réduction globale (facultatif) */}
                <div className="discount-container">
                    <h3>Réduction Globale</h3>
                    <label>
                        Type de réduction:
                        <select
                            value={discount.type}
                            onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
                        >
                            <option value="">Aucune</option>
                            <option value="pourcentage">Pourcentage</option>
                            <option value="montant">Montant fixe</option>
                        </select>
                    </label>
                    <label>
                        Valeur:
                        <input
                            type="number"
                            value={discount.value}
                            onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
                        />
                    </label>
                </div>

                {/* Formulaire de création d’une nouvelle formule (réservé admin) */}
                {isAdmin && (
                    <div className="new-formula-container">
                        <h3>Créer une nouvelle formule</h3>
                        <input
                            type="text"
                            placeholder="Nom de la formule"
                            value={newFormula.name}
                            onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Condition (ex: Vin>=2)"
                            value={newFormula.conditionText}
                            onChange={(e) => setNewFormula({ ...newFormula, conditionText: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Apply (ex: -1€/Vin)"
                            value={newFormula.applyText}
                            onChange={(e) => setNewFormula({ ...newFormula, applyText: e.target.value })}
                        />
                        <button onClick={handleAddNewFormula}>Ajouter la formule</button>
                    </div>
                )}

                {/* Affichage des produits */}
                <div className="products-grid">
                    {products
                        .filter(product => !selectedType || product.type === selectedType)
                        .map(product => (
                            <div
                                key={product.id}
                                className={`product-card ${product.type.toLowerCase()}`}
                                onClick={() => addToCart(product)}
                            >
                                {/* <img src={`../../public/${product.name}.png`} alt={product.name} className="product-image" /> */}
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

            {/* Panier fixe en bas (seulement s’il y a des articles) */}
            {cart.length > 0 && (
                <div className="cart fixed-cart">
                    <div className="cart-summary">
                        {/* On affiche totalFinal au lieu de cartTotal */}
                        <span>Total du panier: {totalFinal.toFixed(2)}€</span>
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

            {/* Modal de modification du panier */}
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
                                    <span className="cart-item-total">
                                        {(item.price * item.quantity).toFixed(2)}€
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="modal-buttons">
                            <button onClick={() => setIsCartModalOpen(false)}>Enregistrer</button>
                            <button onClick={() => setIsCartModalOpen(false)}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de choix du mode de paiement */}
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

import React, { useState, useEffect } from 'react';
import {
    getProducts,
    postProduct,
    putProduct,
    deleteProduct,
    postRestock
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader/Loader';
import './Stock.css';

const Stock = ({ setPage }) => {
    const navigate = useNavigate();

    // Liste de tous les produits
    const [products, setProducts] = useState([]);

    // Gestion du chargement et des erreurs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtrage par type
    const [selectedType, setSelectedType] = useState(null);
    const productTypes = ['Biere', 'Vin', 'Gouter', 'Miam'];

    // Formulaire de création d'un nouveau produit
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        quantity: '',
        type: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Nouveau formulaire dédié au restock
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [restockForm, setRestockForm] = useState({
        productName: '',
        quantity: '',
        costTotal: '',
        date: ''
    });
    // Liste des produits filtrés pour l'auto-complétion
    const [autoCompleteResults, setAutoCompleteResults] = useState([]);

    useEffect(() => {
        setPage('Stock');
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

    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitNewProduct = async (e) => {
        e.preventDefault();

        const productToAdd = {
            name: newProduct.name.trim(),
            price: parseFloat(newProduct.price),
            quantity: parseInt(newProduct.quantity, 10),
            type: newProduct.type
        };

        if (
            !productToAdd.name ||
            isNaN(productToAdd.price) ||
            isNaN(productToAdd.quantity) ||
            !productToAdd.type
        ) {
            setError('Veuillez remplir tous les champs correctement');
            return;
        }

        // Vérifier que les prix et quantités ne sont pas négatifs
        if (productToAdd.price < 0 || productToAdd.quantity < 0) {
            setError('Les prix et quantités ne peuvent pas être négatifs');
            return;
        }

        try {
            const added = await postProduct(productToAdd);
            setProducts((prev) => [...prev, added]);
            setNewProduct({ name: '', price: '', quantity: '', type: '' });
            setIsModalOpen(false);
        } catch (err) {
            setError("Erreur lors de l'ajout du produit");
        }
    };

    /**
     * Suppression d'un produit
     */
    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                await deleteProduct(productId);
                setProducts((prev) => prev.filter((p) => p.id !== productId));
            } catch (err) {
                setError('Erreur lors de la suppression du produit');
            }
        }
    };

    /**
     * Ouvre le modal de restock et initialise le formulaire
     */
    const openRestockModal = () => {
        setRestockForm({
            productName: '',
            quantity: '',
            costTotal: '',
            // Date du jour par défaut (format "YYYY-MM-DD")
            date: new Date().toISOString().split('T')[0]
        });
        setAutoCompleteResults([]);
        setIsRestockModalOpen(true);
    };

    // Fermer le modal de restock
    const closeRestockModal = () => {
        setIsRestockModalOpen(false);
    };

    const handleRestockInputChange = (e) => {
        const { name, value } = e.target;
        setRestockForm((prev) => ({
            ...prev,
            [name]: value
        }));

        // Auto-complétion sur le nom du produit
        if (name === 'productName') {
            handleAutoComplete(value);
        }
    };

    // Logique d'auto-complétion améliorée sur le nom du produit
    const handleAutoComplete = (searchValue) => {
        if (!searchValue) {
            setAutoCompleteResults([]);
            return;
        }
        const search = searchValue.toLowerCase();
        // Filtrer les produits dont le nom contient la chaîne recherchée
        const results = products.filter((p) =>
            p.name.toLowerCase().includes(search)
        );
        // Trier : en priorité ceux dont le nom commence par la chaîne recherchée
        const sortedResults = results.sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(search);
            const bStarts = b.name.toLowerCase().startsWith(search);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            // Sinon, trier alphabétiquement
            return a.name.localeCompare(b.name);
        });
        setAutoCompleteResults(sortedResults);
    };

    // Lorsqu'on clique sur une suggestion dans la liste
    const handleSelectProductFromAutocomplete = (product) => {
        setRestockForm((prev) => ({
            ...prev,
            productName: product.name
        }));
        setAutoCompleteResults([]);
    };

    // Validation et envoi du restock
    const handleSubmitRestock = async (e) => {
        e.preventDefault();

        // Trouver le produit correspondant au nom
        const targetProduct = products.find(
            (p) => p.name.toLowerCase() === restockForm.productName.trim().toLowerCase()
        );

        if (!targetProduct) {
            setError("Aucun produit ne correspond au nom saisi.");
            return;
        }

        // Vérifier la quantité saisie
        const addedQuantity = parseInt(restockForm.quantity, 10);
        if (isNaN(addedQuantity) || addedQuantity <= 0) {
            setError("La quantité doit être un entier positif.");
            return;
        }

        // Vérifier le coût total
        const cost = parseFloat(restockForm.costTotal);
        if (isNaN(cost) || cost < 0) {
            setError("Le coût total doit être un nombre positif ou zéro.");
            return;
        }

        // Construire la nouvelle quantité
        const newQuantity = targetProduct.quantity + addedQuantity;

        // Mettre à jour la partie "Produits" (PUT)
        const updatedProductData = {
            ...targetProduct,
            quantity: newQuantity
        };

        try {
            // Mise à jour du produit
            const updatedProduct = await putProduct(targetProduct.id, updatedProductData);
            setProducts((prev) =>
                prev.map((p) => (p.id === targetProduct.id ? updatedProduct : p))
            );

            // Créer un document Restock
            const restockData = {
                date: restockForm.date,
                idProduit: targetProduct.id,
                quantiteAjoutee: addedQuantity,
                coutTotal: cost,
                fournisseur: 'Modification manuelle',
                note: `Ajout de ${addedQuantity} exemplaire(s) pour le produit ${targetProduct.name}`
            };

            await postRestock(restockData);

            closeRestockModal();
            setError(null);
        } catch (err) {
            setError("Erreur lors de l'opération de restock.");
        }
    };

    if (loading) return <Loader message="Chargement des produits..." />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="ventes-container">
            <header className="header">
                <h1>Stock</h1>
                {/* Bouton pour accéder à l'historique */}
                <button onClick={() => navigate('/restocks')}>Historique</button>
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
                {/* Bouton pour ouvrir le modal de restock */}
                <button className="restock-button" onClick={openRestockModal}>
                    Modifier le stock
                </button>
                {productTypes.map((type) => {
                    if (selectedType && selectedType !== type) return null;

                    const filtered = products.filter((p) => p.type === type);
                    if (filtered.length === 0) return null;

                    return (
                        <div key={type} className={`product-group ${type.toLowerCase()}`}>
                            <h2>{type}</h2>
                            <div className="products-grid">
                                {filtered.map((product) => (
                                    <div key={product.id} className="product-card">
                                        <div className="product-header">
                                            <h3>{product.name}</h3>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteProduct(product.id)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                        <p>{product.price.toFixed(2)} €</p>
                                        <p>Stock : {product.quantity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </main>

            <div className="buttons-container">
                {/* Bouton pour ouvrir le modal d'ajout de produit */}
                <button className="add-product-button" onClick={() => setIsModalOpen(true)}>
                    Ajouter un nouveau produit
                </button>
            </div>
            {/* Modal pour le restock */}
            {isRestockModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <h2>Modification du stock</h2>
                        <form onSubmit={handleSubmitRestock}>
                            <label>Produit :</label>
                            <input
                                type="text"
                                name="productName"
                                placeholder="Nom"
                                value={restockForm.productName}
                                onChange={handleRestockInputChange}
                                required
                            />
                            {autoCompleteResults.length > 0 && (
                                <div className="autocomplete-container">
                                    <ul className="autocomplete-list">
                                        {autoCompleteResults.map((prod) => (
                                            <li
                                                key={prod.id}
                                                onClick={() => handleSelectProductFromAutocomplete(prod)}
                                                className="autocomplete-item"
                                            >
                                                {prod.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <label>Quantité à ajouter :</label>
                            <input
                                type="number"
                                name="quantity"
                                placeholder="Quantité"
                                value={restockForm.quantity}
                                onChange={handleRestockInputChange}
                                min="1"
                                required
                            />
                            <label>Coût total :</label>
                            <input
                                type="number"
                                name="costTotal"
                                placeholder="Prix total"
                                value={restockForm.costTotal}
                                onChange={handleRestockInputChange}
                                min="0"
                                step="0.01"
                                required
                            />
                            <label>Date :</label>
                            <input
                                type="date"
                                name="date"
                                value={restockForm.date}
                                onChange={handleRestockInputChange}
                                required
                            />
                            <div className="button-group">
                                <button type="submit">Valider</button>
                                <button type="button" onClick={closeRestockModal}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal pour l'ajout d'un nouveau produit */}
            {isModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <h2>Ajouter un produit</h2>
                        <form onSubmit={handleSubmitNewProduct}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nom du produit"
                                value={newProduct.name}
                                onChange={handleNewProductChange}
                                required
                            />
                            <input
                                type="number"
                                name="price"
                                placeholder="Prix du produit"
                                value={newProduct.price}
                                onChange={handleNewProductChange}
                                min="0"
                                step="0.1"
                                required
                            />
                            <input
                                type="number"
                                name="quantity"
                                placeholder="Quantité"
                                value={newProduct.quantity}
                                onChange={handleNewProductChange}
                                min="0"
                                required
                            />
                            <select
                                name="type"
                                value={newProduct.type}
                                onChange={handleNewProductChange}
                                required
                            >
                                <option value="">Sélectionnez un type</option>
                                {productTypes.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                            <div className="button-group">
                                <button type="submit">Ajouter</button>
                                <button type="button" onClick={() => setIsModalOpen(false)}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stock;

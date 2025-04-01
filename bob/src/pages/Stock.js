import React, { useState, useEffect } from 'react';
import {
    getProducts,
    postProduct,
    putProduct,
    deleteProduct,
    postRestock
} from '../services/api';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader/Loader';
import './Stock.css';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteProductDialog from '../components/DeleteProductDialog/DeleteProductDialog';

const Stock = ({ setPage }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [selectedType, setSelectedType] = useState(null);
    const productTypes = ['Biere', 'Vin', 'Gouter', 'Miam', 'Soft'];
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        quantity: '',
        type: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [restockForm, setRestockForm] = useState({
        productName: '',
        quantity: '',
        costTotal: '',
        date: ''
    });
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
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des produits');
            setLoading(false);
        }
    };

    // Gestion du formulaire d'ajout de produit
    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitNewProduct = async (e) => {
        e.preventDefault();

        if (!newProduct.name || newProduct.name.trim().length < 2) {
            setError('Le nom du produit doit contenir au moins 2 caractères.');
            return;
        }
        const priceNumber = parseFloat(newProduct.price);
        if (isNaN(priceNumber) || priceNumber < 0.01 || priceNumber > 10000) {
            setError('Le prix doit être un nombre entre 0.01 et 10000.');
            return;
        }
        const quantityNumber = parseInt(newProduct.quantity, 10);
        if (isNaN(quantityNumber) || quantityNumber < 0 || quantityNumber > 1000) {
            setError('La quantité doit être un entier entre 0 et 1000.');
            return;
        }
        if (!newProduct.type || !productTypes.includes(newProduct.type)) {
            setError('Le type de produit est invalide.');
            return;
        }

        const productToAdd = {
            name: newProduct.name.trim(),
            price: priceNumber,
            quantity: quantityNumber,
            type: newProduct.type.trim()
        };

        try {
            const added = await postProduct(productToAdd);
            setProducts((prev) => [...prev, added]);
            setNewProduct({ name: '', price: '', quantity: '', type: '' });
            setIsModalOpen(false);
            setError(null);
        } catch (err) {
            setError("Erreur lors de l'ajout du produit");
        }
    };

    // Gestion de la suppression
    const handleDeleteProduct = (product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteProduct = async () => {
        try {
            await deleteProduct(productToDelete.id);
            setProducts((prev) =>
                prev.filter((p) => p.id !== productToDelete.id)
            );
            setError(null);
        } catch (err) {
            setError('Erreur lors de la suppression du produit');
        } finally {
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    // Gestion du restock
    const openRestockModal = () => {
        setRestockForm({
            productName: '',
            quantity: '',
            costTotal: '',
            date: new Date().toISOString().split('T')[0]
        });
        setAutoCompleteResults([]);
        setIsRestockModalOpen(true);
    };

    const closeRestockModal = () => {
        setIsRestockModalOpen(false);
    };

    const handleRestockInputChange = (e) => {
        const { name, value } = e.target;
        setRestockForm((prev) => ({
            ...prev,
            [name]: value
        }));
        if (name === 'productName') {
            handleAutoComplete(value);
        }
    };

    const handleAutoComplete = (searchValue) => {
        if (!searchValue) {
            setAutoCompleteResults([]);
            return;
        }
        const search = searchValue.toLowerCase();
        const results = products.filter((p) =>
            p.name.toLowerCase().includes(search)
        );
        const sortedResults = results.sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(search);
            const bStarts = b.name.toLowerCase().startsWith(search);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.name.localeCompare(b.name);
        });
        setAutoCompleteResults(sortedResults);
    };

    const handleSelectProductFromAutocomplete = (product) => {
        setRestockForm((prev) => ({
            ...prev,
            productName: product.name
        }));
        setAutoCompleteResults([]);
    };

    const handleSubmitRestock = async (e) => {
        e.preventDefault();

        const targetProduct = products.find(
            (p) =>
                p.name.toLowerCase() ===
                restockForm.productName.trim().toLowerCase()
        );

        if (!targetProduct) {
            setError("Aucun produit ne correspond au nom saisi.");
            return;
        }

        const addedQuantity = parseInt(restockForm.quantity, 10);
        if (isNaN(addedQuantity)) {
            setError("La quantité doit être un entier.");
            return;
        }

        const cost = parseFloat(restockForm.costTotal);
        if (isNaN(cost)) {
            setError("Le coût total doit être un nombre.");
            return;
        }

        const newQuantity = targetProduct.quantity + addedQuantity;
        const updatedProductData = { ...targetProduct, quantity: newQuantity };

        try {
            const updatedProduct = await putProduct(targetProduct.id, updatedProductData);
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === targetProduct.id ? updatedProduct : p
                )
            );

            const restockData = {
                date: restockForm.date,
                idProduit: targetProduct.id,
                quantiteAjoutee: addedQuantity,
                coutTotal: cost,
                fournisseur: 'Modification manuelle'
            };

            await postRestock(restockData);

            closeRestockModal();
            setError(null);
        } catch (err) {
            setError("Erreur lors de l'opération de restock.");
        }
    };

    if (loading) return <Loader message="Chargement des produits..." />;

    return (
        <div className="stock-container">
            <header className="header">
                <h1>Stock</h1>
                <button onClick={() => navigate('/restocks')}>Historique</button>
            </header>

            {error && <div className="error-message">{error}</div>}

            <main>
                <div className="filter-buttons">
                    {productTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`filter-button ${type} ${selectedType === type ? 'active' : ''
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                    <button
                        onClick={() => setSelectedType(null)}
                        className="filter-button"
                    >
                        Tout afficher
                    </button>
                </div>

                <div className="actions">
                    <button
                        className="restock-button"
                        onClick={openRestockModal}
                    >
                        Modifier le stock
                    </button>
                </div>
                <div className="buttons-container">
                    <button
                        className="add-product-button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Ajouter un nouveau produit
                    </button>
                </div>                <div className="products-grid">
                    {(selectedType
                        ? products.filter((p) => p.type === selectedType)
                        : products
                    ).map((product) => (
                        <div
                            key={product.id}
                            className={`product-card ${product.type.toLowerCase()}`}
                        >
                            <div className="product-header">
                                <h3>{product.name}</h3>
                                {/* <button
                                    className="delete-button"
                                    onClick={() => handleDeleteProduct(product)}
                                >
                                    Supprimer
                                </button> */}
                                <IconButton
                                    onClick={() => handleDeleteProduct(product)}
                                    color="error"
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                            <p>{product.price.toFixed(2)} €</p>
                            <p>Stock : {product.quantity}</p>
                        </div>
                    ))}
                </div>
            </main>



            {/* Modal de modification du stock */}
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
                                                onClick={() =>
                                                    handleSelectProductFromAutocomplete(prod)
                                                }
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
                                required
                            />
                            <label>Coût total :</label>
                            <input
                                type="number"
                                name="costTotal"
                                placeholder="Prix total"
                                value={restockForm.costTotal}
                                onChange={handleRestockInputChange}
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

            {/* Modal d'ajout de produit */}
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

            {/* Dialogue de suppression */}
            {deleteDialogOpen && (
                <DeleteProductDialog
                    open={deleteDialogOpen}
                    onClose={() => {
                        setDeleteDialogOpen(false);
                        setProductToDelete(null);
                    }}
                    onConfirm={confirmDeleteProduct}
                    productName={productToDelete ? productToDelete.name : ''}
                />
            )}
        </div>
    );
};

export default Stock;

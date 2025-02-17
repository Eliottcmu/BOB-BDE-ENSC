import React, { useState, useEffect } from 'react';
import { getProducts, postProduct, putProduct, deleteProduct } from '../services/api';
import Loader from '../components/Loader/Loader';
import './Stock.css';

const Stock = ({ setPage }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        quantity: '',
        type: ''
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [editProductForm, setEditProductForm] = useState({
        name: '',
        price: '',
        quantity: '',
        type: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const productTypes = ['Biere', 'Vin', 'Gouter', 'Miam'];

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

    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditProductInputChange = (e) => {
        const { name, value } = e.target;
        setEditProductForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const startEditingProduct = (product) => {
        setEditingProduct(product.id);
        setEditProductForm({
            name: product.name || '',
            price: product.price.toString() || '',
            quantity: product.quantity.toString() || '',
            type: product.type || ''
        });
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                await deleteProduct(productId);
                setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
            } catch (error) {
                setError('Erreur lors de la suppression du produit');
            }
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();

        const productToAdd = {
            name: newProduct.name.trim(),
            price: parseFloat(newProduct.price),
            quantity: parseInt(newProduct.quantity, 10),
            type: newProduct.type
        };

        if (!productToAdd.name || isNaN(productToAdd.price) || isNaN(productToAdd.quantity) || !productToAdd.type) {
            setError('Veuillez remplir tous les champs correctement');
            return;
        }

        try {
            const addedProduct = await postProduct(productToAdd);
            setProducts(prev => [...prev, addedProduct]);
            setNewProduct({ name: '', price: '', quantity: '', type: '' });
            setIsModalOpen(false);
        } catch (err) {
            setError("Erreur lors de l'ajout du produit");
        }
    };

    const handleUpdateProductSubmit = async (productId) => {
        try {
            const productData = {
                name: editProductForm.name.trim(),
                price: parseFloat(editProductForm.price),
                quantity: parseInt(editProductForm.quantity, 10),
                type: editProductForm.type,
                id: productId
            };

            if (!productData.name || isNaN(productData.price) || isNaN(productData.quantity) || !productData.type) {
                setError('Veuillez remplir tous les champs correctement');
                return;
            }

            const updatedProduct = await putProduct(productId, productData);
            setProducts(prev =>
                prev.map(product => (product.id === productId ? updatedProduct : product))
            );
            setEditingProduct(null);
        } catch (err) {
            setError('Erreur lors de la modification du produit');
        }
    };

    if (loading) return <Loader message="Chargement des produits..." />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="ventes-container">
            <header className="header">
                <h1>Stock</h1>


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
                                        {editingProduct === product.id ? (
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                handleUpdateProductSubmit(product.id);
                                            }}>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editProductForm.name}
                                                    onChange={handleEditProductInputChange}
                                                    placeholder="Nom"
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={editProductForm.price}
                                                    onChange={handleEditProductInputChange}
                                                    step="0.01"
                                                    placeholder="Prix"
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={editProductForm.quantity}
                                                    onChange={handleEditProductInputChange}
                                                    placeholder="Quantité"
                                                    required
                                                />
                                                <select
                                                    name="type"
                                                    value={editProductForm.type}
                                                    onChange={handleEditProductInputChange}
                                                    required
                                                >
                                                    <option value="">Sélectionnez un type</option>
                                                    {productTypes.map(type => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="button-group">
                                                    <button type="submit">Sauvegarder</button>
                                                    <button type="button" onClick={() => setEditingProduct(null)}>
                                                        Annuler
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <h3>{product.name}</h3>
                                                <p>Prix : {product.price.toFixed(2)} €</p>
                                                <p>Quantité : {product.quantity}</p>
                                                <div className="button-group">
                                                    <button onClick={() => startEditingProduct(product)}>
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="delete-button"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </main>
            <div className="add-product-container">
                <button
                    className="add-product-button"
                    onClick={() => setIsModalOpen(true)}
                >
                    Ajouter un nouveau produit
                </button>
            </div>

            {
                isModalOpen && (
                    <div className="modal-overlay active">
                        <div className="modal-content">
                            <h2>Ajouter un produit</h2>
                            <form onSubmit={handleProductSubmit}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nom du produit"
                                    value={newProduct.name}
                                    onChange={handleProductInputChange}
                                    required
                                />
                                <input
                                    type="number"
                                    name="price"
                                    placeholder="Prix du produit"
                                    value={newProduct.price}
                                    onChange={handleProductInputChange}
                                    step="0.01"
                                    required
                                />
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantité"
                                    value={newProduct.quantity}
                                    onChange={handleProductInputChange}
                                    required
                                />
                                <select
                                    name="type"
                                    value={newProduct.type}
                                    onChange={handleProductInputChange}
                                    required
                                >
                                    <option value="">Sélectionnez un type</option>
                                    {productTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type}
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
                )
            }
        </div >
    );
};

export default Stock;

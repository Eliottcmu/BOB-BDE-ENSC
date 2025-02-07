import React, { useState, useEffect } from 'react';
import { getProducts, postProduct, putProduct, deleteProduct } from '../services/api';
import Loader from '../components/Loader/Loader';

function Stock({ setPage }) {
    const [products, setProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',  // Change to string
        quantity: '',  // Change to string
        type: ''
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [editProductForm, setEditProductForm] = useState({
        name: '',
        price: '',  // Change to string
        quantity: '',  // Change to string
        type: ''
    });

    useEffect(() => {
        setPage('Stock');
        loadProducts();
    }, [setPage]);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            if (Array.isArray(data)) setProduct(data);
            else console.error("Les données reçues ne sont pas un tableau :", data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des bières :', error);
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

    const handleProductSubmit = async (e) => {
        e.preventDefault();

        // Validate and convert values
        const productToAdd = {
            name: newProduct.name.trim(),
            price: parseFloat(newProduct.price),
            quantity: parseInt(newProduct.quantity, 10),
            type: newProduct.type
        };

        // Additional validation
        if (!productToAdd.name || isNaN(productToAdd.price) || isNaN(productToAdd.quantity) || !productToAdd.type) {
            alert('Please fill all fields correctly. Ensure price and quantity are valid numbers.');
            return;
        }

        try {
            console.log('Sending Product:', productToAdd);
            const addedProduct = await postProduct(productToAdd);
            setProduct(prev => [...prev, addedProduct]);
            setNewProduct({ name: '', price: '', quantity: '', type: '' });
        } catch (error) {
            console.error("Erreur lors de l'ajout du produit :", error);
            alert('Error adding product. Please check the console for details.');
        }
    };

    const handleUpdateProductSubmit = async (productId) => {
        try {
            // Validate and convert values
            const productData = {
                name: editProductForm.name.trim(),
                price: parseFloat(editProductForm.price),
                quantity: parseInt(editProductForm.quantity, 10),
                type: editProductForm.type,
                id: productId
            };

            // Additional validation
            if (!productData.name || isNaN(productData.price) || isNaN(productData.quantity) || !productData.type) {
                alert('Please fill all fields correctly. Ensure price and quantity are valid numbers.');
                return;
            }

            const updatedProduct = await putProduct(productId, productData);
            setProduct(prev =>
                prev.map(product => product.id === productId ? updatedProduct : product)
            );
            setEditingProduct(null);
        } catch (error) {
            console.error('Erreur lors de la modification de la bière :', error);
            alert('Error updating product. Please check the console for details.');
        }
    };

    if (loading) {
        return <Loader message="Chargement du stock..." />;
    }

    return (
        <div>
            <header>
                <h1 className="stock">Stock</h1>
            </header>
            <main>
                <h2>Liste des bières</h2>
                <div className="Products-list">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div className="product-card" key={product.id}>
                                {editingProduct === product.id ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleUpdateProductSubmit(product.id);
                                        }}
                                    >
                                        <input
                                            type="text"
                                            name="name"
                                            value={editProductForm.name || ''}
                                            onChange={handleEditProductInputChange}
                                            required
                                        />
                                        <input
                                            type="number"
                                            name="price"
                                            value={editProductForm.price || ''}
                                            onChange={handleEditProductInputChange}
                                            step="0.01"
                                            required
                                        />
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={editProductForm.quantity || ''}
                                            onChange={handleEditProductInputChange}
                                            required
                                        />
                                        <select
                                            name="type"
                                            value={editProductForm.type || ''}
                                            onChange={handleEditProductInputChange}
                                            required
                                        >
                                            <option value="">Sélectionnez un type</option>
                                            <option value="Biere">Bière</option>
                                            <option value="Vin">Vin</option>
                                            <option value="Cookie">Cookie</option>
                                            <option value="KinderBueno">Kinder Bueno</option>
                                        </select>
                                        <div className="button-group">
                                            <button type="submit">Sauvegarder</button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingProduct(null)}
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h3>Nom : {product.name}</h3>
                                        <p>Prix : {product.price}</p>
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
                        ))
                    ) : (
                        <p>Chargement ou aucune bière disponible.</p>
                    )}
                </div>
                <h2>Ajouter une bière</h2>
                <form onSubmit={handleProductSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Nom de la bière"
                        value={newProduct.name}
                        onChange={handleProductInputChange}
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Prix de bière"
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
                        <option value="Biere">Bière</option>
                        <option value="Vin">Vin</option>
                        <option value="Cookie">Cookie</option>
                        <option value="KinderBueno">Kinder Bueno</option>
                    </select>

                    <button type="submit">Ajouter</button>
                </form>
            </main>
            <footer>All Rights Reserved - BDE ENSC ©</footer>
        </div>
    );
}

export default Stock;
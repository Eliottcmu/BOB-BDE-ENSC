import React, { useState, useEffect } from 'react';
import { getBeers, postBeer, putBeer, deleteBeer } from '../services/api';
import Loader from '../components/Loader/Loader';

function Stock({ setPage }) {
    const [beers, setBeers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newBeer, setNewBeer] = useState({ name: '', price: '', quantity: '' });
    const [editingBeer, setEditingBeer] = useState(null);
    const [editBeerForm, setEditBeerForm] = useState({ name: '', price: '', quantity: '' });


    useEffect(() => {
        setPage('Stock');
        loadBeers();
    }, [setPage]);

    const loadBeers = async () => {
        try {
            const data = await getBeers();
            if (Array.isArray(data)) setBeers(data);
            else console.error("Les données reçues ne sont pas un tableau :", data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des bières :', error);
            setLoading(false);
        }
    };

    const handleBeerInputChange = (e) => {
        const { name, value } = e.target;
        setNewBeer((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditBeerInputChange = (e) => {
        const { name, value } = e.target;
        setEditBeerForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleBeerSubmit = async (e) => {
        e.preventDefault();
        try {
            const addedBeer = await postBeer(newBeer);
            setBeers((prev) => [...prev, addedBeer]);
            setNewBeer({ name: '', price: '', quantity: '' });
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la bière :', error);
        }
    };

    const startEditingBeer = (beer) => {
        setEditingBeer(beer.id);
        setEditBeerForm({
            name: beer.name || '',
            price: beer.price || '',
            quantity: beer.quantity || ''
        });
    };

    if (loading) {
        return <Loader message="Chargement du stock..." />;
    }

    const handleUpdateBeerSubmit = async (beerId) => {
        try {
            const beerData = {
                ...editBeerForm,
                id: beerId
            };
            const updatedBeer = await putBeer(beerId, beerData);
            setBeers((prev) =>
                prev.map((beer) => (beer.id === beerId ? updatedBeer : beer))
            );
            setEditingBeer(null);
        } catch (error) {
            console.error('Erreur lors de la modification de la bière :', error);
        }
    };
    const handleDeleteBeer = async (beerId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette bière ?')) {
            try {
                await deleteBeer(beerId);
                setBeers((prev) => prev.filter((beer) => beer.id !== beerId));
            } catch (error) {
                console.error('Erreur lors de la suppression de la bière :', error);
            }
        }
    };

    return (
        <div>
            <header>
                <h1 className="stock">Stock</h1>
            </header>
            <main>
                <h2>Liste des bières</h2>
                <div className="beers-list">
                    {beers.length > 0 ? (
                        beers.map((beer) => (
                            <div className="beer-card" key={beer.id}>
                                {editingBeer === beer.id ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleUpdateBeerSubmit(beer.id);
                                        }}
                                    >
                                        <input
                                            type="text"
                                            name="name"
                                            value={editBeerForm.name || ''}
                                            onChange={handleEditBeerInputChange}
                                            required
                                        />
                                        <input
                                            type="number"
                                            name="price"
                                            value={editBeerForm.price || ''}
                                            onChange={handleEditBeerInputChange}
                                            required
                                        />
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={editBeerForm.quantity || ''}
                                            onChange={handleEditBeerInputChange}
                                            required
                                        />
                                        <div className="button-group">
                                            <button type="submit">Sauvegarder</button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingBeer(null)}
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h3>Nom : {beer.name}</h3>
                                        <p>Prix : {beer.price}</p>
                                        <p>Quantité : {beer.quantity}</p>
                                        <div className="button-group">
                                            <button onClick={() => startEditingBeer(beer)}>
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBeer(beer.id)}
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
                <form onSubmit={handleBeerSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Nom de la bière"
                        value={newBeer.name}
                        onChange={handleBeerInputChange}
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Prix de bière"
                        value={newBeer.price}
                        onChange={handleBeerInputChange}
                        required
                    />
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Quantité"
                        value={newBeer.quantity}
                        onChange={handleBeerInputChange}
                        required
                    />
                    <button type="submit">Ajouter</button>
                </form>
            </main>
            <footer>All Rights Reserved - BDE ENSC ©</footer>
        </div>
    );
}

export default Stock;

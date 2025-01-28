import React, { useState, useEffect, useMemo } from 'react';
import { getVentes, deleteVente, deleteAllVentes } from '../services/api';
import Loader from '../components/Loader/Loader';

function formatDateTime(datetime) {
    if (!datetime || datetime === 'Invalid Date') return '';
    const date = new Date(datetime);
    if (isNaN(date.getTime())) return '';

    const options = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    return new Intl.DateTimeFormat('fr-FR', options).format(date);
}

const Tresorerie = ({ setPage }) => {
    const [ventes, setVentes] = useState([]);
    const [filteredVentes, setFilteredVentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);

    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [produitFilter, setProduitFilter] = useState('');
    const [groupBy, setGroupBy] = useState('none');

    const productList = useMemo(() => {
        return [...new Set(ventes.map(vente => vente.name))].sort();
    }, [ventes]);


    useEffect(() => {
        setPage('Tresorerie');
        loadVentes();
    }, [setPage]);

    const loadVentes = async () => {
        try {
            const data = await getVentes();

            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setVentes(sortedData);
            setFilteredVentes(sortedData);
            updateTotal(sortedData);
            setLoading(false);
        } catch (err) {
            setError('Erreur lors du chargement des ventes');
            setLoading(false);
        }
    };

    const updateTotal = (data) => {
        const totalVentes = data.reduce((acc, vente) => acc + vente.montant, 0);
        setTotal(totalVentes);
    };
    const handleDeleteVente = async (venteId) => {
        const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?');
        if (confirmDelete) {
            try {
                await deleteVente(venteId);
                const updatedVentes = ventes.filter(vente => vente.id !== venteId);
                setVentes(updatedVentes);
                setFilteredVentes(updatedVentes);
                updateTotal(updatedVentes);
            } catch (err) {
                setError('Erreur lors de la suppression de la vente');
            }
        }
    };

    const handleResetAllVentes = async () => {
        const confirmReset = window.confirm('Êtes-vous sûr de vouloir supprimer toutes les ventes ?');
        if (confirmReset) {
            try {
                await deleteAllVentes();
                setVentes([]);
                setFilteredVentes([]);
                setTotal(0);
            } catch (err) {
                setError('Erreur lors de la suppression de toutes les ventes');
            }
        }
    };

    const applyFilters = () => {
        let filtered = [...ventes];

        if (dateStart) {
            filtered = filtered.filter(vente => new Date(vente.date) >= new Date(dateStart));
        }
        if (dateEnd) {
            filtered = filtered.filter(vente => new Date(vente.date) <= new Date(dateEnd));
        }
        if (produitFilter) {
            filtered = filtered.filter(vente => vente.name === produitFilter);
        }

        setFilteredVentes(filtered);
        updateTotal(filtered);
    };

    const resetFilters = () => {
        setDateStart('');
        setDateEnd('');
        setProduitFilter('');
        setGroupBy('none');
        setFilteredVentes(ventes);
        updateTotal(ventes);
    };

    const groupVentes = (ventes) => {
        if (groupBy === 'none') return ventes;

        const grouped = {};
        ventes.forEach(vente => {
            let key = '';
            const date = new Date(vente.date);

            switch (groupBy) {
                case 'day':
                    key = date.toLocaleDateString();
                    break;
                case 'month':
                    key = `${date.getMonth() + 1}/${date.getFullYear()}`;
                    break;
                case 'year':
                    key = date.getFullYear().toString();
                    break;
                default:
                    return vente;
            }

            if (!grouped[key]) {
                grouped[key] = {
                    date: key,
                    name: `Total ${key}`,
                    montant: 0,
                    entries: []
                };
            }
            grouped[key].montant += vente.montant;
            grouped[key].entries.push(vente);
        });


        return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    if (loading) return <Loader message="Chargement de la trésorerie..." />;
    if (error) return <div className="error-message" role="alert">{error}</div>;

    const groupedVentes = groupVentes(filteredVentes);
    const groupOptions = [
        { value: 'none', label: 'Pas de groupement' },
        { value: 'day', label: 'Par jour' },
        { value: 'month', label: 'Par mois' },
        { value: 'year', label: 'Par année' }
    ];

    return (
        <div className="tresorerie-container">
            <header className="header" role="banner">
                <h1>Trésorerie</h1>

            </header>

            <main className="main-content">
                <div className="filters-container">
                    <div className="filters-grid">
                        <div className="filter-item">
                            <p>penser à faire plusieurs pages pour eviter de faire charger trop de trucs : changer l'api</p>
                            <label>Date début</label>
                            <input
                                type="date"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-item">
                            <label>Date fin</label>
                            <input
                                type="date"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-item">
                            <label>Produit</label>
                            <select
                                value={produitFilter}
                                onChange={(e) => setProduitFilter(e.target.value)}
                                className="filter-input"
                            >
                                <option value="">Tous les produits</option>
                                {productList.map(product => (
                                    <option key={product} value={product}>
                                        {product}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Groupement</label>
                            <select
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                                className="filter-input"
                            >
                                {groupOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button onClick={applyFilters} className="btn btn-primary">
                            Appliquer
                        </button>
                        <button onClick={resetFilters} className="btn btn-secondary">
                            Réinitialiser
                        </button>
                    </div>
                </div>
                <div className="table-actions">
                    <button
                        onClick={handleResetAllVentes}
                        className="btn btn-danger"
                    >
                        Réinitialiser toutes les ventes
                    </button>
                </div>
                <div className="total-card">
                    <h2>Total des ventes: <span>{total.toFixed(2)} €</span></h2>
                </div>

                <div className="table-container">
                    <table className="sales-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Produit</th>
                                <th>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedVentes.map((vente, index) => (
                                <tr key={index}>
                                    <td data-label="Date">{formatDateTime(vente.date)}</td>
                                    <td data-label="Produit">{vente.name}</td>
                                    <td data-label="Montant">{vente.montant.toFixed(2)} €</td>
                                    <td data-label="Actions">
                                        {!vente.entries && ( // Only show delete for individual entries, not grouped
                                            <button
                                                onClick={() => handleDeleteVente(vente.id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Tresorerie;
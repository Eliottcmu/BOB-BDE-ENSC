import React, { useState, useMemo } from 'react';
import { getVentes, deleteVente, deleteAllVentes } from '../services/api';
import {
    Paper, Button, Box, Typography, useMediaQuery
} from '@mui/material';
import Loader from '../components/Loader/Loader';
import './Tresorerie.css';
import TresorerieFilters from '../components/TresorerieFilter/TresorerieFilter';
import TresorerieTable from '../components/TresorerieTable/TresorerieTable';
import ResetSalesDialog from '../components/ResetSalesDialog/ResetSalesDialog';

function formatDateTime(datetime) {
    if (!datetime || datetime === 'Invalid Date') return '';
    const date = new Date(datetime);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date);
}

const Tresorerie = ({ setPage }) => {
    const isMobile = useMediaQuery('(max-width:600px)');

    const [ventes, setVentes] = useState([]);
    const [filteredVentes, setFilteredVentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [dateStart, setDateStart] = useState(null);
    const [dateEnd, setDateEnd] = useState(null);
    const [produitFilter, setProduitFilter] = useState('');
    const [groupBy, setGroupBy] = useState('none');
    const [displayCount, setDisplayCount] = useState(15);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [venteToDelete, setVenteToDelete] = useState(null);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);

    const productList = useMemo(() =>
        [...new Set(ventes.map(vente => vente.name))].sort(), [ventes]
    );

    React.useEffect(() => {
        const fetchVentes = async () => {
            try {
                const data = await getVentes();
                setVentes(data);
                setFilteredVentes(data);
                setTotal(data.reduce((sum, vente) => sum + vente.montant, 0));
                setError(null);
            } catch (err) {
                setError('Erreur lors du chargement des ventes');
            } finally {
                setLoading(false);
            }
        };

        fetchVentes();
    }, []);

    const groupOptions = [
        { value: 'none', label: 'Pas de groupement' },
        { value: 'day', label: 'Par jour' },
        { value: 'month', label: 'Par mois' },
        { value: 'year', label: 'Par année' }
    ];

    const groupVentes = (ventes) => {
        if (groupBy === 'none') return [...ventes].sort((a, b) => new Date(b.date) - new Date(a.date));

        const grouped = ventes.reduce((acc, vente) => {
            const date = new Date(vente.date);
            let key;

            switch (groupBy) {
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    break;
                case 'year':
                    key = `${date.getFullYear()}`;
                    break;
                default:
                    key = vente.date;
            }

            if (!acc[key]) {
                acc[key] = {
                    id: key,
                    date: key,
                    name: 'Groupe',
                    montant: 0,
                    entries: []
                };
            }
            acc[key].montant += vente.montant;
            acc[key].entries.push(vente);
            return acc;
        }, {});

        return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const applyFilters = () => {
        let filtered = ventes;

        if (dateStart) {
            filtered = filtered.filter(vente => new Date(vente.date) >= dateStart);
        }
        if (dateEnd) {
            filtered = filtered.filter(vente => new Date(vente.date) <= dateEnd);
        }
        if (produitFilter) {
            filtered = filtered.filter(vente => vente.name === produitFilter);
        }

        setFilteredVentes(filtered);
        setTotal(filtered.reduce((sum, vente) => sum + vente.montant, 0));
        setDisplayCount(15);
    };

    const resetFilters = () => {
        setDateStart(null);
        setDateEnd(null);
        setProduitFilter('');
        setFilteredVentes(ventes);
        setTotal(ventes.reduce((sum, vente) => sum + vente.montant, 0));
        setDisplayCount(15);
    };

    const handleShowMore = () => {
        setDisplayCount(prevCount => prevCount + 15);
    };

    const handleDeleteVente = async (venteId) => {
        setVenteToDelete(venteId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteVente(venteToDelete);
            const updatedVentes = ventes.filter(vente => vente.id !== venteToDelete);
            setVentes(updatedVentes);
            setFilteredVentes(updatedVentes);
            setTotal(updatedVentes.reduce((sum, vente) => sum + vente.montant, 0));
        } catch (error) {
            setError('Erreur lors de la suppression');
        } finally {
            setDeleteDialogOpen(false);
            setVenteToDelete(null);
        }
    };

    const handleResetAllVentes = () => {
        setResetDialogOpen(true);
    };

    const confirmReset = async () => {
        try {
            await deleteAllVentes();
            setVentes([]);
            setFilteredVentes([]);
            setTotal(0);
            setResetDialogOpen(false);
        } catch (error) {
            setError('Erreur lors de la réinitialisation');
        }
    };

    const handleVenteDeleted = (deletedId) => {
        const updatedVentes = ventes.filter(vente => vente.id !== deletedId);
        setVentes(updatedVentes);
        setFilteredVentes(updatedVentes);
        setTotal(updatedVentes.reduce((sum, vente) => sum + vente.montant, 0));
    };

    if (loading) return <Loader message="Chargement de la trésorerie..." />;
    if (error) return <Typography color="error">{error}</Typography>;

    const displayVentes = groupVentes(filteredVentes).slice(0, displayCount);
    const hasMore = displayCount < groupVentes(filteredVentes).length;

    return (
        <div>
            <header className="header">
                <h1>Trésorerie</h1>
            </header>
            <Box sx={{ padding: isMobile ? 2 : 4, width: '100%' }}>

                <Box id="tresorerie-container" className="tresorerie-wrapper">
                    <Paper className="summary-section">
                        <Typography variant="h6">Total des ventes: {total.toFixed(2)} €</Typography>
                    </Paper>

                    <TresorerieFilters
                        dateStart={dateStart}
                        setDateStart={setDateStart}
                        dateEnd={dateEnd}
                        setDateEnd={setDateEnd}
                        produitFilter={produitFilter}
                        setProduitFilter={setProduitFilter}
                        groupBy={groupBy}
                        setGroupBy={setGroupBy}
                        productList={productList}
                        onApplyFilters={applyFilters}
                        onResetFilters={resetFilters}
                    />

                    <Box className="reset-section">
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleResetAllVentes}
                        >
                            Réinitialiser toutes les ventes
                        </Button>
                    </Box>

                    <TresorerieTable
                        displayVentes={displayVentes}
                        hasMore={hasMore}
                        onShowMore={handleShowMore}
                        onVenteDeleted={handleVenteDeleted}
                        formatDateTime={formatDateTime}
                    />
                </Box>
            </Box>
            <ResetSalesDialog
                open={resetDialogOpen}
                onClose={() => setResetDialogOpen(false)}
                onConfirm={confirmReset}
            />
        </div>
    );
};

export default Tresorerie;
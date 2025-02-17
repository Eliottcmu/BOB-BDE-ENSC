import React, { useState, useMemo } from 'react';
import { getVentes, deleteVente, deleteAllVentes } from '../services/api';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, TextField, Select, MenuItem, Grid, Box, Typography,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import frLocale from 'date-fns/locale/fr';
import Loader from '../components/Loader/Loader';
import './Tresorerie.css';

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
        if (groupBy === 'none') return ventes;

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

        return Object.values(grouped);
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
        try {
            await deleteVente(venteId);
            const updatedVentes = ventes.filter(vente => vente.id !== venteId);
            setVentes(updatedVentes);
            setFilteredVentes(updatedVentes);
            setTotal(updatedVentes.reduce((sum, vente) => sum + vente.montant, 0));
        } catch (error) {
            setError('Erreur lors de la suppression');
        }
    };

    const handleResetAllVentes = async () => {
        try {
            await deleteAllVentes();
            setVentes([]);
            setFilteredVentes([]);
            setTotal(0);
        } catch (error) {
            setError('Erreur lors de la réinitialisation');
        }
    };

    if (loading) return <Loader message="Chargement de la trésorerie..." />;
    if (error) return <Typography color="error">{error}</Typography>;

    const displayVentes = groupVentes(filteredVentes).slice(0, displayCount);
    const hasMore = displayCount < groupVentes(filteredVentes).length;

    return (
        <Box id="tresorerie-container" className="tresorerie-wrapper">
            <Typography variant="h4" gutterBottom className="title">Trésorerie</Typography>

            <Paper className="filter-section">
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                            <DatePicker
                                label="Date début"
                                value={dateStart}
                                onChange={setDateStart}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                            <DatePicker
                                label="Date fin"
                                value={dateEnd}
                                onChange={setDateEnd}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Select
                            fullWidth
                            value={produitFilter}
                            onChange={(e) => setProduitFilter(e.target.value)}
                            className="filter-select"
                        >
                            <MenuItem value="">Tous les produits</MenuItem>
                            {productList.map(product => (
                                <MenuItem key={product} value={product}>{product}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Select
                            fullWidth
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            className="filter-select"
                        >
                            {groupOptions.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                </Grid>
                <Box className="button-group">
                    <Button variant="contained" onClick={applyFilters} className="apply-button">Appliquer</Button>
                    <Button variant="outlined" onClick={resetFilters} className="reset-button">Réinitialiser</Button>
                </Box>
            </Paper>

            <Paper className="summary-section">
                <Typography variant="h6">Total des ventes: {total.toFixed(2)} €</Typography>
            </Paper>

            <TableContainer component={Paper} className="table-container">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Produit</TableCell>
                            <TableCell align="right">Montant</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayVentes.map((vente) => (
                            <TableRow key={vente.id} className="vente-row">
                                <TableCell>{formatDateTime(vente.date)}</TableCell>
                                <TableCell>{vente.name}</TableCell>
                                <TableCell align="right">{vente.montant.toFixed(2)} €</TableCell>
                                <TableCell align="right">
                                    {!vente.entries && (
                                        <IconButton
                                            onClick={() => handleDeleteVente(vente.id)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleShowMore}
                    >
                        Afficher plus
                    </Button>
                </Box>
            )}

            <Box className="reset-section">
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleResetAllVentes}
                >
                    Réinitialiser toutes les ventes
                </Button>
            </Box>
        </Box>
    );
};

export default Tresorerie;
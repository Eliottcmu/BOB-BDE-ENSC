import React from 'react';
import { Grid, Paper, Button, TextField, Select, MenuItem, Box } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from 'date-fns/locale/fr';

const TresorerieFilters = ({
    dateStart,
    setDateStart,
    dateEnd,
    setDateEnd,
    produitFilter,
    setProduitFilter,
    groupBy,
    setGroupBy,
    productList,
    onApplyFilters,
    onResetFilters
}) => {
    const groupOptions = [
        { value: 'none', label: 'Pas de groupement' },
        { value: 'day', label: 'Par jour' },
        { value: 'month', label: 'Par mois' },
        { value: 'year', label: 'Par année' }
    ];

    return (
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
                <Button variant="contained" onClick={onApplyFilters} className="apply-button">
                    Appliquer
                </Button>
                <Button variant="outlined" onClick={onResetFilters} className="reset-button">
                    Réinitialiser
                </Button>
            </Box>
        </Paper>
    );
};

export default TresorerieFilters;
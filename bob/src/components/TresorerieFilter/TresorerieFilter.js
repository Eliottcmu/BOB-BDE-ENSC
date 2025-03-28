import React from 'react';
import { Grid, Paper, Button, TextField, Select, MenuItem, Box } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from 'date-fns/locale/fr';

const TresorerieFiltersCompact = ({
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
        <Paper style={{ padding: '8px', margin: '8px' }} elevation={2}>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                        <DatePicker
                            label="Début"
                            value={dateStart}
                            onChange={setDateStart}
                            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                        <DatePicker
                            label="Fin"
                            value={dateEnd}
                            onChange={setDateEnd}
                            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Select
                        fullWidth
                        value={produitFilter}
                        onChange={(e) => setProduitFilter(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="">Tous</MenuItem>
                        {productList.map((product) => (
                            <MenuItem key={product} value={product}>
                                {product}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Select
                        fullWidth
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                        size="small"
                    >
                        {groupOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>
            <Box display="flex" justifyContent="space-between" mt={1}>
                <Button variant="contained" onClick={onApplyFilters} size="small">
                    Appliquer
                </Button>
                <Button variant="outlined" onClick={onResetFilters} size="small">
                    Réinitialiser
                </Button>
            </Box>
        </Paper>
    );
};

export default TresorerieFiltersCompact;

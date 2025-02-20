import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Button, Box, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteVente } from '../../services/api';

const TresorerieTable = ({
    displayVentes,
    hasMore,
    onShowMore,
    onVenteDeleted,
    formatDateTime
}) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [venteToDelete, setVenteToDelete] = React.useState(null);
    const [error, setError] = React.useState(null);

    const handleDeleteClick = (venteId) => {
        setVenteToDelete(venteId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteVente(venteToDelete);
            onVenteDeleted(venteToDelete);
            setDeleteDialogOpen(false);
            setVenteToDelete(null);
        } catch (error) {
            setError('Erreur lors de la suppression');
        }
    };

    return (
        <>
            {error && <div className="error-message">{error}</div>}
            <TableContainer component={Paper} className="table-container">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Produit</TableCell>
                            <TableCell align="right">Montant</TableCell>
                            <TableCell align="right">Actions</TableCell>
                            <TableCell align="right">Type Règlement</TableCell>
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
                                            onClick={() => handleDeleteClick(vente.id)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                                <TableCell align="right">{vente.typeReglement}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                    <Button variant="contained" onClick={onShowMore}>
                        Afficher plus
                    </Button>
                </Box>
            )}

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmer la suppression"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TresorerieTable;
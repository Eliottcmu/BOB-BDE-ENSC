import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';

const DeleteProductDialog = ({ open, onClose, onConfirm, productName }) => {
    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="delete-product-dialog-title">
            <DialogTitle id="delete-product-dialog-title">
                Supprimer le produit
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Êtes-vous sûr de vouloir supprimer le produit {productName} ?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Annuler
                </Button>
                <Button onClick={onConfirm} variant="contained" color="error">
                    Supprimer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteProductDialog;

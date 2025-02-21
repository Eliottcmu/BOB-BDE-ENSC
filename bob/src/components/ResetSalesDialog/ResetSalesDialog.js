import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';

const ResetSalesDialog = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle className="text-red-600">
                Réinitialiser toutes les ventes
            </DialogTitle>
            <DialogContent>
                <Typography className="py-4">
                    Êtes-vous sûr de vouloir supprimer toutes les ventes ? Cette action est irréversible.
                </Typography>
            </DialogContent>
            <DialogActions className="p-4">
                <Button
                    onClick={onClose}
                    variant="outlined"
                    className="mr-2"
                >
                    Annuler
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    autoFocus
                >
                    Confirmer la suppression
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ResetSalesDialog;
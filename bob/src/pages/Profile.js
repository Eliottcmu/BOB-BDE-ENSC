import React, { useState, useEffect } from 'react';
import { getUser, putUser } from '../services/api';
import { isAuthenticated, getCurrentUser } from '../services/auth';
import { Eye, EyeOff } from 'lucide-react';
import {
    Container, Paper, Typography, TextField, IconButton,
    Box, Button, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length > 3;

const Profile = () => {
    const [userProfile, setUserProfile] = useState({ name: '', email: '', password: '' });
    const [editMode, setEditMode] = useState(false);
    const [visiblePassword, setVisiblePassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            window.location.href = '/login';
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const storedUser = getCurrentUser();
                if (!storedUser) {
                    navigate('/login');
                    return;
                }
                const currentUser = await getUser(storedUser.id);
                setUserProfile({
                    name: currentUser.name,
                    email: currentUser.email,
                    password: currentUser.password
                });
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération du profil :", error);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserProfile(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const validateField = (fieldName, value) => {
        const newErrors = { ...errors };
        if (fieldName === 'email') {
            !validateEmail(value)
                ? newErrors.email = "L'email doit être valide."
                : delete newErrors.email;
        }
        if (fieldName === 'password') {
            !validatePassword(value)
                ? newErrors.password = "Le mot de passe doit faire plus de 3 caractères."
                : delete newErrors.password;
        }
        setErrors(newErrors);
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        validateField(fieldName, userProfile[fieldName]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};
        if (!validateEmail(userProfile.email)) validationErrors.email = "L'email doit être valide.";
        if (!validatePassword(userProfile.password)) validationErrors.password = "Le mot de passe doit faire plus de 3 caractères.";
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const storedUser = getCurrentUser();
            const updatedUser = await putUser(storedUser.id, userProfile);
            localStorage.setItem('user', JSON.stringify({ id: updatedUser.id, isAdmin: updatedUser.isAdmin }));
            setEditMode(false);
        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 6 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Mon Profil
                </Typography>

                {!editMode ? (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Typography><strong>Nom :</strong> {userProfile.name}</Typography>
                        <Typography><strong>Email :</strong> {userProfile.email}</Typography>
                        <Box display="flex" alignItems="center">
                            <Typography sx={{ mr: 1 }}><strong>Mot de passe :</strong></Typography>
                            <Typography sx={{ mr: 1 }}>
                                {visiblePassword ? userProfile.password : '•'.repeat(userProfile.password.length)}
                            </Typography>
                            <IconButton onClick={() => setVisiblePassword(!visiblePassword)} size="small">
                                {visiblePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                        </Box>
                        <Button variant="contained" onClick={() => setEditMode(true)} sx={{ mt: 2 }}>
                            Modifier le profil
                        </Button>
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3}>
                        <TextField
                            label="Nom"
                            name="name"
                            value={userProfile.name}
                            onChange={handleInputChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={userProfile.email}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('email')}
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Mot de passe"
                            name="password"
                            type={visiblePassword ? 'text' : 'password'}
                            value={userProfile.password}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('password')}
                            error={touched.password && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                            required
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <IconButton onClick={() => setVisiblePassword(!visiblePassword)} edge="end">
                                        {visiblePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </IconButton>
                                )
                            }}
                        />
                        <Box display="flex" gap={2} justifyContent="flex-end">
                            <Button variant="outlined" onClick={() => setEditMode(false)}>Annuler</Button>
                            <Button type="submit" variant="contained">Sauvegarder</Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default Profile;

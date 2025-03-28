// components/Profile.js
import React, { useState, useEffect } from 'react';
import { getUser, putUser } from '../services/api';
import { isAuthenticated, getCurrentUser } from '../services/auth';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

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
        // Vérifier si l'utilisateur est authentifié
        if (!isAuthenticated()) {
            // Redirection "manuelle" pour éviter les erreurs de sécurité liées à `replaceState`
            window.location.href = '/login';
            return null; // Important : retourner null après une redirection
        }


        const fetchUserProfile = async () => {
            try {
                const storedUser = getCurrentUser();
                if (!storedUser) {
                    console.error('Aucun utilisateur authentifié trouvé.');
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
            if (!validateEmail(value)) {
                newErrors.email = "L'email doit être valide.";
            } else {
                delete newErrors.email;
            }
        }
        if (fieldName === 'password') {
            if (!validatePassword(value)) {
                newErrors.password = "Le mot de passe doit faire plus de 3 caractères.";
            } else {
                delete newErrors.password;
            }
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
            if (!storedUser) {
                console.error("Utilisateur non authentifié.");
                navigate('/login');
                return;
            }
            const updatedUser = await putUser(storedUser.id, userProfile);
            localStorage.setItem('user', JSON.stringify({ id: updatedUser.id, isAdmin: updatedUser.isAdmin }));
            setEditMode(false);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil :", error);
        }
    };

    if (loading) {
        return <div>Chargement du profil...</div>;
    }

    if (!userProfile || !userProfile.email) {
        return <div>Profil non disponible. Veuillez vous reconnecter.</div>;
    }

    return (
        <div className="personal-profile">
            <header className='header'>
                <h1>Mon Profil</h1>
            </header>
            {!editMode ? (
                <div className="profile-view">
                    <p><strong>Nom :</strong> {userProfile.name}</p>
                    <p><strong>Email :</strong> {userProfile.email}</p>
                    <p>
                        <strong>Mot de passe :</strong>
                        {visiblePassword ? userProfile.password : '•'.repeat(userProfile.password.length)}
                        <button
                            onClick={() => setVisiblePassword(!visiblePassword)}
                            className="password-toggle-btn"
                        >
                            {visiblePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </p>
                    <button onClick={() => setEditMode(true)}>Modifier le profil</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="profile-edit-form">
                    <div className="form-group">
                        <label>Nom</label>
                        <input
                            type="text"
                            name="name"
                            value={userProfile.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userProfile.email}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('email')}
                            required
                        />
                        {touched.email && errors.email && (
                            <p className="error">{errors.email}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <div className="password-input-container">
                            <input
                                type={visiblePassword ? 'text' : 'password'}
                                name="password"
                                value={userProfile.password}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('password')}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setVisiblePassword(!visiblePassword)}
                                className="password-toggle-btn"
                            >
                                {visiblePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {touched.password && errors.password && (
                            <p className="error">{errors.password}</p>
                        )}
                    </div>
                    <div className="button-group">
                        <button type="submit">Sauvegarder</button>
                        <button type="button" onClick={() => setEditMode(false)}>Annuler</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Profile;

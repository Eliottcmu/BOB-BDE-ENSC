import React, { useState, useEffect } from 'react';
import { getUsers, postUser, putUser, deleteUser } from '../services/api';
import Loader from '../components/Loader/Loader';
import { Eye, EyeOff } from 'lucide-react';
import './ListUser.css';

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
    return password.length > 3;
};

const ListUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [errors, setErrors] = useState({ newUser: {}, editForm: {} });
    const [touched, setTouched] = useState({ newUser: {}, editForm: {} });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const userData = await getUsers();
            setUsers(userData);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement :', error);
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await deleteUser(userId);
                setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            } catch (error) {
                console.error("Erreur lors de la suppression de l'utilisateur :", error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser((prevUser) => ({ ...prevUser, [name]: value }));
        validateField('newUser', name, value);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
        validateField('editForm', name, value);
    };

    const validateField = (formType, fieldName, value) => {
        const newErrors = { ...errors[formType] };

        if (fieldName === 'email' && value) {
            if (!validateEmail(value)) {
                newErrors.email = "L'email doit être valide.";
            } else {
                delete newErrors.email;
            }
        }

        if (fieldName === 'password' && value) {
            if (!validatePassword(value)) {
                newErrors.password = "Le mot de passe doit faire plus de 3 caractères.";
            } else {
                delete newErrors.password;
            }
        }

        setErrors(prev => ({ ...prev, [formType]: newErrors }));
    };

    const handleBlur = (formType, fieldName) => {
        setTouched(prev => ({
            ...prev,
            [formType]: { ...prev[formType], [fieldName]: true }
        }));

        const value = formType === 'newUser' ? newUser[fieldName] : editForm[fieldName];
        validateField(formType, fieldName, value);
    };

    const validateNewUser = () => {
        const newErrors = {};
        if (!validateEmail(newUser.email)) newErrors.email = "L'email doit être valide.";
        if (!validatePassword(newUser.password)) newErrors.password = "Le mot de passe doit faire plus de 3 caractères.";
        setErrors((prev) => ({ ...prev, newUser: newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const validateEditUser = () => {
        const editErrors = {};
        if (!validateEmail(editForm.email)) editErrors.email = "L'email doit être valide.";
        if (!validatePassword(editForm.password)) editErrors.password = "Le mot de passe doit faire plus de 3 caractères.";
        setErrors((prev) => ({ ...prev, editForm: editErrors }));
        return Object.keys(editErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateNewUser()) return;

        try {
            const addedUser = await postUser(newUser);
            setUsers((prevUsers) => [...prevUsers, addedUser]);
            setNewUser({ name: '', email: '', password: '' });
            setErrors((prev) => ({ ...prev, newUser: {} }));
            setTouched((prev) => ({ ...prev, newUser: {} }));
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'utilisateur :", error);
        }
    };

    const startEditing = (user) => {
        setEditingUser(user.id);
        setEditForm({ name: user.name, email: user.email, password: user.password });
        setErrors((prev) => ({ ...prev, editForm: {} }));
        setTouched((prev) => ({ ...prev, editForm: {} }));
    };

    const handleUpdateSubmit = async (userId) => {
        if (!validateEditUser()) return;

        try {
            const updatedUser = await putUser(userId, editForm);
            setUsers((prevUsers) =>
                prevUsers.map((user) => (user.id === userId ? updatedUser : user))
            );
            setEditingUser(null);
            setErrors((prev) => ({ ...prev, editForm: {} }));
            setTouched((prev) => ({ ...prev, editForm: {} }));
        } catch (error) {
            console.error("Erreur lors de la modification de l'utilisateur :", error);
        }
    };

    const togglePasswordVisibility = (userId) => {
        setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
    };

    if (loading) {
        return <Loader message="Chargement des utilisateurs..." />;
    }
    if (!users.length) return <div className="loading">Chargement...</div>;

    return (
        <div className="profile-page">
            <div className="users-section">
                <header className='header'>
                    <h1>Liste des utilisateurs</h1>
                </header>
                <div className="users-list">
                    {users.map((user) => (
                        <div className="user-card" key={user.id}>
                            {editingUser === user.id ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleUpdateSubmit(user.id);
                                    }}
                                    className="edit-form"
                                >
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleEditInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <div className="input-wrapper">
                                            <input
                                                type="email"
                                                name="email"
                                                value={editForm.email}
                                                onChange={handleEditInputChange}
                                                onBlur={() => handleBlur('editForm', 'email')}
                                                required
                                            />
                                            {touched.editForm?.email && errors.editForm?.email && (
                                                <p className="error">{errors.editForm.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="input-wrapper">
                                            <div className="password-input-container">
                                                <input
                                                    type={visiblePasswords[user.id] ? 'text' : 'password'}
                                                    name="password"
                                                    value={editForm.password}
                                                    onChange={handleEditInputChange}
                                                    onBlur={() => handleBlur('editForm', 'password')}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility(user.id)}
                                                    className="password-toggle-btn"
                                                >
                                                    {visiblePasswords[user.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            {touched.editForm?.password && errors.editForm?.password && (
                                                <p className="error">{errors.editForm.password}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="button-group">
                                        <button type="submit">Sauvegarder</button>
                                        <button type="button" onClick={() => setEditingUser(null)}>Annuler</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <p>Name : {user.name}</p>
                                    <p>Email : {user.email}</p>
                                    <div className="password-display">
                                        <p>
                                            Password : {visiblePasswords[user.id] ? user.password : '•'.repeat(user.password.length)}
                                            <button
                                                onClick={() => togglePasswordVisibility(user.id)}
                                                className="password-toggle-btn"
                                            >
                                                {visiblePasswords[user.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </p>
                                    </div>
                                    <div className="button-group">
                                        <button className='btn-modif-users' onClick={() => startEditing(user)}>Modifier</button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="delete-button-user">
                                            Supprimer
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
                <div className="form-new-user">
                    <p>Ajouter un utilisateur</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="name"
                                placeholder="Nom"
                                value={newUser.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('newUser', 'email')}
                                    required
                                />
                                {touched.newUser?.email && errors.newUser?.email && (
                                    <p className="error">{errors.newUser.email}</p>
                                )}
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Mot de passe"
                                    value={newUser.password}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('newUser', 'password')}
                                    required
                                />
                                {touched.newUser?.password && errors.newUser?.password && (
                                    <p className="error">{errors.newUser.password}</p>
                                )}
                            </div>
                        </div>
                        <button type="submit">Ajouter</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ListUser;
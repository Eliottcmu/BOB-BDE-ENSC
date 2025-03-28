import React, { useState, useEffect } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import {
    getIsAdmin,
    getProducts,
    getVentes
} from '../services/api';
import { logout } from '../services/auth'; // Importation de la fonction logout

function Home({ setPage }) {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [mostStockedProduct, setMostStockedProduct] = useState('');
    const [mostSoldProduct, setMostSoldProduct] = useState('');
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [todayTopProduct, setTodayTopProduct] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Vérification du statut administrateur
                const adminStatus = await getIsAdmin();
                setIsAdmin(adminStatus);

                // Récupération des produits pour les infos de stock
                const products = await getProducts();
                const mostStocked = products.reduce((prev, current) =>
                    (prev.quantity > current.quantity) ? prev : current
                );
                setMostStockedProduct(mostStocked.name);

                // Récupération des données de ventes
                const sales = await getVentes();

                // Calcul du produit le plus vendu globalement
                const productSales = {};
                sales.forEach(sale => {
                    productSales[sale.name] = (productSales[sale.name] || 0) + sale.quantite;
                });
                const topProduct = Object.entries(productSales)
                    .reduce((prev, [name, quantity]) =>
                        quantity > prev.quantity ? { name, quantity } : prev,
                        { name: '', quantity: 0 }
                    );
                setMostSoldProduct(topProduct.name);

                // Calcul des ventes d'aujourd'hui
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const todaySales = sales.filter(sale => {
                    const saleDate = new Date(sale.date);
                    saleDate.setHours(0, 0, 0, 0);
                    return saleDate.getTime() === today.getTime();
                });

                // Calcul du chiffre d'affaires d'aujourd'hui
                const revenue = todaySales.reduce((sum, sale) =>
                    sum + sale.montant, 0
                );
                setTodayRevenue(revenue || 0);

                // Calcul du produit le plus vendu d'aujourd'hui
                const todayProductSales = {};
                todaySales.forEach(sale => {
                    todayProductSales[sale.name] = (todayProductSales[sale.name] || 0) + sale.quantite;
                });
                const todayTop = Object.entries(todayProductSales)
                    .reduce((prev, [name, quantity]) =>
                        quantity > prev.quantity ? { name, quantity } : prev,
                        { name: '', quantity: 0 }
                    );
                setTodayTopProduct(todayTop.name);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        // Appel à la fonction logout qui retire les cookies et nettoie la session
        logout();
        navigate('/login');
    };

    return (
        <div className="home-container">
            <header className="header">
                <h1>Accueil</h1>
                <Link
                    to={isAdmin ? '/listuser' : '/profile'}
                    className="profile-link"
                >
                    <FaUser />
                </Link>
            </header>
            <main>
                <button className="logout-button" onClick={handleLogout}>Déconnexion</button>
                <div className="sections-container">
                    <button
                        className="section-button"
                        onClick={() => navigate('/statistiques')}
                    >
                        <div className="section-image statistiques"></div>
                        <span>STATISTIQUES</span>
                        <small>Produit le plus vendu: {mostSoldProduct || 'Aucune vente'}</small>
                    </button>
                    <button
                        className="section-button"
                        onClick={() => navigate('/stock')}
                    >
                        <div className="section-image stockage"></div>
                        <span>STOCKAGE</span>
                        <small>Plus grand stock: {mostStockedProduct || 'Aucun stock'}</small>
                    </button>
                    <button
                        className="section-button"
                        onClick={() => navigate('/tresorerie')}
                    >
                        <div className="section-image tresorerie"></div>
                        <span>TRÉSORERIE</span>
                        <small>Ventes aujourd'hui: {todayRevenue.toFixed(2)}€</small>
                    </button>
                    <button
                        className="section-button"
                        onClick={() => navigate('/ventes')}
                    >
                        <div className="section-image ventes"></div>
                        <span>VENTES</span>
                        <small>Meilleure vente du jour: {todayTopProduct || 'Aucune vente'}</small>
                    </button>
                </div>
            </main>
            <img src="BOB.png" id="bob" alt="BOB" />
            <footer>All Rights Reserved - BDE ENSC ©</footer>
        </div>
    );
}

export default Home;

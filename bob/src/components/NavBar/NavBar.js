import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaBoxes, FaChartBar, FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa';
import './NavBar.css';

function NavBar() {
    return (
        <nav className="navbar">
            <Link to="/" className="navlink">
                <FaHome className="navlink-icon" />
                Accueil
            </Link>
            <Link to="/stock" className="navlink">
                <FaBoxes className="navlink-icon" />
                Stocks
            </Link>
            <Link to="/statistiques" className="navlink">
                <FaChartBar className="navlink-icon" />
                Statistiques
            </Link>
            <Link to="/tresorerie" className="navlink">
                <FaMoneyBillWave className="navlink-icon" />
                Trésorerie
            </Link>
            <Link to="/ventes" className="navlink">
                <FaShoppingCart className="navlink-icon" />
                Ventes
            </Link>
        </nav>
    );
}

export default NavBar;

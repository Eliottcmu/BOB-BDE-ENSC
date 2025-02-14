import React, { useState, useEffect } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { getIsAdmin } from '../services/api'

function Home({ setPage }) {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const adminStatus = await getIsAdmin();
                setIsAdmin(adminStatus);
            } catch (error) {
                console.error('Error checking admin status:', error);
            }
        };

        checkAdminStatus();
    }, []);


    const handleLogout = () => {
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
                    </button>
                    <button
                        className="section-button"
                        onClick={() => navigate('/stock')}
                    >
                        <div className="section-image stockage"></div>
                        <span>STOCKAGE</span>
                    </button>
                    <button
                        className="section-button"
                        onClick={() => navigate('/tresorerie')}
                    >
                        <div className="section-image tresorerie"></div>
                        <span>TRÉSORERIE</span>
                    </button>
                    <button
                        className="section-button"
                        onClick={() => navigate('/ventes')}
                    >
                        <div className="section-image ventes"></div>
                        <span>VENTES</span>
                    </button>
                </div>
            </main>
            <img src="BOB.png" id="bob" alt="BOB" />
            <footer>All Rights Reserved - BDE ENSC ©</footer>
        </div >
    );
}

export default Home;

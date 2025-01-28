import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getVentes, getBeers } from '../services/api';
import Loader from '../components/Loader/Loader';
import './Statistiques.css';

const Statistiques = ({ setPage }) => {
    const [loading, setLoading] = useState(true);
    const [ventesData, setVentesData] = useState([]);
    const [beersData, setBeersData] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('all');
    const [statsVentes, setStatsVentes] = useState({
        totalVentes: 0,
        nombreVentes: 0,
        moyenneParVente: 0
    });

    useEffect(() => {
        setPage('Statistiques');
        fetchData();
    }, [setPage]);

    const fetchData = async () => {
        try {
            const [ventes, beers] = await Promise.all([getVentes(), getBeers()]);
            setVentesData(ventes);
            setBeersData(beers);
            calculateStats(ventes);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            setLoading(false);
        }
    };

    const calculateStats = (ventes) => {
        const total = ventes.reduce((sum, vente) => sum + vente.montant, 0);
        setStatsVentes({
            totalVentes: total,
            nombreVentes: ventes.length,
            moyenneParVente: ventes.length ? (total / ventes.length) : 0
        });
    };

    // Previous data preparation functions
    const prepareVentesParJour = () => {
        const ventesParJour = {};
        ventesData.forEach(vente => {
            const date = new Date(vente.date).toLocaleDateString();
            ventesParJour[date] = (ventesParJour[date] || 0) + vente.montant;
        });
        return Object.entries(ventesParJour).map(([date, montant]) => ({
            date,
            montant: Number(montant.toFixed(2))
        }));
    };

    const prepareVentesParProduit = () => {
        const ventesParProduit = {};
        ventesData.forEach(vente => {
            ventesParProduit[vente.name] = (ventesParProduit[vente.name] || 0) + vente.quantite;
        });
        return Object.entries(ventesParProduit).map(([name, quantite]) => ({
            name,
            quantite
        }));
    };

    // New data preparation functions
    const prepareVentesParHeure = () => {
        const ventesParHeure = Array(24).fill(0);
        ventesData.forEach(vente => {
            if (selectedProduct === 'all' || vente.name === selectedProduct) {
                const hour = new Date(vente.date).getHours();
                ventesParHeure[hour] += vente.quantite;
            }
        });
        return ventesParHeure.map((quantite, hour) => ({
            hour: `${hour}h`,
            quantite
        }));
    };

    const prepareVentesParJourSemaine = () => {
        const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const ventesParJour = Array(7).fill(0);
        const totalVentesParJour = Array(7).fill(0);

        ventesData.forEach(vente => {
            const jour = new Date(vente.date).getDay(); // Récupération de l'index du jour
            ventesParJour[jour] += vente.quantite; // Ajout de la quantité vendue pour ce jour
            totalVentesParJour[jour] += 1; // Incrémentation du compteur de ventes pour ce jour
        });

        // Construction du tableau final
        return jours.map((jour, index) => ({
            jour,
            quantite: ventesParJour[index], // Quantité totale vendue pour ce jour
            moyenne: totalVentesParJour[index] > 0
                ? ventesParJour[index] / totalVentesParJour[index]
                : 0 // Moyenne des ventes par jour
        }));
    };


    const prepareTendanceMensuelle = () => {
        const ventesParMois = {};
        ventesData.forEach(vente => {
            const date = new Date(vente.date);
            const moisAnnee = `${date.getMonth() + 1}/${date.getFullYear()}`;
            ventesParMois[moisAnnee] = (ventesParMois[moisAnnee] || 0) + vente.montant;
        });
        return Object.entries(ventesParMois)
            .map(([mois, montant]) => ({
                mois,
                montant: Number(montant.toFixed(2))
            }))
            .sort((a, b) => {
                const [moisA, anneeA] = a.mois.split('/');
                const [moisB, anneeB] = b.mois.split('/');
                return new Date(anneeA, moisA - 1) - new Date(anneeB, moisB - 1);
            });
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) {
        return <Loader message="Chargement des statistiques..." />;
    }

    return (
        <div className="p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Statistiques des Ventes</h1>
            </header>

            <main className="space-y-8">
                {/* Previous statistics cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* ... (previous cards remain the same) ... */}
                </div>

                {/* Product selector for time-based analysis */}
                <div className="flex justify-end mb-4">
                    <select
                        className="p-2 border rounded"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                        <option value="all">Tous les produits</option>
                        {beersData.map(beer => (
                            <option key={beer.id} value={beer.name}>{beer.name}</option>
                        ))}
                    </select>
                </div>

                {/* All graphs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Previous graphs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution des Ventes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={prepareVentesParJour()}>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="montant" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition des Ventes par Produit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={prepareVentesParProduit()}
                                        dataKey="quantite"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {prepareVentesParProduit().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Ventes par Heure</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prepareVentesParHeure()}>
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="quantite" fill="#8884d8" name="Quantité vendue" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ventes par Jour de la Semaine</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prepareVentesParJourSemaine()}>
                                    <XAxis dataKey="jour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="quantite" fill="#82ca9d" name="Quantité totale" />
                                    <Bar dataKey="moyenne" fill="#8884d8" name="Moyenne par jour" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tendance Mensuelle des Ventes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={prepareTendanceMensuelle()}>
                                    <XAxis dataKey="mois" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="montant" stroke="#82ca9d" name="Montant des ventes" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <footer className="mt-8 text-center text-gray-600">
                All Rights Reserved - BDE ENSC ©
            </footer>
        </div>
    );
};

export default Statistiques;
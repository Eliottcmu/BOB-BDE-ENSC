import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getVentes, getBeers } from '../services/api';
import Loader from '../components/Loader/Loader';

const Statistiques = ({ setPage }) => {
    const [loading, setLoading] = useState(true);
    const [ventesData, setVentesData] = useState([]);
    const [beersData, setBeersData] = useState([]);
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
                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total des Ventes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{statsVentes.totalVentes.toFixed(2)} €</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Nombre de Ventes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{statsVentes.nombreVentes}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Moyenne par Vente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{statsVentes.moyenneParVente.toFixed(2)} €</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution des Ventes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LineChart width={500} height={300} data={prepareVentesParJour()}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="montant" stroke="#8884d8" />
                            </LineChart>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition des Ventes par Produit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PieChart width={500} height={300}>
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
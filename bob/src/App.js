import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import React from 'react';
import Home from './pages/Home';
import Stock from './pages/Stock';
import Statistiques from './pages/Statistiques';
import Ventes from './pages/Ventes';
import Tresorerie from './pages/Tresorerie';
import NavBar from './components/NavBar/NavBar';
import Profile from './pages/Profile';
import Page404 from './pages/Page404';
import Loader from './components/Loader/Loader';

const App = () => {
  const [page, setPage] = useState('Home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000); // Simule un délai de chargement
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <NavBar setPage={setPage} />
      <Routes>
        <Route path="/" element={<Home setPage={setPage} />} />
        <Route path="/stock" element={<Stock setPage={setPage} />} />
        <Route path="/statistiques" element={<Statistiques setPage={setPage} />} />
        <Route path="/ventes" element={<Ventes setPage={setPage} />} />
        <Route path="/tresorerie" element={<Tresorerie setPage={setPage} />} />
        <Route path="/profile" element={<Profile setPage={setPage} />} />
        <Route path="*" element={<Page404 setPage={setPage} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

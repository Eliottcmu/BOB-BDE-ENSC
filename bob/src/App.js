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
import Login from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';

const App = () => {
  const [page, setPage] = useState('Home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Create a wrapper component to handle setPage prop consistently
  const PageWrapper = ({ component: Component }) => {
    return <Component setPage={setPage} />;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <NavBar setPage={setPage} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageWrapper component={Home} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <PageWrapper component={Stock} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/statistiques"
          element={
            <ProtectedRoute>
              <PageWrapper component={Statistiques} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ventes"
          element={
            <ProtectedRoute>
              <PageWrapper component={Ventes} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tresorerie"
          element={
            <ProtectedRoute>
              <PageWrapper component={Tresorerie} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageWrapper component={Profile} />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<PageWrapper component={Page404} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
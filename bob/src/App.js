import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
import Home from './pages/Home';
import Stock from './pages/Stock';
import Statistiques from './pages/Statistiques';
import Ventes from './pages/Ventes';
import Tresorerie from './pages/Tresorerie';
import NavBar from './components/NavBar/NavBar';
import Profile from './pages/Profile';
import Login from './pages/LoginPage';
import ListUser from './pages/ListUser';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { isAuthenticated } from './services/auth';
import Restock from './pages/Restocks';

const App = () => {
  const [page, setPage] = useState('Home');

  const PageWrapper = ({ component: Component }) => {
    return <Component setPage={setPage} />;
  };

  const AuthenticatedLayout = () => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    return (
      <>
        <NavBar setPage={setPage} />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<PageWrapper component={Home} />} />
          <Route path="/ventes" element={<PageWrapper component={Ventes} />} />
          <Route path="/profile" element={<PageWrapper component={Profile} />} />
          <Route path="/stock" element={<PageWrapper component={Stock} />} />
          <Route path="/statistiques" element={<PageWrapper component={Statistiques} />} />

          {/* Routes protégées -> droits d'admin */}
          <Route
            path="/tresorerie"
            element={
              <ProtectedRoute requireAdmin>
                <PageWrapper component={Tresorerie} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listuser"
            element={
              <ProtectedRoute requireAdmin>
                <PageWrapper component={ListUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restocks"
            element={
              <ProtectedRoute requireAdmin>
                <PageWrapper component={Restock} />
              </ProtectedRoute>
            }
          />
        </Routes>

      </>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AuthenticatedLayout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

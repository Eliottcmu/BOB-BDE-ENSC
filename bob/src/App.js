import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
import Home from './pages/Home';
import Stock from './pages/Stock';
import Statistiques from './pages/Statistiques';
import Ventes from './pages/Ventes';
import Tresorerie from './pages/Tresorerie';
import NavBar from './components/NavBar/NavBar';
import Profile from './pages/Profile';
import Page404 from './pages/Page404';
import Login from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import ListUser from './pages/ListUser';

const App = () => {
  const [page, setPage] = useState('Home');

  const PageWrapper = ({ component: Component }) => {
    return <Component setPage={setPage} />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <NavBar setPage={setPage} />
                <Routes>
                  <Route path="/" element={<PageWrapper component={Home} />} />
                  <Route path="/stock" element={<PageWrapper component={Stock} />} />
                  <Route path="/statistiques" element={<PageWrapper component={Statistiques} />} />
                  <Route path="/ventes" element={<PageWrapper component={Ventes} />} />
                  <Route path="/tresorerie" element={<PageWrapper component={Tresorerie} />} />
                  <Route path="/profile" element={<PageWrapper component={Profile} />} />
                  <Route path="/listuser" element={<PageWrapper component={ListUser} />} />
                  <Route path="*" element={<PageWrapper component={Page404} />} />
                </Routes>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
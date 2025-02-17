import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './NavBar.css';


const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const paths = ['/', '/stock', '/statistiques', '/tresorerie', '/ventes'];
    const currentValue = paths.indexOf(location.pathname);

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                <BottomNavigation
                    showLabels
                    value={currentValue}
                    onChange={(_, newValue) => {
                        navigate(paths[newValue]);
                    }}
                >
                    <BottomNavigationAction label="Accueil" icon={<HomeIcon />} />
                    <BottomNavigationAction label="Stocks" icon={<Inventory2Icon />} />
                    <BottomNavigationAction label="Statistiques" icon={<BarChartIcon />} />
                    <BottomNavigationAction label="Trésorerie" icon={<AccountBalanceWalletIcon />} />
                    <BottomNavigationAction label="Ventes" icon={<ShoppingCartIcon />} />
                </BottomNavigation>
            </Paper>
        </Box>
    );
};

export default NavBar;
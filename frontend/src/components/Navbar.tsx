import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const context = useContext(AuthContext);
  const isAdmin = context?.isAdmin;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Library Management System
        </Typography>
        <Button color="inherit" component={Link} to="/dashboard">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/books">
          Books
        </Button>
        <Button color="inherit" component={Link} to="/register">
          Register
        </Button>
        {isAdmin && isAdmin() && (
          <Button color="inherit" component={Link} to="/admin">
            Admin
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Welcome, {user.name || user.email}!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Role: {user.role}
      </Typography>
      <Button variant="contained" color="secondary" onClick={logout}>
        Logout
      </Button>
    </Container>
  );
};

export default Dashboard;

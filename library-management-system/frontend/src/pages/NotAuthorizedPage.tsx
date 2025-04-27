import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotAuthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" gutterBottom>
        You do not have permission to view this page.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </Container>
  );
};

export default NotAuthorizedPage;

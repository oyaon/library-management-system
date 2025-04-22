import React, { useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { ErrorContext } from '../contexts/ErrorContext';

const ErrorSnackbar: React.FC = () => {
  const { error, clearError } = useContext(ErrorContext);

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={clearError}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="error" onClose={clearError} sx={{ width: '100%' }}>
        {error}
      </Alert>
    </Snackbar>
  );
};

export default ErrorSnackbar;

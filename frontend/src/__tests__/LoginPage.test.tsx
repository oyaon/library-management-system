import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ErrorContext } from '../contexts/ErrorContext';

// import React from 'react'; // removed unused import

const mockLogin = vi.fn();

const renderWithProviders = () => {
  render(
    <ErrorContext.Provider value={{ error: '', setError: () => {}, clearError: () => {} }}>
      <AuthContext.Provider value={{
        user: null,
        login: mockLogin,
        logout: () => {},
        register: async () => ({} as any), // stub User to satisfy TS
        loading: false,
        error: '',
        hasRole: () => false,
        isAdmin: () => false
      }}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    </ErrorContext.Provider>
  );
};

describe('LoginPage', () => {
  it('renders email and password fields and login button', () => {
    renderWithProviders();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls login on form submit', async () => {
    renderWithProviders();
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
  });
});

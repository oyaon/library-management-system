import React, { createContext, useState, ReactNode } from 'react';

interface ErrorContextType {
  error: string;
  setError: (msg: string) => void;
  clearError: () => void;
}

export const ErrorContext = createContext<ErrorContextType>({
  error: '',
  setError: () => {},
  clearError: () => {}
});

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string>('');

  const clearError = () => setError('');

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

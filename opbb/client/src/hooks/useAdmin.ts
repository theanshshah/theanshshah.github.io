import { useState } from 'react';

export const useAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (password: string) => {
    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return { isAuthenticated, login };
};

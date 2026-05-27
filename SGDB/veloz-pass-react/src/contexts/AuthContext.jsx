import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch CSRF token ao montar
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/csrf-token');
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Erro ao buscar CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  // Login
  const login = useCallback(
    async (email, senha) => {
      setLoading(true);
      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          credentials: 'include',
          body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setToken(data.token);
        setUser({
          id: data.id,
          nome: data.nome,
          cod_identificador: data.cod_identificador,
        });

        sessionStorage.setItem('auth_token', data.token);
        sessionStorage.setItem(
          'user_data',
          JSON.stringify({
            id: data.id,
            nome: data.nome,
            cod_identificador: data.cod_identificador,
          })
        );

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [csrfToken]
  );

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.clear();
  }, []);

  // Register
  const register = useCallback(
    async (userData) => {
      setLoading(true);
      try {
        const response = await fetch('/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          credentials: 'include',
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setToken(data.token);
        setUser({
          id: data.id,
          nome: data.nome,
          cod_identificador: data.cod_identificador,
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [csrfToken]
  );

  const value = {
    user,
    token,
    csrfToken,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

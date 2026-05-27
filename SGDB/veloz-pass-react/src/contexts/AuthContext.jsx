import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedToken = sessionStorage.getItem('auth_token');
        const savedUser = sessionStorage.getItem('user_data');
        const savedCsrf = sessionStorage.getItem('csrf_token');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }

        if (savedCsrf) {
          setCsrfToken(savedCsrf);
        }
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);

        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user_data');
        sessionStorage.removeItem('csrf_token');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/csrf-token', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar CSRF token');
        }

        const data = await response.json();

        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);

          sessionStorage.setItem(
            'csrf_token',
            data.csrfToken
          );
        }
      } catch (error) {
        console.error(
          'Erro ao buscar CSRF token:',
          error
        );
      }
    };

    fetchCsrfToken();
  }, []);

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

        if (!response.ok) {
          throw new Error(
            data.message || 'Erro ao fazer login'
          );
        }

        const userData = {
          id: data.id,
          nome: data.nome,
          cod_identificador: data.cod_identificador,
        };

        setToken(data.token);
        setUser(userData);

        sessionStorage.setItem(
          'auth_token',
          data.token
        );

        sessionStorage.setItem(
          'user_data',
          JSON.stringify(userData)
        );

        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      } finally {
        setLoading(false);
      }
    },
    [csrfToken]
  );

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

        if (!response.ok) {
          throw new Error(
            data.message || 'Erro ao cadastrar'
          );
        }

        const newUser = {
          id: data.id,
          nome: data.nome,
          cod_identificador: data.cod_identificador,
        };

        setToken(data.token);
        setUser(newUser);

        sessionStorage.setItem(
          'auth_token',
          data.token
        );

        sessionStorage.setItem(
          'user_data',
          JSON.stringify(newUser)
        );

        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      } finally {
        setLoading(false);
      }
    },
    [csrfToken]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setCsrfToken(null);

    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('csrf_token');
  }, []);

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
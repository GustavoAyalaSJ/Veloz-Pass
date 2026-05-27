import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import './Auth.css';

export const Login = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!isValidEmail(email)) {
      setErro('Email inválido');
      return;
    }

    if (!isValidPassword(senha)) {
      setErro('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    const result = await login(email, senha);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErro(result.error || 'Erro ao fazer login');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Bem-vindo ao Veloz Pass</h2>
        {erro && <div className="erro-message">{erro}</div>}

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="switch-auth-link">
          Não tem conta? <a href="#" onClick={onSwitchToRegister}>Cadastre-se</a>
        </p>
      </form>
    </div>
  );
};
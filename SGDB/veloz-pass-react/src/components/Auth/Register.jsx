import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  isValidEmail,
  isValidPassword,
  isValidCPF,
  isValidPhone,
} from '../../utils/validators';
import './Auth.css';

export const Register = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    nome_usuario: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    confirmar_senha: '',
  });
  const [erro, setErro] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!formData.nome_usuario.trim()) {
      setErro('Nome de usuário é obrigatório');
      return;
    }

    if (!isValidCPF(formData.cpf)) {
      setErro('CPF inválido');
      return;
    }

    if (!isValidPhone(formData.telefone)) {
      setErro('Telefone inválido');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setErro('Email inválido');
      return;
    }

    if (!isValidPassword(formData.senha)) {
      setErro('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (formData.senha !== formData.confirmar_senha) {
      setErro('Senhas não coincidem');
      return;
    }

    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErro(result.error || 'Erro ao fazer cadastro');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Criar Conta</h2>
        {erro && <div className="erro-message">{erro}</div>}

        <div className="form-group">
          <label htmlFor="nome">Nome de Usuário:</label>
          <input
            id="nome"
            type="text"
            name="nome_usuario"
            value={formData.nome_usuario}
            onChange={handleChange}
            placeholder="Seu nome"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cpf">CPF:</label>
          <input
            id="cpf"
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone:</label>
          <input
            id="telefone"
            type="tel"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <input
            id="senha"
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmar_senha">Confirmar Senha:</label>
          <input
            id="confirmar_senha"
            type="password"
            name="confirmar_senha"
            value={formData.confirmar_senha}
            onChange={handleChange}
            placeholder="Confirme sua senha"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </button>

        <p className="switch-auth-link">
          Já tem conta? <a href="#" onClick={onSwitchToLogin}>Faça login</a>
        </p>
      </form>
    </div>
  );
};
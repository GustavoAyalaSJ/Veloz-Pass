import React from 'react';
import './PoliticasModal.css'; // Você pode criar um CSS específico para o modal de políticas

const PoliticasModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="politicas-overlay" onClick={onClose}>
      <div className="politicas-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>
        <h2>Termos de Política</h2>
        <div className="politicas-content">
          <div>
            <strong>1. Sobre o Serviço:</strong>
            <p>O Veloz Pass é um sistema online desenvolvido para facilitar a realização de recarga sem cartões de transporte utilizados na cidade de Joinville. O serviço tem como objetivo oferecer praticidade e rapidez aos usuários.</p>
          </div>
          <div>
            <strong>2. Uso da Conta:</strong>
            <p>Cada usuário deve possuir apenas uma conta vinculada aos seus dados pessoais. Não é permitido criar contas duplicadas utilizando o mesmo CPF ou telefone. Em caso de perda de acesso à conta, o usuário deve entrar em contato com o suporte para realizar o processo de recuperação, comprovando que é o dono da conta.</p>
          </div>
          <div>
            <strong>3. Sistema de Recarga:</strong>
            <p>O sistema de recarga funciona de forma direta e não armazena dados bancários dos usuários. As informações utilizadas para pagamento são processadas apenas no momento da transação. O Veloz Pass não incentiva o compartilhamento de dados pessoais ou financeiros entre usuários ou terceiros.</p>
          </div>
          <div>
            <strong>4. Responsabilidade:</strong>
            <p>O Veloz Pass se compromete a fornecer um sistema funcional e acessível. Entretanto, não nos responsabilizamos por falhas decorrentes de problemas de conexão via internet, erros de preenchimento de dados por parte do usuário ou solicitações de transações realizadas incorretamente. Ao utilizar o serviço, o usuário reconhece e aceita essas condições.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliticasModal;
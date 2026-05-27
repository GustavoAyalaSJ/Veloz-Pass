import React from 'react';
import Carousel from '../components/App/Carousel';
import { toast } from 'react-toastify';
import '../styles/AppPage.css';

const images = [
  '/Assets/Carrousel/imagem1.webp',
  '/Assets/Carrousel/imagem2.webp',
  '/Assets/Carrousel/imagem3.webp'
];

export const AppPage = () => {
  const handleDownloadClick = (store) => {
    toast.info(`Download na ${store} em fase de desenvolvimento.`);
  };

  return (
    <div className="app-page-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Veloz Pass: Seu Transporte na Palma da Mão</h1>
          <p>Recarregue seu cartão de transporte de forma rápida, segura e sem filas.</p>
          <div className="download-buttons">
            <button className="download-btn google-play" onClick={() => handleDownloadClick('Google Play')}>
              <i className="bi bi-google-play"></i> Google Play
            </button>
            <button className="download-btn apple-store" onClick={() => handleDownloadClick('Apple Store')}>
              <i className="bi bi-apple"></i> Apple Store
            </button>
          </div>
        </div>
        <div className="hero-image">
          {/* Imagem principal do app ou mockups */}
          <img src="/Assets/app-mockup.webp" alt="Veloz Pass App" />
        </div>
      </section>

      <section className="features-section">
        <h2>Funcionalidades que Você Vai Amar</h2>
        <div className="feature-list">
          <div className="feature-item">
            <i className="bi bi-speedometer2"></i>
            <h3>Recarga Rápida</h3>
            <p>Adicione créditos ao seu cartão em segundos, a qualquer hora e em qualquer lugar.</p>
          </div>
          <div className="feature-item">
            <i className="bi bi-shield-check"></i>
            <h3>Segurança</h3>
            <p>Transações protegidas com as mais avançadas tecnologias de segurança.</p>
          </div>
          <div className="feature-item">
            <i className="bi bi-clock-history"></i>
            <h3>Histórico Completo</h3>
            <p>Acompanhe todas as suas recargas e pagamentos de forma detalhada.</p>
          </div>
        </div>
      </section>

      <section className="carousel-section">
        <h2>Veja como é fácil usar</h2>
        <Carousel images={images} />
      </section>

      <section className="cta-section">
        <h2>Baixe Agora e Simplifique Seu Dia!</h2>
        <div className="download-buttons">
          <button className="download-btn google-play" onClick={() => handleDownloadClick('Google Play')}>
            <i className="bi bi-google-play"></i> Google Play
          </button>
          <button className="download-btn apple-store" onClick={() => handleDownloadClick('Apple Store')}>
            <i className="bi bi-apple"></i> Apple Store
          </button>
        </div>
      </section>
    </div>
  );
};
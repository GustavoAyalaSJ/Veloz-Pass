document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.carousel-photos');
    if (!container) return;

    const imagens = [
        '/assets/Carrousel/imagem1.webp',
        '/assets/Carrousel/imagem2.webp',
        '/assets/Carrousel/imagem3.webp'
    ];

    let indexAtual = 0;

    container.innerHTML = `
        <button class="carousel-btn prev" aria-label="Slide anterior"><i class="bi bi-chevron-left"></i></button>
        <div class="carousel-track-container">
            <ul class="carousel-track"></ul>
        </div>
        <button class="carousel-btn next" aria-label="Próximo slide"><i class="bi bi-chevron-right"></i></button>
    `;

    const track = container.querySelector('.carousel-track');

    const fragment = document.createDocumentFragment();
    imagens.forEach((src) => {
        const li = document.createElement('li');
        li.className = 'carousel-slide';
        li.innerHTML = `<img src="${src}" alt="Interface Veloz Pass" loading="lazy">`;
        fragment.appendChild(li);
    });
    track.appendChild(fragment);

    const slides = Array.from(track.children);

    const moverParaSlide = (index) => {
        if (!slides.length || !slides[0]) return;
        const larguraSlide = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${index * larguraSlide}px)`;
        indexAtual = index;
    };

    container.querySelector('.next')?.addEventListener('click', () => {
        indexAtual = (indexAtual + 1) % slides.length;
        moverParaSlide(indexAtual);
    });

    container.querySelector('.prev')?.addEventListener('click', () => {
        indexAtual = (indexAtual - 1 + slides.length) % slides.length;
        moverParaSlide(indexAtual);
    });

    let temporizadorResize;
    window.addEventListener('resize', () => {
        clearTimeout(temporizadorResize);
        temporizadorResize = setTimeout(() => {
            moverParaSlide(indexAtual);
        }, 100);
    });

    const btnGooglePlay = document.querySelector('.download-btn1');
    const btnAppleStore = document.querySelector('.download-btn2');

    const emDesenvolvimento = (e) => {
        e.preventDefault();
        alert('Em fase de desenvolvimento.');
    };

    btnGooglePlay?.addEventListener('click', emDesenvolvimento);
    btnAppleStore?.addEventListener('click', emDesenvolvimento);

    if (slides.length > 0) {
        moverParaSlide(0);
    }
});
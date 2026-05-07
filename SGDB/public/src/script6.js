document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.carousel-photos');

    const imagens = [
        'Assets/placeholder.webp',
        'Assets/placeholder.webp',
        'Assets/placeholder.webp'
    ];

    let indexAtual = 0;

    container.innerHTML = `
        <button class="carousel-btn prev"><i class="bi bi-chevron-left"></i></button>
        <div class="carousel-track-container">
            <ul class="carousel-track"></ul>
        </div>
        <button class="carousel-btn next"><i class="bi bi-chevron-right"></i></button>
    `;

    const track = container.querySelector('.carousel-track');

    imagens.forEach((src) => {
        const li = document.createElement('li');
        li.className = 'carousel-slide';
        li.innerHTML = `<img src="${src}" alt="Interface Veloz Pass">`;
        track.appendChild(li);
    });

    const slides = Array.from(track.children);

    const moverParaSlide = (index) => {
        const larguraSlide = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${index * larguraSlide}px)`;
        indexAtual = index;
    };

    container.querySelector('.next').addEventListener('click', () => {
        indexAtual = (indexAtual + 1) % slides.length;
        moverParaSlide(indexAtual);
    });

    container.querySelector('.prev').addEventListener('click', () => {
        indexAtual = (indexAtual - 1 + slides.length) % slides.length;
        moverParaSlide(indexAtual);
    });

    const btnGooglePlay = document.querySelector('.download-btn1');
    const btnAppleStore = document.querySelector('.download-btn2');

    const mostrarEmDesenvolvimento = () => {
        alert('Em desenvolvimento.');
    };

    btnGooglePlay?.addEventListener('click', mostrarEmDesenvolvimento);
    btnAppleStore?.addEventListener('click', mostrarEmDesenvolvimento);

    window.addEventListener('resize', () => moverParaSlide(indexAtual));
});


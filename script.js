// Animación de entrada para elementos
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar secciones para animación
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section, .hero, footer');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Animación de tarjetas individuales
    const cards = document.querySelectorAll('.service-card, .phase, .step-card, .contact-item');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            const cardObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, index * 100);
                        cardObserver.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            cardObserver.observe(card);
        }, 0);
    });

    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Efecto parallax suave en el hero
    let lastScrollY = window.scrollY;
    const heroImage = document.querySelector('.hero-image');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (heroImage && scrollY < window.innerHeight) {
            heroImage.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
        lastScrollY = scrollY;
    });

    // Animación del ícono del cerebro
    const brainIcon = document.querySelector('.brain-icon');
    if (brainIcon) {
        brainIcon.addEventListener('mouseenter', () => {
            brainIcon.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        brainIcon.addEventListener('mouseleave', () => {
            brainIcon.style.transform = 'scale(1) rotate(0deg)';
        });
    }
});

// Contador de fase visible
const phases = document.querySelectorAll('.phase');
phases.forEach(phase => {
    phase.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
        this.style.transform = 'translateY(-10px) scale(1.05)';
    });
    
    phase.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Efecto hover en tarjetas de servicio
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
    });
});

// Validación y efectos para información de contacto
const contactItems = document.querySelectorAll('.contact-item a');
contactItems.forEach(item => {
    item.addEventListener('click', function(e) {
        // Pequeña animación al hacer clic
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});

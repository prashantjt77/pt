document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════
    // 1. PREMIUM ANIMATED PARTICLE NETWORK
    //    (Dark theme — vibrant glowing particles)
    // ═══════════════════════════════════════════
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 180 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    // Track mouse position
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle color palette (vibrant on dark — brighter for contrast)
    const palette = [
        { r: 167, g: 139, b: 250 },   // purple/violet
        { r: 56, g: 189, b: 248 },     // sky blue
        { r: 45, g: 212, b: 191 },     // teal
        { r: 244, g: 114, b: 182 },    // pink
        { r: 251, g: 146, b: 60 },     // orange
        { r: 52, g: 211, b: 153 },     // emerald
        { r: 139, g: 92, b: 246 },     // violet
        { r: 251, g: 191, b: 36 },     // amber
    ];

    class Particle {
        constructor(layer) {
            this.layer = layer; // 0 = far/slow, 1 = mid, 2 = near/fast
            this.reset(true);
        }

        reset(initial) {
            this.x = initial ? Math.random() * canvas.width : Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : Math.random() * canvas.height;

            // Layer-based sizing and speed (parallax depth)
            const layerMultiplier = [0.3, 0.6, 1.0][this.layer];
            this.size = (Math.random() * 2.5 + 0.8) * layerMultiplier;
            this.baseSpeedX = (Math.random() - 0.5) * 0.4 * layerMultiplier;
            this.baseSpeedY = (Math.random() - 0.5) * 0.4 * layerMultiplier;
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;

            // Alpha by layer (brighter on dark bg)
            this.baseAlpha = [0.2, 0.35, 0.6][this.layer];
            this.alpha = this.baseAlpha;

            // Glow pulsing
            this.pulseOffset = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.008 + Math.random() * 0.015;

            // Color from palette
            const c = palette[Math.floor(Math.random() * palette.length)];
            this.color = c;
        }

        update(time) {
            // Pulse alpha
            this.alpha = this.baseAlpha + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.15;

            // Mouse interaction (attract/repel near particles)
            if (mouse.x != null && mouse.y != null && this.layer >= 1) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    // Gentle attraction
                    this.speedX = this.baseSpeedX + Math.cos(angle) * force * 0.4;
                    this.speedY = this.baseSpeedY + Math.sin(angle) * force * 0.4;
                    // Boost alpha near mouse
                    this.alpha = Math.min(0.9, this.alpha + force * 0.4);
                } else {
                    this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
                    this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
                }
            } else {
                this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
                this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
            }

            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap around edges
            if (this.x < -20) this.x = canvas.width + 20;
            if (this.x > canvas.width + 20) this.x = -20;
            if (this.y < -20) this.y = canvas.height + 20;
            if (this.y > canvas.height + 20) this.y = -20;
        }

        draw() {
            const { r, g, b } = this.color;

            // Outer glow (larger on dark bg for more ambiance)
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 5
            );
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const area = canvas.width * canvas.height;
        const baseCount = Math.min(100, Math.floor(area / 10000));

        // Create particles in 3 depth layers
        for (let i = 0; i < baseCount * 0.3; i++) particles.push(new Particle(0)); // far
        for (let i = 0; i < baseCount * 0.4; i++) particles.push(new Particle(1)); // mid
        for (let i = 0; i < baseCount * 0.3; i++) particles.push(new Particle(2)); // near
    }

    function drawConnections() {
        // Only connect mid and near particles
        const connectableParticles = particles.filter(p => p.layer >= 1);

        for (let i = 0; i < connectableParticles.length; i++) {
            for (let j = i + 1; j < connectableParticles.length; j++) {
                const a = connectableParticles[i];
                const b = connectableParticles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 160;

                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.2;

                    // Gradient line between the two particle colors
                    const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                    grad.addColorStop(0, `rgba(${a.color.r}, ${a.color.g}, ${a.color.b}, ${opacity})`);
                    grad.addColorStop(1, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${opacity})`);

                    ctx.beginPath();
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 1;
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        // Mouse connections — draw lines from mouse to nearby particles
        if (mouse.x != null && mouse.y != null) {
            for (let i = 0; i < connectableParticles.length; i++) {
                const p = connectableParticles[i];
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    const opacity = (1 - dist / mouse.radius) * 0.25;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(mouse.x, mouse.y);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                }
            }
        }
    }

    let time = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time++;

        // Draw each particle (far layer first for proper depth)
        particles.sort((a, b) => a.layer - b.layer);
        particles.forEach(p => {
            p.update(time);
            p.draw();
        });

        drawConnections();
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    // ═══════════════════════════════════
    // 2. NAVBAR SCROLL EFFECT
    // ═══════════════════════════════════
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ═══════════════════════════════════
    // 3. MOBILE MENU
    // ═══════════════════════════════════
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ═══════════════════════════════════
    // 4. SCROLL REVEAL ANIMATIONS
    // ═══════════════════════════════════
    const fadeElements = document.querySelectorAll('.fade-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));

    // Trigger for items already in viewport
    setTimeout(() => {
        fadeElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);

    // ═══════════════════════════════════
    // 5. ANIMATED STAT COUNTERS
    // ═══════════════════════════════════
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    function animateCounters() {
        if (countersStarted) return;
        countersStarted = true;

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);

                stat.textContent = current;
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target;
                }
            };
            requestAnimationFrame(updateCounter);
        });
    }

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        statsObserver.observe(statsSection);
    }

    // ═══════════════════════════════════
    // 6. SMOOTH SCROLL FOR NAV LINKS
    // ═══════════════════════════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ═══════════════════════════════════
    // 7. ACTIVE NAV LINK HIGHLIGHT
    // ═══════════════════════════════════
    const sections = document.querySelectorAll('.section, .hero');
    const navLinksList = document.querySelectorAll('.nav-links a:not(.btn-nav)');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinksList.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = '#a78bfa';
            }
        });
    });
});

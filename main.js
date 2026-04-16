document.addEventListener('DOMContentLoaded', () => {
    // Add illumination overlay
    const illumination = document.createElement('div');
    illumination.className = 'mouse-illumination';
    document.body.appendChild(illumination);

    // Custom Cursor tracking
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // Background illumination tracking
        document.body.style.setProperty('--mouse-x', e.clientX + 'px');
        document.body.style.setProperty('--mouse-y', e.clientY + 'px');

        setTimeout(() => {
            follower.style.left = e.clientX - 16 + 'px';
            follower.style.top = e.clientY - 16 + 'px';
        }, 50);
    });

    // Reveal animations on scroll
    const revealElements = document.querySelectorAll('.reveal, .reveal-text');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top;
            const elementBottom = rect.bottom;

            // Define a threshold for visibility
            const threshold = 100;

            // If the element is within the viewport (with threshold)
            if (elementTop < windowHeight - threshold && elementBottom > threshold) {
                el.classList.add('active');
            } else {
                // Remove class to animate out/ready for re-entry
                el.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Smooth reveal for text
    document.querySelectorAll('.reveal-text').forEach(el => {
        el.style.opacity = '1'; // Ensure visible after animation logic sets in
    });

    // Navbar scroll effect
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.padding = '1rem 5%';
            nav.style.backgroundColor = 'rgba(5, 5, 5, 0.9)';
        } else {
            nav.style.padding = '2rem 5%';
            nav.style.backgroundColor = 'transparent';
        }
    });

    // Hover effect for service cards and video cards
    document.querySelectorAll('.service-card, .video-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            follower.style.transform = 'scale(1.5)';
            follower.style.backgroundColor = 'rgba(0, 242, 255, 0.1)';
        });
        card.addEventListener('mouseleave', () => {
            follower.style.transform = 'scale(1)';
            follower.style.backgroundColor = 'transparent';
        });
    });

    // Video Modal Logic
    const videoCards = document.querySelectorAll('.video-card');
    const modal = document.getElementById('video-modal');
    
    if (modal) {
        const modalIframe = document.getElementById('modal-iframe');
        const closeModal = document.querySelector('.close-modal');

        videoCards.forEach(card => {
            card.addEventListener('click', () => {
                const iframe = card.querySelector('iframe');
                if(iframe) {
                    modalIframe.src = iframe.src;
                    modal.classList.add('active');
                }
            });
        });

        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
            modalIframe.src = ''; 
        });

        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                modal.classList.remove('active');
                modalIframe.src = ''; 
            }
        });
    }

    // Hamburger Menu Logic
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    // Infinite Carousel Logic
    const reviewsGrid = document.querySelector('.reviews-grid');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (reviewsGrid && prevBtn && nextBtn) {
        
        const getScrollStep = () => {
            const card = reviewsGrid.querySelector('.review-card');
            const gap = parseFloat(window.getComputedStyle(reviewsGrid).gap) || 32;
            return card.offsetWidth + gap;
        };

        const originalCards = Array.from(reviewsGrid.children);
        const originalCount = originalCards.length;

        // Remove 'reveal' class so cloning doesn't trap them in opacity 0
        originalCards.forEach(card => card.classList.remove('reveal'));

        // Clone cards to create 5 exact identical sets (so scroll boundary is extremely far)
        for (let i = 0; i < 4; i++) {
            originalCards.forEach(card => {
                reviewsGrid.appendChild(card.cloneNode(true));
            });
        }

        setTimeout(() => {
            const step = getScrollStep();
            const originalWidth = step * originalCount;

            // Initialize position strictly in the middle (Set 3 out of 5)
            reviewsGrid.style.scrollBehavior = 'auto';
            reviewsGrid.scrollLeft = originalWidth * 2;
            void reviewsGrid.offsetWidth; // force css reflow
            reviewsGrid.style.scrollBehavior = 'smooth';

            // We only check borders safely after native scrolling finishes entirely (to avoid blocking touch scroll inertia)
            reviewsGrid.addEventListener('scrollend', () => {
                const current = reviewsGrid.scrollLeft;

                // Si se meten al primer set (Llegando muy cerca a la izquierda absoluta)
                if (current < originalWidth * 1) {
                    reviewsGrid.style.scrollBehavior = 'auto';
                    reviewsGrid.scrollLeft += (originalWidth * 2);
                    void reviewsGrid.offsetWidth;
                    reviewsGrid.style.scrollBehavior = 'smooth';
                }
                // Si se meten al quinto set (Llegando muy cerca a la derecha absoluta)
                else if (current >= originalWidth * 4) {
                    reviewsGrid.style.scrollBehavior = 'auto';
                    reviewsGrid.scrollLeft -= (originalWidth * 2);
                    void reviewsGrid.offsetWidth;
                    reviewsGrid.style.scrollBehavior = 'smooth';
                }
            });

            const scrollNext = () => {
                reviewsGrid.scrollBy({ left: step, behavior: 'smooth' });
            };

            const scrollPrev = () => {
                reviewsGrid.scrollBy({ left: -step, behavior: 'smooth' });
            };

            prevBtn.addEventListener('click', () => {
                scrollPrev();
                resetAutoScroll();
            });
            
            nextBtn.addEventListener('click', () => {
                scrollNext();
                resetAutoScroll();
            });

            // Auto scroll configuration
            let autoScrollInterval = setInterval(scrollNext, 3500);

            const resetAutoScroll = () => {
                clearInterval(autoScrollInterval);
                autoScrollInterval = setInterval(scrollNext, 3500);
            };

            // Pause auto scroll on user interaction
            reviewsGrid.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
            reviewsGrid.addEventListener('mouseleave', resetAutoScroll);
            reviewsGrid.addEventListener('touchstart', () => clearInterval(autoScrollInterval), { passive: true });
            reviewsGrid.addEventListener('touchend', resetAutoScroll, { passive: true });

        }, 100);
    }

    // Pricing Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.pricing-tab-content');

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');

                const targetId = btn.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
});

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

    // Hover effect for service cards
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            follower.style.transform = 'scale(1.5)';
            follower.style.backgroundColor = 'rgba(0, 242, 255, 0.1)';
        });
        card.addEventListener('mouseleave', () => {
            follower.style.transform = 'scale(1)';
            follower.style.backgroundColor = 'transparent';
        });
    });
});

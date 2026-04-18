document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Logic
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    const mainFrameContainer = document.querySelector('.main-frame-container');

    document.addEventListener('mousemove', (e) => {
        // Dot follows instantly
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // Follower follows with slight delay/smoothing
        requestAnimationFrame(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        });
    });

    // Hide custom cursor over video area to allow native interaction
    const playerArea = document.querySelector('.main-player-outer');
    if (playerArea) {
        playerArea.addEventListener('mouseenter', () => {
            document.body.classList.add('hide-custom-cursor');
        });
        playerArea.addEventListener('mouseleave', () => {
            document.body.classList.remove('hide-custom-cursor');
        });
    }

    // Reveal Animations
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(reveal => revealObserver.observe(reveal));

    // Gallery Logic
    let mainFrame = document.getElementById('main-frame');
    const activeTitle = document.getElementById('active-title');
    const activeDesc = document.getElementById('active-desc');
    const mainDownload = document.getElementById('main-download');
    const gridItems = document.querySelectorAll('.grid-item');

    gridItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update Active State
            gridItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const videoId = item.getAttribute('data-id');
            const title = item.getAttribute('data-title');
            const desc = item.getAttribute('data-desc');

            // Update Main Player (with a slight fade effect)
            mainFrame.style.opacity = '0';
            setTimeout(() => {
                const parent = mainFrame.parentElement;
                const timestamp = new Date().getTime();

                // Rewrite parent innerHTML cleanly (overlay removed)
                parent.innerHTML = `
                    <iframe id="main-frame" 
                        src="https://drive.google.com/file/d/${videoId}/preview?t=${timestamp}" 
                        allow="autoplay; fullscreen" 
                        frameborder="0" 
                        referrerpolicy="strict-origin-when-cross-origin"
                        style="opacity: 0; transition: opacity 0.3s ease;"></iframe>
                `;

                // Re-bind reference
                mainFrame = document.getElementById('main-frame');

                // Smooth fade-in
                setTimeout(() => {
                    mainFrame.style.opacity = '1';
                }, 50);
            }, 300);

            // Update Metadata
            activeTitle.textContent = title;
            activeDesc.textContent = desc;

            // Update Download Link
            mainDownload.href = `https://drive.google.com/uc?export=download&id=${videoId}`;

            // Scroll to player on mobile
            if (window.innerWidth < 1100) {
                window.scrollTo({
                    top: mainFrame.offsetTop - 150,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add smooth transition to iframe
    mainFrame.style.transition = 'opacity 0.3s ease';
});

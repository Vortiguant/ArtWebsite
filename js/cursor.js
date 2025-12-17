/**
 * Custom "Sunny" Cursor
 * Adds a fluid, organic cursor follower.
 */

const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

// Only active on non-touch devices
if (window.matchMedia("(pointer: fine)").matches) {

    // Enable the consistent cursor hiding
    document.body.classList.add('custom-cursor-active');

    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline follows with slight delay (animation handled by CSS transition or pure JS for smoother feel)
        // Using CSS animate for simplicty and performance
        cursorOutline.style.left = `${posX}px`;
        cursorOutline.style.top = `${posY}px`;

        // Fade in on specific interaction
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Hover effects
    const interactables = document.querySelectorAll('a, button, .gallery-card, input, textarea');

    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('hovered');
            cursorDot.classList.add('hovered');
        });

        el.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('hovered');
            cursorDot.classList.remove('hovered');
        });
    });

    // Handle cursor visibility when leaving/entering the window
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });
}

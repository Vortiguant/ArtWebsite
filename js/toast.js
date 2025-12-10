/**
 * Simple Toast Notification System
 * Displays non-intrusive messages to the user.
 */

const TOAST_DURATION = 3000;

function createToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Shows a toast message.
 * @param {string} message - The text to display.
 * @param {string} type - 'info', 'success', 'error' (default: 'info')
 */
export function showToast(message, type = 'info') {
    const container = createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;

    // Add to container
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, TOAST_DURATION);
}

// Expose globally for simplicity if modules aren't strictly used everywhere yet,
// but ideally we import it. Given the current setup seems to be vanilla JS files
// loaded via script tags, we might need to attach it to window or load it as a module.
// The current main.js is loaded with `defer`, not type="module".
// To be safe and compatible with the existing setup:
window.showToast = showToast;

const featuredArtworks = [
  {
    id: 'sunrise-horizons',
    title: 'Sunrise Horizons',
    image: 'assets/images/sunrise-horizons.webp',
    blurb: 'Acrylic gradients inspired by Rajasthani dawns.'
  },
  {
    id: 'marigold-breeze',
    title: 'Marigold Breeze',
    image: 'assets/images/marigold-breeze.webp',
    blurb: 'Marigold garlands translated into sweeping gestures.'
  },
  {
    id: 'terracotta-fields',
    title: 'Terracotta Fields',
    image: 'assets/images/terracotta-fields.webp',
    blurb: 'Topographic echoes of the Aravalli foothills.'
  }
];

const INSTAGRAM_TOKEN_PLACEHOLDER = 'ADD_INSTAGRAM_TOKEN';
const INSTAGRAM_USER_ID_PLACEHOLDER = 'INSTAGRAM_USER_ID';
const THEME_STORAGE_KEY = 'sunita-theme';
let themeToggles = [];

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function setYear() {
  qsa('#year').forEach((node) => (node.textContent = new Date().getFullYear()));
}

function setupNav() {
  const toggle = qs('.nav-toggle');
  const nav = qs('.site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function applyTheme(mode) {
  const isDark = mode === 'dark';
  document.body.classList.toggle('theme-dark', isDark);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    console.warn('Theme preference not saved', error);
  }
  themeToggles.forEach((btn) => {
    const label = btn.querySelector('.toggle-text');
    if (label) {
      label.textContent = isDark ? 'Light mode' : 'Dark mode';
    } else {
      btn.textContent = isDark ? 'Light mode' : 'Dark mode';
    }
    btn.setAttribute('aria-pressed', String(isDark));
    btn.classList.toggle('is-dark', isDark);
  });
}

function initThemeToggle() {
  themeToggles = qsa('[data-theme-toggle]');
  if (!themeToggles.length) return;
  let stored = null;
  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn('Theme preference unavailable', error);
  }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(initial);
  themeToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextMode = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
      applyTheme(nextMode);
    });
  });
}

function initCarousel() {
  const track = qs('.carousel-track');
  const prev = qs('.carousel-control.prev');
  const next = qs('.carousel-control.next');
  const heroPicture = qs('.hero picture');
  if (!track || !prev || !next || !heroPicture) return;

  const heroImg = qs('img', heroPicture);
  const heroSource = qs('source', heroPicture);
  let current = 0;

  const renderThumbs = () => {
    track.innerHTML = '';
    featuredArtworks.forEach((art, index) => {
      const img = document.createElement('img');
      img.src = art.image;
      img.alt = art.title;
      img.loading = 'lazy';
      if (index === current) img.classList.add('active');
      img.addEventListener('click', () => updateHero(index));
      track.appendChild(img);
    });
  };

  const updateHero = (index) => {
    current = (index + featuredArtworks.length) % featuredArtworks.length;
    const art = featuredArtworks[current];
    if (heroSource) heroSource.srcset = art.image;
    heroImg.src = art.image;
    heroImg.alt = art.title;
    renderThumbs();
  };

  prev.addEventListener('click', () => updateHero(current - 1));
  next.addEventListener('click', () => updateHero(current + 1));

  renderThumbs();
  updateHero(0);
}

async function fetchInstagramFeed() {
  const grid = qs('#insta-grid');
  if (!grid) return;

  const renderCards = (items) => {
    grid.innerHTML = '';
    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'insta-card';
      card.innerHTML = `
        <img src="${item.media_url || item.image}" alt="Instagram post" loading="lazy" width="320" height="320" />
        <p>${item.caption || ''}</p>
        <a href="${item.permalink}" target="_blank" rel="noopener">Open on Instagram →</a>
      `;
      grid.appendChild(card);
    });
  };

  try {
    if (INSTAGRAM_TOKEN_PLACEHOLDER !== 'ADD_INSTAGRAM_TOKEN') {
      const url = `https://graph.instagram.com/${INSTAGRAM_USER_ID_PLACEHOLDER}/media?fields=id,caption,media_url,permalink,timestamp&access_token=${INSTAGRAM_TOKEN_PLACEHOLDER}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Instagram API error');
      const { data } = await response.json();
      renderCards(data.slice(0, 6));
      return;
    }
    throw new Error('No token configured');
  } catch (error) {
    console.warn('Instagram API fallback → static data', error);
    const response = await fetch('data/instagram.json');
    const data = await response.json();
    renderCards(data);
  }
}

function setupNewsletterForm(formId = 'newsletter-form', messageId = 'newsletter-message') {
  const form = qs(`#${formId}`);
  const message = qs(`#${messageId}`);
  if (!form || !message) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    if (formData.get('suntrap')) {
      message.textContent = 'Submission blocked. Please leave optional fields blank.';
      return;
    }
    message.textContent = 'Submitting…';
    // Replace with actual marketing API call
    setTimeout(() => {
      message.textContent = 'Thank you! Please check your inbox to confirm.';
      form.reset();
    }, 900);
  });
}

function setupShareButtons() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('.share-btn');
    if (!button) return;
    const url = button.dataset.shareUrl || window.location.href;
    const title = 'Sunita Kamal Art | Art and sunny things';
    const originalLabel = button.dataset.defaultLabel || button.textContent.trim();
    if (!button.dataset.defaultLabel) {
      button.dataset.defaultLabel = originalLabel;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        button.textContent = 'Shared!';
      } catch (error) {
        console.warn('Share canceled', error);
      }
      setTimeout(() => {
        button.textContent = button.dataset.defaultLabel;
      }, 2000);
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      button.textContent = 'Link copied';
    } catch {
      button.textContent = url;
    }
    setTimeout(() => {
      button.textContent = button.dataset.defaultLabel;
    }, 2200);
  });
}

function init() {
  setYear();
  setupNav();
  initThemeToggle();
  initCarousel();
  fetchInstagramFeed();
  setupNewsletterForm('newsletter-form', 'newsletter-message');
  setupShareButtons();
}

document.addEventListener('DOMContentLoaded', init);

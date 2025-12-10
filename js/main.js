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
    const isExpanded = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isExpanded);
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
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
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

function setupScrollToTop() {
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-to-top';
  scrollBtn.setAttribute('aria-label', 'Scroll to top');
  scrollBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  `;
  document.body.appendChild(scrollBtn);

  const toggleButtonVisibility = () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleButtonVisibility);

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update URL without jumping
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });
}

function setupIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated sections
  document.querySelectorAll('section, .art-card, .insta-card').forEach(el => {
    if (window.getComputedStyle(el).animationName !== 'none') {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    }
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

    // Add fade-out class
    heroImg.classList.add('fade-out');

    // Wait for fade-out, then update image and fade back in
    setTimeout(() => {
      if (heroSource) heroSource.srcset = art.image;
      heroImg.src = art.image;
      heroImg.alt = art.title;

      // Remove fade-out class to trigger fade-in
      setTimeout(() => {
        heroImg.classList.remove('fade-out');
      }, 50);
    }, 250);

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
    // Check if token is configured (not the placeholder)
    if (INSTAGRAM_TOKEN_PLACEHOLDER && INSTAGRAM_TOKEN_PLACEHOLDER !== 'ADD_INSTAGRAM_TOKEN') {
      const url = `https://graph.instagram.com/${INSTAGRAM_USER_ID_PLACEHOLDER}/media?fields=id,caption,media_url,permalink,timestamp&access_token=${INSTAGRAM_TOKEN_PLACEHOLDER}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Instagram API error');
      const { data } = await response.json();
      renderCards(data.slice(0, 6));
      return;
    }
    // Explicitly throw to trigger fallback if token is missing
    throw new Error('No valid Instagram token configured');
  } catch (error) {
    console.log('Loading static Instagram feed (fallback mode)');
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

    // Simulate network request
    setTimeout(() => {
      // TODO: Integrate with a real newsletter service (e.g., Mailchimp, ConvertKit)
      const success = true; // Mock success

      if (success) {
        if (window.showToast) {
          window.showToast('Thank you! You have been added to the list.', 'success');
        }
        message.textContent = 'Thank you! Please check your inbox to confirm.';
        form.reset();
      } else {
        message.textContent = 'Something went wrong. Please try again.';
        if (window.showToast) window.showToast('Subscription failed', 'error');
      }
    }, 1500);
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
      if (window.showToast) {
        window.showToast('Link copied to clipboard', 'success');
      } else {
        button.textContent = 'Link copied';
      }
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
  setupScrollToTop();
  setupSmoothScroll();
  setupIntersectionObserver();
}

document.addEventListener('DOMContentLoaded', init);

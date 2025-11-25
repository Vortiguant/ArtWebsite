const galleryState = {
  artworks: [],
  filtered: [],
};

const FALLBACK_ARTWORKS = [
  {
    id: 'sunrise-horizons',
    title: 'Sunrise Horizons',
    medium: 'Acrylic and natural dyes on cotton canvas',
    dimensions: '48 x 60 in',
    year: 2024,
    category: 'Golden Hours',
    image: 'assets/images/sunrise-horizons.webp',
    commentary: 'Layered saffron washes fading into blush fields inspired by Jaipur mornings.',
    instagram_engagement: { likes: 8700, comments: 412, saves: 963 },
    slug: 'sunrise-horizons',
  },
  {
    id: 'marigold-breeze',
    title: 'Marigold Breeze',
    medium: 'Oil glaze on Belgian linen',
    dimensions: '36 x 48 in',
    year: 2023,
    category: 'Bloom Studies',
    image: 'assets/images/marigold-breeze.webp',
    commentary: 'A study of marigold garlands translated into sweeping marks and dots.',
    instagram_engagement: { likes: 6400, comments: 188, saves: 532 },
    slug: 'marigold-breeze',
  },
  {
    id: 'terracotta-fields',
    title: 'Terracotta Fields',
    medium: 'Mixed media with clay pigment',
    dimensions: '60 x 72 in',
    year: 2024,
    category: 'Landforms',
    image: 'assets/images/terracotta-fields.webp',
    commentary: 'Topographic lines mapped from Aravalli foothills at dusk.',
    instagram_engagement: { likes: 7200, comments: 305, saves: 601 },
    slug: 'terracotta-fields',
  },
  {
    id: 'saffron-threads',
    title: 'Saffron Threads',
    medium: 'Watercolor and silk screen',
    dimensions: '24 x 36 in',
    year: 2022,
    category: 'Studies',
    image: 'assets/images/saffron-threads.webp',
    commentary: 'Fine lines referencing handloom warp threads catching morning light.',
    instagram_engagement: { likes: 5200, comments: 140, saves: 420 },
    slug: 'saffron-threads',
  },
  {
    id: 'desert-bloom',
    title: 'Desert Bloom',
    medium: 'Acrylic, chalk pastel',
    dimensions: '40 x 40 in',
    year: 2023,
    category: 'Landforms',
    image: 'assets/images/desert-bloom.webp',
    commentary: 'Celebration of desert flora emerging after monsoon showers.',
    instagram_engagement: { likes: 4980, comments: 210, saves: 387 },
    slug: 'desert-bloom',
  },
  {
    id: 'copper-dawn',
    title: 'Copper Dawn',
    medium: 'Oil pastel and acrylic',
    dimensions: '30 x 45 in',
    year: 2021,
    category: 'Golden Hours',
    image: 'assets/images/copper-dawn.webp',
    commentary: 'First light over Lisbon rooftops translated into copper gradients.',
    instagram_engagement: { likes: 4300, comments: 165, saves: 330 },
    slug: 'copper-dawn',
  },
  {
    id: 'clay-fish-tray',
    title: 'Koi Drift Trinket Tray',
    medium: 'Hand-built clay with underglaze illustration',
    dimensions: '8 x 5 in',
    year: 2024,
    category: 'Clay Keepsakes',
    image: 'assets/images/desert-bloom.webp',
    commentary: 'Fish-themed tray with layered cobalt and saffron slips referencing sunlight skipping across water.',
    instagram_engagement: { likes: 3100, comments: 96, saves: 220 },
    slug: 'koi-drift-trinket-tray',
  },
  {
    id: 'polar-card-1',
    title: 'Polar Parade I',
    medium: 'Gouache and pencil on cotton card stock',
    dimensions: '5 x 7 in',
    year: 2024,
    category: 'Holiday Cards',
    image: 'assets/images/sunrise-horizons.webp',
    commentary: 'First in the five-card Christmas polar bear series featuring hand-lettered greetings.',
    instagram_engagement: { likes: 2100, comments: 84, saves: 190 },
    slug: 'polar-parade-i',
  },
  {
    id: 'polar-card-2',
    title: 'Polar Parade II',
    medium: 'Gouache and pencil on cotton card stock',
    dimensions: '5 x 7 in',
    year: 2024,
    category: 'Holiday Cards',
    image: 'assets/images/marigold-breeze.webp',
    commentary: 'Playful polar bear duo carrying garlands beneath a twilight sky.',
    instagram_engagement: { likes: 2050, comments: 68, saves: 175 },
    slug: 'polar-parade-ii',
  },
  {
    id: 'polar-card-3',
    title: 'Polar Parade III',
    medium: 'Gouache and pencil on cotton card stock',
    dimensions: '5 x 7 in',
    year: 2024,
    category: 'Holiday Cards',
    image: 'assets/images/saffron-threads.webp',
    commentary: 'Snow-globe composition with rosy northern lights enveloping a bear family.',
    instagram_engagement: { likes: 1980, comments: 72, saves: 160 },
    slug: 'polar-parade-iii',
  },
  {
    id: 'polar-card-4',
    title: 'Polar Parade IV',
    medium: 'Gouache and pencil on cotton card stock',
    dimensions: '5 x 7 in',
    year: 2024,
    category: 'Holiday Cards',
    image: 'assets/images/terracotta-fields.webp',
    commentary: 'Polar bear delivering gifts via aurora-lit ice floes.',
    instagram_engagement: { likes: 2025, comments: 65, saves: 150 },
    slug: 'polar-parade-iv',
  },
  {
    id: 'polar-card-5',
    title: 'Polar Parade V',
    medium: 'Gouache and pencil on cotton card stock',
    dimensions: '5 x 7 in',
    year: 2024,
    category: 'Holiday Cards',
    image: 'assets/images/copper-dawn.webp',
    commentary: 'Final card with polar cubs stringing lights around a snowy fir.',
    instagram_engagement: { likes: 2150, comments: 70, saves: 185 },
    slug: 'polar-parade-v',
  },
];

const galleryGrid = document.getElementById('gallery-grid');
const template = document.getElementById('artwork-template');
const categorySelect = document.getElementById('category-filter');
const modal = document.getElementById('zoom-modal');
const modalImage = modal ? modal.querySelector('img') : null;
const modalClose = modal ? modal.querySelector('.modal-close') : null;

async function loadArtworks() {
  if (!galleryGrid || !template) return;
  try {
    const response = await fetch('data/artworks.json');
    if (!response.ok) throw new Error('Unable to load gallery data');
    const data = await response.json();
    hydrateGallery(data);
  } catch (error) {
    console.warn('Gallery data fallback activated.', error);
    hydrateGallery(FALLBACK_ARTWORKS);
    galleryGrid.classList.add('gallery-fallback');
  }
}

function hydrateGallery(data) {
  galleryState.artworks = data;
  galleryState.filtered = data;
  populateCategories(data);
  renderGallery(data);
}

function populateCategories(artworks) {
  if (!categorySelect) return;
  categorySelect.innerHTML = '<option value="all">All collections</option>';
  const categories = Array.from(new Set(artworks.map((art) => art.category))).sort();
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function renderGallery(artworks) {
  galleryGrid.innerHTML = '';
  if (!artworks.length) {
    galleryGrid.innerHTML = '<p class="gallery-empty">Artworks will be added soon. Please check back!</p>';
    return;
  }
  artworks.forEach((art) => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector('.art-card');
    article.id = art.slug;
    const title = node.querySelector('.art-title');
    title.textContent = art.title;
    const titleId = `${art.slug}-title`;
    title.id = titleId;
    article.setAttribute('aria-labelledby', titleId);

    const img = node.querySelector('img');
    img.src = art.image;
    img.alt = art.title;
    img.dataset.artId = art.id;

    const medium = node.querySelector('.art-medium');
    const dimensions = node.querySelector('.art-dimensions');
    const year = node.querySelector('.art-year');
    medium.textContent = art.medium;
    dimensions.textContent = art.dimensions;
    year.textContent = art.year;

    const commentary = node.querySelector('.art-commentary');
    commentary.textContent = art.commentary;

    const likes = node.querySelector('.engagement-likes');
    const comments = node.querySelector('.engagement-comments');
    const saves = node.querySelector('.engagement-saves');
    likes.textContent = art.instagram_engagement.likes.toLocaleString();
    comments.textContent = art.instagram_engagement.comments.toLocaleString();
    saves.textContent = art.instagram_engagement.saves.toLocaleString();

    const zoomButton = node.querySelector('.zoom-btn');
    zoomButton.dataset.image = art.image;
    zoomButton.dataset.title = art.title;

    const commentToggle = node.querySelector('.comment-toggle');
    const commentsWrapper = node.querySelector('.comments');
    const commentsList = node.querySelector('.existing-comments');
    const form = node.querySelector('.comment-form');
    const shareBtn = node.querySelector('.share-btn');
    const origin = window.location.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'https://artandsunnythings.com';
    const shareUrl = `${origin}/art/?piece=${art.slug}`;
    shareBtn.dataset.shareUrl = shareUrl;

    commentToggle.addEventListener('click', () => {
      const isHidden = commentsWrapper.hasAttribute('hidden');
      commentsWrapper.toggleAttribute('hidden', !isHidden);
      if (isHidden) {
        commentToggle.textContent = 'Hide Comments';
      } else {
        commentToggle.textContent = 'Comments';
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = formData.get('name').trim();
      const message = formData.get('message').trim();
      if (!name || !message) return;
      const payload = {
        name,
        message,
        date: new Date().toISOString(),
      };
      saveComment(art.id, payload);
      form.reset();
      renderComments(art.id, commentsList);
    });

    renderComments(art.id, commentsList);
    galleryGrid.appendChild(node);
  });
}

function getCommentsKey(id) {
  return `art-comments-${id}`;
}

function loadComments(id) {
  try {
    const raw = localStorage.getItem(getCommentsKey(id));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Unable to load comments', error);
    return [];
  }
}

function saveComment(id, comment) {
  const existing = loadComments(id);
  existing.unshift(comment);
  try {
    localStorage.setItem(getCommentsKey(id), JSON.stringify(existing));
  } catch (error) {
    console.warn('Unable to store comment', error);
  }
}

function renderComments(id, container) {
  const comments = loadComments(id);
  container.innerHTML = '';
  if (!comments.length) {
    container.innerHTML = '<p class="muted">Be the first to share a thought.</p>';
    return;
  }
  comments.forEach((comment) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'comment';

    const header = document.createElement('div');
    header.className = 'comment-header';
    const name = document.createElement('strong');
    name.textContent = comment.name;
    const date = document.createElement('small');
    date.textContent = new Date(comment.date).toLocaleDateString();
    header.append(name, date);

    const body = document.createElement('p');
    body.textContent = comment.message;

    wrapper.append(header, body);
    container.appendChild(wrapper);
  });
}

function setupFilter() {
  if (!categorySelect) return;
  categorySelect.addEventListener('change', (event) => {
    const value = event.target.value;
    if (value === 'all') {
      galleryState.filtered = galleryState.artworks;
    } else {
      galleryState.filtered = galleryState.artworks.filter((art) => art.category === value);
    }
    renderGallery(galleryState.filtered);
  });
}

function setupModal() {
  if (!modal || !modalClose) return;
  galleryGrid.addEventListener('click', (event) => {
    const zoomBtn = event.target.closest('.zoom-btn');
    if (!zoomBtn) return;
    const image = zoomBtn.dataset.image;
    const title = zoomBtn.dataset.title;
    modalImage.src = image;
    modalImage.alt = `${title} – zoomed view`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modalImage.src = '';
}

function initGallery() {
  if (!galleryGrid) return;
  loadArtworks();
  setupFilter();
  setupModal();
}

document.addEventListener('DOMContentLoaded', initGallery);

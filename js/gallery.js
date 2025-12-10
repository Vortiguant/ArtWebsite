const galleryState = {
  artworks: [],
  filtered: [],
};

const FALLBACK_ARTWORKS = [];

const galleryGrid = document.getElementById('gallery-grid');
const template = document.getElementById('artwork-template');
const categorySelect = document.getElementById('category-filter');
const modal = document.getElementById('zoom-modal');
const modalImage = modal ? modal.querySelector('img') : null;
const modalClose = modal ? modal.querySelector('.modal-close') : null;

async function loadArtworks() {
  if (!galleryGrid || !template) return;

  showLoadingSkeleton();

  try {
    const response = await fetch('data/artworks.json');
    if (!response.ok) throw new Error('Unable to load gallery data');
    const data = await response.json();
    hideLoadingSkeleton();
    hydrateGallery(data);
  } catch (error) {
    console.warn('Gallery data fallback activated.', error);
    hideLoadingSkeleton();
    hideLoadingSkeleton();
    hydrateGallery(FALLBACK_ARTWORKS);
    if (window.showToast) {
      window.showToast('Using offline gallery data', 'info');
    }
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

function showLoadingSkeleton() {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-card';
    galleryGrid.appendChild(skeleton);
  }
}

function hideLoadingSkeleton() {
  const skeletons = galleryGrid.querySelectorAll('.skeleton');
  skeletons.forEach(s => s.remove());
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
      if (window.showToast) {
        window.showToast('Comment posted!', 'success');
      }
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
    filterAndRender(value, '');
  });
}

function setupSearch() {
  // Create search input if it doesn't exist
  const controlsSection = document.querySelector('.gallery-controls');
  if (!controlsSection) return;

  const existingSearch = document.getElementById('gallery-search');
  if (existingSearch) return;

  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = 'flex: 1; min-width: 240px;';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'gallery-search';
  searchInput.placeholder = 'Search artworks...';
  searchInput.style.cssText = 'width: 100%; padding: 0.6rem 1rem; border-radius: 999px; border: 1px solid rgba(51, 31, 22, 0.2);';
  searchInput.setAttribute('aria-label', 'Search artworks by title or description');

  searchContainer.appendChild(searchInput);
  controlsSection.insertBefore(searchContainer, controlsSection.firstChild);

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const categoryValue = categorySelect ? categorySelect.value : 'all';
      filterAndRender(categoryValue, searchTerm);
    }, 300);
  });
}

function filterAndRender(category, searchTerm) {
  let filtered = galleryState.artworks;

  // Filter by category
  if (category !== 'all') {
    filtered = filtered.filter((art) => art.category === category);
  }

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter((art) => {
      const searchableText = (
        art.title +
        ' ' +
        art.commentary +
        ' ' +
        art.medium +
        ' ' +
        art.category
      ).toLowerCase();
      return searchableText.includes(searchTerm);
    });
  }

  galleryState.filtered = filtered;

  // Add fade out animation
  galleryGrid.style.opacity = '0';
  setTimeout(() => {
    renderGallery(filtered);
    galleryGrid.style.opacity = '1';
  }, 150);
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

  // Add smooth opacity transition to gallery grid
  galleryGrid.style.transition = 'opacity 0.3s ease';

  loadArtworks();
  setupFilter();
  setupSearch();
  setupModal();
}

document.addEventListener('DOMContentLoaded', initGallery);

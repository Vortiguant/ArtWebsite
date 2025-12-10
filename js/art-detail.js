const artDetailState = {
  artwork: null,
  commentsKeyPrefix: 'art-comments-',
};

const selectors = {
  artSection: document.querySelector('.art-detail'),
  emptySection: document.getElementById('art-empty'),
  title: document.getElementById('art-title'),
  summary: document.getElementById('art-summary'),
  image: document.getElementById('art-image'),
  medium: document.getElementById('art-medium'),
  dimensions: document.getElementById('art-dimensions'),
  year: document.getElementById('art-year'),
  commentary: document.getElementById('art-commentary'),
  likes: document.getElementById('detail-likes'),
  comments: document.getElementById('detail-comments'),
  saves: document.getElementById('detail-saves'),
  shareButton: document.getElementById('share-artwork'),
  instagramLink: document.getElementById('open-instagram'),
  commentList: document.querySelector('#art-comments .existing-comments'),
  commentForm: document.getElementById('art-comment-form'),
  backButton: document.getElementById('back-to-gallery'),
};

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  const paramSlug = params.get('piece');
  if (paramSlug) return paramSlug;
  if (window.location.hash) return window.location.hash.replace('#', '');
  return null;
}

function formatNumber(value) {
  return Number(value).toLocaleString();
}

function getShareUrl(slug) {
  const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://artandsunnythings.com';
  return `${origin}/art/?piece=${slug}`;
}

function renderArt(artwork) {
  if (!selectors.artSection) return;
  selectors.artSection.hidden = false;
  selectors.emptySection.hidden = true;
  selectors.title.textContent = artwork.title;
  selectors.summary.textContent = `${artwork.category} · ${artwork.medium}`;
  const imagePath = artwork.image.startsWith('assets/') ? `../${artwork.image}` : artwork.image;
  selectors.image.src = imagePath;
  selectors.image.alt = `${artwork.title} by Sunita Kamal`;
  selectors.medium.textContent = artwork.medium;
  selectors.dimensions.textContent = artwork.dimensions;
  selectors.year.textContent = artwork.year;
  selectors.commentary.textContent = artwork.commentary;
  selectors.likes.textContent = formatNumber(artwork.instagram_engagement.likes);
  selectors.comments.textContent = formatNumber(artwork.instagram_engagement.comments);
  selectors.saves.textContent = formatNumber(artwork.instagram_engagement.saves);
  document.title = `${artwork.title} | Sunita Kamal Art`;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute(
      'content',
      `${artwork.title} — ${artwork.medium} ${artwork.dimensions}, ${artwork.year} by Sunita Kamal (Art and sunny things).`
    );
  }
  if (selectors.shareButton) {
    selectors.shareButton.dataset.shareUrl = getShareUrl(artwork.slug);
  }
  if (selectors.instagramLink) {
    selectors.instagramLink.href = 'https://www.instagram.com/artandsunnythings';
  }
}

function getCommentsKey(id) {
  return `${artDetailState.commentsKeyPrefix}${id}`;
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
    console.warn('Unable to save comment', error);
  }
}

function renderComments(id) {
  if (!selectors.commentList) return;
  const comments = loadComments(id);
  selectors.commentList.innerHTML = '';
  if (!comments.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Be the first to share a thought.';
    selectors.commentList.appendChild(empty);
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

    const message = document.createElement('p');
    message.textContent = comment.message;

    wrapper.append(header, message);
    selectors.commentList.appendChild(wrapper);
  });
}

function handleCommentSubmit(event) {
  event.preventDefault();
  if (!artDetailState.artwork) return;
  const formData = new FormData(event.target);
  const name = (formData.get('name') || '').trim();
  const message = (formData.get('message') || '').trim();
  if (!name || !message) return;
  saveComment(artDetailState.artwork.id, {
    name,
    message,
    date: new Date().toISOString(),
  });
  event.target.reset();
  renderComments(artDetailState.artwork.id);
}

function showEmptyState() {
  if (selectors.artSection) selectors.artSection.hidden = true;
  if (selectors.emptySection) selectors.emptySection.hidden = false;
}

async function loadArtwork() {
  const slug = getSlug();
  if (!slug) {
    showEmptyState();
    return;
  }
  try {
    const response = await fetch('../data/artworks.json');
    if (!response.ok) throw new Error('Unable to load artwork data');
    const data = await response.json();
    const artwork = data.find((item) => item.slug === slug);
    if (!artwork) {
      showEmptyState();
      return;
    }
    artDetailState.artwork = artwork;
    renderArt(artwork);
    renderComments(artwork.id);
  } catch (error) {
    console.error('Failed to load artwork detail', error);
    showEmptyState();
  }
}

function initArtDetail() {
  loadArtwork();
  if (selectors.commentForm) {
    selectors.commentForm.addEventListener('submit', handleCommentSubmit);
  }
  if (selectors.backButton) {
    selectors.backButton.addEventListener('click', () => {
      const hash = artDetailState.artwork ? `#${artDetailState.artwork.slug}` : '';
      window.location.href = `../gallery.html${hash}`;
    });
  }
}

document.addEventListener('DOMContentLoaded', initArtDetail);

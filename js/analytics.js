(function () {
  const STORAGE_KEY = 'sunita-analytics-optout';
  const optOutLinks = document.querySelectorAll('#analytics-optout');
  const hasOptedOut = localStorage.getItem(STORAGE_KEY) === 'true';

  function loadAnalytics() {
    if (hasOptedOut) return;
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXX', { anonymize_ip: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
    document.head.appendChild(script);
  }

  function handleOptOut(event) {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, 'true');
    alert('Analytics tracking disabled. Refresh to apply.');
  }

  optOutLinks.forEach((link) => link.addEventListener('click', handleOptOut));
  loadAnalytics();
})();

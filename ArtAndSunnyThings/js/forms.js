function handleFormSubmission({ formId, messageId, endpoint }) {
  const form = document.getElementById(formId);
  const message = document.getElementById(messageId);
  if (!form || !message) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    if (formData.get('suntrap')) {
      message.textContent = 'Spam detected. Submission blocked.';
      return;
    }

    const payload = Object.fromEntries(formData.entries());
    message.textContent = 'Sending securely…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Network issue');
      message.textContent = 'Thank you! Sunita will reply within 2 business days.';
      form.reset();
    } catch (error) {
      console.warn('Form fallback (no endpoint configured).', error);
      // Fallback simulation for local testing
      setTimeout(() => {
        message.textContent = 'Received! This is a local confirmation. Connect the form endpoint to deliver emails.';
        form.reset();
      }, 800);
    }
  });
}

function initForms() {
  handleFormSubmission({
    formId: 'contact-form',
    messageId: 'contact-message',
    endpoint: '/api/contact-secure',
  });
  handleFormSubmission({
    formId: 'contact-newsletter',
    messageId: 'contact-newsletter-message',
    endpoint: '/api/newsletter',
  });
}

document.addEventListener('DOMContentLoaded', initForms);

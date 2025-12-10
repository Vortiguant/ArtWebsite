function addRealTimeValidation(form) {
  const inputs = form.querySelectorAll('input[required], textarea[required]');

  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateField(input);
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) {
        validateField(input);
      }
    });
  });
}

function validateField(field) {
  const isValid = field.checkValidity();

  if (!isValid) {
    field.classList.add('invalid');
    field.classList.remove('valid');

    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
      const errorMsg = document.createElement('span');
      errorMsg.className = 'error-message';
      errorMsg.style.cssText = 'color: #e4612c; font-size: 0.85rem; margin-top: 0.25rem; display: block;';
      errorMsg.textContent = field.validationMessage || 'Please fill out this field';
      errorMsg.setAttribute('role', 'alert');
      field.parentNode.appendChild(errorMsg);
    }
  } else {
    field.classList.remove('invalid');
    field.classList.add('valid');
    const errorMsg = field.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
      errorMsg.remove();
    }
  }
}

function handleFormSubmission({ formId, messageId, endpoint }) {
  const form = document.getElementById(formId);
  const message = document.getElementById(messageId);
  if (!form || !message) return;

  addRealTimeValidation(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Validate all fields
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isFormValid = true;
    inputs.forEach(input => {
      validateField(input);
      if (!input.checkValidity()) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      message.textContent = 'Please fix the errors above';
      message.style.color = '#e4612c';
      return;
    }

    const formData = new FormData(form);
    if (formData.get('suntrap')) {
      message.textContent = 'Spam detected. Submission blocked.';
      message.style.color = '#e4612c';
      return;
    }

    const payload = Object.fromEntries(formData.entries());
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span style="display: inline-block; animation: pulse 1.5s ease-in-out infinite;">Sending...</span>';
    message.textContent = 'Sending securely…';
    message.style.color = 'var(--muted)';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Network issue');
      message.textContent = '✓ Thank you! Sunita will reply within 2 business days.';
      message.style.color = '#4caf50';
      message.style.fontWeight = '600';
      form.reset();
      form.querySelectorAll('.valid, .invalid').forEach(el => {
        el.classList.remove('valid', 'invalid');
      });
    } catch (error) {
      console.warn('Form fallback (no endpoint configured).', error);
      // Fallback simulation for local testing
      setTimeout(() => {
        message.textContent = '✓ Received! This is a local confirmation. Connect the form endpoint to deliver emails.';
        message.style.color = '#4caf50';
        message.style.fontWeight = '600';
        form.reset();
        form.querySelectorAll('.valid, .invalid').forEach(el => {
          el.classList.remove('valid', 'invalid');
        });
      }, 800);
    } finally {
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }, 1000);
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
